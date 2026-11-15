#!/usr/bin/env bash
# Restore a backup made by tools/backup-supabase.sh into an EMPTY Supabase project.
#
#   tools/restore-supabase.sh backups/2026-11-10_1530 "postgresql://...target..."
#
# It refuses to run if the target already has tables in `public`, so it can never
# overwrite the live site by accident. See backups/README.md for when to use it.
set -euo pipefail
cd "$(dirname "$0")/.."

DIR=${1:-}
TARGET=${2:-}
if [ -z "$DIR" ] || [ -z "$TARGET" ] || [ ! -f "$DIR/schema.sql" ]; then
  echo "Usage: tools/restore-supabase.sh backups/<snapshot> <target-db-url>" >&2
  exit 1
fi

PG_MAJOR=17
pg() {
  local tool=$1; shift
  if command -v "$tool" >/dev/null 2>&1 && "$tool" --version | grep -q " $PG_MAJOR\."; then
    "$tool" "$@"
  elif docker info >/dev/null 2>&1; then
    docker run --rm -i "postgres:$PG_MAJOR" "$tool" "$@"
  else
    echo "Need Docker running (open -a Docker) or: brew install postgresql@$PG_MAJOR" >&2
    exit 1
  fi
}

existing=$(pg psql "$TARGET" -At -c \
  "select count(*) from pg_tables where schemaname = 'public'")
if [ "$existing" != "0" ]; then
  echo "Target already has $existing tables in public. Restore only into a fresh, empty project." >&2
  exit 1
fi

echo "Restoring $DIR into the target project."
read -r -p "Type RESTORE to continue: " ok
[ "$ok" = "RESTORE" ] || { echo "Cancelled."; exit 1; }

echo "1/3 structure"
pg psql "$TARGET" -v ON_ERROR_STOP=1 -q < "$DIR/schema.sql"
echo "2/3 auth triggers + storage"
pg psql "$TARGET" -v ON_ERROR_STOP=1 -q < "$DIR/extras.sql"
echo "3/3 data"
# replica mode: load rows as-is without re-firing triggers (member numbers, counts).
{ echo "set session_replication_role = replica;"; cat "$DIR/data.sql"; } \
  | pg psql "$TARGET" -v ON_ERROR_STOP=1 -q

echo "Done. Compare row counts with $DIR/row-counts.txt"

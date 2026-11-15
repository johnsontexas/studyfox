#!/usr/bin/env bash
# Snapshot the StudyFox Supabase database: full structure + all data.
#
#   npm run backup:db
#
# Writes backups/<date>_<time>/ (gitignored: it holds user emails and auth rows)
# and refreshes supabase/snapshot/schema.sql (structure only, safe to commit, so
# `git diff supabase/snapshot` shows exactly what changed in the database).
#
# Needs SUPABASE_DB_URL in .env and either Docker running or pg_dump 17 installed.
# See backups/README.md.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -f .env ]; then set -a; . ./.env; set +a; fi
if [ -z "${SUPABASE_DB_URL:-}" ]; then
  if [ ! -t 0 ]; then
    echo "Missing SUPABASE_DB_URL. Add it to .env (see backups/README.md)." >&2
    exit 1
  fi
  echo "Supabase > Connect > Session pooler. Copy the URI exactly as shown,"
  echo "still containing [YOUR-PASSWORD], and paste it here (input is hidden):"
  read -r -s -p "> " template; echo
  template=$(printf '%s' "$template" | tr -d '[:space:]')
  case "$template" in
    postgresql://*:*@*.pooler.supabase.com:*/postgres) ;;
    *) echo "That isn't the Session pooler URI. It should look like:" >&2
       echo "  postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-0-region.pooler.supabase.com:5432/postgres" >&2
       exit 1 ;;
  esac
  dbpass=""
  case "$template" in
    *'[YOUR-PASSWORD]@'*) read -r -s -p "Database password (hidden): " dbpass; echo ;;
  esac
  # Rebuild the URI with the password URL-encoded, so characters like @ / : #
  # in it don't get mistaken for the host part. Works whether the password was
  # typed separately or already pasted into the URI.
  SUPABASE_DB_URL=$(TPL="$template" DBPASS="$dbpass" python3 -I -c '
import os, urllib.parse as u
tpl, pw = os.environ["TPL"], os.environ["DBPASS"]
scheme, rest = tpl.split("://", 1)
creds, host = rest.rsplit("@", 1)   # host never contains @, the password might
user, raw = creds.split(":", 1)
if raw != "[YOUR-PASSWORD]":
    pw = u.unquote(raw)
print(f"{scheme}://{user}:{u.quote(pw, safe=str())}@{host}")')
  printf 'SUPABASE_DB_URL=%s\n' "$SUPABASE_DB_URL" >> .env
  chmod 600 .env
  echo "Saved to .env (gitignored), so next time it just runs."
fi

PG_MAJOR=17   # must match the server (Supabase project runs Postgres 17)

# Run a Postgres tool: a local v17 install if there is one, otherwise Docker.
pg() {
  local tool=$1; shift
  if command -v "$tool" >/dev/null 2>&1 && "$tool" --version | grep -q " $PG_MAJOR\."; then
    "$tool" "$@"
  elif docker info >/dev/null 2>&1; then
    docker run --rm -i -e PGCONNECT_TIMEOUT=20 "postgres:$PG_MAJOR" "$tool" "$@"
  else
    echo "Need Docker running (open -a Docker) or: brew install postgresql@$PG_MAJOR" >&2
    exit 1
  fi
}

STAMP=$(date +%Y-%m-%d_%H%M)
OUT="backups/$STAMP"
mkdir -p "$OUT"
# Don't leave a half-written snapshot behind if anything fails.
trap 'status=$?; if [ $status -ne 0 ]; then rm -rf "$OUT"; echo "Backup failed; nothing saved." >&2; fi' EXIT
echo "Backing up to $OUT ..."

# 1. Structure of everything we own: tables, columns, indexes, RLS policies,
#    functions, triggers, views, grants.
pg pg_dump --dbname "$SUPABASE_DB_URL" --schema-only --no-owner --schema=public \
  > "$OUT/schema.sql"

# 2. Things we added to Supabase-managed schemas, which a public-only dump misses:
#    triggers on auth.users (member numbers, user count, signup blocking) and
#    storage policies/buckets (news images).
pg psql "$SUPABASE_DB_URL" -Atq -v ON_ERROR_STOP=1 > "$OUT/extras.sql" <<'SQL'
set search_path = '';  -- makes pg_get_triggerdef schema-qualify function names
select '-- Triggers on auth tables';
select format('drop trigger if exists %I on %I.%I;', t.tgname, n.nspname, c.relname)
       || E'\n' || pg_get_triggerdef(t.oid) || ';'
from pg_trigger t
join pg_class c on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'auth' and not t.tgisinternal
order by c.relname, t.tgname;

select E'\n-- Storage buckets';
select format('insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values (%L, %L, %L, %s, %L) on conflict (id) do nothing;',
              id, name, public, coalesce(file_size_limit::text, 'null'), allowed_mime_types)
from storage.buckets order by id;

select E'\n-- Storage policies';
select format('drop policy if exists %I on %I.%I;', policyname, schemaname, tablename)
       || E'\n' || format('create policy %I on %I.%I as %s for %s to %s', policyname, schemaname, tablename,
                          permissive, cmd, array_to_string(roles, ', '))
       || coalesce(' using (' || qual || ')', '')
       || coalesce(' with check (' || with_check || ')', '') || ';'
from pg_policies where schemaname = 'storage'
order by tablename, policyname;
SQL

# 3. All rows: our tables plus auth users (so member/progress rows keep their owners).
pg pg_dump --dbname "$SUPABASE_DB_URL" --data-only --no-owner \
  --schema=public --schema=auth \
  --exclude-table=auth.schema_migrations \
  > "$OUT/data.sql"

# Row counts, so a restore can be checked against the original.
pg psql "$SUPABASE_DB_URL" -Atq -v ON_ERROR_STOP=1 > "$OUT/row-counts.txt" <<'SQL'
select format('%-28s %s', c.relname, (xpath('/row/n/text()',
       query_to_xml(format('select count(*) as n from public.%I', c.relname), false, true, '')))[1]::text)
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by c.relname;
SQL

# Committable structure snapshot (no personal data in it).
mkdir -p supabase/snapshot
cp "$OUT/schema.sql" supabase/snapshot/schema.sql
cp "$OUT/extras.sql" supabase/snapshot/extras.sql

echo
echo "Done: $OUT"
ls -lh "$OUT" | tail -n +2
echo
echo "Structure diff vs last commit:  git diff --stat supabase/snapshot"

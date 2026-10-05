// Runs before anything else (see index.ts). Gives React Native the few browser globals the
// website's shared modules expect, so the app can import js/store.js and js/content/* unchanged.
import 'react-native-url-polyfill/auto';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { installLocalStorage } from './storage';

const g = globalThis as any;
g.window ??= g;
// js/util.js tex() calls window.katex. The app draws math natively (components/Math.tsx), so this
// stand-in leaves the TeX as $...$ for the native renderer to pick up.
g.katex = { renderToString: (src: string) => `$${src}$` };

// WebCrypto subset: js/store.js hashes passwords with SHA-256, and Supabase uses it for PKCE.
if (!g.crypto?.subtle) {
  const names: Record<string, Crypto.CryptoDigestAlgorithm> = {
    'SHA-1': Crypto.CryptoDigestAlgorithm.SHA1,
    'SHA-256': Crypto.CryptoDigestAlgorithm.SHA256,
    'SHA-384': Crypto.CryptoDigestAlgorithm.SHA384,
    'SHA-512': Crypto.CryptoDigestAlgorithm.SHA512,
  };
  g.crypto = {
    ...(g.crypto || {}),
    getRandomValues: g.crypto?.getRandomValues ?? Crypto.getRandomValues,
    subtle: {
      digest: (alg: string | { name: string }, data: BufferSource) =>
        Crypto.digest(names[typeof alg === 'string' ? alg : alg.name], data),
    },
  };
}

if (Platform.OS !== 'web') installLocalStorage();

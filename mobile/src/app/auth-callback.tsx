import { Redirect } from 'expo-router';

// Google sign-in returns here; the session is finished in lib/cloud.ts, so just go home.
export default function AuthCallback() {
  return <Redirect href="/" />;
}

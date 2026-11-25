import { expoClient } from '@better-auth/expo/client';
import { createAuthClient } from 'better-auth/react';
import type { BetterAuthClientPlugin } from 'better-auth/client';
import { emailOTPClient } from 'better-auth/client/plugins';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// The website (Next.js) hosts the backend; the app talks to the same API.
// Must be the bare domain: Google redirects back to bookfxorder.com/api/auth/callback/google,
// and the OAuth state cookie is host-only, so starting sign-in on www.bookfxorder.com makes
// the callback fail with state_mismatch and leaves the user on the website's error page.
export const API_URL = 'https://bookfxorder.com';

export const IS_WEB = Platform.OS === 'web';

// The website has no CORS headers, so in the browser API calls go to this app's own origin,
// where src/app/api/[...path]+api.ts forwards them to the website. Native calls it directly.
export const API_BASE_URL =
  IS_WEB && typeof window !== 'undefined' ? window.location.origin : API_URL;

const expo = expoClient({
  scheme: 'bookfxorderapp',
  storagePrefix: 'bookfxorderapp',
  storage: SecureStore,
});

// @better-auth/expo 1.6.26 declares its plugin type out of step with better-auth's own
// (the plugin works at runtime), so the cast restores the type and re-adds getCookie.
// Drop the casts once the website and app move to a release where the types line up.
const APP_ORIGIN = 'bookfxorderapp://';

const client = createAuthClient({
  baseURL: API_BASE_URL,
  // emailOTPClient: the website supports signing in with a 6-digit code emailed to the user,
  // which needs no password (Google accounts have none) and no browser redirect.
  plugins: [expo as unknown as BetterAuthClientPlugin, emailOTPClient()],
  fetchOptions: {
    // The Expo plugin sends its deep-link base as the request origin. In Expo Go that is
    // exp://<ip>:8081, which the website rejects with 403 INVALID_ORIGIN, so email login and
    // registration fail. The website trusts bookfxorderapp://, so always send that from native.
    // (The Origin check guards browsers against CSRF; it doesn't apply to a native app.)
    onRequest: (context) => {
      if (!IS_WEB) context.headers.set('expo-origin', APP_ORIGIN);
    },
  },
});

export const authClient = client as typeof client & { getCookie: () => string };

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  emailVerified?: boolean;
  // Added by the website's phoneNumber plugin; null when the user never added one.
  phoneNumber?: string | null;
  createdAt?: string | Date;
};

// The plugin cast above erases the session type (it comes out as `never`), so restate it here.
export function useSession() {
  return authClient.useSession() as unknown as {
    data: { user: SessionUser } | null;
    isPending: boolean;
  };
}

// Sign-in methods linked to the account: 'credential' (email & password), 'google', ...
// (The plugin cast above also erases listAccounts' types, hence the local shape.)
export async function listSignInProviders(): Promise<string[]> {
  const { data } = (await authClient.listAccounts()) as { data: { providerId: string }[] | null };
  return (data ?? []).map((a) => a.providerId);
}

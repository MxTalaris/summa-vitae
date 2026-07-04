// Google Identity Services (GIS) — popup token flow.
// No client secret, no redirect, no backend needed.
// Docs: https://developers.google.com/identity/oauth2/web/guides/use-token-model

const CLIENT_ID = '1024163549094-u3d1u2gvq1352ohd736s0k1nknk9o3ve.apps.googleusercontent.com';

const SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/drive.appdata',
].join(' ');

// ── GIS type declarations ─────────────────────────────────────────────────────

interface GsiTokenResponse {
  access_token: string;
  error?: string;
  error_description?: string;
}

interface GsiTokenClient {
  requestAccessToken(): void;
}

interface GsiTokenClientConfig {
  client_id: string;
  scope: string;
  prompt?: string;
  hint?: string;
  callback: (r: GsiTokenResponse) => void;
  error_callback?: (e: { type: string }) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient(config: GsiTokenClientConfig): GsiTokenClient;
        };
      };
    };
  }
}

// ── Script loader ─────────────────────────────────────────────────────────────

let _gsiLoad: Promise<void> | null = null;

function loadGSI(): Promise<void> {
  if (_gsiLoad) return _gsiLoad;
  _gsiLoad = new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Google Identity Services. Check your internet connection.'));
    document.head.appendChild(s);
  });
  return _gsiLoad;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

/** Opens the Google account picker popup and resolves with an access token.
 *  No redirect, no client secret, no backend. */
export async function requestGoogleToken(): Promise<string> {
  await loadGSI();
  return new Promise((resolve, reject) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (resp) => {
        if (resp.error) {
          reject(new Error(resp.error_description ?? resp.error));
        } else {
          resolve(resp.access_token);
        }
      },
      error_callback: (e) => {
        if (e.type === 'popup_closed') {
          reject(new Error('popup_closed'));
        } else {
          reject(new Error(`Google auth error: ${e.type}`));
        }
      },
    });
    client.requestAccessToken();
  });
}

/** Tries to get a token silently (no account picker) using the user's known email.
 *  Works when the browser still has a live Google session. Throws if interaction is required. */
export async function requestGoogleTokenSilent(hint: string): Promise<string> {
  await loadGSI();
  return new Promise((resolve, reject) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      hint,
      prompt: '',
      callback: (resp) => {
        if (resp.error) reject(new Error(resp.error_description ?? resp.error));
        else resolve(resp.access_token);
      },
      error_callback: (e) => reject(new Error(e.type)),
    });
    client.requestAccessToken();
  });
}

// ── User info ─────────────────────────────────────────────────────────────────

export interface GoogleUser {
  name: string;
  email: string;
}

export async function getGoogleUser(accessToken: string): Promise<GoogleUser> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch Google user info');
  return res.json();
}

// ── Google Drive storage ──────────────────────────────────────────────────────
// Uses the appDataFolder (hidden, app-only folder — not visible in user's Drive).

const DRIVE_FILE_NAME = 'summa-vitae-cv-data.json';
const DRIVE_FOLDER = 'appDataFolder';

export interface RemoteData {
  schemaVersion: 1;
  lastSaved: string;
  baseCV: unknown;
  povs: unknown[];
}

/** Finds the existing data file ID, or null if none exists yet. */
export async function findDriveFile(token: string): Promise<string | null> {
  const res = await driveReq(token, 'GET',
    `/files?spaces=${DRIVE_FOLDER}&q=name='${DRIVE_FILE_NAME}'&fields=files(id)`
  );
  if (!res.ok) await throwDriveError(res, 'search Drive');
  const { files } = await res.json() as { files: { id: string }[] };
  return files[0]?.id ?? null;
}

/** Reads the data file. */
export async function readDriveData(token: string, fileId: string): Promise<RemoteData> {
  const res = await driveReq(token, 'GET', `/files/${fileId}?alt=media`);
  if (!res.ok) await throwDriveError(res, 'read Drive file');
  return res.json();
}

/** Creates or updates the data file. Returns the file ID. */
export async function writeDriveData(
  token: string,
  data: RemoteData,
  fileId?: string | null,
): Promise<string> {
  const meta = {
    name: DRIVE_FILE_NAME,
    mimeType: 'application/json',
    ...(fileId ? {} : { parents: [DRIVE_FOLDER] }),
  };

  const body = new FormData();
  body.append('metadata', new Blob([JSON.stringify(meta)], { type: 'application/json' }));
  body.append('file', new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));

  const url = fileId
    ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
    : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`;

  const res = await fetch(url, {
    method: fileId ? 'PATCH' : 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body,
  });
  if (!res.ok) await throwDriveError(res, 'write Drive file');
  const file = await res.json() as { id: string };
  return file.id;
}

function driveReq(token: string, method: string, path: string) {
  return fetch(`https://www.googleapis.com/drive/v3${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function throwDriveError(res: Response, action: string): Promise<never> {
  let detail = `HTTP ${res.status}`;
  try {
    const body = await res.json() as { error?: { message?: string; status?: string } };
    if (body.error?.message) detail = body.error.message;
  } catch { /* non-JSON response */ }
  throw new Error(`Drive ${action} failed: ${detail}`);
}

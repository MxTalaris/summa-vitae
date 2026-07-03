// GitHub App Client ID — not a secret; safe to hardcode for Device Flow.
export const GITHUB_CLIENT_ID = 'Iv23li7JziAIP2DXVEyx';
export const DATA_REPO = 'summa-vitae-cvdata';
const DATA_FILE = 'cv-data.json';

// Proxy URL for the two Device Flow endpoints that github.com blocks via CORS.
// Set VITE_GITHUB_PROXY_URL to your Cloudflare Worker URL after deploying
// github-auth-proxy/worker.js.  Intentionally crashes loudly if missing so the
// developer notices immediately rather than getting a silent failure.
const PROXY = (() => {
  const v = import.meta.env.VITE_GITHUB_PROXY_URL as string | undefined;
  if (!v) {
    console.error(
      '[Summa Vitae] VITE_GITHUB_PROXY_URL is not set. ' +
      'Deploy github-auth-proxy/worker.js to Cloudflare Workers and set the env var.'
    );
  }
  return (v ?? '').replace(/\/$/, '');
})();

// ── Device Flow ───────────────────────────────────────────────────────────────

export interface DeviceFlowInit {
  deviceCode: string;
  userCode: string;
  verificationUri: string;
  expiresIn: number;   // seconds until the code expires (~900)
  interval: number;   // minimum polling interval in seconds
}

export async function startDeviceFlow(): Promise<DeviceFlowInit> {
  if (!PROXY) throw new Error('GitHub proxy URL is not configured. Set VITE_GITHUB_PROXY_URL.');
  const res = await fetch(`${PROXY}/device/code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({ client_id: GITHUB_CLIENT_ID }),
  });
  if (!res.ok) throw new Error(`GitHub Device Flow failed (${res.status})`);
  const d = await res.json();
  return {
    deviceCode: d.device_code,
    userCode: d.user_code,
    verificationUri: d.verification_uri,
    expiresIn: d.expires_in,
    interval: d.interval ?? 5,
  };
}

export type PollResult =
  | { status: 'token'; token: string }
  | { status: 'pending' }
  | { status: 'slow_down'; newInterval: number }
  | { status: 'expired' }
  | { status: 'error'; message: string };

export async function pollDeviceFlow(deviceCode: string): Promise<PollResult> {
  const res = await fetch(`${PROXY}/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      device_code: deviceCode,
      grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
    }),
  });
  const d = await res.json();
  if (d.access_token) return { status: 'token', token: d.access_token };
  if (d.error === 'authorization_pending') return { status: 'pending' };
  if (d.error === 'slow_down') return { status: 'slow_down', newInterval: d.interval };
  if (d.error === 'expired_token') return { status: 'expired' };
  return { status: 'error', message: d.error_description ?? d.error };
}

// ── User ──────────────────────────────────────────────────────────────────────

export interface GitHubUser {
  login: string;
  name: string | null;
}

export async function getAuthUser(token: string): Promise<GitHubUser> {
  const res = await gh(token, 'GET', '/user');
  if (!res.ok) throw new Error('Failed to fetch GitHub user');
  return res.json();
}

// ── Repository ────────────────────────────────────────────────────────────────

export type RepoSetupResult = 'ready' | 'needs-manual-create';

/** Ensures the data repo exists. Returns 'needs-manual-create' if the token
 *  lacks permission to create repos — user can create it once on GitHub. */
export async function ensureRepo(token: string, username: string): Promise<RepoSetupResult> {
  const check = await gh(token, 'GET', `/repos/${username}/${DATA_REPO}`);
  if (check.status === 200) return 'ready';

  const create = await gh(token, 'POST', '/user/repos', {
    name: DATA_REPO,
    private: true,
    description: 'Summa Vitae CV data — managed automatically, do not edit manually',
    auto_init: true,
  });

  if (create.status === 201) {
    await sleep(1500); // let GitHub finish initialising the default branch
    return 'ready';
  }

  // 403 = token lacks permission; 422 = already exists (race); treat 422 as ready
  if (create.status === 422) return 'ready';
  return 'needs-manual-create';
}

// ── CV data file ──────────────────────────────────────────────────────────────

export interface RemoteData {
  schemaVersion: 1;
  lastSaved: string;
  baseCV: unknown;
  povs: unknown[];
}

export async function readRemoteData(
  token: string,
  username: string,
): Promise<{ data: RemoteData; sha: string } | null> {
  const res = await gh(token, 'GET', `/repos/${username}/${DATA_REPO}/contents/${DATA_FILE}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to read remote CV data');
  const file = await res.json();
  const data: RemoteData = JSON.parse(atob(file.content.replace(/\s/g, '')));
  return { data, sha: file.sha as string };
}

export async function writeRemoteData(
  token: string,
  username: string,
  data: RemoteData,
  sha?: string,
): Promise<void> {
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
  const res = await gh(token, 'PUT', `/repos/${username}/${DATA_REPO}/contents/${DATA_FILE}`, {
    message: 'Update CV data via Summa Vitae',
    content,
    ...(sha ? { sha } : {}),
  });
  if (!res.ok) throw new Error('Failed to write CV data to GitHub');
}

// ── Sharing ───────────────────────────────────────────────────────────────────

/** Creates a public Gist and returns its ID (used to build the share URL). */
export async function createShareGist(
  token: string,
  payload: object,
  title: string,
): Promise<string> {
  const res = await gh(token, 'POST', '/gists', {
    description: `Summa Vitae — ${title}`,
    public: true,
    files: { 'cv.json': { content: JSON.stringify(payload) } },
  });
  if (!res.ok) throw new Error('Failed to create share Gist');
  const gist = await res.json();
  return gist.id as string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function gh(token: string, method: string, path: string, body?: object) {
  return fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

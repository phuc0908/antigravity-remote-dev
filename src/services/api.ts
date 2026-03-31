// API service layer — all credentials: 'include' for httpOnly cookie auth

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { credentials: 'include', ...init });
  if (res.status === 401) {
    window.location.href = '/';
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text);
  }
  return res.json() as Promise<T>;
}

function get<T>(path: string): Promise<T> {
  return apiFetch<T>(path);
}

function post<T>(path: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body != null ? JSON.stringify(body) : undefined,
  });
}

// Auth
export function login(password: string): Promise<{ success: boolean }> {
  return post('/api/login', { password });
}

// Cascades
export function getCascades(): Promise<Array<{ id: string; title: string; active: boolean }>> {
  return get('/cascades');
}

// Snapshot & styles
export function getSnapshot(id: string): Promise<{
  html: string;
  bodyBg: string;
  bodyColor: string;
  clickMap: Record<number, string>;
  hasFeedbackButtons: boolean;
  feedbackFingerprint: string | null;
}> {
  return get(`/snapshot/${id}`);
}

export function getStyles(id: string): Promise<{ css: string; computedVars: Record<string, string> }> {
  return get(`/styles/${id}`);
}

export function getQuota(id: string): Promise<{
  statusText: string;
  planName: string | null;
  models: Array<{ label: string; percentage: number | null; resetTime: string }>;
}> {
  return get(`/api/quota/${id}`);
}

// Interaction
export function sendMessage(id: string, message: string): Promise<{ success: boolean }> {
  return post(`/send/${id}`, { message });
}

export function clickElement(id: string, index: number): Promise<{ success: boolean; text: string; filePath: string | null }> {
  return post(`/click/${id}`, { index });
}

export function scrollView(id: string, opts: { deltaY?: number; ratio?: number; scrollTop?: number }): Promise<{ success: boolean; scrollTop: number; scrollHeight: number; clientHeight: number }> {
  return post(`/scroll/${id}`, opts);
}

export function openPopup(id: string, index: number): Promise<{ items: Array<{ title: string; description: string; badges: string[]; header: string; selector: string; checked: boolean }>; found: boolean }> {
  return post(`/popup/${id}`, { index });
}

export function clickPopup(id: string, opts: { title: string; selector?: string; triggerIndex?: number }): Promise<{ success: boolean; text: string }> {
  return post(`/popup-click/${id}`, opts);
}

export function dismissPopup(id: string): Promise<{ success: boolean }> {
  return post(`/dismiss/${id}`);
}

export function newConversation(id: string): Promise<{ success: boolean }> {
  return post(`/new-conversation/${id}`);
}

// Editor / tabs
export function getActiveTabName(id: string): Promise<{ name: string | null }> {
  return get(`/api/active-tab-name/${id}`);
}

export function getActiveFile(id: string): Promise<{ type: 'file' | 'artifact'; content?: string; filename?: string; ext?: string; path?: string; name?: string; html?: string }> {
  return get(`/api/active-file/${id}`);
}

export function closeTab(id: string): Promise<{ success: boolean; skipped?: boolean; reason?: string }> {
  return post(`/api/close-tab/${id}`);
}

// IDE lifecycle
export function launchIde(port?: number): Promise<{ success: boolean; port?: number; error?: string }> {
  return post('/api/launch', port != null ? { port } : {});
}

export function killAll(): Promise<{ success: boolean; closedConnections: number; processKilled: boolean }> {
  return post('/api/kill-all', {});
}

export function closeCascade(id: string): Promise<{ success: boolean; closedId: string }> {
  return post(`/api/close-cascade/${id}`);
}

// Project browser
export function browse(path?: string): Promise<{ currentPath: string; parentPath: string | null; items: Array<{ name: string; path: string }> }> {
  return get(`/api/browse${path ? `?path=${encodeURIComponent(path)}` : ''}`);
}

export function getWorkspaceRoot(): Promise<{ root: string; source: string; projectName?: string }> {
  return get('/api/workspace-root');
}

export function openProject(folder: string): Promise<{ success: boolean; alreadyRunning: boolean; method?: string; port?: number; error?: string }> {
  return post('/api/open-project', { folder });
}

// Account manager
export function getManagerAccounts(): Promise<unknown> {
  return get('/api/manager/accounts');
}

export function getManagerCurrent(): Promise<unknown> {
  return get('/api/manager/current');
}

export function switchAccount(accountId: string): Promise<{ success: boolean; current: unknown }> {
  return post('/api/manager/switch', { accountId });
}

// Push notifications
export function getVapidKey(): Promise<{ publicKey: string }> {
  return get('/api/push/vapid-key');
}

export function subscribePush(subscription: PushSubscriptionJSON): Promise<{ success: boolean }> {
  return post('/api/push/subscribe', subscription);
}

export function unsubscribePush(endpoint: string): Promise<{ success: boolean }> {
  return post('/api/push/unsubscribe', { endpoint });
}

// Terminal
export function createTerminal(): Promise<{ id: string; shell: string; cwd: string }> {
  return post('/api/terminal/create');
}

export function resizeTerminal(id: string, cols: number, rows: number): Promise<{ success: boolean }> {
  return post(`/api/terminal/resize/${id}`, { cols, rows });
}

export function closeTerminal(id: string): Promise<{ success: boolean }> {
  return post(`/api/terminal/close/${id}`);
}

export function listTerminals(): Promise<{ enabled: boolean; sessions: Array<{ id: string; shell: string; cwd: string; createdAt: number }> }> {
  return get('/api/terminal/list');
}

export function readFile(filePath: string): Promise<{
  type: 'file';
  content: string;
  filename: string;
  ext: string;
  path: string;
}> {
  return get(`/api/read-file?path=${encodeURIComponent(filePath)}`);
}

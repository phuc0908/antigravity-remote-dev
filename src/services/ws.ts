import { useAppStore } from '../store';
import { getSnapshot, getStyles } from './api';

type WSMessage =
  | { type: 'cascade_list'; cascades: Array<{ id: string; title: string; active: boolean; window?: string; quota?: unknown }> }
  | { type: 'snapshot_update'; cascadeId: string }
  | { type: 'quota_update'; cascadeId: string; quota: { statusText: string; planName: string | null; models: Array<{ label: string; percentage: number | null; resetTime: string }> } }
  | { type: 'css_update'; cascadeId: string }
  | { type: 'ai_complete'; cascadeId: string; title: string }
  | { type: 'terminal_output'; sessionId: string; data: string }
  | { type: 'terminal_exit'; sessionId: string; exitCode: number };

let ws: WebSocket | null = null;
let retryCount = 0;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let isUnmounted = false;

export function connectWS(): void {
  isUnmounted = false;
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  const url = `${protocol}//${location.host}/`;
  ws = new WebSocket(url);

  // Expose WS instance globally so TerminalView can attach message listeners
  (window as any).__agWs = ws;

  ws.onopen = () => {
    retryCount = 0;
  };

  ws.onmessage = async (event: MessageEvent) => {
    let msg: WSMessage;
    try {
      msg = JSON.parse(event.data as string) as WSMessage;
    } catch {
      return;
    }
    const store = useAppStore.getState();

    switch (msg.type) {
      case 'cascade_list': {
        const cascades = msg.cascades as Parameters<typeof store.setCascades>[0];
        store.setCascades(cascades);
        const targetId = store.currentCascadeId || (cascades.length > 0 ? cascades[0].id : null);
        if (!store.currentCascadeId && targetId) {
          store.setCurrentCascadeId(targetId);
        }
        if (targetId) {
          void getSnapshot(targetId).then((snap) => {
            useAppStore.getState().setSnapshot(targetId, snap);
          }).catch(() => {});
          void getStyles(targetId).then((styles) => {
            useAppStore.getState().setStyles(targetId, styles);
          }).catch(() => {});
        }
        break;
      }
      case 'snapshot_update': {
        try {
          const snap = await getSnapshot(msg.cascadeId);
          useAppStore.getState().setSnapshot(msg.cascadeId, snap);
        } catch {
          // snapshot fetch failed — skip update
        }
        break;
      }
      case 'quota_update': {
        store.setQuota(msg.cascadeId, msg.quota);
        break;
      }
      case 'css_update': {
        try {
          const styles = await getStyles(msg.cascadeId);
          useAppStore.getState().setStyles(msg.cascadeId, styles);
        } catch {
          // styles fetch failed — skip update
        }
        break;
      }
      case 'ai_complete': {
        useAppStore.getState().triggerAiComplete(msg.cascadeId, msg.title);
        break;
      }
      case 'terminal_exit': {
        useAppStore.getState().removeTerminalSession(msg.sessionId);
        break;
      }
      // terminal_output is handled directly by TerminalView via __agWs listener
    }
  };

  ws.onclose = (event: CloseEvent) => {
    if (event.code === 4001) {
      useAppStore.getState().setAuthed(false);
      return;
    }
    if (isUnmounted) return;
    const delay = Math.min(1000 * Math.pow(2, retryCount), 10_000);
    retryCount++;
    retryTimer = setTimeout(connectWS, delay);
  };

  ws.onerror = () => {
    ws?.close();
  };
}

export function disconnectWS(): void {
  isUnmounted = true;
  if (retryTimer != null) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
  if (ws) {
    ws.onclose = null;
    ws.close();
    ws = null;
  }
  (window as any).__agWs = null;
}

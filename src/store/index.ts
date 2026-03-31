import { create } from 'zustand';

// Inline types to avoid circular deps during parallel task execution
interface QuotaModel {
  label: string;
  percentage: number | null;
  resetTime: string;
}
interface QuotaObject {
  statusText: string;
  planName: string | null;
  models: QuotaModel[];
}
interface SnapshotObject {
  html: string;
  bodyBg: string;
  bodyColor: string;
  clickMap: Record<number, string>;
  hasFeedbackButtons: boolean;
  feedbackFingerprint: string | null;
}
interface StylesResponse {
  css: string;
  computedVars: Record<string, string>;
}
interface CascadeItem {
  id: string;
  title: string;
  active: boolean;
  window?: string;
  quota?: QuotaObject | null;
}
interface TerminalSession {
  id: string;
  shell: string;
  cwd: string;
}

interface AppStore {
  // Auth
  isAuthed: boolean;
  setAuthed: (v: boolean) => void;
  // Cascades
  cascades: CascadeItem[];
  currentCascadeId: string | null;
  setCascades: (cascades: CascadeItem[]) => void;
  setCurrentCascadeId: (id: string | null) => void;
  // Snapshots
  snapshots: Record<string, SnapshotObject>;
  setSnapshot: (id: string, snap: SnapshotObject) => void;
  // Styles
  styles: Record<string, StylesResponse>;
  setStyles: (id: string, data: StylesResponse) => void;
  // Quota
  quotaCache: Record<string, QuotaObject>;
  setQuota: (id: string, quota: QuotaObject) => void;
  // Theme
  themeMode: 'follow' | 'light' | 'dark';
  setThemeMode: (mode: 'follow' | 'light' | 'dark') => void;
  // UI
  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;
  activeView: 'chat' | 'terminal' | 'more';
  setActiveView: (v: 'chat' | 'terminal' | 'more') => void;
  // Modals
  activeModal: null | 'accounts' | 'file-preview' | 'project';
  setActiveModal: (m: null | 'accounts' | 'file-preview' | 'project') => void;
  filePreviewHint: string | null;
  setFilePreviewHint: (v: string | null) => void;
  // AI Complete toast
  aiCompleteEvent: { cascadeId: string; title: string } | null;
  triggerAiComplete: (cascadeId: string, title: string) => void;
  clearAiComplete: () => void;
  // Terminal
  terminalSessions: TerminalSession[];
  activeTerminalId: string | null;
  setActiveTerminalId: (id: string | null) => void;
  addTerminalSession: (session: TerminalSession) => void;
  removeTerminalSession: (id: string) => void;
}

export const useAppStore = create<AppStore>()((set) => ({
  // Auth
  isAuthed: false,
  setAuthed: (v) => set({ isAuthed: v }),
  // Cascades
  cascades: [],
  currentCascadeId: null,
  setCascades: (cascades) => set({ cascades }),
  setCurrentCascadeId: (id) => set({ currentCascadeId: id }),
  // Snapshots
  snapshots: {},
  setSnapshot: (id, snap) =>
    set((state) => ({ snapshots: { ...state.snapshots, [id]: snap } })),
  // Styles
  styles: {},
  setStyles: (id, data) =>
    set((state) => ({ styles: { ...state.styles, [id]: data } })),
  // Quota
  quotaCache: {},
  setQuota: (id, quota) =>
    set((state) => ({ quotaCache: { ...state.quotaCache, [id]: quota } })),
  // Theme
  themeMode: (localStorage.getItem('themeMode') as 'follow' | 'light' | 'dark') ?? 'follow',
  setThemeMode: (mode) => {
    localStorage.setItem('themeMode', mode);
    set({ themeMode: mode });
  },
  // UI
  drawerOpen: false,
  setDrawerOpen: (v) => set({ drawerOpen: v }),
  activeView: 'chat',
  setActiveView: (v) => set({ activeView: v }),
  // Modals
  activeModal: null,
  setActiveModal: (m) => set({ activeModal: m }),
  filePreviewHint: null,
  setFilePreviewHint: (v) => set({ filePreviewHint: v }),
  // AI Complete
  aiCompleteEvent: null,
  triggerAiComplete: (cascadeId, title) => set({ aiCompleteEvent: { cascadeId, title } }),
  clearAiComplete: () => set({ aiCompleteEvent: null }),
  // Terminal
  terminalSessions: [],
  activeTerminalId: null,
  setActiveTerminalId: (id) => set({ activeTerminalId: id }),
  addTerminalSession: (session) =>
    set((state) => ({ terminalSessions: [...state.terminalSessions, session] })),
  removeTerminalSession: (id) =>
    set((state) => {
      const updated = state.terminalSessions.filter((s) => s.id !== id);
      const newActive = state.activeTerminalId === id
        ? (updated.length > 0 ? updated[updated.length - 1].id : null)
        : state.activeTerminalId;
      return { terminalSessions: updated, activeTerminalId: newActive };
    }),
}));

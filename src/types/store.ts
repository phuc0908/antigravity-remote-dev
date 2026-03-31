import type { CascadeItem, QuotaObject, SnapshotObject, StylesResponse } from './api';

export interface AppStore {
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
  activeView: 'chat' | 'more';
  setActiveView: (v: 'chat' | 'more') => void;
  // Modals
  activeModal: null | 'accounts' | 'file-preview' | 'project';
  setActiveModal: (m: null | 'accounts' | 'file-preview' | 'project') => void;
  filePreviewHint: string | null;
  setFilePreviewHint: (v: string | null) => void;
  // AI Complete toast
  aiCompleteEvent: { cascadeId: string; title: string } | null;
  triggerAiComplete: (cascadeId: string, title: string) => void;
  clearAiComplete: () => void;
}

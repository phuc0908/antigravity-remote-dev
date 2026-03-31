export interface SnapshotObject {
  html: string;
  bodyBg: string;
  bodyColor: string;
  clickMap: Record<number, string>;
  hasFeedbackButtons: boolean;
  feedbackFingerprint: string | null;
}

export interface QuotaModel {
  label: string;
  percentage: number | null;
  resetTime: string;
}

export interface QuotaObject {
  statusText: string;
  planName: string | null;
  models: QuotaModel[];
}

export interface CascadeItem {
  id: string;
  title: string;
  active: boolean;
  window?: string;
  quota?: QuotaObject | null;
}

export interface PopupItem {
  title: string;
  description: string;
  badges: string[];
  header: string;
  selector: string;
  checked: boolean;
}

export interface ActiveFileResponse {
  type: 'file' | 'artifact';
  content?: string;
  filename?: string;
  ext?: string;
  path?: string;
  name?: string;
  html?: string;
}

export interface BrowseItem {
  name: string;
  path: string;
}

export interface BrowseResponse {
  currentPath: string;
  parentPath: string | null;
  items: BrowseItem[];
}

export interface StylesResponse {
  css: string;
  computedVars: Record<string, string>;
}

export interface ScrollResponse {
  success: boolean;
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}

export interface ClickResponse {
  success: boolean;
  text: string;
  filePath: string | null;
}

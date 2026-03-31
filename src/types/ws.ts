import type { CascadeItem, QuotaObject } from './api';

export type WSMessage =
  | { type: 'cascade_list'; cascades: CascadeItem[] }
  | { type: 'snapshot_update'; cascadeId: string }
  | { type: 'quota_update'; cascadeId: string; quota: QuotaObject }
  | { type: 'css_update'; cascadeId: string }
  | { type: 'ai_complete'; cascadeId: string; title: string };

import { useRef, useEffect, useState, useCallback } from 'react';
import DOMPurify from 'dompurify';
import morphdom from 'morphdom';
import { useAppStore } from '../../store';
import {
  clickElement, scrollView, openPopup, clickPopup, dismissPopup,
  getSnapshot, getStyles,
} from '../../services/api';
import PopupBubble from './PopupBubble';

let snapshotCssCache: string | null = null;
let themeCssCache: string | null = null;

async function fetchCss(path: string): Promise<string> {
  const res = await fetch(path);
  return res.text();
}

interface PopupState {
  items: Array<{ title: string; description: string; badges: string[]; selector: string; checked: boolean }>;
  anchorRect: DOMRect;
  triggerIndex: number;
}

interface ChatViewProps {
  cascadeId: string;
}

export default function ChatView({ cascadeId }: ChatViewProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<ShadowRoot | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollSyncLockRef = useRef(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const snapshot = useAppStore((s) => s.snapshots[cascadeId]);
  const styles = useAppStore((s) => s.styles[cascadeId]);
  const themeMode = useAppStore((s) => s.themeMode);
  const setFilePreviewHint = useAppStore((s) => s.setFilePreviewHint);
  const setActiveModal = useAppStore((s) => s.setActiveModal);

  const [popup, setPopup] = useState<PopupState | null>(null);

  useEffect(() => {
    if (!cascadeId) return;
    if (!snapshot) {
      void getSnapshot(cascadeId)
        .then((snap) => useAppStore.getState().setSnapshot(cascadeId, snap))
        .catch(() => {});
    }
    if (!styles) {
      void getStyles(cascadeId)
        .then((sty) => useAppStore.getState().setStyles(cascadeId, sty))
        .catch(() => {});
    }
  }, [cascadeId, snapshot, styles]);

  useEffect(() => {
    if (!hostRef.current) return;
    if (hostRef.current.shadowRoot) {
      shadowRef.current = hostRef.current.shadowRoot;
    } else {
      shadowRef.current = hostRef.current.attachShadow({ mode: 'open' });
    }

    const shadow = shadowRef.current;

    const baseStyle = document.createElement('style');
    baseStyle.id = 'base-style';
    baseStyle.textContent = `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        box-sizing: border-box;
      }
      #chat-mount, #chat-viewport, .chat-viewport,
      [data-testid="conversation-view"], [data-testid="autoscroll-viewport"],
      [class*="conversation-view"], #root {
        width: 100%;
        max-width: 100%;
        min-height: 100%;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
      }
      [data-testid="conversation-view"], [data-testid="autoscroll-viewport"] {
        height: auto !important;
        overflow-y: visible !important;
        overflow-x: hidden !important;
      }
      #antigravity\\.agentSidePanelInputBox,
      [class*="surface-composer"] {
        display: none !important;
      }
      .pointer-events-none.absolute.inset-y-0.left-0.z-10.w-7,
      [data-testid="conversation-navigator"] {
        display: none !important;
      }
      .absolute.bottom-0[style*="linear-gradient"],
      [style*="linear-gradient(to top"],
      [style*="linear-gradient(to bottom"],
      [style*="linear-gradient"],
      .md-sticky-message-bleed::after,
      .md-sticky-message-bleed::before,
      [class*="md-sticky-message-bleed"]::after,
      [class*="md-sticky-message-bleed"]::before,
      [class*="after:bg-gradient"],
      [class*="before:bg-gradient"] {
        display: none !important;
        content: none !important;
        background: transparent !important;
      }
      [role="article"].sticky,
      [role="article"][class*="sticky"],
      [class*="sticky"][class*="top-0"] {
        position: relative !important;
        top: auto !important;
        z-index: 1 !important;
      }
      [role="article"][aria-label="User message"] {
        background: rgba(9, 105, 218, 0.08) !important;
        border: 1px solid rgba(128, 128, 128, 0.2) !important;
        border-radius: 16px !important;
        padding: 10px 14px !important;
        margin-top: 10px !important;
        margin-bottom: 14px !important;
        max-width: 95% !important;
      }
      [data-testid="conversation-view"] {
        padding: 12px 14px 32px 14px !important;
      }
      [data-testid="conversation-view"] p,
      [data-testid="conversation-view"] li {
        font-size: 15px !important;
        line-height: 1.6 !important;
      }
      .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 200px;
        color: #999;
        font-size: 14px;
      }
    `;
    shadow.appendChild(baseStyle);

    const ideStyle = document.createElement('style');
    ideStyle.id = 'ide-style';
    shadow.appendChild(ideStyle);

    const snapshotAdapt = document.createElement('style');
    snapshotAdapt.id = 'snapshot-adapt';
    shadow.appendChild(snapshotAdapt);

    const themeOverride = document.createElement('style');
    themeOverride.id = 'theme-override';
    shadow.appendChild(themeOverride);

    const mount = document.createElement('div');
    mount.id = 'chat-mount';
    mount.className = 'chat-viewport';
    mount.innerHTML = '<div class="loading">Waiting for content...</div>';
    shadow.appendChild(mount);
    mountRef.current = mount;

    if (snapshotCssCache) {
      snapshotAdapt.textContent = snapshotCssCache;
    } else {
      void fetchCss('/css/snapshot.css').then((css) => {
        snapshotCssCache = css;
        const el = shadow.querySelector<HTMLStyleElement>('#snapshot-adapt');
        if (el) el.textContent = css;
      });
    }

    if (themeCssCache) {
      themeOverride.textContent = themeCssCache;
    } else {
      void fetchCss('/css/chat-theme.css').then((css) => {
        themeCssCache = css;
        const el = shadow.querySelector<HTMLStyleElement>('#theme-override');
        if (el) el.textContent = css;
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!shadowRef.current || !styles) return;
    const ideStyleEl = shadowRef.current.querySelector<HTMLStyleElement>('#ide-style');
    if (ideStyleEl) {
      ideStyleEl.textContent = styles.css;
    }
    const hostEl = hostRef.current;
    if (hostEl && styles.computedVars) {
      for (const [k, v] of Object.entries(styles.computedVars)) {
        hostEl.style.setProperty(k, v);
      }
    }
  }, [styles]);

  useEffect(() => {
    if (!shadowRef.current || !mountRef.current || !snapshot?.html) return;

    const fragment = DOMPurify.sanitize(snapshot.html, {
      USE_PROFILES: { html: true, svg: true },
      RETURN_DOM_FRAGMENT: true,
      ADD_TAGS: ['style'],
      ADD_ATTR: [
        'data-cdp-click',
        'data-file-name',
        'data-tooltip-id',
        'data-turn-id',
        'data-message-id',
        'data-testid',
        'data-cascade-id',
        'data-quotable',
        'style',
      ],
      ALLOW_DATA_ATTR: true,
      FORCE_BODY: false,
    }) as DocumentFragment;

    const wrapper = document.createElement('div');
    wrapper.id = 'chat-mount';
    wrapper.className = 'chat-viewport';
    while (fragment.firstChild) {
      wrapper.appendChild(fragment.firstChild);
    }

    try {
      morphdom(mountRef.current, wrapper, {
        childrenOnly: false,
        onBeforeElUpdated: (from: Element, to: Element) => {
          if (from.isEqualNode(to)) return false;
          if (from instanceof HTMLTextAreaElement && to instanceof HTMLTextAreaElement) {
            to.value = from.value;
          }
          return true;
        },
      });
    } catch (err) {
      console.warn('morphdom fallback to replaceChildren:', err);
      mountRef.current.replaceChildren(...Array.from(wrapper.childNodes));
    }

    mountRef.current = shadowRef.current.querySelector<HTMLDivElement>('#chat-mount') ?? mountRef.current;

    const effectiveThemeAfterMorph = themeMode === 'follow'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : themeMode;
    mountRef.current.classList.toggle('theme-dark', effectiveThemeAfterMorph === 'dark');
    mountRef.current.classList.toggle('theme-light', effectiveThemeAfterMorph === 'light');
  }, [snapshot, themeMode]);

  useEffect(() => {
    if (!mountRef.current) return;
    const effectiveTheme = themeMode === 'follow'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : themeMode;
    mountRef.current.classList.toggle('theme-dark', effectiveTheme === 'dark');
    mountRef.current.classList.toggle('theme-light', effectiveTheme === 'light');
  }, [themeMode]);

  const handleShadowClick = useCallback(async (e: Event) => {
    const target = (e as MouseEvent).composedPath().find(
      (el): el is HTMLElement => el instanceof HTMLElement && el.dataset.cdpClick !== undefined,
    );
    if (!target) return;
    e.preventDefault();
    e.stopPropagation();

    const index = parseInt(target.dataset.cdpClick ?? '-1', 10);
    if (index < 0) return;

    const fileName = target.dataset.fileName ?? target.closest('[data-file-name]')?.getAttribute('data-file-name');
    if (fileName) {
      try {
        const clickResult = await clickElement(cascadeId, index);
        const hint = clickResult.filePath ?? fileName;
        setFilePreviewHint(hint);
      } catch {
        setFilePreviewHint(fileName);
      }
      setActiveModal('file-preview');
      return;
    }

    try {
      const rect = target.getBoundingClientRect();
      await clickElement(cascadeId, index);
      const { items, found } = await openPopup(cascadeId, index);
      if (found && items.length > 0) {
        setPopup({ items, anchorRect: rect, triggerIndex: index });
      }
    } catch {}
  }, [cascadeId, setFilePreviewHint, setActiveModal]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    host.addEventListener('click', handleShadowClick);
    return () => host.removeEventListener('click', handleShadowClick);
  }, [handleShadowClick]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (scrollSyncLockRef.current) return;
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(async () => {
        const ratio = container.scrollTop / Math.max(1, container.scrollHeight - container.clientHeight);
        try {
          await scrollView(cascadeId, { ratio: Math.min(1, Math.max(0, ratio)) });
        } catch {}
      }, 150);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, [cascadeId]);

  const handlePopupSelect = useCallback(async (item: { title: string; selector: string }) => {
    if (!popup) return;
    setPopup(null);
    try {
      await clickPopup(cascadeId, { title: item.title, selector: item.selector, triggerIndex: popup.triggerIndex });
    } catch {}
  }, [cascadeId, popup]);

  const handlePopupDismiss = useCallback(async () => {
    setPopup(null);
    try {
      await dismissPopup(cascadeId);
    } catch {}
  }, [cascadeId]);

  return (
    <div id="chatContainer" ref={containerRef} className="chat-container">
      <div ref={hostRef} id="chatHost" />
      {popup && (
        <PopupBubble
          items={popup.items}
          anchorRect={popup.anchorRect}
          onSelect={(item) => void handlePopupSelect(item)}
          onDismiss={() => void handlePopupDismiss()}
        />
      )}
    </div>
  );
}

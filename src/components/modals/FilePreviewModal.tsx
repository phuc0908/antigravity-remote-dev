import { useEffect, useState } from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import DOMPurify from 'dompurify';
import { useAppStore } from '../../store';
import { readFile, getActiveFile, closeTab } from '../../services/api';

marked.setOptions({ gfm: true, breaks: true });

function highlightCode(code: string, lang: string): string {
  try {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  } catch {
    return code;
  }
}

function isMarkdownFile(filename: string, ext: string): boolean {
  if (ext === 'md' || ext === 'markdown') return true;
  const lower = filename.toLowerCase();
  return lower.includes('.md.') || lower.endsWith('.md');
}

export default function FilePreviewModal() {
  const { activeModal, filePreviewHint, currentCascadeId, setActiveModal, setFilePreviewHint } = useAppStore();
  const isOpen = activeModal === 'file-preview';

  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isHtml, setIsHtml] = useState(false);
  const [hasTab, setHasTab] = useState(false);

  useEffect(() => {
    if (!isOpen || !currentCascadeId) return;
    setLoading(true);
    setError('');
    setContent('');
    setHasTab(false);

    const hint = filePreviewHint ?? '';
    const isAbsolutePath = hint.startsWith('/') || hint.startsWith('~');

    const fetchContent = isAbsolutePath
      ? readFile(hint)
      : new Promise<Awaited<ReturnType<typeof getActiveFile>>>((resolve, reject) => {
          setTimeout(() => getActiveFile(currentCascadeId).then(resolve).catch(reject), 600);
        });

    void fetchContent
      .then((file) => {
        if (file.type === 'artifact') {
          setTitle((file as { name?: string }).name ?? 'Artifact');
          const sanitized = DOMPurify.sanitize((file as { html?: string }).html ?? '', {
            USE_PROFILES: { html: true },
          });
          setContent(sanitized);
          setIsHtml(true);
          setHasTab(true);
        } else {
          const fname = (file as { filename?: string }).filename ?? hint ?? 'File';
          setTitle(fname);
          const ext = ((file as { ext?: string }).ext ?? fname.split('.').pop() ?? '').toLowerCase();
          const rawContent = (file as { content?: string }).content ?? '';
          if (isMarkdownFile(fname, ext)) {
            const rendered = marked.parse(rawContent) as string;
            setContent(DOMPurify.sanitize(rendered));
          } else {
            const highlighted = highlightCode(rawContent, ext);
            setContent(`<pre><code class="hljs">${highlighted}</code></pre>`);
          }
          setIsHtml(true);
          setHasTab(!isAbsolutePath);
        }
      })
      .catch((err: Error) => {
        setError(err.message || 'Failed to load file');
      })
      .finally(() => setLoading(false));
  }, [isOpen, currentCascadeId, filePreviewHint]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    setActiveModal(null);
    setFilePreviewHint(null);
    setContent('');
  };

  const handleCloseTab = async () => {
    if (!currentCascadeId) return;
    try {
      await closeTab(currentCascadeId);
    } catch {
      void 0;
    }
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay file-preview-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="File Preview"
    >
      <div className="modal-card file-preview-modal">
        <div className="modal-header">
          <span className="file-preview-title">{title || filePreviewHint || 'File Preview'}</span>
          <div className="modal-header-actions">
            {hasTab && (
              <button type="button" className="modal-btn" onClick={() => void handleCloseTab()} title="Close tab">
                Close Tab
              </button>
            )}
            <button type="button" className="modal-close" onClick={handleClose} aria-label="Close">✕</button>
          </div>
        </div>
        <div className="modal-body file-content">
          {loading && <div className="file-loading">Loading...</div>}
          {error && <div className="file-error">{error}</div>}
          {!loading && !error && isHtml && (
            // eslint-disable-next-line react/no-danger
            <div
              dangerouslySetInnerHTML={{ __html: content }}
              className="file-html"
            />
          )}
        </div>
      </div>
    </div>
  );
}

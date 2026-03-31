import { useEffect, useRef, useCallback } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';
import { useAppStore } from '../../store';

interface TerminalViewProps {
  sessionId: string;
}

export default function TerminalView({ sessionId }: TerminalViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);

  const sendWsMessage = useCallback((data: unknown) => {
    const ws = (window as any).__agWs as WebSocket | undefined;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: "'JetBrainsMono Nerd Font', 'MesloLGS NF', 'Fira Code', 'Cascadia Code', monospace",
      theme: {
        background: '#1a1b26',
        foreground: '#c0caf5',
        cursor: '#c0caf5',
        selectionBackground: '#33467c',
        black: '#15161e',
        red: '#f7768e',
        green: '#9ece6a',
        yellow: '#e0af68',
        blue: '#7aa2f7',
        magenta: '#bb9af7',
        cyan: '#7dcfff',
        white: '#a9b1d6',
        brightBlack: '#414868',
        brightRed: '#f7768e',
        brightGreen: '#9ece6a',
        brightYellow: '#e0af68',
        brightBlue: '#7aa2f7',
        brightMagenta: '#bb9af7',
        brightCyan: '#7dcfff',
        brightWhite: '#c0caf5',
      },
      allowTransparency: true,
      scrollback: 5000,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);
    term.open(containerRef.current);

    // Fit after short delay to ensure container is measured
    requestAnimationFrame(() => {
      fitAddon.fit();
      sendWsMessage({ type: 'terminal_resize', sessionId, cols: term.cols, rows: term.rows });
    });

    // Send input to server
    term.onData((data) => {
      sendWsMessage({ type: 'terminal_input', sessionId, data });
    });

    termRef.current = term;
    fitRef.current = fitAddon;

    // Resize observer
    const observer = new ResizeObserver(() => {
      fitAddon.fit();
      sendWsMessage({ type: 'terminal_resize', sessionId, cols: term.cols, rows: term.rows });
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      term.dispose();
      termRef.current = null;
      fitRef.current = null;
    };
  }, [sessionId, sendWsMessage]);

  // Listen for WS output
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'terminal_output' && msg.sessionId === sessionId) {
          termRef.current?.write(msg.data);
        }
      } catch { /* ignore */ }
    };

    // Attach listener to the global WS
    const checkWs = () => {
      const ws = (window as any).__agWs as WebSocket | undefined;
      if (ws) {
        ws.addEventListener('message', handler);
        return () => ws.removeEventListener('message', handler);
      }
      return undefined;
    };

    let cleanup = checkWs();
    // Retry if WS not ready yet
    if (!cleanup) {
      const interval = setInterval(() => {
        cleanup = checkWs();
        if (cleanup) clearInterval(interval);
      }, 200);
      return () => {
        clearInterval(interval);
        cleanup?.();
      };
    }

    return cleanup;
  }, [sessionId]);

  return (
    <div className="terminal-view" ref={containerRef} />
  );
}

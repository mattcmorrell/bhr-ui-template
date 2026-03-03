import { useEffect, useRef } from 'react';

// Injected directly into the js-dos container element so it scopes tightly
// and can't be beaten by Tailwind utility classes (inline style > class styles)
const JSDOS_NUKE_CSS = `
  .sidebar, .sidebar-button, .background-image, .contentbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
    overflow: hidden !important;
    pointer-events: none !important;
  }
  .window.absolute {
    overflow: hidden !important;
  }
  .window.absolute > div:first-child {
    width: 100% !important;
    height: 100% !important;
    overflow: hidden !important;
  }
  .pre-run-window {
    width: 100% !important;
    height: 100% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  .pre-run-window > div:not(:first-child) {
    display: none !important;
  }
  canvas {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain !important;
    image-rendering: pixelated !important;
  }
`;

const kbd: React.CSSProperties = {
  background: '#333',
  color: '#aaa',
  padding: '1px 5px',
  borderRadius: '3px',
  border: '1px solid #444',
  fontSize: '11px',
  fontFamily: 'Inter, sans-serif',
};

export function Doom() {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current || !containerRef.current) return;
    loadedRef.current = true;

    const container = containerRef.current;

    // Load js-dos v8 from CDN
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://v8.js-dos.com/latest/js-dos.css';
    document.head.appendChild(link);

    // Inject override styles into the container itself (not <head>)
    // so they load after js-dos CSS and win specificity battles
    const style = document.createElement('style');
    style.textContent = JSDOS_NUKE_CSS;

    const script = document.createElement('script');
    script.src = 'https://v8.js-dos.com/latest/js-dos.js';
    script.onload = () => {
      // @ts-expect-error js-dos global
      Dos(container, {
        url: 'https://v8.js-dos.com/bundles/doom.jsdos',
        autoStart: true,
        mouseSensitivity: 3.0,
        mouseCapture: true,
      });
      // Inject style after js-dos renders its first frame
      requestAnimationFrame(() => container.appendChild(style));
    };
    document.head.appendChild(script);

    return () => {
      link.remove();
      style.remove();
      script.remove();
    };
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#1a1a1a',
      borderRadius: 'var(--radius-medium)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid #333',
        flexShrink: 0,
      }}>
        <h1 style={{ color: '#c41e1e', fontSize: '24px', fontWeight: 700, margin: 0, fontFamily: 'Inter, sans-serif' }}>
          DOOM
        </h1>
        <p style={{ color: '#888', fontSize: '13px', margin: '4px 0 0', fontFamily: 'Inter, sans-serif' }}>
          Employee Wellness Program
        </p>
      </div>
      <div
        ref={containerRef}
        style={{
          flex: 1,
          width: '100%',
          background: '#000',
          position: 'relative',
          overflow: 'hidden',
        }}
      />
      <div style={{
        padding: '10px 24px',
        borderTop: '1px solid #333',
        flexShrink: 0,
        display: 'flex',
        gap: '24px',
        fontFamily: 'Inter, sans-serif',
        fontSize: '12px',
        color: '#666',
      }}>
        <span><kbd style={kbd}>WASD</kbd> / <kbd style={kbd}>Arrows</kbd> Move</span>
        <span><kbd style={kbd}>Mouse</kbd> Aim</span>
        <span><kbd style={kbd}>Click</kbd> / <kbd style={kbd}>Ctrl</kbd> Shoot</span>
        <span><kbd style={kbd}>Space</kbd> Use/Open</span>
        <span><kbd style={kbd}>Shift</kbd> Run</span>
        <span><kbd style={kbd}>1-7</kbd> Weapons</span>
        <span><kbd style={kbd}>Esc</kbd> Menu / Release mouse</span>
      </div>
    </div>
  );
}

export default Doom;

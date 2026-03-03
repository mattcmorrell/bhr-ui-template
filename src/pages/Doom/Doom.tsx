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
`;

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
    </div>
  );
}

export default Doom;

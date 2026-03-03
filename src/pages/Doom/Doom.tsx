import { useEffect, useRef } from 'react';

export function Doom() {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current || !containerRef.current) return;
    loadedRef.current = true;

    // Load js-dos v8 from CDN
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://v8.js-dos.com/latest/js-dos.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://v8.js-dos.com/latest/js-dos.js';
    script.onload = () => {
      const el = containerRef.current;
      if (!el) return;
      // @ts-expect-error js-dos global
      Dos(el, {
        url: 'https://v8.js-dos.com/bundles/doom.jsdos',
      });
    };
    document.head.appendChild(script);

    return () => {
      link.remove();
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
        }}
      />
    </div>
  );
}

export default Doom;

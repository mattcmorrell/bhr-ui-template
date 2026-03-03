import { useEffect, useRef, useState, useCallback } from 'react';

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

// Track all AudioContexts created by js-dos so we can kill them on unmount
const trackedContexts = new Set<AudioContext>();
let audioPatched = false;
let globalMuted = false;
let muteInterval: ReturnType<typeof setInterval> | null = null;

function patchAudioContext() {
  if (audioPatched) return;
  audioPatched = true;

  const OrigAudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!OrigAudioContext) return;

  const PatchedAudioContext = function (this: AudioContext, ...args: any[]) {
    const ctx = new OrigAudioContext(...args);
    trackedContexts.add(ctx);
    // If globally muted, immediately suspend new contexts
    if (globalMuted) ctx.suspend();
    return ctx;
  } as any;
  PatchedAudioContext.prototype = OrigAudioContext.prototype;
  (window as any).AudioContext = PatchedAudioContext;
  if ((window as any).webkitAudioContext) {
    (window as any).webkitAudioContext = PatchedAudioContext;
  }
}

function closeAllAudioContexts() {
  if (muteInterval) { clearInterval(muteInterval); muteInterval = null; }
  trackedContexts.forEach((ctx) => {
    try {
      if (ctx.state !== 'closed') ctx.close();
    } catch { /* already closed */ }
  });
  trackedContexts.clear();
}

function setMuteAll(muted: boolean) {
  globalMuted = muted;
  // Clear any existing enforcement interval
  if (muteInterval) { clearInterval(muteInterval); muteInterval = null; }

  const apply = () => {
    trackedContexts.forEach((ctx) => {
      try {
        if (muted && ctx.state === 'running') ctx.suspend();
        if (!muted && ctx.state === 'suspended') ctx.resume();
      } catch { /* closed */ }
    });
  };

  apply();
  // js-dos creates/resumes contexts over time — enforce periodically while muted
  if (muted) {
    muteInterval = setInterval(apply, 500);
  }
}

// Load the js-dos script once globally — it must survive across navigations
let scriptLoaded = false;
function ensureScript(): Promise<void> {
  patchAudioContext();

  if (scriptLoaded && typeof (window as any).Dos === 'function') {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    if (typeof (window as any).Dos === 'function') {
      scriptLoaded = true;
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://v8.js-dos.com/latest/js-dos.js';
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    document.head.appendChild(script);
  });
}

function DoomEmulator({ muted }: { muted: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle mute/unmute via gain nodes (reliable unlike suspend/resume)
  useEffect(() => {
    setMuteAll(muted);
  }, [muted]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const style = document.createElement('style');
    style.textContent = JSDOS_NUKE_CSS;

    let cancelled = false;

    ensureScript().then(() => {
      if (cancelled || !containerRef.current) return;
      // @ts-expect-error js-dos global
      Dos(container, {
        url: 'https://v8.js-dos.com/bundles/doom.jsdos',
        autoStart: true,
        mouseSensitivity: 0.9,
        mouseCapture: true,
      });
      requestAnimationFrame(() => container.appendChild(style));
    });

    return () => {
      cancelled = true;
      // Close all tracked AudioContexts created by js-dos
      closeAllAudioContexts();
      // Kill any media elements
      container.querySelectorAll('audio, video').forEach((el) => el.remove());
      // Nuke the container contents to stop the emulator
      container.innerHTML = '';
      style.remove();
    };
  }, []);

  return (
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
  );
}

export function Doom() {
  const [sessionKey, setSessionKey] = useState(0);
  const [muted, setMuted] = useState(false);

  const toggleMute = useCallback(() => setMuted((m) => !m), []);

  useEffect(() => {
    return () => setSessionKey((k) => k + 1);
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{ color: '#c41e1e', fontSize: '24px', fontWeight: 700, margin: 0, fontFamily: 'Inter, sans-serif' }}>
            DOOM
          </h1>
          <p style={{ color: '#888', fontSize: '13px', margin: '4px 0 0', fontFamily: 'Inter, sans-serif' }}>
            Employee Wellness Program
          </p>
        </div>
        <button
          onClick={toggleMute}
          title={muted ? 'Unmute' : 'Mute'}
          style={{
            background: muted ? '#c41e1e' : 'transparent',
            border: '2px solid #c41e1e',
            borderRadius: '8px',
            padding: '8px 16px',
            color: '#fff',
            fontSize: '20px',
            fontFamily: 'Inter, sans-serif',
            cursor: 'pointer',
            transition: 'background 0.2s, color 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '24px', lineHeight: 1 }}>{muted ? '🔇' : '🔊'}</span>
          <span style={{ fontSize: '14px', fontWeight: 700 }}>{muted ? 'Unmute' : 'Mute'}</span>
        </button>
      </div>
      <DoomEmulator key={sessionKey} muted={muted} />
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

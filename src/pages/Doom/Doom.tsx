import { useEffect, useRef, useState, useCallback } from 'react';

const kbd: React.CSSProperties = {
  background: '#333',
  color: '#aaa',
  padding: '1px 5px',
  borderRadius: '3px',
  border: '1px solid #444',
  fontSize: '11px',
  fontFamily: 'Inter, sans-serif',
};

// Build a self-contained HTML page that runs js-dos inside an iframe.
// This completely isolates js-dos (CSS, JS, AudioContext) from the host app.
// Tearing down = removing the iframe. No monkey-patching needed.
const DOOM_HTML = `<!DOCTYPE html>
<html><head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: #000; }
  #dos { width: 100%; height: 100%; }
  .sidebar, .sidebar-button, .background-image, .contentbar {
    display: none !important;
    width: 0 !important; height: 0 !important;
    overflow: hidden !important; pointer-events: none !important;
  }
  .window.absolute { overflow: hidden !important; }
  .window.absolute > div:first-child {
    width: 100% !important; height: 100% !important; overflow: hidden !important;
  }
  .pre-run-window {
    width: 100% !important; height: 100% !important;
    display: flex !important; align-items: center !important; justify-content: center !important;
  }
  .pre-run-window > div:not(:first-child) { display: none !important; }
  canvas {
    width: 100% !important; height: 100% !important;
    object-fit: contain !important; image-rendering: pixelated !important;
  }
</style>
</head><body>
<div id="dos"></div>
<script src="https://v8.js-dos.com/latest/js-dos.js"><\/script>
<script>
  Dos(document.getElementById("dos"), {
    url: "https://v8.js-dos.com/bundles/doom.jsdos",
    autoStart: true,
    mouseSensitivity: 0.9,
    mouseCapture: true,
  });

  // Listen for mute/unmute messages from parent
  window.addEventListener("message", function(e) {
    if (e.data === "mute") {
      var contexts = window._audioContexts || [];
      contexts.forEach(function(ctx) {
        if (ctx.state === "running") ctx.suspend();
      });
    } else if (e.data === "unmute") {
      var contexts = window._audioContexts || [];
      contexts.forEach(function(ctx) {
        if (ctx.state === "suspended") ctx.resume();
      });
    }
  });

  // Track all AudioContexts created inside the iframe
  window._audioContexts = [];
  var _OrigAC = window.AudioContext || window.webkitAudioContext;
  if (_OrigAC) {
    var _Patched = function() {
      var ctx = new _OrigAC();
      window._audioContexts.push(ctx);
      return ctx;
    };
    _Patched.prototype = _OrigAC.prototype;
    window.AudioContext = _Patched;
    if (window.webkitAudioContext) window.webkitAudioContext = _Patched;
  }
<\/script>
</body></html>`;

export function Doom() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const blobUrlRef = useRef<string | null>(null);
  const [muted, setMuted] = useState(false);

  const toggleMute = useCallback(() => setMuted((m) => !m), []);

  // Send mute/unmute messages to the iframe
  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(muted ? 'mute' : 'unmute', '*');
  }, [muted]);

  // Create blob URL on mount, revoke on unmount
  useEffect(() => {
    const blob = new Blob([DOOM_HTML], { type: 'text/html' });
    blobUrlRef.current = URL.createObjectURL(blob);
    const url = blobUrlRef.current;

    if (iframeRef.current) {
      iframeRef.current.src = url;
    }

    return () => {
      // Removing/clearing the iframe src kills all audio and JS inside it
      if (iframeRef.current) {
        iframeRef.current.src = 'about:blank';
      }
      URL.revokeObjectURL(url);
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
      <iframe
        ref={iframeRef}
        style={{
          flex: 1,
          width: '100%',
          border: 'none',
          background: '#000',
        }}
        allow="autoplay"
        title="DOOM"
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

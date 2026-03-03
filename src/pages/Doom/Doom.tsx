export function Doom() {
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
      <iframe
        src="https://dos.zone/doom-dec-1993/"
        style={{
          flex: 1,
          width: '100%',
          border: 'none',
          background: '#000',
        }}
        allow="autoplay; fullscreen"
        title="DOOM"
      />
    </div>
  );
}

export default Doom;

export default function MobileControls() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (!isMobile) return null;

  return (
    <div id="mobile-controls" style={{ display: 'none' }}>
      <div className="mobile-movement-controls">
        <div>
          <button className="mobile-button" id="move-up">↑</button>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="mobile-button" id="move-left">←</button>
          <button className="mobile-button" id="move-right">→</button>
        </div>
        <button className="mobile-button" id="move-down">↓</button>
      </div>
      <div className="mobile-action-controls">
        <button className="mobile-action-button" id="mobile-preview">G</button>
        <button className="mobile-action-button" id="mobile-buy">B</button>
      </div>
    </div>
  );
}
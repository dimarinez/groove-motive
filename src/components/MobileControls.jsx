export default function MobileControls() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (!isMobile) return null;

  return (
    <div id="mobile-controls" style={{ display: 'none' }}>
      <div className="mobile-movement-controls">
        <div>
          <button className="mobile-button" id="move-up" aria-label="Move forward">↑</button>
        </div>
        <div className="mobile-movement-row">
          <button className="mobile-button" id="move-left" aria-label="Move left">←</button>
          <button className="mobile-button" id="move-right" aria-label="Move right">→</button>
        </div>
        <button className="mobile-button" id="move-down" aria-label="Move backward">↓</button>
      </div>
      <div className="mobile-action-controls">
        <button className="mobile-action-button" id="mobile-preview" aria-label="Play or stop preview"><span>G</span><small>Play</small></button>
        <button className="mobile-action-button" id="mobile-pause" aria-label="Pause or resume preview"><span>P</span><small>Pause</small></button>
        <button className="mobile-action-button" id="mobile-buy" aria-label="Buy track"><span>B</span><small>Buy</small></button>
      </div>
    </div>
  );
}

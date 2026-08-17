export default function UI() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  return (
    <div id="ui" role="status" aria-live="polite">
      <div className="gallery-ui-status">
        <span className="gallery-ui-status-dot" aria-hidden="true"></span>
        Selected release
      </div>
      <div id="album-title"></div>
      <div className="instructions" aria-label="Release controls">
        {isMobile ? (
          <>
            <span><strong>G</strong> Preview</span>
            <span><strong>B</strong> Buy track</span>
          </>
        ) : (
          <>
            <span><strong>G</strong> Preview</span>
            <span><strong>B</strong> Buy track</span>
          </>
        )}
      </div>
    </div>
  );
}

export default function UI() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  return (
    <div id="ui">
      <div id="album-title"></div>
      <div className="instructions">
        {isMobile ? (
          <>
            Tap <strong>G</strong> button to play preview<br />
            Tap <strong>B</strong> button to buy album
          </>
        ) : (
          <>
            Press <strong>G</strong> to play preview<br />
            Press <strong>B</strong> to buy album
          </>
        )}
      </div>
    </div>
  );
}
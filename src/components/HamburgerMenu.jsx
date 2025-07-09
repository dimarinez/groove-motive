export default function HamburgerMenu() {
  const handleExit = () => {
    // Exit gallery mode by unlocking controls
    // This will trigger the unlock event listener which resets to initial state
    try {
      // First try to access controls from global scope
      if (window.controls && window.controls.unlock) {
        window.controls.unlock();
      } else {
        // Fallback: dispatch escape event
        const escEvent = new KeyboardEvent('keydown', {
          key: 'Escape',
          keyCode: 27,
          which: 27,
          code: 'Escape',
          bubbles: true
        });
        document.dispatchEvent(escEvent);
      }
    } catch (error) {
      console.warn('Could not exit gallery:', error);
      // Last resort: reload page to exit gallery
      window.location.reload();
    }
  };

  return (
    <div id="hamburger-menu" className="hamburger-menu">
      <button 
        className="hamburger-button"
        onClick={handleExit}
        aria-label="Exit Gallery"
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>
    </div>
  );
}
export default function HamburgerMenu() {
  const handleExit = () => {
    // Exit gallery mode by unlocking controls
    // This will trigger the unlock event listener which resets to initial state
    try {
      // First try to access controls from global scope
      if (window.controls && window.controls.unlock) {
        console.log('Unlocking controls via hamburger menu');
        window.controls.unlock();
      } else {
        console.log('Controls not available, trying escape event');
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
      // Force exit by showing container and hiding controls
      const container = document.getElementById('container');
      const mobileControls = document.getElementById('mobile-controls');
      
      if (container) {
        container.style.display = 'flex';
      }
      if (mobileControls) {
        mobileControls.style.display = 'none';
      }
      
      // Reset body styles
      document.body.style.cursor = 'auto';
      document.body.classList.remove('gallery-entered');
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
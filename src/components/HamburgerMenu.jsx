export default function HamburgerMenu() {
  const handleExit = () => {
    // Exit gallery mode by unlocking controls
    // This will trigger the unlock event listener which properly resets to initial state
    try {
      console.log('Hamburger menu clicked - exiting gallery');
      
      // Use the controls unlock method which triggers the proper reset sequence
      if (window.controls && window.controls.unlock) {
        window.controls.unlock();
      } else if (window.controls && window.controls.isLocked) {
        // Alternative unlock method
        window.controls.isLocked = false;
        window.controls.dispatchEvent(new Event('unlock'));
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
      console.warn('Could not exit gallery properly, using manual reset:', error);
      
      // Manual reset sequence that matches resetToInitialState
      const container = document.getElementById('container');
      const mobileControls = document.getElementById('mobile-controls');
      
      // Show container with animation
      if (container) {
        container.style.display = 'flex';
      }
      
      // Hide mobile controls
      if (mobileControls) {
        mobileControls.style.display = 'none';
      }
      
      // Reset body styles
      document.body.style.cursor = 'auto';
      document.body.classList.remove('gallery-entered');
      
      // Call animatePreview if available
      if (window.animatePreview) {
        window.animatePreview();
      }
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
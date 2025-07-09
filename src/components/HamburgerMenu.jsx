export default function HamburgerMenu() {
  const handleExit = () => {
    console.log('Hamburger menu clicked - exiting gallery');
    
    try {
      // Directly call resetToInitialState if available for proper transitions
      if (window.resetToInitialState) {
        console.log('Calling resetToInitialState directly');
        window.resetToInitialState();
        return;
      }
      
      // Fallback: Use controls unlock method
      if (window.controls && window.controls.unlock) {
        console.log('Using controls.unlock() method');
        window.controls.unlock();
        return;
      }
      
      // Last resort: dispatch escape event
      console.log('Using escape key fallback');
      const escEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        keyCode: 27,
        which: 27,
        code: 'Escape',
        bubbles: true
      });
      document.dispatchEvent(escEvent);
      
    } catch (error) {
      console.warn('All exit methods failed, forcing manual reset:', error);
      
      // Force manual reset
      const container = document.getElementById('container');
      const mobileControls = document.getElementById('mobile-controls');
      
      if (container) container.style.display = 'flex';
      if (mobileControls) mobileControls.style.display = 'none';
      
      document.body.style.cursor = 'auto';
      document.body.classList.remove('gallery-entered');
      
      if (window.animatePreview) {
        setTimeout(() => window.animatePreview(), 100);
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
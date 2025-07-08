import { useState } from 'react';

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const handleExit = () => {
    // Simulate ESC key press functionality
    const escEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      keyCode: 27,
      which: 27,
      code: 'Escape',
      bubbles: true
    });
    document.dispatchEvent(escEvent);
    setIsOpen(false);
  };

  return (
    <div id="hamburger-menu" className="hamburger-menu">
      <button 
        className="hamburger-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu"
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>
      
      {isOpen && (
        <div className="hamburger-dropdown">
          <button 
            className="hamburger-item"
            onClick={handleExit}
          >
            Exit Gallery
          </button>
        </div>
      )}
    </div>
  );
}
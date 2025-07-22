export default function HamburgerMenu() {
  const handleExit = () => {
    // Simple page refresh for clean reset on all devices
    window.location.reload();
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
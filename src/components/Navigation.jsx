import { useState, useEffect } from 'react';
import { gsap } from 'gsap';

export default function Navigation({ onNavigate, currentView = 'home' }) {
  // Determine if we need dark or light navigation based on current view
  const isDarkBackground = currentView === 'home';
  const navClass = isDarkBackground ? 'nav-dark-bg' : 'nav-light-bg';
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'about', label: 'About', href: '#about' },
    { id: 'releases', label: 'Releases', href: '#releases' },
    { id: 'events', label: 'Events', href: '#events' },
    { id: 'videos', label: 'Videos', href: '#videos' }
  ];

  useEffect(() => {
    // Animate navigation on mount
    gsap.fromTo('.nav-item', 
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, delay: 0.3 }
    );
  }, []);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
    
    if (!isMenuOpen) {
      gsap.to('.mobile-nav-menu', {
        opacity: 1,
        visibility: 'visible',
        duration: 0.3,
        ease: 'power2.out'
      });
      gsap.fromTo('.mobile-nav-item',
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, delay: 0.2 }
      );
    } else {
      gsap.to('.mobile-nav-menu', {
        opacity: 0,
        visibility: 'hidden',
        duration: 0.3,
        ease: 'power2.in'
      });
    }
  };

  const handleNavClick = (itemId, href) => {
    setIsMenuOpen(false);
    
    onNavigate(itemId);

    // Close mobile menu
    if (isMenuOpen) {
      gsap.to('.mobile-nav-menu', {
        opacity: 0,
        visibility: 'hidden',
        duration: 0.3
      });
    }
  };

  return (
    <>
      <nav className={`main-navigation ${navClass}`}>
        <div className="nav-container">
          {/* Logo - Clickable Home Button */}
          <button 
            className="nav-logo"
            onClick={() => handleNavClick('home', '#home')}
            aria-label="Go to home page"
          >
            <img 
              src="/src/assets/GM_Wordmark_WHITE_300PPI.svg" 
              alt="Groove Motive" 
              className="nav-logo-img"
            />
          </button>

          {/* Desktop Navigation */}
          <ul className="nav-menu desktop-nav">
            {navigationItems.map((item) => (
              <li key={item.id} className="nav-item">
                <button
                  onClick={() => handleNavClick(item.id, item.href)}
                  className={`nav-link ${currentView === item.id ? 'active' : ''} ${item.isSpecial ? 'special' : ''}`}
                >
                  {item.label}
                  {item.isSpecial && <span className="arrow">→</span>}
                </button>
              </li>
            ))}
          </ul>

          {/* Mobile Menu Button */}
          <button 
            className={`mobile-menu-btn ${isMenuOpen ? 'open' : ''}`}
            onClick={handleMenuToggle}
            aria-label="Toggle navigation menu"
          >
            <span className="menu-line"></span>
            <span className="menu-line"></span>
            <span className="menu-line"></span>
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      <div className={`mobile-nav-menu ${navClass}`}>
        <div className="mobile-nav-content">
          <ul className="mobile-nav-list">
            {navigationItems.map((item) => (
              <li key={item.id} className="mobile-nav-item">
                <button
                  onClick={() => handleNavClick(item.id, item.href)}
                  className={`mobile-nav-link ${currentView === item.id ? 'active' : ''} ${item.isSpecial ? 'special' : ''}`}
                >
                  {item.label}
                  {item.isSpecial && <span className="arrow">→</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
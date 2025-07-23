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
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);
    
    const mobileMenu = document.querySelector('.mobile-nav-menu');
    
    if (newState) {
      // Opening menu
      mobileMenu.classList.add('show');
      gsap.fromTo('.mobile-nav-item',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, delay: 0.2 }
      );
    } else {
      // Closing menu
      gsap.to('.mobile-nav-item', {
        opacity: 0,
        y: -30,
        duration: 0.3,
        stagger: 0.05,
        onComplete: () => {
          mobileMenu.classList.remove('show');
        }
      });
    }
  };

  const handleNavClick = (itemId, href) => {
    onNavigate(itemId);

    // Close mobile menu if open
    if (isMenuOpen) {
      const mobileMenu = document.querySelector('.mobile-nav-menu');
      gsap.to('.mobile-nav-item', {
        opacity: 0,
        y: -30,
        duration: 0.3,
        stagger: 0.05,
        onComplete: () => {
          mobileMenu.classList.remove('show');
          setIsMenuOpen(false);
        }
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
              src="https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/GM_Wordmark_WHITE_300PPI.svg" 
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
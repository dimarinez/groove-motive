import { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import wordmark from '../assets/GM_Wordmark_WHITE_300PPI.svg';

export default function Navigation({ onNavigate, currentView = 'home' }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [navTheme, setNavTheme] = useState(currentView === 'home' ? 'dark' : 'light');
  const navClass = navTheme === 'dark' ? 'nav-dark-bg' : 'nav-light-bg';

  const navigationItems = [
    { id: 'about', label: 'About', href: '#about', number: '01' },
    { id: 'releases', label: 'Releases', href: '#releases', number: '02' },
    { id: 'events', label: 'Events', href: '#events', number: '03' },
    { id: 'videos', label: 'Videos', href: '#videos', number: '04' },
    // { id: 'open-decks', label: 'Open Decks', href: '#open-decks' }
  ];

  useEffect(() => {
    // Animate navigation on mount
    gsap.fromTo('.nav-item', 
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, delay: 0.3 }
    );
  }, []);

  useEffect(() => {
    let frameId = null;

    const updateNavTheme = () => {
      frameId = null;
      const sampleY = window.innerWidth <= 900 ? 38 : 43;
      const themedSections = document.querySelectorAll('[data-nav-theme]');
      let nextTheme = currentView === 'home' ? 'dark' : 'light';

      themedSections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= sampleY && rect.bottom > sampleY) {
          nextTheme = section.dataset.navTheme;
        }
      });

      setNavTheme((currentTheme) => currentTheme === nextTheme ? currentTheme : nextTheme);
    };

    const requestThemeUpdate = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(updateNavTheme);
    };

    updateNavTheme();
    window.addEventListener('scroll', requestThemeUpdate, { passive: true });
    window.addEventListener('resize', requestThemeUpdate);

    return () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', requestThemeUpdate);
      window.removeEventListener('resize', requestThemeUpdate);
    };
  }, [currentView]);

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
              src={wordmark}
              alt="Groove Motive" 
              className="nav-logo-img"
            />
            <span className="nav-logo-meta">Independent label · Los Angeles</span>
          </button>

          {/* Desktop Navigation */}
          <ul className="nav-menu desktop-nav">
            {navigationItems.map((item) => (
              <li key={item.id} className="nav-item">
                <button
                  onClick={() => handleNavClick(item.id, item.href)}
                  className={`nav-link ${currentView === item.id ? 'active' : ''} ${item.isSpecial ? 'special' : ''}`}
                  aria-current={currentView === item.id ? 'page' : undefined}
                >
                  <span className="nav-item-number">{item.number}</span>
                  {item.label}
                  {item.isSpecial && <span className="arrow">→</span>}
                </button>
              </li>
            ))}
          </ul>

          <button
            className="nav-gallery-link"
            onClick={() => handleNavClick('listening-room', '#listening-room')}
          >
            <span>Enter 3D gallery</span>
            <span aria-hidden="true">↗</span>
          </button>

          {/* Mobile Menu Button */}
          <button 
            className={`mobile-menu-btn ${isMenuOpen ? 'open' : ''}`}
            onClick={handleMenuToggle}
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
          >
            <span className="menu-line"></span>
            <span className="menu-line"></span>
            <span className="menu-line"></span>
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      <div id="mobile-navigation" className={`mobile-nav-menu ${navClass}`} aria-hidden={!isMenuOpen}>
        <div className="mobile-nav-content">
          <ul className="mobile-nav-list">
            {navigationItems.map((item) => (
              <li key={item.id} className="mobile-nav-item">
                <button
                  onClick={() => handleNavClick(item.id, item.href)}
                  className={`mobile-nav-link ${currentView === item.id ? 'active' : ''} ${item.isSpecial ? 'special' : ''}`}
                  aria-current={currentView === item.id ? 'page' : undefined}
                >
                  <span className="mobile-nav-number">{item.number}</span>
                  {item.label}
                  {item.isSpecial && <span className="arrow">→</span>}
                </button>
              </li>
            ))}
            <li className="mobile-nav-item mobile-nav-gallery-item">
              <button
                onClick={() => handleNavClick('listening-room', '#listening-room')}
                className="mobile-nav-link mobile-nav-gallery-link"
              >
                <span className="mobile-nav-number">05</span>
                Enter 3D gallery <span aria-hidden="true">↗</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}

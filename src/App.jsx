import { useEffect, useState } from 'react';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import UI from './components/UI';
import MobileControls from './components/MobileControls';
import HamburgerMenu from './components/HamburgerMenu';
import { initScene, animate, animatePreview, enterGallery } from './lib/scene';
import gsap from 'gsap';

function App() {
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);

  const handleEnterGallery = () => {
    enterGallery();
    animate();
    setShowHamburgerMenu(true);
  };

  useEffect(() => {
    // Initialize Three.js scene for preview
    initScene();
    animatePreview();

    // GSAP animations for panels
    gsap.fromTo(
      '#left-panel',
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out' }
    );
    gsap.fromTo(
      '#right-panel',
      { opacity: 0 },
      { opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.2 }
    );

    // Add event listener for enter button
    const enterButton = document.getElementById('enter-button');
    if (enterButton) {
      enterButton.addEventListener('click', handleEnterGallery);
      // Add touch support for mobile
      enterButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleEnterGallery();
      });
      
      return () => {
        // Cleanup (e.g., remove event listeners)
        enterButton.removeEventListener('click', handleEnterGallery);
        enterButton.removeEventListener('touchstart', handleEnterGallery);
      };
    }
  }, []);

  return (
    <>
      <div id="container">
        <LeftPanel />
        <RightPanel />
      </div>
      <UI />
      <MobileControls />
      <div className={`hamburger-menu ${showHamburgerMenu ? 'show' : ''}`}>
        <HamburgerMenu />
      </div>
    </>
  );
}

export default App;
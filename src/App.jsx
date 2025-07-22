import { useEffect, useState } from 'react';
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import AboutPage from './components/pages/AboutPage';
import ReleasesPage from './components/pages/ReleasesPage';
import EventsPage from './components/pages/EventsPage';
import VideosPage from './components/pages/VideosPage';
import MouseFollower from './components/MouseFollower';
import UI from './components/UI';
import MobileControls from './components/MobileControls';
import HamburgerMenu from './components/HamburgerMenu';
import InstructionsGroup from './components/InstructionsGroup';
import PageLoader from './components/PageLoader';
import { initScene, animate, animatePreview, enterGallery, resetSceneForHomepage } from './lib/scene';
import { resetHomeAnimationState } from './components/HomePage';
import gsap from 'gsap';

function App() {
  const [currentView, setCurrentView] = useState(() => {
    // Initialize state from URL
    const path = window.location.pathname;
    if (path === '/') return 'home';
    return path.slice(1); // Remove leading slash
  });
  const [isInGallery, setIsInGallery] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event) => {
      const path = window.location.pathname;
      const newView = path === '/' ? 'home' : path.slice(1);
      setCurrentView(newView);
      setIsInGallery(false);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Homepage canvas scene loading
  useEffect(() => {
    if (currentView === 'home') {
      setIsLoading(true);
      
      // Maximum 5-second timeout
      const maxTimeout = setTimeout(() => {
        setIsLoading(false);
      }, 5000);
      
      // Listen for scene ready event
      const handleSceneReady = () => {
        clearTimeout(maxTimeout);
        setIsLoading(false);
      };
      
      // Listen for scene error event
      const handleSceneError = (event) => {
        clearTimeout(maxTimeout);
        setIsLoading(false);
        console.error('Scene error:', event.detail.message);
      };
      
      // Check if scene is already ready
      if (window.sceneReady) {
        clearTimeout(maxTimeout);
        setIsLoading(false);
      } else {
        // Listen for scene events
        window.addEventListener('sceneReady', handleSceneReady);
        window.addEventListener('sceneError', handleSceneError);
      }
      
      return () => {
        clearTimeout(maxTimeout);
        window.removeEventListener('sceneReady', handleSceneReady);
        window.removeEventListener('sceneError', handleSceneError);
      };
    } else {
      setIsLoading(false);
    }
  }, [currentView]);

  const handleEnterGallery = () => {
    try {
      setIsInGallery(true);
      enterGallery();
      // Small delay to ensure canvas is properly attached before starting animation
      setTimeout(() => {
        try {
          animate();
        } catch (error) {
          console.error("Error starting animation:", error);
          // Reset to homepage if animation fails
          handleReturnToHomepage();
        }
      }, 50);
    } catch (error) {
      console.error("Error entering gallery:", error);
      // Reset to homepage if gallery entry fails
      handleReturnToHomepage();
    }
  };

  const handleReturnToHomepage = () => {
    setCurrentView('home');
    setIsInGallery(false);
    
    // Reset animation states to allow entrance animation to play again
    resetHomeAnimationState();
    
    // Reset scene state and reinitialize
    setTimeout(() => {
      try {
        // Reset scene states first
        resetSceneForHomepage();
        
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          const heroCanvas = document.getElementById('hero-gallery-canvas');
          if (heroCanvas) {
            console.log("Reinitializing scene for homepage return");
            
            // Reinitialize the scene
            initScene();
            
            // Start preview animation after initialization
            setTimeout(() => {
              console.log("Starting preview animation after homepage return");
              animatePreview();
            }, 200);
          } else {
            console.warn("Hero canvas not found when returning to homepage");
          }
        }, 100);
      } catch (error) {
        console.error("Error reinitializing scene on homepage return:", error);
      }
    }, 50);
  };

  const handleNavigation = (section) => {
    if (section === 'listening-room') {
      handleEnterGallery();
    } else {
      // Update URL
      const url = section === 'home' ? '/' : `/${section}`;
      window.history.pushState({ view: section }, '', url);
      
      // Clean up scene preview when navigating away from home
      try {
        resetSceneForHomepage();
      } catch (error) {
        console.warn("Error cleaning up scene during navigation:", error);
      }
      
      // Page transition animation
      gsap.to('.page-transition', {
        opacity: 1,
        duration: 0.3,
        onComplete: () => {
          setCurrentView(section);
          setIsInGallery(false);
          
          // Scroll to top of page
          window.scrollTo(0, 0);
          
          // Fade out transition overlay
          gsap.to('.page-transition', {
            opacity: 0,
            duration: 0.3,
            delay: 0.1
          });
        }
      });
    }
  };

  useEffect(() => {
    if (currentView === 'home' && !isInGallery) {
      // Initialize Three.js scene for preview in hero section
      console.log("Home page loaded, initializing scene preview");
      
      const initScenePreview = () => {
        const heroCanvas = document.getElementById('hero-gallery-canvas');
        console.log("Looking for hero canvas:", {
          heroCanvas: !!heroCanvas,
          currentView,
          isInGallery
        });
        
        if (heroCanvas) {
          console.log("Initializing 3D scene in hero canvas");
          try {
            initScene();
            // Small delay to ensure scene is fully initialized
            setTimeout(() => {
              animatePreview();
            }, 100);
          } catch (error) {
            console.error("Error initializing scene:", error);
          }
        } else {
          console.warn("Hero canvas not found, retrying...");
          // Retry after longer delay
          setTimeout(() => {
            const retryCanvas = document.getElementById('hero-gallery-canvas');
            if (retryCanvas) {
              console.log("Retry successful, initializing scene");
              try {
                initScene();
                setTimeout(() => {
                  animatePreview();
                }, 100);
              } catch (error) {
                console.error("Error initializing scene on retry:", error);
              }
            } else {
              console.error("Hero canvas still not found after retry");
            }
          }, 500);
        }
      };

      // Use a timeout to ensure DOM is ready
      setTimeout(initScenePreview, 500);
    }
  }, [currentView, isInGallery]);

  // Expose the return to homepage function globally
  useEffect(() => {
    if (globalThis.window) {
      window.returnToHomepage = handleReturnToHomepage;
    }
    
    return () => {
      if (globalThis.window) {
        delete window.returnToHomepage;
      }
    };
  }, [handleReturnToHomepage]);

  // Render different views based on current state
  if (isInGallery) {
    return (
      <>
        {/* Full 3D Gallery Experience */}
        <UI />
        <MobileControls />
        <InstructionsGroup />
        <div className="hamburger-menu">
          <HamburgerMenu />
        </div>
      </>
    );
  }

  // Render different views based on current state
  const renderCurrentView = () => {
    switch(currentView) {
      case 'home':
        return <HomePage onEnterListeningRoom={handleEnterGallery} />;
      case 'about':
        return <AboutPage />;
      case 'releases':
        return <ReleasesPage />;
      case 'events':
        return <EventsPage />;
      case 'videos':
        return <VideosPage />;
      case 'listening-room':
        return null; // This shouldn't be reached since listening-room triggers isInGallery
      default:
        return <HomePage onEnterListeningRoom={handleEnterGallery} />;
    }
  };

  return (
    <>
      {currentView === 'home' && <PageLoader isLoading={isLoading} />}
      <MouseFollower />
      <Navigation onNavigate={handleNavigation} currentView={currentView} />
      
      {/* Page Transition Overlay */}
      <div className="page-transition"></div>
      
      {/* Main Content */}
      <main className="main-content">
        {renderCurrentView()}
      </main>
    </>
  );
}

export default App;
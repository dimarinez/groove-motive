import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Footer from './Footer';
import beatportIcon from '../assets/beatport.svg';
import soundcloudIcon from '../assets/soundcloud.svg';

gsap.registerPlugin(ScrollTrigger);

// Track if the initial home animation has been played
let hasPlayedInitialAnimation = false;

// Function to reset animation state when returning to homepage
export function resetHomeAnimationState() {
  hasPlayedInitialAnimation = false;
}

export default function HomePage({ onEnterListeningRoom }) {
  const heroRef = useRef(null);
  const latestReleaseRef = useRef(null);

  const handleEnterClick = () => {
    onEnterListeningRoom();
  };

  useEffect(() => {
    // Only run the entrance animation if it hasn't been played yet
    if (!hasPlayedInitialAnimation) {
      // Hide navigation initially for entrance animation
      gsap.set('.main-navigation', { opacity: 0, y: -100 });
      
      // Awwwards-style entrance animation
      const tl = gsap.timeline();
      
      // Page load animation
      tl.fromTo('body', 
        { backgroundColor: '#000000' },
        { backgroundColor: '#1a1a1a', duration: 1.2, ease: 'power1.out' }
      )
      .fromTo('.hero-title .title-line', 
        { opacity: 0, y: 80, rotationX: -60 },
        { 
          opacity: 1, 
          y: 0, 
          rotationX: 0,
          duration: 1.8, 
          stagger: 0.15,
          ease: 'power2.out' 
        },
        0.4
      )
      .fromTo('.arrow', 
        { opacity: 0, x: -30, rotation: -90 },
        { 
          opacity: 1, 
          x: 0, 
          rotation: 0,
          duration: 1.2, 
          ease: 'power2.out' 
        },
        '-=0.8'
      )
      .fromTo('.hero-3d-preview', 
        { opacity: 0, scale: 0.9, y: 60 },
        { 
          opacity: 1, 
          scale: 1, 
          y: 0,
          duration: 2.0, 
          ease: 'power2.out' 
        },
        '-=1.2'
      )
      .fromTo('.main-navigation', 
        { opacity: 0, y: -60 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' },
        '-=1.6'
      );
      
      // Mark animation as played
      hasPlayedInitialAnimation = true;
    } else {
      // Ensure elements are visible immediately when returning to home
      gsap.set(['.hero-title .title-line', '.arrow', '.hero-3d-preview', '.main-navigation'], { 
        opacity: 1, 
        y: 0, 
        x: 0,
        rotationX: 0,
        rotation: 0,
        scale: 1,
        transform: 'none'
      });
      gsap.set('body', { backgroundColor: '#1a1a1a' });
    }

    // Scroll-triggered animations
    gsap.fromTo('.latest-release-section',
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: 'power1.out',
        scrollTrigger: {
          trigger: '.latest-release-section',
          start: 'top 85%',
          end: 'bottom 15%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const handleMouseEnter = (e) => {
    gsap.to(e.target, {
      scale: 1.05,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const handleMouseLeave = (e) => {
    gsap.to(e.target, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  return (
    <div className="homepage">
        {/* Hero Section - Full 3D Preview */}
      <section className="hero-section" ref={heroRef}>
        <div className="hero-content">
          <h1 className="hero-title" onClick={handleEnterClick}>
            <span className="title-line">Enter the</span>
            <span className="title-line listening-room-text">Listening Room</span>
            <span className="arrow">→</span>
          </h1>
        </div>
        
        <div className="hero-3d-preview" onClick={handleEnterClick}>
          <div className="preview-container scene-ready">
            <canvas id="hero-gallery-canvas"></canvas>
            
            
            <div className="preview-overlay">
              <div className="preview-hint">
                <span>Click to enter</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Release Section */}
      <section className="latest-release-section" ref={latestReleaseRef}>
        <div className="section-container">
          <h2 className="section-title">Latest Release:</h2>
          <div className="release-content">
            <h3 className="release-title">Like Me by Dateless</h3>
            
            <div className="release-showcase">
              <div className="release-artwork">
                <div className="artwork-container">
                  <img 
                    src="https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/GM003.jpg" 
                    alt="Like Me by Dateless"
                    className="artwork-image"
                  />
                </div>
              </div>
              
              <div className="release-platforms">
                <div className="platform-logo beatport">
                  <img src={beatportIcon} alt="Beatport" />
                  <span>Beatport</span>
                </div>
                <div className="platform-logo soundcloud">
                  <img src={soundcloudIcon} alt="SoundCloud" />
                  <span>SoundCloud</span>
                </div>
                <div className="platform-logo spotify">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" fill="#1DB954"/>
                  </svg>
                  <span>Spotify</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

        <Footer />
      </div>
  );
}
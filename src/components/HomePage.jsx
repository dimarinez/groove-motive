import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Footer from './Footer';

gsap.registerPlugin(ScrollTrigger);

const latestReleaseCover = 'https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/gm-new%20updates/feelthebeatep.jpg';

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
      gsap.set(['.hero-title .title-line', '.arrow', '.main-navigation'], { 
        opacity: 1, 
        y: 0, 
        x: 0,
        rotationX: 0,
        rotation: 0,
        scale: 1,
        transform: 'none'
      });
      
      // Reset hero-3d-preview but preserve centering transform
      gsap.set('.hero-3d-preview', { 
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
      <section className="hero-section" ref={heroRef} data-nav-theme="dark">
        <div className="hero-content">
          <h1 className="hero-title" onClick={handleEnterClick}>
            <span className="title-line">Enter the</span>
            <span className="title-line listening-room-text">Listening Room</span>
          </h1>
          <button type="button" className="hero-enter-link" onClick={handleEnterClick}>
            <span>Explore the 3D music gallery</span>
            <span className="arrow" aria-hidden="true">↗</span>
          </button>
        </div>
        
        <div className="hero-3d-preview" onClick={handleEnterClick}>
          <div className="gallery-frame-meta">
            <span><i aria-hidden="true"></i> Interactive 3D archive</span>
            <span>Click + drag to explore</span>
          </div>
          <div className="preview-container scene-ready">
            <canvas id="hero-gallery-canvas"></canvas>
          </div>
        </div>
      </section>

      {/* Latest Release Section */}
      <section className="latest-release-section" ref={latestReleaseRef} data-nav-theme="light">
        <div className="section-container">
          <div className="section-heading-row">
            <span className="section-kicker">New on the label</span>
            <span className="section-index">GM012 · 2026</span>
          </div>
          <h2 className="section-title">Latest<br />Release</h2>
          <div className="release-content">
            <div className="release-showcase">
              <div className="release-artwork">
                <div className="artwork-container">
                  <img
                    src={latestReleaseCover}
                    alt="Feel The Beat by Steady Rock and Luke Andy"
                    className="artwork-image"
                  />
                </div>
              </div>

              <div className="release-platforms">
                <p className="latest-release-label">GM012 / New release</p>
                <h3 className="release-title">Feel The Beat</h3>
                <p className="latest-release-artist">Steady Rock &amp; Luke Andy</p>
                <button
                  type="button"
                  onClick={handleEnterClick}
                  className="platform-logo beatport"
                >
                  <span>Listen in the gallery</span>
                  <span aria-hidden="true">↗</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

        <Footer />
      </div>
  );
}

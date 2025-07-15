import { useEffect } from 'react';
import { gsap } from 'gsap';
import Footer from '../Footer';

export default function AboutPage() {
  useEffect(() => {
    // Page enter animation
    gsap.fromTo('.page-content', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    );
  }, []);

  return (
    <div className="page about-page">
      <div className="page-content">
        <div className="page-container">
          <div className="page-header">
            <h1 className="page-title">About</h1>
            <p className="page-subtitle">A New Label Built from Passion</p>
          </div>

          <div className="about-content">
            <div className="about-photo-section">
              <div className="about-photo-placeholder">
                <img 
                  src="https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/luke.jpg" 
                  alt="Groove Motive" 
                  className="about-photo"
                />
              </div>
            </div>
            
            <div className="about-text">
              <h2>Our Story</h2>
              <p>
                Groove Motive is an electronic music label born from a deep love for underground sounds and innovative artistry. We create immersive experiences where music transcends traditional boundaries, connecting artists with audiences through carefully curated releases and unique presentation methods.
              </p>
              
              <p>
                Founded in 2024, we emerged from the vibrant underground electronic music scene with a vision to bridge the gap between experimental artistry and accessible listening experiences. Our approach combines traditional record label expertise with cutting-edge digital innovation, creating new ways for listeners to discover and engage with music.
              </p>

              <h2>Our Mission</h2>
              <p>
                Our mission is simple yet profound: discover and nurture emerging talent while providing a platform that respects both the artist's vision and the listener's experience. We believe that great music deserves great presentation, and every release should tell a story that resonates beyond the speakers.
              </p>
              
              <p>
                We're committed to supporting artists at every stage of their journey, from initial creation to global distribution. Through our innovative listening room experience and traditional release channels, we ensure that each track finds its intended audience while maintaining the integrity of the underground culture that inspires us.
              </p>

              <h2>Our Approach</h2>
              <p>
                At Groove Motive, we believe in the power of immersion. Our 3D listening room represents more than just a novel way to experience music—it's a digital gallery space where each release becomes a living, breathing artwork. This innovative approach allows listeners to engage with music in a more meaningful way, creating lasting connections between sound and space.
              </p>
              
              <p>
                We carefully curate each release, working closely with artists to ensure their creative vision is preserved while reaching new audiences. Our catalog spans various electronic sub-genres, unified by a commitment to quality, innovation, and authentic underground spirit.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
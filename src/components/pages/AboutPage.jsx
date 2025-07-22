import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Footer from '../Footer';

gsap.registerPlugin(ScrollTrigger);

export default function AboutPage() {
  useEffect(() => {
    // Page enter animation
    gsap.fromTo('.page-content', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    );

    // Quote scroll animation
    const quote = document.querySelector('.founder-quote');
    if (quote) {
      ScrollTrigger.create({
        trigger: quote,
        start: 'top 80%',
        end: 'bottom 20%',
        onEnter: () => {
          quote.classList.add('animate-in');
        },
        onLeave: () => {
          quote.classList.remove('animate-in');
        },
        onEnterBack: () => {
          quote.classList.add('animate-in');
        },
        onLeaveBack: () => {
          quote.classList.remove('animate-in');
        }
      });
    }

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="page about-page">
      <div className="page-content">
        <div className="page-container">
          <div className="page-header">
            <h1 className="page-title">About</h1>
            <p className="page-subtitle">A Creative Platform for Authentic Electronic Music</p>
          </div>

          {/* Our Story Section */}
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
              <h2>Our Vision</h2>
              <p>
                Groove Motive was launched in 2025 by Luke Andy as a label and creative platform dedicated to authenticity and innovation in electronic music. It started with a vision to create a home for emerging and experimental artists, to push boundaries and connect with their audience in a new way.
              </p>
              
              <blockquote className="founder-quote">
                "I want artists to be themselves and make dope s***."
                <cite>– Luke Andy</cite>
              </blockquote>
            </div>
          </div>

          {/* Our Mission Section */}
          <div className="about-content">
            <div className="about-photo-section">
              <div className="about-photo-placeholder">
                <img 
                  src="https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/FF7AA9D7-02C9-454A-AB6E-826FE9A21313.jpeg" 
                  alt="Our Mission" 
                  className="about-photo"
                />
              </div>
            </div>
            
            <div className="about-text">
              <h2>Our Motive</h2>
              <p>
                Our mission is to foster community through music — amplifying bold, forward-thinking voices and allowing artists to explore, evolve, and stay true to their sound. Our catalog spans various electronic sub-genres, always unified by our commitment to quality.
              </p>
              
              <p>
                At any Groove Motive event, you can expect that the music comes first and the energy is real. Whether it's a single release or a live set, everything we do is about supporting artists and creating something worth showing up for.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
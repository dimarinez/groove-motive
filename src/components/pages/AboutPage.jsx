import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Footer from '../Footer';

gsap.registerPlugin(ScrollTrigger);

const artists = [
  {
    name: 'Luke Andy',
    photo: 'LukeAndy.jpg',
    instagram: 'https://www.instagram.com/lukeandymusic/'
  },
  {
    name: 'Ragie Ban',
    photo: 'RagieBan.jpg',
    instagram: 'https://www.instagram.com/ragieban/'
  },
  {
    name: 'Sophiegrophy',
    photo: 'Sophiegrophy.jpg',
    instagram: 'https://www.instagram.com/sophiegrophy/'
  },
  {
    name: 'Kirik',
    photo: 'Kirik.jpg',
    instagram: 'https://www.instagram.com/kirillkirik/'
  },
  {
    name: 'Dateless',
    photo: 'Dateless.jpg',
    instagram: 'https://www.instagram.com/datelessmusic/'
  },
  {
    name: 'BRN',
    photo: 'BRN.jpg',
    instagram: 'https://www.instagram.com/livebrn/'
  },
  {
    name: 'Allendes',
    photo: 'FranciscoAllendes.jpg',
    instagram: 'https://www.instagram.com/allendes/'
  },
  {
    name: 'Havoc & Lawn',
    photo: 'Havoc&Lawn.webp',
    instagram: 'https://www.instagram.com/havocandlawn/'
  },
  {
    name: 'Lonely',
    photo: 'Lonely.jpg',
    instagram: 'https://www.instagram.com/lonely.ofc/'
  },
  {
    name: 'Boss Doms',
    photo: 'BossDoms.jpg',
    instagram: 'https://www.instagram.com/bossdoms/'
  },
  {
    name: 'Rob Pearson',
    photo: 'RobPearson.jpg',
    instagram: 'https://www.instagram.com/djrobpearson/'
  },
  {
    name: 'Carvalho (BR)',
    photo: 'Carvalho(BR).JPG',
    instagram: 'https://www.instagram.com/carvalhodj/'
  }
];

export default function AboutPage() {
  useEffect(() => {
    // Page enter animation
    gsap.fromTo('.page-content', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    );

    // Quote scroll animation - fade in once and stay
    const quote = document.querySelector('.founder-quote');
    if (quote) {
      ScrollTrigger.create({
        trigger: quote,
        start: 'top 80%',
        onEnter: () => {
          quote.classList.add('animate-in');
        }
      });
    }

    // Artists section scroll animation - consistent with other sections
    const artistsSection = document.querySelector('.about-artists-section');
    if (artistsSection) {
      // Simple title fade-in animation - fade in once and stay
      ScrollTrigger.create({
        trigger: '.artists-section-title',
        start: 'top 80%',
        onEnter: () => {
          document.querySelector('.artists-section-title').classList.add('animate-in-title');
        }
      });

      // Clean grid animation - fade in once and stay
      ScrollTrigger.create({
        trigger: artistsSection,
        start: 'top 70%',
        onEnter: () => {
          gsap.to('.about-artists-section .artist-card', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            stagger: 0.1,
            delay: 0.3
          });
        }
      });

      // Enhanced hover animations (simplified) - Desktop only
      const artistCards = document.querySelectorAll('.about-artists-section .artist-card');
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
                       ('ontouchstart' in window) || 
                       (navigator.maxTouchPoints > 0) ||
                       window.innerWidth <= 768;

      if (!isMobile) {
        artistCards.forEach(card => {
          const image = card.querySelector('.artist-photo img');
          const overlay = card.querySelector('.artist-overlay');
          const name = card.querySelector('.artist-name');

          // Mouse enter
          card.addEventListener('mouseenter', () => {
            gsap.timeline()
              .to(card, { 
                y: -12,
                scale: 1.03,
                duration: 0.4,
                ease: 'power2.out'
              })
              .to(image, { 
                scale: 1.1,
                filter: 'brightness(1.1) contrast(1.05)',
                duration: 0.4,
                ease: 'power2.out'
              }, 0)
              .to(overlay, {
                opacity: 1,
                backdropFilter: 'blur(3px)',
                duration: 0.3
              }, 0)
              .fromTo(name, 
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' },
                0.1
              );
          });

          // Mouse leave
          card.addEventListener('mouseleave', () => {
            gsap.timeline()
              .to(card, { 
                y: 0,
                scale: 1,
                duration: 0.4,
                ease: 'power2.out'
              })
              .to(image, { 
                scale: 1,
                filter: 'brightness(1) contrast(1)',
                duration: 0.4,
                ease: 'power2.out'
              }, 0)
              .to(overlay, {
                opacity: 0,
                backdropFilter: 'blur(0px)',
                duration: 0.3
              }, 0)
              .to(name, {
                y: 20,
                opacity: 0,
                duration: 0.3,
                ease: 'power2.in'
              }, 0);
          });
        });

        // Magnetic cursor effect for artist cards - Desktop only
        artistCards.forEach(card => {
          card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            gsap.to(card, {
              x: x * 0.1,
              y: y * 0.1,
              duration: 0.3,
              ease: 'power2.out'
            });
          });

          card.addEventListener('mouseleave', () => {
            gsap.to(card, {
              x: 0,
              y: 0,
              duration: 0.4,
              ease: 'power2.out'
            });
          });
        });
      }
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
          <div className="about-content about-our-motive">
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
              
              <p className="about-paragraph">
                At any Groove Motive event, you can expect that the music comes first and the energy is real. Whether it's a single release or a live set, everything we do is about supporting artists and creating something worth showing up for.
              </p>
            </div>
          </div>

          {/* Our Artists Section */}
          <div className="about-artists-section">
            <h2 className="artists-section-title">Our Artists</h2>
            <div className="artists-grid">
              {artists.map((artist, index) => (
                <div key={index} className="artist-card">
                  <a 
                    href={artist.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="artist-link"
                  >
                    <div className="artist-photo">
                      <img 
                        src={`https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/${artist.photo}`}
                        alt={artist.name}
                        decoding="async"
                      />
                      <div className="artist-overlay">
                        <div className="artist-name">{artist.name}</div>
                        <div className="instagram-icon mobile-only">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
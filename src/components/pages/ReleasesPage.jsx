import { useEffect } from 'react';
import { gsap } from 'gsap';
import Footer from '../Footer';

export default function ReleasesPage() {
  const releases = [
    {
      id: 'GM001',
      title: 'My Side',
      artist: 'Luke Andy x Sophiegrophy',
      cover: 'https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/GM001%20Cover%20Art.jpg',
      date: '2024',
      description: 'Our debut release showcasing the collaborative spirit that defines Groove Motive.',
      buyUrl: 'https://www.beatport.com/track/my-side/20167500'
    },
    {
      id: 'GM002',
      title: 'Truth',
      artist: 'KiRiK',
      cover: 'https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/GM002.jpg',
      date: '2024',
      description: 'Raw energy meets sophisticated production in this powerful release.',
      buyUrl: 'https://www.beatport.com/track/truth/20398456'
    },
    {
      id: 'GM003',
      title: 'Like Me',
      artist: 'Dateless',
      cover: 'https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/GM003.jpg',
      date: '2024',
      description: 'Hypnotic grooves that define the essence of underground electronic music.',
      buyUrl: 'https://example.com/buy3'
    },
    {
      id: 'GM004',
      title: 'Machines',
      artist: 'BRN',
      cover: 'https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/GM004_Machines.jpg',
      date: '2024',
      description: 'A deep dive into industrial soundscapes and rhythmic complexity.',
      buyUrl: 'https://example.com/buy3'
    }
  ];

  useEffect(() => {
    // Page enter animation with linear easing
    gsap.fromTo('.releases-page .page-content', 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1.2, ease: 'Power2.out' }
    );

    // Sequential animation for release cards (one after another)
    gsap.fromTo('.releases-page .release-card',
      { opacity: 0, y: 30, scale: 0.95 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        duration: 0.8, 
        stagger: 0.3, 
        delay: 0.5,
        ease: 'none' 
      }
    );
  }, []);

  return (
    <div className="page releases-page">
      <div className="page-content">
        <div className="page-container">
          <div className="page-header">
            <h1 className="page-title">Releases</h1>
            <p className="page-subtitle">Our carefully curated catalog of electronic music</p>
          </div>

          <div className="releases-grid">
            {releases.map((release) => (
              <div key={release.id} className="release-card">
                <div className="release-artwork">
                  <img src={release.cover} alt={`${release.title} by ${release.artist}`} />
                  <div className="release-overlay">
                    <div className="play-button">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="release-info">
                  <div className="release-meta">
                    <span className="release-id">{release.id}</span>
                    <span className="release-date">{release.date}</span>
                  </div>
                  <h3 className="release-title">{release.title}</h3>
                  <p className="release-artist">{release.artist}</p>
                  <p className="release-description">{release.description}</p>
                  
                  <div className="release-links">
                    <a href={release.buyUrl} target="_blank" rel="noopener noreferrer" className="buy-link">
                      Buy Now
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
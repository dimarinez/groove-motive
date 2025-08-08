import { useEffect } from 'react';
import { gsap } from 'gsap';
import Footer from '../Footer';
import appleMusicIcon from '../../assets/Apple_Music_icon.svg';
import * as analytics from '../../lib/analytics.js';

export default function ReleasesPage() {
  const releases = [
    {
      id: 'GM001',
      title: 'My Side',
      artist: 'Luke Andy x Sophiegrophy',
      cover: 'https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/GM001%20Cover%20Art.jpg',
      date: '2025',
      description: 'Our debut release showcasing the collaborative spirit that defines Groove Motive.',
      appleMusic: 'https://music.apple.com/us/song/my-side/1798361061',
      spotify: 'https://open.spotify.com/track/7w7ipS58fvd95UnkTNSyGy?si=2f74432eff7b4cad',
      buyUrl: 'https://www.beatport.com/track/my-side/20167500'
    },
    {
      id: 'GM002',
      title: 'Truth',
      artist: 'KiRiK',
      cover: 'https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/GM002.jpg',
      date: '2025',
      description: 'Raw energy meets sophisticated production in this powerful release.',
      appleMusic: 'https://music.apple.com/us/song/truth/1807433737',
      spotify: 'https://open.spotify.com/track/2ORoncSZeAueAezwbe9jvm?si=a9ef0ef6dd0d46fa',
      buyUrl: 'https://www.beatport.com/track/truth/20398456'
    },
    {
      id: 'GM003',
      title: 'Like Me',
      artist: 'Dateless',
      cover: 'https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/GM003.jpg',
      date: '2025',
      description: 'Hypnotic grooves that define the essence of underground electronic music.',
      appleMusic: 'https://music.apple.com/us/song/like-me/1820409691',
      spotify: 'https://open.spotify.com/track/6MCGngj0MVPGSNqAUKIaMw?si=61b7876e5af64f34',
      buyUrl: 'https://www.beatport.com/track/like-me/20633536'
    },
    {
      id: 'GM004',
      title: 'Machines',
      artist: 'BRN',
      cover: 'https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/GM004_Machines.jpg',
      date: '2025',
      description: 'A deep dive into industrial soundscapes and rhythmic complexity.',
      appleMusic: 'https://music.apple.com/us/song/machines/1826087172',
      spotify: 'https://open.spotify.com/track/4FMOsst9oel1TTQd3frinz?si=3af6f918b87145ef',
      buyUrl: 'https://www.beatport.com/track/machines/20752666'
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
          </div>

          <div className="releases-grid">
            {releases.map((release) => (
              <div 
                key={release.id} 
                className="release-card"
                onClick={() => {
                  analytics.trackPurchaseByTrack(release.title, release.artist, release.buyUrl, 'releases_page');
                  window.open(release.buyUrl, '_blank', 'noopener,noreferrer');
                }}
                style={{ cursor: 'pointer' }}
              >
                <div className="release-artwork">
                  <img src={release.cover} alt={`${release.title} by ${release.artist}`} />
                  <div className="release-overlay"></div>
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
                    <a 
                      href={release.buyUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="buy-link"
                      onClick={(e) => {
                        e.stopPropagation();
                        analytics.trackPurchaseByTrack(release.title, release.artist, release.buyUrl, 'releases_page_buy_link');
                      }}
                    >
                      Buy Now
                    </a>
                    <div className="streaming-links">
                      <a 
                        href={release.appleMusic}
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="streaming-link apple-music"
                        title="Listen on Apple Music"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <img src={appleMusicIcon} alt="Apple Music" />
                      </a>
                      <a 
                        href={release.spotify}
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="streaming-link spotify"
                        title="Listen on Spotify"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                        </svg>
                      </a>
                    </div>
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
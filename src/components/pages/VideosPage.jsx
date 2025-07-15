import { useEffect } from 'react';
import { gsap } from 'gsap';
import Footer from '../Footer';

export default function VideosPage() {
  const videos = [
    {
      id: 1,
      title: 'Groove Motive x Tikis - Event Recap',
      description: 'Behind the scenes and highlights from our intimate showcase',
      thumbnail: 'https://img.youtube.com/vi/rGYFKKNghoE/maxresdefault.jpg',
      url: 'https://www.youtube.com/watch?v=rGYFKKNghoE',
      duration: '3:42'
    },
    {
      id: 2,
      title: 'BRN - Machines (Official Visualizer)',
      description: 'Industrial soundscapes meet visual artistry',
      thumbnail: 'https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/GM004_Machines.jpg',
      url: '#',
      duration: '6:15'
    },
    {
      id: 3,
      title: 'Dateless - Like Me (Studio Session)',
      description: 'Watch the creative process behind our latest release',
      thumbnail: 'https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/GM003.jpg',
      url: '#',
      duration: '4:28'
    },
    {
      id: 4,
      title: 'KiRiK - Truth (Live Performance)',
      description: 'Raw energy captured in an intimate live setting',
      thumbnail: 'https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/GM002.jpg',
      url: '#',
      duration: '5:33'
    },
    {
      id: 5,
      title: 'Luke Andy x Sophiegrophy - My Side (Collaboration Story)',
      description: 'The story behind our debut collaborative release',
      thumbnail: 'https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/GM001%20Cover%20Art.jpg',
      url: '#',
      duration: '7:12'
    },
    {
      id: 6,
      title: 'Groove Motive - Label Documentary',
      description: 'The journey from passion project to underground label',
      thumbnail: 'https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/GM_Wordmark_CLEAR_BLACK.png',
      url: '#',
      duration: '12:45'
    }
  ];


  useEffect(() => {
    // Page enter animation
    gsap.fromTo('.page-content', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    );

    // Stagger animation for video cards
    gsap.fromTo('.video-card',
      { opacity: 0, scale: 0.9 },
      { 
        opacity: 1, 
        scale: 1, 
        duration: 0.5, 
        stagger: 0.1, 
        delay: 0.3,
        ease: 'back.out(1.7)' 
      }
    );
  }, []);

  return (
    <div className="page videos-page">
      <div className="page-content">
        <div className="page-container">
          <div className="page-header">
            <h1 className="page-title">Videos</h1>
            <p className="page-subtitle">Visual stories from the Groove Motive universe</p>
          </div>


          <div className="videos-grid">
            {videos.map((video) => (
              <div key={video.id} className="video-card">
                <div className="video-thumbnail">
                  <img src={video.thumbnail} alt={video.title} />
                  <div className="video-overlay">
                    <div className="play-button">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <div className="video-duration">{video.duration}</div>
                  </div>
                </div>
                
                <div className="video-info">
                  <h3 className="video-title">{video.title}</h3>
                  <p className="video-description">{video.description}</p>
                  
                  <div className="video-actions">
                    <a 
                      href={video.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="watch-btn"
                    >
                      Watch Now
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="videos-cta">
            <h2>Subscribe for More</h2>
            <p>Stay connected with our latest visual content and behind-the-scenes footage.</p>
            <a 
              href="https://www.youtube.com/@GrooveMotiveRecs" 
              target="_blank" 
              rel="noopener noreferrer"
              className="youtube-subscribe"
            >
              Subscribe on YouTube
            </a>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
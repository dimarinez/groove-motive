
import { useEffect } from 'react';
import { gsap } from 'gsap';
import Footer from '../Footer';
import * as analytics from '../../lib/analytics.js';

export default function VideosPage() {
  const videos = [
    {
      id: 1,
      title: "Groove Motive Presents Dateless @ Tiki's | June 2025",
      description: 'Groove Motive Records proudly presents the full video of Dateless’ set...',
      thumbnail: 'https://img.youtube.com/vi/4SknkCdDLjo/maxresdefault.jpg',
      url: 'https://youtu.be/4SknkCdDLjo?si=hMpTIHhJMRMgrrPO',
      duration: '1:26:40'
    },
    {
      id: 2,
      title: "Groove Motive Presents Luke Andy @ Tiki's | June 2025",
      description: "Groove Motive Records proudly presents the full video of Luke Andy's set...",
      thumbnail: 'https://img.youtube.com/vi/rGYFKKNghoE/hqdefault.jpg',
      url: 'https://youtu.be/rGYFKKNghoE?si=vDMgz3-0Fb3LCpfn',
      duration: '1:33:50'
    },
    {
      id: 3,
      title: 'Get to know Groove Motive Records',
      description: 'This is the story of how Groove Motive Records came to life. Luke Andy...',
      thumbnail: 'https://img.youtube.com/vi/WTkBW3y-0OY/maxresdefault.jpg',
      url: 'https://youtu.be/WTkBW3y-0OY?si=W7rocJ0CzpqHpkhe',
      duration: '6:28'
    },
    {
      id: 4,
      title: 'My Side - Luke Andy & Sophiegrophy',
      description: 'GM001 - My Side - Luke Andy & Sophiegrophy',
      thumbnail: 'https://img.youtube.com/vi/7Nc6QjXoN9E/maxresdefault.jpg',
      url: 'https://youtu.be/7Nc6QjXoN9E?si=NBz3as-9iUpoKX51',
      duration: '4:50'
    },
    {
      id: 5,
      title: 'Luke Andy & Sophiegrophy - My Side (Official Visualizer)',
      description: 'Listen to the single "My Side". Out Now!',
      thumbnail: 'https://img.youtube.com/vi/5PXRkHTwdtk/maxresdefault.jpg',
      url: 'https://youtu.be/5PXRkHTwdtk?si=3-3hhxAtCZN8mjUT',
      duration: '7:12'
    },
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
          </div>


          <div className="videos-grid">
            {videos.map((video) => (
              <div 
                key={video.id} 
                className="video-card"
                onClick={() => {
                  analytics.trackVideoClick(video.title, video.url, video.id);
                  window.open(video.url, '_blank', 'noopener,noreferrer');
                }}
                style={{ cursor: 'pointer' }}
              >
                <div className="video-thumbnail">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    loading="lazy"
                    onError={(e) => {
                      // Fallback chain: maxresdefault -> hqdefault -> mqdefault -> default
                      if (e.target.src.includes('maxresdefault')) {
                        e.target.src = e.target.src.replace('maxresdefault', 'hqdefault');
                      } else if (e.target.src.includes('hqdefault')) {
                        e.target.src = e.target.src.replace('hqdefault', 'mqdefault');
                      } else if (e.target.src.includes('mqdefault')) {
                        e.target.src = e.target.src.replace('mqdefault', 'default');
                      }
                    }}
                  />
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
                  <div className="video-content">
                    <h3 className="video-title">{video.title}</h3>
                    <p className="video-description">{video.description}</p>
                  </div>
                  
                  <div className="video-actions">
                    <a 
                      href={video.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="watch-btn"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click when link is clicked
                        analytics.trackVideoClick(video.title, video.url, video.id);
                      }}
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
import { useEffect } from 'react';
import { gsap } from 'gsap';
import Footer from '../Footer';

export default function EventsPage() {
  const events = [
    {
      id: 1,
      title: 'Groove Motive x Tikis',
      date: '6.28',
      location: 'Los Angeles, CA',
      description: 'An intimate showcase featuring our latest artists in an underground setting.',
      image: 'https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/exhibition-1.jpg',
      link: 'https://www.youtube.com/watch?v=rGYFKKNghoE',
      status: 'past'
    },
    {
      id: 2,
      title: 'Spotlight LA',
      date: '8.31',
      location: 'Los Angeles, CA',
      description: 'A curated night of electronic music featuring Groove Motive artists and special guests.',
      image: 'https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/exhibition-2.jpg',
      link: 'https://shotgun.live/en/events/groovemotive',
      status: 'upcoming'
    }
  ];

  // Sort events: upcoming first, then past events
  const sortedEvents = events.sort((a, b) => {
    const statusOrder = { 'upcoming': 1, 'past': 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  useEffect(() => {
    // Page enter animation with linear easing
    gsap.fromTo('.events-page .page-content', 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1.2, ease: 'Power2.out' }
    );

    // Sequential animation for event cards (one after another)
    gsap.fromTo('.events-page .event-card',
      { opacity: 0, x: -30, y: 20 },
      { 
        opacity: 1, 
        x: 0, 
        y: 0,
        duration: 0.8, 
        stagger: 0.3, 
        delay: 0.5,
        ease: 'none' 
      }
    );
  }, []);

  return (
    <div className="page events-page">
      <div className="page-content">
        <div className="page-container">
          <div className="page-header">
            <h1 className="page-title">Events</h1>
            <p className="page-subtitle">Experience our music in intimate, curated settings</p>
          </div>

          <div className="events-list">
            {sortedEvents.map((event) => (
              <div key={event.id} className={`event-card ${event.status}`}>
                <div className="event-date">
                  <span className="date-text">{event.date}</span>
                  <span className="status-badge">{event.status}</span>
                </div>
                
                <div className="event-content">
                  <div className="event-info">
                    <h3 className="event-title">{event.title}</h3>
                    <p className="event-location">{event.location}</p>
                    <p className="event-description">{event.description}</p>
                    
                    <div className="event-actions">
                      {event.status === 'past' && (
                        <a 
                          href={event.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="event-link"
                        >
                          Watch Recap
                        </a>
                      )}
                      {event.status === 'upcoming' && (
                        <a 
                          href={event.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="event-link primary"
                        >
                          Get Tickets
                        </a>
                      )}
                    </div>
                  </div>
                  
                  {event.image && (
                    <div className="event-image">
                      <img src={event.image} alt={event.title} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="events-cta">
            <h2>Stay Updated</h2>
            <p>Follow us on social media to be the first to know about upcoming events and exclusive showcases.</p>
            <div className="social-links">
              <a href="https://www.instagram.com/groovemotive" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="https://www.youtube.com/@GrooveMotiveRecs" target="_blank" rel="noopener noreferrer">YouTube</a>
              <a href="http://tiktok.com/@groovemotive" target="_blank" rel="noopener noreferrer">TikTok</a>
              <a href="https://x.com/Groove_Motive" target="_blank" rel="noopener noreferrer">X</a>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
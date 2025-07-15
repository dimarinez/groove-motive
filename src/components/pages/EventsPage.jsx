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
    },
    {
      id: 3,
      title: 'Underground Sessions Vol. 1',
      date: 'TBA',
      location: 'New York, NY',
      description: 'Coming soon - an immersive audio-visual experience in the heart of Brooklyn.',
      image: null,
      link: '#',
      status: 'announced'
    }
  ];

  useEffect(() => {
    // Page enter animation
    gsap.fromTo('.page-content', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    );

    // Stagger animation for event cards
    gsap.fromTo('.event-card',
      { opacity: 0, x: -50 },
      { 
        opacity: 1, 
        x: 0, 
        duration: 0.6, 
        stagger: 0.15, 
        delay: 0.3,
        ease: 'power2.out' 
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
            {events.map((event) => (
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
                      {event.status === 'announced' && (
                        <button className="event-link disabled">
                          Coming Soon
                        </button>
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
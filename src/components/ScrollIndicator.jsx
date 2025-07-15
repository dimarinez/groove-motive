import { useEffect, useState } from 'react';
import { gsap } from 'gsap';

export default function ScrollIndicator() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setScrollProgress(scrollPercent);
    };

    window.addEventListener('scroll', handleScroll);
    
    // Animate scroll indicator on mount
    gsap.fromTo('.scroll-indicator', 
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.6, delay: 1 }
    );

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="scroll-indicator">
      <div className="scroll-track">
        <div 
          className="scroll-thumb"
          style={{ height: `${scrollProgress}%` }}
        />
      </div>
      <div className="scroll-label">
        <span>Scroll</span>
        <div className="scroll-arrow">↓</div>
      </div>
    </div>
  );
}
import { useEffect, useRef } from 'react';

export default function LeftPanel() {
  const hoverImages = useRef([]);

  useEffect(() => {
    const eventLinks = document.querySelectorAll('#left-panel ul li a');
    hoverImages.current = [];

    eventLinks.forEach((link, index) => {
      const img = document.createElement('img');
      img.src = `https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/exhibition-${index + 1}.jpg`; // Placeholder paths, replace with actual image paths
      img.className = 'hover-image';
      img.id = `hover-img-${index}`;
      img.style.display = 'none';
      img.style.opacity = '0';
      document.body.appendChild(img);
      hoverImages.current.push(img);

      const moveImage = (e) => {
        const imgElement = hoverImages.current[index];
        if (imgElement) {
          imgElement.style.left = `${e.pageX - 100}px`; // Center image relative to cursor
          imgElement.style.top = `${e.pageY - 100}px`;
          imgElement.style.opacity = '1';
          imgElement.style.display = 'block';
        }
      };

      const hideImage = () => {
        const imgElement = hoverImages.current[index];
        if (imgElement) {
          imgElement.style.opacity = '0';
          imgElement.style.display = 'none';
        }
      };

      link.addEventListener('mouseover', moveImage);
      link.addEventListener('mousemove', moveImage);
      link.addEventListener('mouseout', hideImage);

      return () => {
        link.removeEventListener('mouseover', moveImage);
        link.removeEventListener('mousemove', moveImage);
        link.removeEventListener('mouseout', hideImage);
        hoverImages.current.forEach(img => img.remove());
      };
    });
  }, []);

  return (
    <div id="left-panel" className="left-panel-container">
      <img src="https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/GM_Wordmark_CLEAR_BLACK.png" alt="Groove Motive" className="left-panel-logo" />
      <p className="left-panel-description">
        Groove Motive is a record label founded by a Maryland native (Luke Andy) whose journey from rejection to success is defined by perseverance and authenticity. After an eye-opening experience at Moonrise Festival, where he saw Claude VonStroke perform, he shifted from producing rap beats to diving into house music production.
      </p>
      <div className="scroll-indicator">
        <span className="scroll-text">Scroll to read more</span>
        <div className="scroll-arrow">↓</div>
      </div>
      <h2>A New Label, Built from Passion</h2>
      <p className="left-panel-description-2">
      Self-taught and relentless, he spent years perfecting his craft, traveling the East Coast to connect with artists and build his sound. A breakthrough came when his track was played by Ardalan at Northern Nights Music Festival, leading to a signing with Dirtybird Records. Over the next two years, he toured and played at Dirtybird Campout multiple times, living his dream.
      </p>
      <p className="left-panel-description-3">
      In 2024, Groove Motive was born—an artist-driven label focused on building a creative, connected community. As Groove Motive prepares to launch in 2025, it’s guided by the same passion and determination that turned one artist’s dream into reality.
      </p>
      <div className="g-spacer">
        <div className="left-panel-large-g">G</div>
      </div>
      <h2 className="exhibitions-title">Current and past events</h2>
      <ul className="exhibitions-list">
        <li className="exhibition-item"><span>6.28</span> - <span>Groove Motive x Tikis</span> <a href="https://www.youtube.com/watch?v=rGYFKKNghoE" className="exhibition-link">View</a></li>
        <li className="exhibition-item"><span>8.31</span> - <span>Spotlight LA</span> <a href="https://thespotlight.la/events/" className="exhibition-link">View</a></li>
      </ul>
      <div className="social-links">
        <a href="https://www.instagram.com/groovemotive" target="_blank" rel="noopener noreferrer" className="social-link">Instagram</a>
        <a href="https://www.youtube.com/@GrooveMotiveRecs" target="_blank" rel="noopener noreferrer" className="social-link">Youtube</a>
        <a href="http://tiktok.com/@groovemotive" target="_blank" rel="noopener noreferrer" className="social-link">TikTok</a>
        <a href="https://x.com/Groove_Motive" target="_blank" rel="noopener noreferrer" className="social-link">X</a>
      </div>
    </div>
  );
}
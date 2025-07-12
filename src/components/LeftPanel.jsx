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
          imgElement.style.left = `${e.pageX}px`; // Center image relative to cursor
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
      <div className='left-logo-container'>
      <div className='left-logo-back'>
        <img src="https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/GM_Wordmark_CLEAR_BLACK.png" alt="Groove Motive" className="left-panel-logo" />
      </div>
      </div>
      <h2>A New Label Built from Passion</h2>
      <div className="read-more-mobile">
        <span>See Events</span>
        <div className="arrow-down">↓</div>
      </div>
      <div className="left-panel-large-g">
        <img src="https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/GM_Mark_Black_300PPI.png" alt="Groove Motive" className="left-panel-g-artistic" />
      </div>
      <h2 className="exhibitions-title">Events</h2>
      <ul className="exhibitions-list">
        <li className="exhibition-item"><span>6.28</span> - <span>Groove Motive x Tikis</span> <a href="https://www.youtube.com/watch?v=rGYFKKNghoE" className="exhibition-link">View</a></li>
        <li className="exhibition-item"><span>8.31</span> - <span>Spotlight LA</span> <a href="https://shotgun.live/en/events/groovemotive" className="exhibition-link">View</a></li>
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
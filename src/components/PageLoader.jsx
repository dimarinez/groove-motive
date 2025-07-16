import { useEffect, useState } from 'react';
import gsap from 'gsap';

const PageLoader = ({ isLoading }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      // Show loader with fade in
      gsap.set('.page-loader', { display: 'flex' });
      gsap.fromTo('.page-loader', 
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: 'power2.out' }
      );

      // Progress animation
      setProgress(0);
      gsap.to({ progress: 0 }, {
        progress: 100,
        duration: 1.8,
        ease: 'power2.out',
        onUpdate: function() {
          setProgress(Math.round(this.targets()[0].progress));
        }
      });
    } else {
      // Hide loader with fade out
      gsap.to('.page-loader', {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => {
          gsap.set('.page-loader', { display: 'none' });
        }
      });
    }
  }, [isLoading]);

  return (
    <div className="page-loader">
      <div className="loader-content">
        <div className="loader-header">
          <div className="loader-title">Loading Experience</div>
          <div className="loader-counter">{progress}%</div>
        </div>
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        <div className="loader-subtitle">Preparing canvas scene...</div>
      </div>
    </div>
  );
};

export default PageLoader;
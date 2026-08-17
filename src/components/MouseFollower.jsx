import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function MouseFollower() {
  const followerRef = useRef(null);

  useEffect(() => {
    // Only enable mouse follower on desktop
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) return;

    const follower = followerRef.current;
    
    if (!follower) return;

    let hasMouseMoved = false;
    const moveX = gsap.quickTo(follower, 'x', { duration: 0.22, ease: 'power3.out' });
    const moveY = gsap.quickTo(follower, 'y', { duration: 0.22, ease: 'power3.out' });

    const handleMouseMove = (e) => {
      moveX(e.clientX);
      moveY(e.clientY);
      
      // Show follower only after first mouse movement
      if (!hasMouseMoved) {
        hasMouseMoved = true;
        gsap.set(follower, { opacity: 1 });
      }
    };

    const handlePointerOver = (event) => {
      const isInteractive = event.target.closest('a, button, .interactive, .release-card, .video-card, .event-card');
      gsap.to(follower, {
        scale: isInteractive ? 2.8 : 1,
        duration: 0.25,
        ease: 'power2.out'
      });
    };

    // Initially hide the follower
    gsap.set(follower, { opacity: 0 });
    
    // Add event listeners with passive option for better performance
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    document.addEventListener('pointerover', handlePointerOver, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerover', handlePointerOver);
    };
  }, []);

  return (
    <>
      <div ref={followerRef} className="mouse-follower" />
    </>
  );
}

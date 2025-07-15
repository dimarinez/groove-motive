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

    let mouseX = 0;
    let mouseY = 0;
    let animationId;
    let hasMouseMoved = false;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Show follower only after first mouse movement
      if (!hasMouseMoved) {
        hasMouseMoved = true;
        gsap.set(follower, { opacity: 1 });
      }
    };

    const animateFollower = () => {
      gsap.to(follower, {
        x: mouseX,
        y: mouseY,
        duration: 0.1,
        ease: 'power2.out'
      });

      animationId = requestAnimationFrame(animateFollower);
    };

    const handleMouseEnterLink = () => {
      gsap.to(follower, {
        scale: 1.2,
        duration: 0.3
      });
    };

    const handleMouseLeaveLink = () => {
      gsap.to(follower, {
        scale: 1,
        duration: 0.3
      });
    };

    // Initially hide the follower
    gsap.set(follower, { opacity: 0 });
    
    // Add event listeners with passive option for better performance
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    // Add hover effects for interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .interactive');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnterLink);
      el.addEventListener('mouseleave', handleMouseLeaveLink);
    });

    // Start animation
    animateFollower();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnterLink);
        el.removeEventListener('mouseleave', handleMouseLeaveLink);
      });
    };
  }, []);

  return (
    <>
      <div ref={followerRef} className="mouse-follower" />
    </>
  );
}
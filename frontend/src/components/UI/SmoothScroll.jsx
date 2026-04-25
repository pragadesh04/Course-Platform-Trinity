import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';

export default function SmoothScroll({ children }) {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    if (!isMobile) {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
      });

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);

      return () => {
        lenis.destroy();
        window.removeEventListener('resize', checkMobile);
      };
    }
  }, [isMobile]);

  return <>{children}</>;
}

export function useMagnetic(ref, strength = 0.3) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!ref.current) return;
    
    const element = ref.current;
    
    const handleMouseMove = (e) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const x = (e.clientX - centerX) * strength;
      const y = (e.clientY - centerY) * strength;
      
      setPosition({ x, y });
    };
    
    const handleMouseLeave = () => {
      setPosition({ x: 0, y: 0 });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [ref, strength]);

  return position;
}
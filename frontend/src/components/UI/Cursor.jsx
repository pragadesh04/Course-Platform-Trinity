import { useEffect, useRef, useState } from 'react';
import './Cursor.css';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trailingPosition, setTrailingPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const trailingRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 || 'ontouchstart' in window;
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      const isInteractive = 
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.classList.contains('clickable') ||
        target.role === 'button';
      
      setIsHovering(isInteractive);
    };

    const animateTrailing = () => {
      setTrailingPosition((prev) => ({
        x: prev.x + (position.x - prev.x) * 0.15,
        y: prev.y + (position.y - prev.y) * 0.15,
      }));
      animationRef.current = requestAnimationFrame(animateTrailing);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseover', handleMouseOver);
    animateTrailing();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseover', handleMouseOver);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [position, isMobile]);

  if (isMobile) return null;

  return (
    <>
      <div 
        className={`cursor-dot ${isVisible ? 'visible' : ''}`}
        style={{ left: position.x, top: position.y }}
      />
      <div 
        ref={trailingRef}
        className={`cursor-trailing ${isVisible ? 'visible' : ''} ${isHovering ? 'hovering' : ''}`}
        style={{ left: trailingPosition.x, top: trailingPosition.y }}
      />
    </>
  );
}
import { useEffect, useRef } from 'react';
import './BackgroundGalaxy.css';

export default function BackgroundGalaxy() {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationId;
    let stars = [];
    let meteors = [];
    const MAX_METEORS = 5;
    
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    }
    
    function initStars() {
      stars = [];
      const starCount = window.innerWidth < 768 ? 100 : 250;
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speed: Math.random() * 0.5 + 0.1,
          opacity: Math.random(),
          twinkleSpeed: Math.random() * 0.02 + 0.01,
          twinkleDir: Math.random() > 0.5 ? 1 : -1
        });
      }
    }
    
    function createMeteor() {
      if (meteors.length >= MAX_METEORS) return;
      
      const side = Math.random() > 0.5 ? 'left' : 'right';
      meteors.push({
        x: side === 'left' ? Math.random() * canvas.width * 0.3 : canvas.width * 0.7 + Math.random() * canvas.width * 0.3,
        y: Math.random() * canvas.height * 0.3,
        speed: Math.random() * 8 + 12,
        opacity: 1,
        tailLength: Math.random() * 100 + 80,
        angle: side === 'left' ? Math.PI / 4 : -Math.PI / 4
      });
    }
    
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw nebula gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width * 0.7, canvas.height * 0.3, 0,
        canvas.width * 0.7, canvas.height * 0.3, canvas.width * 0.8
      );
      gradient.addColorStop(0, 'rgba(138, 43, 226, 0.15)');
      gradient.addColorStop(0.5, 'rgba(75, 0, 130, 0.08)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw secondary nebula
      const gradient2 = ctx.createRadialGradient(
        canvas.width * 0.2, canvas.height * 0.7, 0,
        canvas.width * 0.2, canvas.height * 0.7, canvas.width * 0.6
      );
      gradient2.addColorStop(0, 'rgba(75, 0, 130, 0.12)');
      gradient2.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw meteors with trails
      meteors = meteors.filter(meteor => {
        // Draw meteor trail
        const trailGradient = ctx.createLinearGradient(
          meteor.x, meteor.y,
          meteor.x - Math.cos(meteor.angle) * meteor.tailLength,
          meteor.y - Math.sin(meteor.angle) * meteor.tailLength
        );
        trailGradient.addColorStop(0, `rgba(138, 43, 226, ${meteor.opacity * 0.8})`);
        trailGradient.addColorStop(0.5, `rgba(138, 43, 226, ${meteor.opacity * 0.3})`);
        trailGradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(
          meteor.x - Math.cos(meteor.angle) * meteor.tailLength,
          meteor.y - Math.sin(meteor.angle) * meteor.tailLength
        );
        ctx.strokeStyle = trailGradient;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw meteor head
        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 245, 245, ${meteor.opacity})`;
        ctx.fill();
        
        // Move meteor
        meteor.x += Math.cos(meteor.angle) * meteor.speed;
        meteor.y += Math.sin(meteor.angle) * meteor.speed;
        meteor.opacity -= 0.01;
        
        return meteor.opacity > 0 && meteor.y < canvas.height;
      });
      
      // Randomly spawn new meteors
      if (Math.random() < 0.01) {
        createMeteor();
      }
      
      // Draw stars
      stars.forEach(star => {
        // Twinkle effect
        star.opacity += star.twinkleSpeed * star.twinkleDir;
        if (star.opacity >= 1 || star.opacity <= 0.2) {
          star.twinkleDir *= -1;
        }
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 245, 245, ${star.opacity})`;
        ctx.fill();
        
        // Add glow for larger stars
        if (star.size > 1.5) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
          const glowGradient = ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, star.size * 3
          );
          glowGradient.addColorStop(0, `rgba(138, 43, 226, ${star.opacity * 0.3})`);
          glowGradient.addColorStop(1, 'transparent');
          ctx.fillStyle = glowGradient;
          ctx.fill();
        }
        
        // Subtle movement
        star.y -= star.speed * 0.1;
        if (star.y < 0) {
          star.y = canvas.height;
          star.x = Math.random() * canvas.width;
        }
      });
      
      animationId = requestAnimationFrame(draw);
    }
    
    resize();
    draw();
    
    window.addEventListener('resize', resize);
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);
  
  return (
    <div className="galaxy-background">
      <canvas ref={canvasRef} className="galaxy-canvas" />
      <div className="galaxy-overlay" />
    </div>
  );
}
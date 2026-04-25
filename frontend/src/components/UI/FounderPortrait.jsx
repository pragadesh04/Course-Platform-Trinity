import { useState } from 'react';
import { Sparkles } from 'lucide-react';

export default function FounderPortrait({ imageUrl, name }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="founder-portrait-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="founder-concentric-circle" />
      
      <svg 
        className={`founder-squiggle squiggle-left ${isHovered ? 'wiggle' : ''}`} 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
      >
        <path 
          d="M10,50 Q25,30 40,50 T70,50 T90,30" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      
      <svg 
        className={`founder-squiggle squiggle-bottom ${isHovered ? 'wiggle' : ''}`} 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
      >
        <path 
          d="M20,20 Q40,40 60,20 T90,40" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      
      <div className="founder-arch">
        <div className={`founder-sunburst ${isHovered ? 'active' : ''}`} />
      </div>
      
      <div className="founder-sparkles">
        <Sparkles size={24} className="sparkle sparkle-1" />
        <Sparkles size={16} className="sparkle sparkle-2" />
        <Sparkles size={12} className="sparkle sparkle-3" />
      </div>
      
      <div className="founder-image-wrapper">
        {imageUrl ? (
          <img src={imageUrl} alt={name || 'Founder'} />
        ) : (
          <div className="founder-placeholder">
            <span>Founder</span>
          </div>
        )}
      </div>
    </div>
  );
}
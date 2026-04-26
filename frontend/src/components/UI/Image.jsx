import { useState } from 'react';

export default function Image({ src, alt, fallback, className, style, onLoad, wrapperStyle, objectFit, ...props }) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  
  const fallbackSrc = fallback || 'https://placehold.co/600x400/8a2be2/1A1A1A?text=No+Image';
  const imageSrc = !src || src === '' ? fallbackSrc : src;
  
  const handleLoad = (e) => {
    setLoaded(true);
    if (onLoad) onLoad(e);
  };
  
  const handleError = () => {
    setError(true);
    setLoaded(true);
  };

  const imgStyle = {
    ...style,
    opacity: loaded ? 1 : 0,
    transition: 'opacity 0.3s ease',
    width: '100%',
    height: '100%',
    objectFit: objectFit || 'cover',
    display: 'block',
  };
  
  const isBackgroundImage = className?.includes('thumbnail-main-img') || className?.includes('product-thumbnail');
  
  if (isBackgroundImage) {
    return (
      <img
        src={error ? fallbackSrc : imageSrc}
        alt={alt}
        className={className}
        style={imgStyle}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    );
  }
  
  return (
    <div 
      className={className} 
      style={{ 
        position: 'relative', 
        width: '100%', 
        minHeight: 400,
        background: 'var(--glass-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...wrapperStyle 
      }}
    >
      {!loaded && (
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--glass-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'inherit',
          }}
        >
          <div className="image-skeleton">
            <div className="skeleton-shimmer"></div>
          </div>
        </div>
      )}
      <img
        src={error ? fallbackSrc : imageSrc}
        alt={alt}
        style={imgStyle}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
      <style>{`
        .image-skeleton {
          width: 100%;
          height: 100%;
          position: absolute;
          overflow: hidden;
          background: var(--glass-bg);
        }
        .skeleton-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(138, 43, 226, 0.2) 50%,
            transparent 100%
          );
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
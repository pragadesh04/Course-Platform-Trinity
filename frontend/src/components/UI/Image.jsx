import { useState } from 'react';

export default function Image({ src, alt, fallback, className, style, onLoad, ...props }) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  
  const fallbackSrc = fallback || 'https://placehold.co/600x400/D4AF37/1A1A1A?text=No+Image';
  const imageSrc = !src || src === '' ? fallbackSrc : src;
  
  const handleLoad = (e) => {
    setLoaded(true);
    if (onLoad) onLoad(e);
  };
  
  const isCloudinary = imageSrc && imageSrc.includes('cloudinary.com');
  
  const handleError = () => {
    setError(true);
    setLoaded(true);
  };
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', ...style }} className={className}>
      {!loaded && (
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            background: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{
            width: 24,
            height: 24,
            border: '3px solid #D4AF37',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
        </div>
      )}
      <img
        src={error ? fallbackSrc : imageSrc}
        alt={alt}
        className={className}
        crossOrigin={isCloudinary ? "anonymous" : undefined}
        style={{
          ...style,
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s ease',
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

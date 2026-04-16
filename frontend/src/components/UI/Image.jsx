import { useState } from 'react';

export default function Image({ src, alt, fallback, className, style, ...props }) {
  const [error, setError] = useState(false);
  
  const fallbackSrc = fallback || 'https://placehold.co/600x400/D4AF37/1A1A1A?text=No+Image';
  
  return (
    <img
      src={error ? fallbackSrc : src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setError(true)}
      {...props}
    />
  );
}

import './CosmicLoader.css';

export default function CosmicSkeleton({ className = '' }) {
    return (
        <div className={`cosmic-skeleton ${className}`}>
            <div className="skeleton-stars">
                {[...Array(20)].map((_, i) => (
                    <div 
                        key={i} 
                        className="star"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            width: `${2 + Math.random() * 3}px`,
                            height: `${2 + Math.random() * 3}px`,
                        }}
                    />
                ))}
            </div>
            <div className="skeleton-core" />
            <div className="skeleton-glow" />
        </div>
    );
}
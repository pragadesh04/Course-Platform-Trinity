import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CosmicLoader.css';

export default function CosmicLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => setShowContent(true), 100);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div 
          className="cosmic-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="loader-background">
            {/* Animated stars */}
            <div className="loader-stars">
              {[...Array(50)].map((_, i) => (
                <div 
                  key={i} 
                  className="loader-star"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
            
            {/* Nebula effect */}
            <div className="loader-nebula" />
          </div>
          
          <div className="loader-content">
            <motion.div 
              className="loader-logo"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', duration: 1 }}
            >
              <div className="loader-logo-inner">
                <span>✦</span>
              </div>
            </motion.div>
            
            <motion.h1
              className="loader-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Trinity
            </motion.h1>
            
            <motion.p
              className="loader-subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              Entering the cosmos...
            </motion.p>
            
            <div className="loader-progress">
              <motion.div 
                className="loader-progress-bar"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.8, ease: 'easeInOut' }}
              />
            </div>
          </div>
          
          {/* Floating particles */}
          <div className="loader-particles">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="loader-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [-20, -window.innerHeight],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
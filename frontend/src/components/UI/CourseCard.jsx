import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, Clock, Users } from 'lucide-react';
import { useState } from 'react';
import Image from './Image';
import './CourseCard.css';

const COURSE_PLACEHOLDER = 'https://placehold.co/600x400/D4AF37/1A1A1A?text=Course';

export default function CourseCard({ course }) {
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useSpring(0, { stiffness: 300, damping: 30 });
  const mouseY = useSpring(0, { stiffness: 300, damping: 30 });

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Free';
    if (price === 0) return 'Free';
    return `₹${price.toLocaleString()}`;
  };

  const getLowestPrice = () => {
    if (course.is_free) return 0;
    if (!course.prices) return 0;
    const prices = [course.prices.m3, course.prices.m6, course.prices.lifetime].filter(p => p && p > 0);
    if (prices.length === 0) return 0;
    return Math.min(...prices);
  };
  
  const lowestPrice = getLowestPrice();

  const thumbnailSrc = course.thumbnail_url || COURSE_PLACEHOLDER;

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x * 10);
    mouseY.set(y * 10);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const rotateX = useMotionTemplate`${mouseY}deg`;
  const rotateY = useMotionTemplate`${-mouseX}deg`;

  return (
    <motion.div
      className="course-card"
      style={{
        transformStyle: 'preserve-3d',
        rotateX,
        rotateY,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <div className="card-shine" style={{ opacity: isHovered ? 1 : 0 }} />
      <div className="course-thumbnail">
        <Image 
          src={thumbnailSrc} 
          alt={course.title}
          fallback={COURSE_PLACEHOLDER}
        />
        <div className="course-sessions">
          {course.sessions || 0} Sessions
        </div>
      </div>

      <div className="course-content">
        <h3 className="course-title">{course.title}</h3>
        <p className="course-description">{course.description}</p>
        
        <div className="course-meta">
          <span className="meta-item">
            <Play size={14} />
            {course.sessions || 0} Videos
          </span>
          <span className="meta-item">
            <Clock size={14} />
            {(() => {
              const mins = course.duration || 0;
              const hrs = Math.floor(mins / 60);
              const m = Math.round(mins % 60);
              if (hrs === 0) return `${m} min`;
              if (m === 0) return `${hrs} hr`;
              return `${hrs} hr ${m} min`;
            })()}
          </span>
        </div>

        <div className="course-footer">
          <motion.div 
            className="course-price"
            animate={{ y: isHovered ? -4 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <span className="price-label">Starting at</span>
            <span className="price-value">{formatPrice(lowestPrice)}</span>
          </motion.div>
          <motion.div
            animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Link to={`/courses/${course.id}`} className="btn btn-primary btn-sm">
              View Course
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

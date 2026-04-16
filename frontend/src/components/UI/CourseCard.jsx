import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, Clock, Users } from 'lucide-react';
import Image from './Image';
import './CourseCard.css';

export default function CourseCard({ course }) {
  const formatPrice = (price) => {
    if (price === 0) return 'Free';
    return `₹${price.toLocaleString()}`;
  };

  const lowestPrice = course.prices 
    ? Math.min(
        course.prices.m3 || Infinity,
        course.prices.m6 || Infinity,
        course.prices.lifetime || Infinity
      )
    : 0;

  return (
    <motion.div
      className="course-card"
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <div className="course-thumbnail">
        <Image 
          src={course.thumbnail_url} 
          alt={course.title}
          fallback="https://placehold.co/600x400/D4AF37/1A1A1A?text=Course"
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
            {course.duration || 0} mins
          </span>
        </div>

        <div className="course-footer">
          <div className="course-price">
            <span className="price-label">Starting at</span>
            <span className="price-value">{formatPrice(lowestPrice)}</span>
          </div>
          <Link to={`/courses/${course.id}`} className="btn btn-primary btn-sm">
            View Course
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

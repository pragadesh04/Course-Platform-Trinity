import { useState, useEffect, useRef, Children } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Carousel.css';

export default function Carousel({ children, autoPlay = true, interval = 5000, aspectRatio = '4/5' }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    const childArray = Children.toArray(children);
    const totalSlides = childArray.length;

    useEffect(() => {
        if (!autoPlay || isPaused || totalSlides <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % totalSlides);
        }, interval);

        return () => clearInterval(timer);
    }, [autoPlay, isPaused, interval, totalSlides]);

    useEffect(() => {
        const nextIndex = (currentIndex + 1) % totalSlides;
        const nextChild = childArray[nextIndex];
        if (nextChild?.props?.src) {
            const img = new Image();
            img.src = nextChild.props.src;
        }
    }, [currentIndex, totalSlides]);

    const goToSlide = (index) => setCurrentIndex(index);
    const goToPrev = () => setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    const goToNext = () => setCurrentIndex((prev) => (prev + 1) % totalSlides);

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        const diff = touchStartX.current - touchEndX.current;
        const threshold = 50;
        if (Math.abs(diff) > threshold) {
            if (diff > 0) goToNext();
            else goToPrev();
        }
        touchStartX.current = 0;
        touchEndX.current = 0;
    };

    if (totalSlides <= 1) {
        return <div className="carousel-single">{children}</div>;
    }

    return (
        <div
            className="carousel"
            style={{ aspectRatio }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div className="carousel-track">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        className="carousel-slides"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                        {childArray[currentIndex]}
                    </motion.div>
                </AnimatePresence>
            </div>

            <button className="carousel-btn carousel-btn-prev" onClick={goToPrev}>
                <ChevronLeft size={28} />
            </button>
            <button className="carousel-btn carousel-btn-next" onClick={goToNext}>
                <ChevronRight size={28} />
            </button>

            <div className="carousel-dots">
                {Array.from({ length: totalSlides }).map((_, index) => (
                    <button
                        key={index}
                        className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => goToSlide(index)}
                    />
                ))}
            </div>
        </div>
    );
}
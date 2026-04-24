import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Scissors, Package, User } from 'lucide-react';
import CourseCard from '../components/UI/CourseCard';
import ProductCard from '../components/UI/ProductCard';
import { AnimatedSection, SectionTitle } from '../components/UI/Animations';
import ArchitecturalLines from '../components/UI/ArchitecturalLines';
import { courseService, productService } from '../services/api';
import { API_BASE_URL } from '../config';
import { useState, useEffect } from 'react';
import './Home.css';

export default function Home() {
    const [featuredCourses, setFeaturedCourses] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [testimonials, setTestimonials] = useState([]);
    const [gallery, setGallery] = useState([]);
    const [founderImages, setFounderImages] = useState([]);
    const [founder, setFounder] = useState(null);
    const [stats, setStats] = useState({ students: 0, students_display: '0' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [courses, products, testimonialsData, galleryData, founderData, statsData] = await Promise.all([
                    courseService.getAll({ featured: true }),
                    productService.getAll({ featured: true }),
                    fetch(`${API_BASE_URL}/testimonials`).then(r => r.json()).catch(() => []),
                    fetch(`${API_BASE_URL}/gallery`).then(r => r.json()).catch(() => []),
                    fetch(`${API_BASE_URL}/settings/founder`).then(r => r.json()).catch(() => null),
                    fetch(`${API_BASE_URL}/settings/stats`).then(r => r.json()).catch(() => ({ students: 0 })),
                ]);

                setFeaturedCourses(courses.slice(0, 4));
                setFeaturedProducts(products.slice(0, 4));
                
                const sortedTestimonials = testimonialsData
                    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                    .slice(0, 10);
                setTestimonials(sortedTestimonials);
                
                const galleryItems = Array.isArray(galleryData) ? galleryData : [];
                setGallery(galleryItems.filter(item => item.type !== 'founder'));
                setFounderImages(galleryItems.filter(item => item.type === 'founder'));
                setFounder(founderData);
                setStats(statsData);
            } catch (error) {
                console.error('Failed to fetch homepage data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    return (
        <div className="home">
            <section className="hero">
                <div className="hero-bg">
                    <div className="hero-pattern"></div>
                </div>
                <div className="hero-content">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="hero-badge">
                            <Sparkles size={14} />
                            Premium Tailoring Education
                        </span>
                        <h1 className="hero-title">
                            Master the Art of
                            <span className="text-gold"> Tailoring</span>
                        </h1>
                        <p className="hero-subtitle">
                            Learn professional dressmaking, alterations, and crafting from industry experts.
                            Transform your passion into a profitable skill.
                        </p>
                        <div className="hero-actions">
                            <Link to="/courses" className="btn btn-primary btn-lg">
                                Explore Courses
                                <ArrowRight size={18} />
                            </Link>
                            <Link to="/products" className="btn btn-outline btn-lg">
                                <Package size={18} />
                                Shop Products
                            </Link>
                        </div>
                    </motion.div>
                </div>
                <div className="hero-visual">
                    <div className="hero-image-wrapper">
                        <img
                            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"
                            alt="Tailoring craftsmanship"
                            className="hero-image"
                        />
                        <div className="hero-float-card">
                            <Scissors size={24} />
                            <span>{stats.students_display || '0'} Users</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="founder-section section">
                <div className="container">
                    <div className="founder-grid">
                        <AnimatedSection className="founder-image">
                            {loading ? (
                                <div className="founder-placeholder loading">
                                    <div className="placeholder-spinner" />
                                </div>
                            ) : founderImages[0]?.image_url || founder?.image_url ? (
                                <ArchitecturalLines seed={0.5}>
                                    <img
                                        src={founderImages[0]?.image_url || founder?.image_url}
                                        alt={founder?.name || "Founder"}
                                    />
                                </ArchitecturalLines>
                            ) : (
                                <div className="founder-placeholder">
                                    <User size={64} strokeWidth={1} />
                                    <span>Founder Image</span>
                                </div>
                            )}
                        </AnimatedSection>
                        <AnimatedSection className="founder-content" delay={0.2}>
                            <span className="section-label">Our Story</span>
                            <h2>A Few Words From Our Founder</h2>
                            <blockquote>
                                "{founder?.bio || 'Tailoring is not just about stitching fabric together; it is about creating confidence and making people feel beautiful in what they wear.'}"
                            </blockquote>
                            <p className="founder-name">- {founder?.name || 'Founder'}</p>
                            <p className="founder-title">{founder?.title || 'Founder & Master Tailor'}</p>
                        </AnimatedSection>
                    </div>
                </div>
            </section>

            <section className="featured-courses section bg-white">
                <div className="container">
                    <SectionTitle
                        title="Featured Courses"
                        subtitle="Start your journey with our most popular courses"
                    />
                    {loading ? (
                        <div className="loading-grid">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="skeleton-card" />
                            ))}
                        </div>
                    ) : featuredCourses.length > 0 ? (
                        <div className="courses-grid">
                            {featuredCourses.map((course) => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>No featured courses available yet. Check back soon!</p>
                        </div>
                    )}
                    <div className="section-cta">
                        <Link to="/courses" className="btn btn-secondary">
                            View All Courses
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>

            <section className="featured-products section">
                <div className="container">
                    <SectionTitle
                        title="Featured Products"
                        subtitle="Quality tools and materials for every tailor"
                    />
                    {loading ? (
                        <div className="loading-grid">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="skeleton-card" />
                            ))}
                        </div>
                    ) : featuredProducts.length > 0 ? (
                        <div className="products-grid">
                            {featuredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>No featured products available yet. Check back soon!</p>
                        </div>
                    )}
                    <div className="section-cta">
                        <Link to="/products" className="btn btn-secondary">
                            View All Products
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>

            <section className="best-works section bg-white">
                <div className="container">
                    <SectionTitle
                        title="Our Best Works"
                        subtitle="See what our students and crafters have created"
                    />
                    {gallery.length > 0 ? (
                        <div className="masonry-grid">
                            {gallery.map((item, index) => (
                                <AnimatedSection
                                    key={item.id}
                                    className="masonry-item"
                                    style={{ gridColumn: `span ${item.span || 1}` }}
                                    delay={index * 0.1}
                                >
                                    <img src={item.image_url} alt={item.title || `Work ${index + 1}`} />
                                </AnimatedSection>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>Gallery images coming soon!</p>
                        </div>
                    )}
                </div>
            </section>

            <section className="testimonials section">
                <div className="container">
                    <SectionTitle
                        title="What Our Students Say"
                        subtitle="Join thousands of satisfied learners"
                    />
                    <div className="testimonials-list">
                        {testimonials.length > 0 ? (
                            testimonials.map((testimonial, index) => (
                                <div key={testimonial.id || index} className="testimonial-item">
                                    <div className="testimonial-card">
                                        <img
                                            src={testimonial.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=D4AF37&color=1A1A1A`}
                                            alt={testimonial.name}
                                            className="testimonial-avatar"
                                        />
                                        {testimonial.rating && (
                                            <div className="testimonial-rating">
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <span key={i} className={i <= testimonial.rating ? 'star filled' : 'star'}>★</span>
                                                ))}
                                            </div>
                                        )}
                                        <p className="testimonial-text">"{testimonial.text}"</p>
                                        <h4 className="testimonial-name">{testimonial.name}</h4>
                                        <span className="testimonial-role">{testimonial.role}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <p>No testimonials yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="cta-section">
                <div className="container">
                    <AnimatedSection className="cta-content">
                        <h2>Ready to Start Your Tailoring Journey?</h2>
                        <p>Join thousands of students who have transformed their passion into profession.</p>
                        <Link to="/register" className="btn btn-primary btn-lg">
                            Get Started Today
                            <ArrowRight size={18} />
                        </Link>
                    </AnimatedSection>
                </div>
            </section>
        </div>
    );
}

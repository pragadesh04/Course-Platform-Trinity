import { Link } from 'react-router-dom';
import { AnimatedSection, SectionTitle } from '../components/UI/Animations';
import { Award, Users, Clock, BookOpen, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { useState, useEffect } from 'react';
import './About.css';

export default function About() {
  const [stats, setStats] = useState({
    students_display: '0',
    courses_display: '0',
    experience_years: 10
  });
  const [about, setAbout] = useState({
    mission: '',
    about_text: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, aboutRes] = await Promise.all([
          fetch(`${API_BASE_URL}/settings/stats`).then(r => r.json()).catch(() => ({})),
          fetch(`${API_BASE_URL}/settings/about`).then(r => r.json()).catch(() => ({}))
        ]);
        
        setStats({
          students_display: statsRes.students_display || '0',
          courses_display: statsRes.courses_display || '0',
          experience_years: statsRes.experience_years || 10
        });
        setAbout({
          mission: aboutRes.mission || 'Our mission is to make quality tailoring education accessible to everyone.',
          about_text: aboutRes.about_text || 'We are dedicated to preserving traditional tailoring skills while embracing modern techniques.'
        });
      } catch (error) {
        console.error('Failed to fetch about data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const statsList = [
    { icon: Users, value: stats.students_display, label: 'Students' },
    { icon: BookOpen, value: stats.courses_display, label: 'Courses' },
    { icon: Award, value: `${stats.experience_years}+`, label: 'Years Experience' },
    { icon: Clock, value: '24/7', label: 'Support' },
  ];

  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="container">
          <AnimatedSection>
            <span className="section-label">About Us</span>
            <h1>Crafting Excellence in Tailoring Education</h1>
            <p>{about.about_text}</p>
          </AnimatedSection>
        </div>
      </section>

      <section className="about-stats section bg-white">
        <div className="container">
          <div className="stats-grid">
            {statsList.map((stat, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <div className="stat-item">
                  <stat.icon size={32} className="stat-icon" />
                  <span className="stat-value">{loading ? '.' : stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="about-mission section">
        <div className="container">
          <div className="mission-grid">
            <AnimatedSection className="mission-content">
              <span className="section-label">Our Mission</span>
              <h2>Empowering Future Tailors</h2>
              <p>{about.mission}</p>
              <ul className="mission-list">
                <li>Industry-expert instructors with decades of experience</li>
                <li>Comprehensive curriculum from basics to advanced techniques</li>
                <li>Hands-on learning with real-world projects</li>
                <li>Lifetime access to course materials</li>
              </ul>
              <div className="mission-cta">
                <Link to="/courses" className="btn btn-primary">
                  Explore Courses
                  <ArrowRight size={16} />
                </Link>
              </div>
            </AnimatedSection>
            <AnimatedSection className="mission-image" delay={0.2}>
              <img
                src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600"
                alt="Tailoring workshop"
              />
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  );
}

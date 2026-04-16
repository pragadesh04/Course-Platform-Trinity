import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import CourseCard from '../components/UI/CourseCard';
import { AnimatedSection, SectionTitle } from '../components/UI/Animations';
import { courseService, categoryService } from '../services/api';
import './Catalog.css';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  async function fetchData() {
    try {
      setLoading(true);
      const [coursesData, categoriesData] = await Promise.all([
        courseService.getAll(selectedCategory ? { category_id: selectedCategory } : {}),
        categoryService.getAll('course'),
      ]);
      setCourses(coursesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="catalog-page">
      <div className="catalog-header">
        <div className="container">
          <h1>Our Courses</h1>
          <p>Learn professional tailoring skills from experts</p>
        </div>
      </div>

      <div className="container">
        <div className="catalog-filters">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
            />
          </div>

          <div className="category-filter">
            <Filter size={20} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="catalog-grid">
            {filteredCourses.map((course, index) => (
              <AnimatedSection key={course.id} delay={index * 0.05}>
                <CourseCard course={course} />
              </AnimatedSection>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No courses found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

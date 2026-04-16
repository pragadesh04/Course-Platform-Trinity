import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import ProductCard from '../components/UI/ProductCard';
import { AnimatedSection } from '../components/UI/Animations';
import { productService, categoryService } from '../services/api';
import './Catalog.css';

export default function Products() {
  const [products, setProducts] = useState([]);
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
      const [productsData, categoriesData] = await Promise.all([
        productService.getAll(selectedCategory ? { category_id: selectedCategory } : {}),
        categoryService.getAll('product'),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(search.toLowerCase()) ||
    product.tags?.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="catalog-page">
      <div className="catalog-header">
        <div className="container">
          <h1>Our Products</h1>
          <p>Quality tools and materials for professional tailors</p>
        </div>
      </div>

      <div className="container">
        <div className="catalog-filters">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search products..."
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
        ) : filteredProducts.length > 0 ? (
          <div className="catalog-grid">
            {filteredProducts.map((product, index) => (
              <AnimatedSection key={product.id} delay={index * 0.05}>
                <ProductCard product={product} />
              </AnimatedSection>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No products found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

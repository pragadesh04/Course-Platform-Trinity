import { useState, useEffect, useRef } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    BookOpen,
    Package,
    FolderTree,
    Users,
    ShoppingBag,
    Plus,
    Edit2,
    Trash2,
    Eye,
    EyeOff,
    X,
    MessageSquare,
    Image,
    Settings,
    MessageCircle,
    Star,
    Reply,
    MoreHorizontal,
    Home,
    Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/UI/Modal';
import ImageUploader from '../components/UI/ImageUploader';
import {
    courseService,
    productService,
    categoryService,
    orderService,
} from '../services/api';
import './Admin.css';
import { API_BASE_URL } from '../config';

export default function Admin() {
    const { user, isAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const mainRef = useRef(null);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        if (mainRef.current) {
            mainRef.current.scrollTop = 0;
        }
    };

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'courses', label: 'Courses', icon: BookOpen },
        { id: 'products', label: 'Products', icon: Package },
        { id: 'categories', label: 'Categories', icon: FolderTree },
        { id: 'orders', label: 'Orders', icon: ShoppingBag },
        { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
        { id: 'gallery', label: 'Gallery', icon: Image },
        { id: 'comments', label: 'Comments', icon: MessageCircle },
        { id: 'feedbacks', label: 'Feedbacks', icon: Star },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const mobileTabs = tabs.slice(0, 5);

    return (
        <div className="admin-page">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h3>Admin Panel</h3>
                </div>
                <nav className="sidebar-nav">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`sidebar-link ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => handleTabChange(tab.id)}
                        >
                            <tab.icon size={20} />
                            {tab.label}
                        </button>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <Link to="/" className="sidebar-link">
                        <Eye size={20} />
                        View Site
                    </Link>
                </div>
            </aside>

            <main className="admin-main" ref={mainRef}>
                {activeTab === 'dashboard' && <DashboardContent />}
                {activeTab === 'courses' && <CoursesContent />}
                {activeTab === 'products' && <ProductsContent />}
                {activeTab === 'categories' && <CategoriesContent />}
                {activeTab === 'orders' && <OrdersContent />}
                {activeTab === 'testimonials' && <TestimonialsContent />}
                {activeTab === 'gallery' && <GalleryContent />}
                {activeTab === 'comments' && <CommentsContent />}
                {activeTab === 'feedbacks' && <FeedbacksContent />}
                {activeTab === 'settings' && <SettingsContent />}
            </main>

            <nav className="mobile-bottom-nav">
                {mobileTabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`mobile-nav-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => handleTabChange(tab.id)}
                    >
                        <tab.icon size={20} />
                        <span>{tab.label}</span>
                    </button>
                ))}
                <button
                    className="mobile-nav-btn"
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                >
                    <MoreHorizontal size={20} />
                    <span>More</span>
                </button>
            </nav>

            {showMobileMenu && (
                <div className="mobile-menu-overlay" onClick={() => setShowMobileMenu(false)}>
                    <div className="mobile-menu-drawer" onClick={(e) => e.stopPropagation()}>
                        <div className="mobile-menu-header">
                            <h3>More Options</h3>
                            <button onClick={() => setShowMobileMenu(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="mobile-menu-items">
                            {tabs.slice(5).map((tab) => (
                                <button
                                    key={tab.id}
                                    className={`mobile-menu-item ${activeTab === tab.id ? 'active' : ''}`}
                                    onClick={() => {
                                        handleTabChange(tab.id);
                                        setShowMobileMenu(false);
                                    }}
                                >
                                    <tab.icon size={20} />
                                    {tab.label}
                                </button>
                            ))}
                            <div className="mobile-menu-divider" />
                            <Link to="/" className="mobile-menu-item" onClick={() => setShowMobileMenu(false)}>
                                <Home size={20} />
                                View Site
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function DashboardContent() {
    const [stats, setStats] = useState({ courses: 0, products: 0, orders: 0, users: 0, students: 0 });

    useEffect(() => {
        async function fetchStats() {
            try {
                const response = await fetch(`${API_BASE_URL || 'http://localhost:8000'}/settings/stats`);
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        }
        fetchStats();
    }, []);

    return (
        <div className="admin-content">
            <h1>Dashboard</h1>
            <div className="stats-grid">
                <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <BookOpen size={32} className="stat-icon" />
                    <div className="stat-info">
                        <span className="stat-value">{stats.courses}</span>
                        <span className="stat-label">Courses</span>
                    </div>
                </motion.div>
                <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Package size={32} className="stat-icon" />
                    <div className="stat-info">
                        <span className="stat-value">{stats.products}</span>
                        <span className="stat-label">Products</span>
                    </div>
                </motion.div>
                <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <ShoppingBag size={32} className="stat-icon" />
                    <div className="stat-info">
                        <span className="stat-value">{stats.orders}</span>
                        <span className="stat-label">Orders</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function CoursesContent() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    async function fetchCourses() {
        try {
            const data = await courseService.getAll();
            setCourses(data);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id) {
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                await courseService.delete(id);
                fetchCourses();
            } catch (error) {
                console.error('Failed to delete course:', error);
            }
        }
    }

    function openEdit(course) {
        setEditingCourse(course);
        setShowModal(true);
    }

    return (
        <div className="admin-content">
            <div className="content-header">
                <h1>Courses</h1>
                <button className="btn btn-primary" onClick={() => { setEditingCourse(null); setShowModal(true); }}>
                    <Plus size={18} />
                    Add Course
                </button>
            </div>

            {loading ? (
                <div className="loading">Loading...</div>
            ) : courses.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <BookOpen size={32} />
                    </div>
                    <h3>No Courses Yet</h3>
                    <p>Create your first course to get started</p>
                    <button className="btn btn-primary" onClick={() => { setEditingCourse(null); setShowModal(true); }}>
                        <Plus size={18} />
                        Add Course
                    </button>
                </div>
            ) : (
                <div className="data-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Sessions</th>
                                <th>Prices</th>
                                <th>Featured</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map((course) => (
                                <tr key={course.id}>
                                    <td data-label="Title">{course.title}</td>
                                    <td data-label="Sessions">{course.sessions || 0}</td>
                                    <td data-label="Prices">
                                        3M: ₹{course.prices?.m3 || 0} |
                                        6M: ₹{course.prices?.m6 || 0} |
                                        LT: ₹{course.prices?.lifetime || 0}
                                    </td>
                                    <td data-label="Featured">{course.featured ? 'Yes' : 'No'}</td>
                                    <td data-label="Actions">
                                        <div className="action-buttons">
                                            <button className="action-btn edit" onClick={() => openEdit(course)}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="action-btn delete" onClick={() => handleDelete(course.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditingCourse(null); }}
                title={editingCourse ? 'Edit Course' : 'Add Course'}
                size="lg"
            >
                <CourseForm
                    course={editingCourse}
                    onClose={() => { setShowModal(false); setEditingCourse(null); }}
                    onSave={fetchCourses}
                />
            </Modal>
        </div>
    );
}

function CourseForm({ course, onClose, onSave }) {
    const [formData, setFormData] = useState({
        title: course?.title || '',
        description: course?.description || '',
        thumbnail_url: course?.thumbnail_url || '',
        video_links: course?.video_links?.join('\n') || '',
        session_durations: course?.sessions_list?.map(s => s.duration.toString()).join('\n') || '',
        session_titles: course?.session_titles?.join('\n') || course?.sessions_list?.map(s => s.title).join('\n') || '',
        featured: course?.featured || false,
        is_first_session_free: course?.is_first_session_free || false,
        prices: {
            m3: course?.prices?.m3 || 0,
            m6: course?.prices?.m6 || 0,
            lifetime: course?.prices?.lifetime || 0,
        },
    });
    const [saving, setSaving] = useState(false);
    const [fetchingMetadata, setFetchingMetadata] = useState(false);

    const fetchMetadata = async () => {
        const videoLinks = formData.video_links.split('\n').filter(url => url.trim());
        if (videoLinks.length === 0) {
            alert('Please add video links first');
            return;
        }
        setFetchingMetadata(true);
        try {
            const token = localStorage.getItem('course_better_token');
            const res = await fetch(`${API_BASE_URL}/courses/extract-metadata`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(videoLinks),
            });
            const data = await res.json();
            if (data.metadata) {
                setFormData(prev => ({
                    ...prev,
                    session_titles: data.metadata.map(m => m.title).join('\n'),
                    session_durations: data.metadata.map(m => m.duration.toString()).join('\n'),
                }));
            }
        } catch (error) {
            console.error('Failed to fetch metadata:', error);
            alert('Failed to fetch metadata. Please try manually.');
        } finally {
            setFetchingMetadata(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const videoLinks = formData.video_links.split('\n').filter((url) => url.trim());
            let durations = formData.session_durations.split('\n').filter(d => d.trim()).map(d => parseFloat(d.trim()) || 0);
            let titles = formData.session_titles.split('\n').filter(t => t.trim());
            
            if ((durations.length === 0 || titles.length === 0) && videoLinks.length > 0) {
                const token = localStorage.getItem('course_better_token');
                const res = await fetch(`${API_BASE_URL}/courses/extract-metadata`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : '',
                    },
                    body: JSON.stringify(videoLinks),
                });
                const data = await res.json();
                if (data.metadata && data.metadata.length > 0) {
                    durations = data.metadata.map(m => Math.round(m.duration * 10) / 10);
                    titles = data.metadata.map(m => m.title);
                    setFormData(prev => ({
                        ...prev,
                        session_durations: durations.map(d => d.toString()).join('\n'),
                        session_titles: titles.join('\n'),
                    }));
                }
            }
            
            if (durations.length === 0) {
                durations = [0];
            }
            if (titles.length === 0) {
                titles = videoLinks.map((_, i) => `Session ${i + 1}`);
            }
            
            const data = {
                title: formData.title,
                description: formData.description,
                thumbnail_url: formData.thumbnail_url,
                video_links: videoLinks,
                session_durations: durations,
                session_titles: titles,
                prices: formData.prices,
                featured: formData.featured,
                is_first_session_free: formData.is_first_session_free,
            };
            if (course) {
                await courseService.update(course.id, data);
            } else {
                await courseService.create(data);
            }
            onSave();
            onClose();
        } catch (error) {
            console.error('Failed to save course:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
                <label>Title</label>
                <input
                    type="text"
                    className="input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                />
            </div>
            <div className="form-group">
                <label>Description</label>
                <textarea
                    className="input"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
            </div>
            <div className="form-group">
                <label>Thumbnail</label>
                <ImageUploader
                    value={formData.thumbnail_url}
                    onChange={(url) => setFormData({ ...formData, thumbnail_url: url })}
                />
            </div>
            <div className="form-group">
                <label>Video Links (one per line)</label>
                <textarea
                    className="input"
                    rows={5}
                    placeholder="https://youtube.com/watch?v=..."
                    value={formData.video_links}
                    onChange={(e) => setFormData({ ...formData, video_links: e.target.value })}
                />
            </div>
            <div className="form-group">
                <div className="form-group-header">
                    <label>Session Titles & Durations (auto-fetched from YouTube)</label>
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={fetchMetadata}
                        disabled={fetchingMetadata}
                    >
                        <Clock size={14} />
                        {fetchingMetadata ? 'Fetching...' : 'Auto-Fetch Metadata'}
                    </button>
                </div>
                <textarea
                    className="input"
                    rows={3}
                    placeholder="Session titles will appear here after fetching"
                    value={formData.session_titles}
                    onChange={(e) => setFormData({ ...formData, session_titles: e.target.value })}
                />
            </div>
            <div className="form-group">
                <label>Session Durations (in minutes)</label>
                <textarea
                    className="input"
                    rows={3}
                    placeholder="Durations will appear here after fetching"
                    value={formData.session_durations}
                    onChange={(e) => setFormData({ ...formData, session_durations: e.target.value })}
                />
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label>3 Months Price (₹)</label>
                    <input
                        type="number"
                        className="input"
                        value={formData.prices.m3}
                        onChange={(e) => setFormData({
                            ...formData,
                            prices: { ...formData.prices, m3: parseFloat(e.target.value) || 0 },
                        })}
                    />
                </div>
                <div className="form-group">
                    <label>6 Months Price (₹)</label>
                    <input
                        type="number"
                        className="input"
                        value={formData.prices.m6}
                        onChange={(e) => setFormData({
                            ...formData,
                            prices: { ...formData.prices, m6: parseFloat(e.target.value) || 0 },
                        })}
                    />
                </div>
                <div className="form-group">
                    <label>Lifetime Price (₹)</label>
                    <input
                        type="number"
                        className="input"
                        value={formData.prices.lifetime}
                        onChange={(e) => setFormData({
                            ...formData,
                            prices: { ...formData.prices, lifetime: parseFloat(e.target.value) || 0 },
                        })}
                    />
                </div>
            </div>
            <div className="form-group checkbox">
                <label>
                    <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    />
                    Featured Course
                </label>
            </div>
            <div className="form-group checkbox">
                <label>
                    <input
                        type="checkbox"
                        checked={formData.is_first_session_free}
                        onChange={(e) => setFormData({ ...formData, is_first_session_free: e.target.checked })}
                    />
                    First Session Free
                </label>
            </div>
            <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Course'}
                </button>
            </div>
        </form>
    );
}

function ProductsContent() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts() {
        try {
            const data = await productService.getAll();
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id) {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await productService.delete(id);
                fetchProducts();
            } catch (error) {
                console.error('Failed to delete product:', error);
            }
        }
    }

    return (
        <div className="admin-content">
            <div className="content-header">
                <h1>Products</h1>
                <button className="btn btn-primary" onClick={() => { setEditingProduct(null); setShowModal(true); }}>
                    <Plus size={18} />
                    Add Product
                </button>
            </div>

            {loading ? (
                <div className="loading">Loading...</div>
            ) : products.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <Package size={32} />
                    </div>
                    <h3>No Products Yet</h3>
                    <p>Add your first product to start selling</p>
                    <button className="btn btn-primary" onClick={() => { setEditingProduct(null); setShowModal(true); }}>
                        <Plus size={18} />
                        Add Product
                    </button>
                </div>
            ) : (
                <div className="data-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Price</th>
                                <th>Features</th>
                                <th>Featured</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id}>
                                    <td data-label="Title">{product.title}</td>
                                    <td data-label="Price">₹{product.price}</td>
                                    <td data-label="Features">{product.key_features?.length || 0}</td>
                                    <td data-label="Featured">{product.featured ? 'Yes' : 'No'}</td>
                                    <td data-label="Actions">
                                        <div className="action-buttons">
                                            <button className="action-btn edit" onClick={() => { setEditingProduct(product); setShowModal(true); }}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="action-btn delete" onClick={() => handleDelete(product.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditingProduct(null); }}
                title={editingProduct ? 'Edit Product' : 'Add Product'}
                size="lg"
            >
                <ProductForm
                    product={editingProduct}
                    onClose={() => { setShowModal(false); setEditingProduct(null); }}
                    onSave={fetchProducts}
                />
            </Modal>
        </div>
    );
}

function ProductForm({ product, onClose, onSave }) {
    const [formData, setFormData] = useState({
        title: product?.title || '',
        description: product?.description || '',
        price: product?.price || 0,
        thumbnail_url: product?.thumbnail_url || '',
        key_features: product?.key_features?.join('\n') || '',
        tags: product?.tags?.join(', ') || '',
        featured: product?.featured || false,
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const data = {
                ...formData,
                price: parseFloat(formData.price) || 0,
                key_features: formData.key_features.split('\n').filter((f) => f.trim()),
                tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
            };
            if (product) {
                await productService.update(product.id, data);
            } else {
                await productService.create(data);
            }
            onSave();
            onClose();
        } catch (error) {
            console.error('Failed to save product:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
                <label>Title</label>
                <input
                    type="text"
                    className="input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                />
            </div>
            <div className="form-group">
                <label>Description</label>
                <textarea
                    className="input"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label>Price (₹)</label>
                    <input
                        type="number"
                        className="input"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Thumbnail</label>
                    <ImageUploader
                        value={formData.thumbnail_url}
                        onChange={(url) => setFormData({ ...formData, thumbnail_url: url })}
                    />
                </div>
            </div>
            <div className="form-group">
                <label>Key Features (one per line)</label>
                <textarea
                    className="input"
                    rows={4}
                    value={formData.key_features}
                    onChange={(e) => setFormData({ ...formData, key_features: e.target.value })}
                />
            </div>
            <div className="form-group">
                <label>Tags (comma separated)</label>
                <input
                    type="text"
                    className="input"
                    placeholder="tools, fabric, scissors"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
            </div>
            <div className="form-group checkbox">
                <label>
                    <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    />
                    Featured Product
                </label>
            </div>
            <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Product'}
                </button>
            </div>
        </form>
    );
}

function CategoriesContent() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    async function fetchCategories() {
        try {
            const data = await categoryService.getAll();
            setCategories(data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id) {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await categoryService.delete(id);
                fetchCategories();
            } catch (error) {
                console.error('Failed to delete category:', error);
            }
        }
    }

    return (
        <div className="admin-content">
            <div className="content-header">
                <h1>Categories</h1>
                <button className="btn btn-primary" onClick={() => { setEditingCategory(null); setShowModal(true); }}>
                    <Plus size={18} />
                    Add Category
                </button>
            </div>

            {loading ? (
                <div className="loading">Loading...</div>
            ) : categories.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <FolderTree size={32} />
                    </div>
                    <h3>No Categories Yet</h3>
                    <p>Create categories to organize your content</p>
                    <button className="btn btn-primary" onClick={() => { setEditingCategory(null); setShowModal(true); }}>
                        <Plus size={18} />
                        Add Category
                    </button>
                </div>
            ) : (
                <div className="data-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Slug</th>
                                <th>Type</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category) => (
                                <tr key={category.id}>
                                    <td data-label="Name">{category.name}</td>
                                    <td data-label="Slug">{category.slug}</td>
                                    <td data-label="Type" className="capitalize">{category.type}</td>
                                    <td data-label="Actions">
                                        <div className="action-buttons">
                                            <button className="action-btn edit" onClick={() => { setEditingCategory(category); setShowModal(true); }}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="action-btn delete" onClick={() => handleDelete(category.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditingCategory(null); }}
                title={editingCategory ? 'Edit Category' : 'Add Category'}
            >
                <CategoryForm
                    category={editingCategory}
                    onClose={() => { setShowModal(false); setEditingCategory(null); }}
                    onSave={fetchCategories}
                />
            </Modal>
        </div>
    );
}

function CategoryForm({ category, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: category?.name || '',
        slug: category?.slug || '',
        type: category?.type || 'course',
    });
    const [saving, setSaving] = useState(false);

    const handleNameChange = (name) => {
        const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        setFormData({ ...formData, name, slug });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (category) {
                await categoryService.update(category.id, formData);
            } else {
                await categoryService.create(formData);
            }
            onSave();
            onClose();
        } catch (error) {
            console.error('Failed to save category:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
                <label>Name</label>
                <input
                    type="text"
                    className="input"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label>Slug</label>
                <input
                    type="text"
                    className="input"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                />
            </div>
            <div className="form-group">
                <label>Type</label>
                <select
                    className="input"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                    <option value="course">Course</option>
                    <option value="product">Product</option>
                </select>
            </div>
            <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Category'}
                </button>
            </div>
        </form>
    );
}

function OrdersContent() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    async function fetchOrders() {
        try {
            const data = await orderService.getAllOrders();
            setOrders(data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="admin-content">
            <div className="content-header">
                <h1>Orders</h1>
            </div>

            {loading ? (
                <div className="loading">Loading...</div>
            ) : orders.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <ShoppingBag size={32} />
                    </div>
                    <h3>No Orders Yet</h3>
                    <p>Orders will appear here when customers make purchases</p>
                </div>
            ) : (
                <div className="data-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Payment</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id}>
                                    <td data-label="Order ID">{order.id.slice(-8)}</td>
                                    <td data-label="Items">{order.items.length} item(s)</td>
                                    <td data-label="Total">₹{order.total}</td>
                                    <td data-label="Payment" className="capitalize">{order.payment_method}</td>
                                    <td data-label="Status">
                                        <span className={`status-badge ${order.status}`}>{order.status}</span>
                                    </td>
                                    <td data-label="Date">{new Date(order.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function TestimonialsContent() {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', role: '', text: '', avatar_url: '' });
    const [saving, setSaving] = useState(false);
    const API_URL = API_BASE_URL || 'http://localhost:8000';

    useEffect(() => {
        fetchTestimonials();
    }, []);

    async function fetchTestimonials() {
        try {
            const res = await fetch(`${API_URL}/testimonials`);
            const data = await res.json();
            setTestimonials(data);
        } catch (error) {
            console.error('Failed to fetch testimonials:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('course_better_token');
            const res = await fetch(`${API_URL}/testimonials`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                setShowModal(false);
                setFormData({ name: '', role: '', text: '', avatar_url: '' });
                fetchTestimonials();
            }
        } catch (error) {
            console.error('Failed to add testimonial:', error);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id) {
        if (window.confirm('Delete this testimonial?')) {
            try {
                const token = localStorage.getItem('course_better_token');
                await fetch(`${API_URL}/testimonials/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                fetchTestimonials();
            } catch (error) {
                console.error('Failed to delete testimonial:', error);
            }
        }
    }

    return (
        <div className="admin-content">
            <div className="content-header">
                <h1>Testimonials</h1>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} /> Add Testimonial
                </button>
            </div>

            {loading ? (
                <div className="loading">Loading...</div>
            ) : (
                <div className="data-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Role</th>
                                <th>Text</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {testimonials.map((t) => (
                                <tr key={t.id}>
                                    <td>{t.name}</td>
                                    <td>{t.role}</td>
                                    <td>{t.text.substring(0, 50)}...</td>
                                    <td>
                                        <button className="action-btn delete" onClick={() => handleDelete(t.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Testimonial">
                <form onSubmit={handleSubmit} className="admin-form">
                    <div className="form-group">
                        <label>Name</label>
                        <input type="text" className="input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Role</label>
                        <input type="text" className="input" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Text</label>
                        <textarea className="input" rows={4} value={formData.text} onChange={(e) => setFormData({ ...formData, text: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Avatar URL</label>
                        <input type="url" className="input" value={formData.avatar_url} onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })} />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

function GalleryContent() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ image_url: '', title: '', span: 1, type: 'gallery' });
    const [saving, setSaving] = useState(false);
    const API_URL = API_BASE_URL || 'http://localhost:8000';

    useEffect(() => {
        fetchImages();
    }, []);

    async function fetchImages() {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/gallery`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setImages(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch gallery:', error);
            setImages([]);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        
        if (!formData.image_url) {
            alert('Please upload an image');
            return;
        }
        
        setSaving(true);
        try {
            const token = localStorage.getItem('course_better_token');
            const res = await fetch(`${API_URL}/gallery`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                setShowModal(false);
                setFormData({ image_url: '', title: '', span: 1, type: 'gallery' });
                await fetchImages();
            } else {
                const error = await res.json();
                alert(error.detail || 'Failed to save');
            }
        } catch (error) {
            console.error('Failed to add image:', error);
            alert('Failed to add image');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id) {
        if (window.confirm('Delete this image?')) {
            try {
                const token = localStorage.getItem('course_better_token');
                await fetch(`${API_URL}/gallery/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                fetchImages();
            } catch (error) {
                console.error('Failed to delete image:', error);
            }
        }
    }

    return (
        <div className="admin-content">
            <div className="content-header">
                <h1>Gallery</h1>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} /> Add Image
                </button>
            </div>

            {loading ? (
                <div className="loading">Loading...</div>
            ) : (
                <div className="data-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Preview</th>
                                <th>Title</th>
                                <th>Type</th>
                                <th>Span</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {images.map((img) => (
                                <tr key={img.id}>
                                    <td><img src={img.image_url} alt={img.title} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8 }} /></td>
                                    <td>{img.title}</td>
                                    <td><span className={`type-badge ${img.type}`}>{img.type}</span></td>
                                    <td>{img.span}</td>
                                    <td>
                                        <button className="action-btn delete" onClick={() => handleDelete(img.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={showModal} onClose={() => { setShowModal(false); setFormData({ image_url: '', title: '', span: 1, type: 'gallery' }); }} title="Add Gallery Image">
                <form onSubmit={handleSubmit} className="admin-form">
                    <div className="form-group">
                        <label>Image *</label>
                        <ImageUploader
                            value={formData.image_url || ''}
                            onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                        />
                    </div>
                    <div className="form-group">
                        <label>Title</label>
                        <input type="text" className="input" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Span (1-2)</label>
                        <input type="number" className="input" min={1} max={2} value={formData.span} onChange={(e) => setFormData({ ...formData, span: parseInt(e.target.value) })} />
                    </div>
                    <div className="form-group">
                        <label>Type</label>
                        <select className="input" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                            <option value="gallery">Gallery Image</option>
                            <option value="founder">Founder Image</option>
                        </select>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

function SettingsContent() {
    const [founder, setFounder] = useState({ name: '', title: '', bio: '', image_url: '' });
    const [about, setAbout] = useState({ experience_years: 10, mission: '', about_text: '' });
    const [contact, setContact] = useState({ phone: '', email: '', address: '', whatsapp: '', instagram: '', facebook: '' });
    const [saving, setSaving] = useState({ founder: false, about: false, contact: false });
    const [messages, setMessages] = useState({ founder: '', about: '', contact: '' });
    const [loading, setLoading] = useState(true);
    const API_URL = API_BASE_URL || 'http://localhost:8000';

    useEffect(() => {
        fetchAllSettings();
    }, []);

    async function fetchAllSettings() {
        try {
            const [founderRes, aboutRes, contactRes] = await Promise.all([
                fetch(`${API_URL}/settings/founder`),
                fetch(`${API_URL}/settings/about`),
                fetch(`${API_URL}/settings/contact`)
            ]);
            const [founderData, aboutData, contactData] = await Promise.all([
                founderRes.json(),
                aboutRes.json(),
                contactRes.json()
            ]);
            setFounder(founderData);
            setAbout(aboutData);
            setContact(contactData);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    }

    async function saveFounder(e) {
        e.preventDefault();
        setSaving(prev => ({ ...prev, founder: true }));
        setMessages(prev => ({ ...prev, founder: '' }));
        try {
            const token = localStorage.getItem('course_better_token');
            const res = await fetch(`${API_URL}/settings/founder`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(founder),
            });
            if (!res.ok) throw new Error('Failed to save');
            setMessages(prev => ({ ...prev, founder: 'success' }));
        } catch (error) {
            console.error('Failed to save founder:', error);
            setMessages(prev => ({ ...prev, founder: 'error' }));
        } finally {
            setSaving(prev => ({ ...prev, founder: false }));
        }
    }

    async function saveAbout(e) {
        e.preventDefault();
        setSaving(prev => ({ ...prev, about: true }));
        setMessages(prev => ({ ...prev, about: '' }));
        try {
            const token = localStorage.getItem('course_better_token');
            const res = await fetch(`${API_URL}/settings/about`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(about),
            });
            if (!res.ok) throw new Error('Failed to save');
            setMessages(prev => ({ ...prev, about: 'success' }));
        } catch (error) {
            console.error('Failed to save about:', error);
            setMessages(prev => ({ ...prev, about: 'error' }));
        } finally {
            setSaving(prev => ({ ...prev, about: false }));
        }
    }

    async function saveContact(e) {
        e.preventDefault();
        setSaving(prev => ({ ...prev, contact: true }));
        setMessages(prev => ({ ...prev, contact: '' }));
        try {
            const token = localStorage.getItem('course_better_token');
            const res = await fetch(`${API_URL}/settings/contact`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(contact),
            });
            if (!res.ok) throw new Error('Failed to save');
            setMessages(prev => ({ ...prev, contact: 'success' }));
        } catch (error) {
            console.error('Failed to save contact:', error);
            setMessages(prev => ({ ...prev, contact: 'error' }));
        } finally {
            setSaving(prev => ({ ...prev, contact: false }));
        }
    }

    if (loading) {
        return <div className="admin-content"><div className="loading">Loading...</div></div>;
    }

    return (
        <div className="admin-content">
            <h1>Site Settings</h1>
            
            <form onSubmit={saveAbout} className="admin-form settings-section">
                <div className="settings-header">
                    <h3>About Us Settings</h3>
                    {messages.about === 'success' && <span className="success-msg">Saved!</span>}
                    {messages.about === 'error' && <span className="error-msg">Failed to save</span>}
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Experience Years</label>
                        <input type="number" className="input" min="0" value={about.experience_years} onChange={(e) => setAbout({ ...about, experience_years: parseInt(e.target.value) || 0 })} />
                    </div>
                </div>
                <div className="form-group">
                    <label>About Text (Hero Description)</label>
                    <textarea className="input" rows={3} value={about.about_text} onChange={(e) => setAbout({ ...about, about_text: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Mission Statement</label>
                    <textarea className="input" rows={3} value={about.mission} onChange={(e) => setAbout({ ...about, mission: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={saving.about}>
                    {saving.about ? 'Saving...' : 'Save About Settings'}
                </button>
            </form>

            <form onSubmit={saveContact} className="admin-form settings-section">
                <div className="settings-header">
                    <h3>Contact Information</h3>
                    {messages.contact === 'success' && <span className="success-msg">Saved!</span>}
                    {messages.contact === 'error' && <span className="error-msg">Failed to save</span>}
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Phone</label>
                        <input type="text" className="input" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" className="input" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
                    </div>
                </div>
                <div className="form-group">
                    <label>Address</label>
                    <input type="text" className="input" value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} />
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>WhatsApp</label>
                        <input type="text" className="input" value={contact.whatsapp} onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Instagram</label>
                        <input type="text" className="input" value={contact.instagram} onChange={(e) => setContact({ ...contact, instagram: e.target.value })} />
                    </div>
                </div>
                <div className="form-group">
                    <label>Facebook</label>
                    <input type="text" className="input" value={contact.facebook} onChange={(e) => setContact({ ...contact, facebook: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={saving.contact}>
                    {saving.contact ? 'Saving...' : 'Save Contact Settings'}
                </button>
            </form>

            <form onSubmit={saveFounder} className="admin-form settings-section">
                <div className="settings-header">
                    <h3>Founder Information</h3>
                    {messages.founder === 'success' && <span className="success-msg">Saved!</span>}
                    {messages.founder === 'error' && <span className="error-msg">Failed to save</span>}
                </div>
                <div className="form-group">
                    <label>Name</label>
                    <input type="text" className="input" value={founder.name} onChange={(e) => setFounder({ ...founder, name: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Title</label>
                    <input type="text" className="input" value={founder.title} onChange={(e) => setFounder({ ...founder, title: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Bio / Quote</label>
                    <textarea className="input" rows={4} value={founder.bio} onChange={(e) => setFounder({ ...founder, bio: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Image</label>
                    <ImageUploader
                        value={founder.image_url || ''}
                        onChange={(url) => setFounder(prev => ({ ...prev, image_url: url }))}
                    />
                </div>
                <button type="submit" className="btn btn-primary" disabled={saving.founder}>
                    {saving.founder ? 'Saving...' : 'Save Founder Settings'}
                </button>
            </form>
        </div>
    );
}

function CommentsContent() {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyModal, setReplyModal] = useState(null);
    const [replyText, setReplyText] = useState('');
    const API_URL = API_BASE_URL || 'http://localhost:8000';

    useEffect(() => {
        fetchComments();
    }, []);

    const getHeaders = () => {
        const token = localStorage.getItem('course_better_token');
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        };
    };

    async function fetchComments() {
        try {
            const res = await fetch(`${API_URL}/comments/all/all`, {
                headers: getHeaders(),
            });
            const data = await res.json();
            setComments(data);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleReply(commentId) {
        if (!replyText.trim()) return;
        try {
            await fetch(`${API_URL}/comments/${commentId}/reply`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ text: replyText }),
            });
            setReplyModal(null);
            setReplyText('');
            fetchComments();
        } catch (error) {
            alert('Failed to reply');
        }
    }

    async function handleDelete(commentId) {
        if (!confirm('Delete this comment?')) return;
        try {
            await fetch(`${API_URL}/comments/${commentId}`, {
                method: 'DELETE',
                headers: getHeaders(),
            });
            fetchComments();
        } catch (error) {
            alert('Failed to delete');
        }
    }

    const formatDate = (date) => new Date(date).toLocaleDateString();

    return (
        <div className="admin-content">
            <h1>Comments</h1>
            {loading ? (
                <div className="loading">Loading...</div>
            ) : (
                <div className="data-table">
                    <table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Course</th>
                                <th>Session</th>
                                <th>Comment</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comments.map((c) => (
                                <tr key={c.id}>
                                    <td>{c.user_name}</td>
                                    <td>{c.course_id}</td>
                                    <td>Session {c.session_index + 1}</td>
                                    <td>{c.text.substring(0, 50)}...</td>
                                    <td>{formatDate(c.created_at)}</td>
                                    <td>
                                        <button className="action-btn" onClick={() => setReplyModal(c)}>
                                            <Reply size={16} />
                                        </button>
                                        <button className="action-btn delete" onClick={() => handleDelete(c.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <Modal isOpen={!!replyModal} onClose={() => setReplyModal(null)} title="Reply to Comment">
                <div className="admin-form">
                    <p><strong>{replyModal?.user_name}:</strong> {replyModal?.text}</p>
                    <div className="form-group">
                        <label>Your Reply</label>
                        <textarea className="input" rows={3} value={replyText} onChange={(e) => setReplyText(e.target.value)} />
                    </div>
                    <div className="form-actions">
                        <button className="btn btn-secondary" onClick={() => setReplyModal(null)}>Cancel</button>
                        <button className="btn btn-primary" onClick={() => handleReply(replyModal?.id)}>Send Reply</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

function FeedbacksContent() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const API_URL = API_BASE_URL || 'http://localhost:8000';

    const getHeaders = () => {
        const token = localStorage.getItem('course_better_token');
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        };
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    async function fetchFeedbacks() {
        try {
            const res = await fetch(`${API_URL}/feedbacks/all/all`, {
                headers: getHeaders(),
            });
            const data = await res.json();
            setFeedbacks(data);
        } catch (error) {
            console.error('Failed to fetch feedbacks:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id) {
        if (!confirm('Delete this feedback?')) return;
        try {
            await fetch(`${API_URL}/feedbacks/${id}`, {
                method: 'DELETE',
                headers: getHeaders(),
            });
            fetchFeedbacks();
        } catch (error) {
            alert('Failed to delete');
        }
    }

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <span key={i} style={{ color: i < rating ? '#D4AF37' : '#ddd' }}>★</span>
        ));
    };

    return (
        <div className="admin-content">
            <h1>Feedbacks</h1>
            {loading ? (
                <div className="loading">Loading...</div>
            ) : (
                <div className="data-table">
                    <table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Course</th>
                                <th>Rating</th>
                                <th>Feedback</th>
                                <th>Auto-Testimonial</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {feedbacks.map((f) => (
                                <tr key={f.id}>
                                    <td>{f.user_name}</td>
                                    <td>{f.course_title || f.course_id}</td>
                                    <td>{renderStars(f.rating)}</td>
                                    <td>{f.text.substring(0, 50)}...</td>
                                    <td>{f.testimonial_id ? 'Yes' : 'No'}</td>
                                    <td>
                                        <button className="action-btn delete" onClick={() => handleDelete(f.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

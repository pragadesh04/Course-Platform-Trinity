import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Save, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { courseService, categoryService } from '../services/api';
import { API_BASE_URL } from '../config';
import ImageUploader from '../components/UI/ImageUploader';
import './CourseEditor.css';

export default function CourseEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);
    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [fetchingMetadata, setFetchingMetadata] = useState(false);
    const [categories, setCategories] = useState([]);
    const [aiLoadingTitle, setAiLoadingTitle] = useState(false);
    const [aiLoadingDescription, setAiLoadingDescription] = useState(false);
    const [aiLoadingLearnings, setAiLoadingLearnings] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        thumbnail_url: '',
        video_links: '',
        session_durations: '',
        session_titles: '',
        featured: false,
        is_first_session_free: false,
        prices: {
            m3: 0,
            m6: 0,
            lifetime: 0,
        },
        is_free: false,
        what_you_will_learn: '',
        prerequisites: '',
        category_ids: [],
    });

    useEffect(() => {
        async function fetchData() {
            try {
                const cats = await categoryService.getAll('course');
                setCategories(cats);

                if (id) {
                    const course = await courseService.getById(id);
                    setFormData({
                        title: course.title || '',
                        description: course.description || '',
                        thumbnail_url: course.thumbnail_url || '',
                        video_links: course.video_links?.join('\n') || '',
                        session_durations: course.sessions_list?.map(s => s.duration.toString()).join('\n') || '',
                        session_titles: course.session_titles?.join('\n') || course.sessions_list?.map(s => s.title).join('\n') || '',
                        featured: course.featured || false,
                        is_first_session_free: course.is_first_session_free || false,
                        prices: {
                            m3: course.prices?.m3 || 0,
                            m6: course.prices?.m6 || 0,
                            lifetime: course.prices?.lifetime || 0,
                        },
                        is_free: course.prices?.m3 === 0 && course.prices?.m6 === 0 && course.prices?.lifetime === 0,
                        what_you_will_learn: course.what_you_will_learn?.join('\n') || '',
                        prerequisites: course.prerequisites?.join('\n') || '',
                        category_ids: course.category_ids || [],
                    });
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id]);

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

                const aiRes = await fetch(`${API_BASE_URL}/courses/generate-ai-content`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(data.metadata),
                });
                const aiData = await aiRes.json();
                if (aiData.what_you_will_learn) {
                    setFormData(prev => ({
                        ...prev,
                        what_you_will_learn: aiData.what_you_will_learn.join('\n'),
                        prerequisites: aiData.prerequisites?.join('\n') || '',
                    }));
                }
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

            const courseData = {
                title: formData.title,
                description: formData.description,
                thumbnail_url: formData.thumbnail_url,
                video_links: videoLinks,
                sessions_list: titles.map((title, index) => ({
                    title: title || `Session ${index + 1}`,
                    duration: durations[index] || 0,
                    video_link: videoLinks[index] || '',
                })),
                featured: formData.featured,
                is_first_session_free: formData.is_first_session_free,
                prices: formData.is_free ? { m3: 0, m6: 0, lifetime: 0 } : formData.prices,
                what_you_will_learn: formData.what_you_will_learn.split('\n').filter(t => t.trim()),
                prerequisites: formData.prerequisites.split('\n').filter(t => t.trim()),
                category_ids: formData.category_ids,
            };

            if (isEditing) {
                await courseService.update(id, courseData);
            } else {
                await courseService.create(courseData);
            }
            navigate('/admin?tab=courses');
        } catch (error) {
            console.error('Failed to save course:', error);
            alert('Failed to save course. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this course?')) return;
        try {
            await courseService.delete(id);
            navigate('/admin?tab=courses');
        } catch (error) {
            console.error('Failed to delete course:', error);
            alert('Failed to delete course.');
        }
    };

    const handleGenerateTitle = async () => {
        if (!formData.title) {
            alert('Please enter a course title first.');
            return;
        }
        setAiLoadingTitle(true);
        try {
            const data = await courseService.generateTitle(formData.title);
            setFormData(prev => ({ ...prev, title: data.title }));
        } catch (error) {
            console.error('AI Title failed:', error);
            alert('Failed to enhance title.');
        } finally {
            setAiLoadingTitle(false);
        }
    };

    const handleGenerateDescription = async () => {
        if (!formData.title) {
            alert('Please enter a course title first.');
            return;
        }
        setAiLoadingDescription(true);
        try {
            const data = await courseService.generateDescription(formData.title);
            setFormData(prev => ({ ...prev, description: data.description }));
        } catch (error) {
            console.error('AI Description failed:', error);
            alert('Failed to generate description.');
        } finally {
            setAiLoadingDescription(false);
        }
    };

    const handleGenerateLearnings = async () => {
        if (!formData.title || !formData.description) {
            alert('Please enter a title and description first.');
            return;
        }
        setAiLoadingLearnings(true);
        try {
            const data = await courseService.generateLearnings(formData.title, formData.description);
            const currentLearnings = formData.what_you_will_learn.split('\n').filter(l => l.trim());
            const combined = [...new Set([...currentLearnings, ...data.learnings])];
            setFormData(prev => ({ ...prev, what_you_will_learn: combined.join('\n') }));
        } catch (error) {
            console.error('AI Learnings failed:', error);
            alert('Failed to generate learnings.');
        } finally {
            setAiLoadingLearnings(false);
        }
    };

    if (loading) {
        return (
            <div className="course-editor loading">
                <div className="loading-spinner" />
            </div>
        );
    }

    return (
        <div className="course-editor">
            <div className="editor-header">
                <button className="btn btn-secondary" onClick={() => navigate('/admin?tab=courses')}>
                    <ArrowLeft size={18} />
                    Back to Courses
                </button>
                <h1>{isEditing ? 'Edit Course' : 'Add New Course'}</h1>
                <div className="header-actions">
                    {isEditing && (
                        <button className="btn btn-danger" onClick={handleDelete}>
                            <Trash2 size={18} />
                            Delete
                        </button>
                    )}
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Course'}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="editor-form">
                <div className="form-section">
                    <h2>Basic Information</h2>
                    <div className="form-group">
                        <div className="label-with-ai">
                            <label>Course Title *</label>
                            <button
                                type="button"
                                className="btn-ai-assist"
                                onClick={handleGenerateTitle}
                                disabled={aiLoadingTitle}
                            >
                                {aiLoadingTitle ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
                                Enhance Title
                            </button>
                        </div>
                        <input
                            type="text"
                            className="input"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <div className="label-with-ai">
                            <label>Description</label>
                            <button
                                type="button"
                                className="btn-ai-assist"
                                onClick={handleGenerateDescription}
                                disabled={aiLoadingDescription}
                            >
                                {aiLoadingDescription ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
                                Generate with AI
                            </button>
                        </div>
                        <textarea
                            className="input"
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Thumbnail Image</label>
                        <ImageUploader
                            value={formData.thumbnail_url}
                            onChange={(url) => setFormData({ ...formData, thumbnail_url: url })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Categories</label>
                        <div className="category-chips">
                            {categories.map(cat => (
                                <label key={cat.id} className={`category-chip ${formData.category_ids.includes(cat.id) ? 'selected' : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={formData.category_ids.includes(cat.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setFormData({ ...formData, category_ids: [...formData.category_ids, cat.id] });
                                            } else {
                                                setFormData({ ...formData, category_ids: formData.category_ids.filter(id => id !== cat.id) });
                                            }
                                        }}
                                    />
                                    {cat.name}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h2>Video Content</h2>
                    <div className="form-group">
                        <label>Video Links (one per line)</label>
                        <textarea
                            className="input"
                            rows={6}
                            placeholder="https://youtube.com/watch?v=..."
                            value={formData.video_links}
                            onChange={(e) => setFormData({ ...formData, video_links: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <div className="form-group-header">
                            <label>Session Titles</label>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={fetchMetadata}
                                disabled={fetchingMetadata}
                            >
                                <Clock size={14} />
                                {fetchingMetadata ? 'Fetching...' : 'Auto-Fetch'}
                            </button>
                        </div>
                        <textarea
                            className="input"
                            rows={4}
                            placeholder="Session titles (one per line)"
                            value={formData.session_titles}
                            onChange={(e) => setFormData({ ...formData, session_titles: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Session Durations (minutes, one per line)</label>
                        <textarea
                            className="input"
                            rows={4}
                            placeholder="Durations (one per line)"
                            value={formData.session_durations}
                            onChange={(e) => setFormData({ ...formData, session_durations: e.target.value })}
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h2>Pricing</h2>
                    <div className="form-group checkbox">
                        <label>
                            <input
                                type="checkbox"
                                checked={formData.is_free}
                                onChange={(e) => setFormData({ ...formData, is_free: e.target.checked })}
                            />
                            Free Course (No payment required)
                        </label>
                    </div>
                    {!formData.is_free && (
                        <div className="form-row">
                            <div className="form-group">
                                <label>3 Months (₹)</label>
                                <input
                                    type="number"
                                    className="input"
                                    value={formData.prices.m3}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        prices: { ...formData.prices, m3: parseFloat(e.target.value) || 0 }
                                    })}
                                />
                            </div>
                            <div className="form-group">
                                <label>6 Months (₹)</label>
                                <input
                                    type="number"
                                    className="input"
                                    value={formData.prices.m6}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        prices: { ...formData.prices, m6: parseFloat(e.target.value) || 0 }
                                    })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Lifetime (₹)</label>
                                <input
                                    type="number"
                                    className="input"
                                    value={formData.prices.lifetime}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        prices: { ...formData.prices, lifetime: parseFloat(e.target.value) || 0 }
                                    })}
                                />
                            </div>
                        </div>
                    )}
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
                </div>

                <div className="form-section">
                    <h2>Course Details</h2>
                    <div className="form-group">
                        <div className="label-with-ai">
                            <label>What You Will Learn (one per line)</label>
                            <button
                                type="button"
                                className="btn-ai-assist"
                                onClick={handleGenerateLearnings}
                                disabled={aiLoadingLearnings}
                            >
                                {aiLoadingLearnings ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
                                Suggest Learnings
                            </button>
                        </div>
                        <textarea
                            className="input"
                            rows={5}
                            placeholder="Skill or knowledge point"
                            value={formData.what_you_will_learn}
                            onChange={(e) => setFormData({ ...formData, what_you_will_learn: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Prerequisites (one per line)</label>
                        <textarea
                            className="input"
                            rows={4}
                            placeholder="Requirements or prerequisites"
                            value={formData.prerequisites}
                            onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin?tab=courses')}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Course'}
                    </button>
                </div>
            </form>
        </div>
    );
}
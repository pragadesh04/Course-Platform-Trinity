import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Check, Loader2, UserPlus } from 'lucide-react';
import { courseService, enrollmentService } from '../../services/api';
import './BulkAccessModal.css';

const DURATION_OPTIONS = [
    { value: '3m', label: '3 Months' },
    { value: '6m', label: '6 Months' },
    { value: 'lifetime', label: 'Lifetime' },
];

export default function BulkAccessModal({ isOpen, onClose }) {
    const [phone, setPhone] = useState('');
    const [courses, setCourses] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [duration, setDuration] = useState('3m');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchCourses();
        }
        return () => {
            setPhone('');
            setSelectedCourses([]);
            setDuration('3m');
            setSuccess(false);
            setError('');
        };
    }, [isOpen]);

    async function fetchCourses() {
        setLoading(true);
        try {
            const data = await courseService.getAll();
            setCourses(data);
        } catch (err) {
            console.error('Failed to fetch courses:', err);
            setError('Failed to load courses');
        } finally {
            setLoading(false);
        }
    }

    function toggleCourse(courseId) {
        setSelectedCourses((prev) =>
            prev.includes(courseId)
                ? prev.filter((id) => id !== courseId)
                : [...prev, courseId]
        );
    }

    async function handleSubmit() {
        if (!phone.trim()) {
            setError('Please enter a phone number');
            return;
        }
        if (selectedCourses.length === 0) {
            setError('Please select at least one course');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await enrollmentService.bulkCreate({
                mobile_number: phone.trim(),
                course_ids: selectedCourses,
                duration: duration,
            });
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            setError(err.message || 'Failed to grant access');
        } finally {
            setSubmitting(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <motion.div
                className="bulk-access-modal"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
                <div className="modal-header">
                    <div className="modal-header-content">
                        <h2>Grant Bulk Access</h2>
                        <p>Instantly grant multiple courses to a user</p>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="phone-input-wrapper">
                        <label>Phone Number</label>
                        <div className="phone-input-container">
                            <Search size={18} className="phone-input-icon" />
                            <input
                                type="tel"
                                className="phone-input"
                                placeholder="Enter phone number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="duration-selector">
                        <label>Access Duration</label>
                        <div className="duration-options">
                            {DURATION_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    className={`duration-option ${duration === option.value ? 'active' : ''}`}
                                    onClick={() => setDuration(option.value)}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="course-selection">
                        <label>Select Courses ({selectedCourses.length} selected)</label>
                        {loading ? (
                            <div className="loading-state">
                                <Loader2 size={24} className="spin" />
                                <span>Loading courses...</span>
                            </div>
                        ) : courses.length === 0 ? (
                            <div className="empty-state">No courses available</div>
                        ) : (
                            <div className="course-grid">
                                {courses.map((course) => (
                                    <motion.div
                                        key={course.id}
                                        className={`course-card ${selectedCourses.includes(course.id) ? 'selected' : ''}`}
                                        onClick={() => toggleCourse(course.id)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="course-thumbnail">
                                            {course.thumbnail_url ? (
                                                <img src={course.thumbnail_url} alt={course.title} />
                                            ) : (
                                                <div className="placeholder-thumb" />
                                            )}
                                        </div>
                                        <div className="course-info">
                                            <span className="course-title">{course.title}</span>
                                            <span className="course-sessions">
                                                {course.sessions || 0} sessions
                                            </span>
                                        </div>
                                        <div className="course-checkbox">
                                            {selectedCourses.includes(course.id) && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                >
                                                    <Check size={16} />
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose} disabled={submitting}>
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary grant-btn"
                        onClick={handleSubmit}
                        disabled={submitting || selectedCourses.length === 0}
                    >
                        {submitting ? (
                            <>
                                <Loader2 size={18} className="spin" />
                                Granting...
                            </>
                        ) : success ? (
                            <>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                >
                                    <Check size={18} />
                                </motion.div>
                                Access Granted!
                            </>
                        ) : (
                            <>
                                Grant Access to {selectedCourses.length} Course{selectedCourses.length !== 1 ? 's' : ''}
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
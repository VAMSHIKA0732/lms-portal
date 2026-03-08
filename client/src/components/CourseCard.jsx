import { Link } from 'react-router-dom';
import { User, Clock } from 'lucide-react';

// Color palettes for course thumbnails (cycles through)
const THUMB_GRADIENTS = [
  'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
  'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
  'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
  'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
  'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
  'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
];
const THUMB_EMOJIS = ['📘', '🚀', '🎨', '💻', '🧪', '📊', '🌐', '🎯'];

function getThumbIndex(id) {
  if (!id) return 0;
  return id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % THUMB_GRADIENTS.length;
}

const CourseCard = ({ course, onEnroll, isEnrolled, showEnroll = true, progress = 0 }) => {
  const idx = getThumbIndex(course._id);
  const gradient = THUMB_GRADIENTS[idx];
  const emoji = THUMB_EMOJIS[idx];

  const getStatusBadge = () => {
    if (isEnrolled && progress === 100) return <span className="course-status-badge completed">✓ Completed</span>;
    if (isEnrolled && progress > 0) return <span className="course-status-badge in-progress">● In Progress</span>;
    if (isEnrolled) return <span className="course-status-badge in-progress">Enrolled</span>;
    return null;
  };

  return (
    <div className="course-card">
      {/* Colorful Thumbnail */}
      <div className="course-thumb" style={{ background: gradient }}>
        <div className="thumb-pattern" />
        <div className="course-thumb-icon">{emoji}</div>
        <div className="course-thumb-title" style={{ position: 'relative', zIndex: 1 }}>
          <div className="course-badge">{course.duration}</div>
        </div>
      </div>

      {/* Card Body */}
      <div className="course-card-body">
        <Link to={`/course/${course._id}`} className="course-card-link">
          <h3>{course.title}</h3>
          <p className="course-desc">{course.description}</p>
        </Link>

        {/* Progress bar for enrolled courses */}
        {isEnrolled && (
          <div className="course-progress-wrap">
            <div className="course-progress-bar">
              <div className="course-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="course-progress-label">{progress}% complete</div>
          </div>
        )}

        {getStatusBadge()}

        {showEnroll && (
          <button
            className={`enroll-btn ${isEnrolled ? 'enrolled' : ''}`}
            onClick={() => !isEnrolled && onEnroll && onEnroll(course._id)}
            disabled={isEnrolled}
          >
            {isEnrolled ? '✓ Enrolled' : 'Enroll Now'}
          </button>
        )}
      </div>

      {/* Meta footer */}
      <div className="course-meta">
        <div className="meta-item">
          <User size={14} />
          <span>{course.teacher?.name || 'Instructor'}</span>
        </div>
        <div className="meta-item">
          <Clock size={14} />
          <span>{course.duration}</span>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;

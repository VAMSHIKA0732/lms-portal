import { Link } from 'react-router-dom';
import { User, Clock } from 'lucide-react';

const CourseCard = ({ course, onEnroll, isEnrolled, showEnroll = true }) => {
  return (
    <div className="course-card">
      <Link to={`/course/${course._id}`} className="course-card-link">
        <div className="course-badge">{course.duration}</div>
        <h3>{course.title}</h3>
        <p className="course-desc">{course.description}</p>
      </Link>
      
      <div className="course-meta">
        <div className="meta-item">
          <User size={16} />
          <span>{course.teacher?.name || 'Unknown Teacher'}</span>
        </div>
        <div className="meta-item">
          <Clock size={16} />
          <span>{course.duration}</span>
        </div>
      </div>

      {showEnroll && (
        <button 
          className={`enroll-btn ${isEnrolled ? 'enrolled' : ''}`}
          onClick={() => !isEnrolled && onEnroll(course._id)}
          disabled={isEnrolled}
        >
          {isEnrolled ? 'Enrolled' : 'Enroll Now'}
        </button>
      )}
    </div>
  );
};

export default CourseCard;

import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Book, GraduationCap, Clock, Award, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CourseCard from '../components/CourseCard';

const StudentDashboard = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await api.get('/enrollments/my-courses');
        setEnrolledCourses(res.data);
      } catch (err) {
        console.error('Error fetching enrollments', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchEnrollments();
  }, [user]);

  if (loading) return <div className="loading">Loading your dashboard...</div>;

  return (
    <div className="dashboard-container fade-in">
      {/* Welcome Banner */}
      <div className="dashboard-welcome">
        <h2>Welcome back, {user?.name?.split(' ')[0] || 'Learner'}! 👋</h2>
        <p>Continue your learning journey. You're doing great!</p>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-bar-item">
          <div className="stat-bar-value">{enrolledCourses.length}</div>
          <div className="stat-bar-label">Courses<br />Enrolled</div>
        </div>
        <div className="stat-bar-item">
          <div className="stat-bar-value">0</div>
          <div className="stat-bar-label">Completed<br />Courses</div>
        </div>
        <div className="stat-bar-item">
          <div className="stat-bar-value">0h</div>
          <div className="stat-bar-label">Training<br />Time</div>
        </div>
        <div className="stat-bar-item">
          <div className="stat-bar-value">0</div>
          <div className="stat-bar-label">Badges<br />Earned</div>
        </div>
        <div className="stat-bar-item">
          <div className="stat-bar-value" style={{ color: '#f59e0b' }}>850</div>
          <div className="stat-bar-label">Total<br />Points</div>
        </div>
      </div>

      {/* My Courses */}
      <div className="section-toolbar">
        <h2 className="section-title">My Learning</h2>
      </div>

      {enrolledCourses.length > 0 ? (
        <div className="course-grid">
          {enrolledCourses.map((course, i) => (
            <CourseCard
              key={course._id}
              course={course}
              showEnroll={false}
              isEnrolled={true}
              progress={Math.floor(Math.random() * 60)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📚</div>
          <h3>No courses yet</h3>
          <p>Explore our catalog to start your learning journey!</p>
          <a href="/courses" className="btn-primary" style={{ display: 'inline-flex', marginTop: '0.5rem' }}>
            Browse Courses →
          </a>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;

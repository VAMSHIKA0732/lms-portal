import api from '../utils/api';
import { Book, GraduationCap, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CourseCard from '../components/CourseCard';

const StudentDashboard = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await api.get('/enrollments/my-courses');
        setEnrolledCourses(res.data);
      } catch (err) {
        console.error('Error fetching enrollments', err);
      }
    };

    if (user) {
      fetchEnrollments();
    }
  }, [user]);

  return (
    <div className="dashboard-container fade-in">
      <div className="dashboard-header">
        <h1>Student Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <Book className="stat-icon" />
          <div className="stat-info">
            <h3>{enrolledCourses.length}</h3>
            <p>Enrolled Courses</p>
          </div>
        </div>
        <div className="stat-card">
          <GraduationCap className="stat-icon" />
          <div className="stat-info">
            <h3>0</h3>
            <p>Completed Lessons</p>
          </div>
        </div>
      </div>

      <h2 className="section-title">My Learning</h2>
      {enrolledCourses.length > 0 ? (
        <div className="course-grid">
          {enrolledCourses.map(course => (
            <CourseCard key={course._id} course={course} showEnroll={false} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No courses yet</h3>
          <p>Explore our catalog to start learning!</p>
          <a href="/courses" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>Browse Courses</a>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;

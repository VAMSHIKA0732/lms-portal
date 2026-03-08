import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CourseCard from '../components/CourseCard';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const [enrolledIds, setEnrolledIds] = useState([]);

  useEffect(() => {
    fetchCourses();
    if (user && user.role === 'Student') fetchEnrollments();
  }, [user]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      courses.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      )
    );
  }, [search, courses]);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error('Error fetching courses', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      if (!user || user.role !== 'Student') return;
      const res = await api.get('/enrollments/my-courses');
      setEnrolledIds(res.data.map(c => c._id));
    } catch (err) {
      console.error('Error fetching enrollments', err);
    }
  };

  const handleEnroll = async (courseId) => {
    if (!user) { alert('Please login to enroll'); return; }
    try {
      await api.post('/enrollments/enroll', { courseId });
      alert('Successfully enrolled!');
      fetchEnrollments();
    } catch (err) {
      alert(err.response?.data?.message || 'Enrollment failed');
    }
  };

  if (loading) return <div className="loading">Loading courses...</div>;

  return (
    <div className="dashboard-container fade-in">
      <div className="section-toolbar">
        <h2 className="section-title">
          All Courses <span style={{ color: '#6b7280', fontWeight: 500, fontSize: '0.9rem' }}>({filtered.length})</span>
        </h2>
        <div className="search-input-wrap">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="course-grid">
        {filtered.map(course => (
          <CourseCard
            key={course._id}
            course={course}
            onEnroll={handleEnroll}
            isEnrolled={enrolledIds.includes(course._id)}
            showEnroll={user?.role !== 'Teacher'}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <h3>No courses found</h3>
          <p>{search ? `No results for "${search}"` : 'No courses available at the moment.'}</p>
        </div>
      )}
    </div>
  );
};

export default CourseList;

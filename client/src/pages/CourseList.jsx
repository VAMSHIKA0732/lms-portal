import { useState, useEffect } from 'react';
import api from '../utils/api';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../context/AuthContext';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [enrolledIds, setEnrolledIds] = useState([]);

  useEffect(() => {
    fetchCourses();
    if (user && user.role === 'Student') {
      fetchEnrollments();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data);
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
    if (!user) {
      alert('Please login to enroll');
      return;
    }
    
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
    <div className="course-grid">
      {courses.map(course => (
        <CourseCard 
          key={course._id} 
          course={course} 
          onEnroll={handleEnroll}
          isEnrolled={enrolledIds.includes(course._id)}
          showEnroll={user?.role !== 'Teacher'}
        />
      ))}
      {courses.length === 0 && <p>No courses available at the moment.</p>}
    </div>
  );
};

export default CourseList;

import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Users, BookOpen, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CourseCard from '../components/CourseCard';

const TeacherDashboard = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [totalStudentsCount, setTotalStudentsCount] = useState(0);
  const [myCourses, setMyCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', duration: '' });
  const { user } = useAuth();

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const res = await api.get('/courses');
      const filtered = res.data.filter(c => c.teacher._id === user.id);
      setMyCourses(filtered);
      
      let studentCount = 0;
      for (const course of filtered) {
        const studentRes = await api.get(`/enrollments/course/${course._id}/students`);
        course.studentCount = studentRes.data.length;
        studentCount += studentRes.data.length;
      }
      setTotalStudentsCount(studentCount);
      setMyCourses([...filtered]);
    } catch (err) {
      console.error('Error fetching my courses', err);
    }
  };

  const viewStudents = async (course) => {
    setSelectedCourse(course);
    try {
      const res = await api.get(`/enrollments/course/${course._id}/students`);
      setEnrolledStudents(res.data);
    } catch (err) {
      alert('Failed to fetch students');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/courses', formData);
      setShowForm(false);
      setFormData({ title: '', description: '', duration: '' });
      fetchMyCourses();
    } catch (err) {
      alert('Failed to create course');
    }
  };

  return (
    <div className="dashboard-container fade-in">
      <div className="dashboard-header">
        <h1>Teacher Dashboard</h1>
        <button className="btn-primary flex-center" onClick={() => setShowForm(!showForm)}>
          <Plus size={20} /> Create Course
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create New Course</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Course Title</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  placeholder="e.g. Mastery in React"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  placeholder="What will students learn?"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Duration</label>
                <input 
                  type="text" 
                  value={formData.duration} 
                  onChange={(e) => setFormData({...formData, duration: e.target.value})} 
                  placeholder="e.g. 8 Weeks"
                  required 
                />
              </div>
              <div className="modal-btns">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Course</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedCourse && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Enrolled Students</h2>
              <p>{selectedCourse.title}</p>
            </div>
            <div className="student-list">
              {enrolledStudents.length > 0 ? (
                enrolledStudents.map(student => (
                  <div key={student._id} className="student-item">
                    <div className="student-avatar">{student.name[0]}</div>
                    <div className="student-info">
                      <p className="student-name">{student.name}</p>
                      <p className="student-email">{student.email}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p>No students enrolled yet.</p>
              )}
            </div>
            <div className="modal-btns">
              <button className="btn-secondary" onClick={() => setSelectedCourse(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <BookOpen className="stat-icon" />
          <div className="stat-info">
            <h3>{myCourses.length}</h3>
            <p>Active Courses</p>
          </div>
        </div>
        <div className="stat-card">
          <Users className="stat-icon" />
          <div className="stat-info">
            <h3>{totalStudentsCount}</h3>
            <p>Total Enrollments</p>
          </div>
        </div>
      </div>

      <h2 className="section-title">My Courses</h2>
      <div className="course-grid">
        {myCourses.map(course => (
          <div key={course._id} className="teacher-course-card">
            <CourseCard key={course._id} course={course} showEnroll={false} />
            <div className="teacher-card-actions">
              <button className="btn-text" onClick={() => viewStudents(course)}>
                <Users size={16} /> {course.studentCount || 0} Students
              </button>
              <Link to={`/course/${course._id}`} className="btn-primary flex-center">
                Manage Course <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherDashboard;

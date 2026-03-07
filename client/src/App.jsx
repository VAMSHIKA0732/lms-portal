import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';

import { Bell, User as UserIcon } from 'lucide-react';
import StudentDashboard from './pages/StudentDashboard';
import CourseList from './pages/CourseList';
import CourseDetails from './pages/CourseDetails';

const Dashboard = () => {
  const { user } = useAuth();
  return user?.role === 'Teacher' ? <TeacherDashboard /> : <StudentDashboard />;
};

const Home = () => (
  <div className="page-container hero-section">
    <h1>Learn Without Limits</h1>
    <p>Empowering students and teachers with a modern LMS platform.</p>
    <div className="hero-btns">
      <Link to="/login" className="btn-primary">Get Started</Link>
      <Link to="/courses" className="btn-secondary">View Courses</Link>
    </div>
  </div>
);

function AppContent() {
  const { user } = useAuth();
  return (
    <div className="app-main">
      <nav className="main-nav">
        <div className="nav-logo">LMS Portal</div>
        <div className="nav-actions">
          <div className="nav-links">
            <Link to="/">Home</Link>
            {user ? (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <div className="notification-bell">
                  <Bell size={20} />
                  <div className="notif-dot"></div>
                </div>
                <button className="nav-profile-btn">{user.name[0]}</button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/courses" element={<CourseList />} />
        <Route path="/course/:id" element={user ? <CourseDetails /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;

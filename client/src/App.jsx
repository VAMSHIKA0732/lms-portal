import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import { Bell, BookOpen, LayoutDashboard, Users, MessageSquare, Calendar, Star, LogOut, Search, Trophy, Home as HomeIcon } from 'lucide-react';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import CourseList from './pages/CourseList';
import CourseDetails from './pages/CourseDetails';
import './App.css';

const Dashboard = () => {
  const { user } = useAuth();
  return user?.role === 'Teacher' ? <TeacherDashboard /> : <StudentDashboard />;
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const active = (path) => location.pathname === path ? 'sidebar-link active' : 'sidebar-link';

  return (
    <aside className="sidebar">
      <span className="sidebar-section-label">Main</span>
      <Link to="/" className={active('/')}><HomeIcon size={17} /> Home</Link>
      {user && <Link to="/dashboard" className={active('/dashboard')}><LayoutDashboard size={17} /> Dashboard</Link>}
      <Link to="/courses" className={active('/courses')}><BookOpen size={17} /> Course Catalog</Link>

      {user && (
        <>
          <span className="sidebar-section-label">Learning</span>
          <Link to="/dashboard" className="sidebar-link"><Star size={17} /> Progress</Link>
          <Link to="/dashboard" className="sidebar-link">
            <MessageSquare size={17} /> Discussions
            <span className="sidebar-badge">3</span>
          </Link>
          <Link to="/dashboard" className="sidebar-link"><Calendar size={17} /> Calendar</Link>

          <span className="sidebar-section-label">Community</span>
          <Link to="/dashboard" className="sidebar-link"><Users size={17} /> Groups</Link>
          <Link to="/dashboard" className="sidebar-link"><Trophy size={17} /> Leaderboard</Link>
        </>
      )}

      <div className="sidebar-footer">
        {user ? (
          <button className="sidebar-link logout-btn" onClick={logout} style={{width:'100%', color:'#f87171', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)'}}>
            <LogOut size={17} /> Sign Out
          </button>
        ) : (
          <>
            <Link to="/login" className="sidebar-link"><LogOut size={17} /> Sign In</Link>
          </>
        )}
      </div>
    </aside>
  );
};

const Home = () => (
  <div className="page-container hero-section">
    <div className="hero-chip"><span></span>✦ Next-Gen Learning Platform</div>
    <h1>Learn Without<br /><span>Limits</span></h1>
    <p>Empower your education with a modern LMS. Connect students and teachers in a beautifully designed learning space.</p>
    <div className="hero-btns">
      <Link to="/login" className="btn-primary">Get Started →</Link>
      <Link to="/courses" className="btn-secondary">Browse Courses</Link>
    </div>
    <div className="hero-stats">
      <div className="hero-stat"><strong>500+</strong><span>Courses</span></div>
      <div className="hero-stat"><strong>10k+</strong><span>Students</span></div>
      <div className="hero-stat"><strong>200+</strong><span>Teachers</span></div>
    </div>
  </div>
);

function AppContent() {
  const { user, logout } = useAuth();

  return (
    <div className="app-main">
      {/* Top Nav */}
      <nav className="main-nav">
        <div className="nav-logo">
          <div className="nav-logo-icon">📚</div>
          EduPortal
        </div>

        <div className="nav-search">
          <Search size={15} className="nav-search-icon" />
          <input type="text" placeholder="Search courses, topics..." />
        </div>

        <div className="nav-actions">
          {user && (
            <div className="nav-points-badge">
              <Trophy size={13} /> 850 pts
            </div>
          )}
          <div className="nav-links">
            {user ? (
              <>
                <Link to="/courses">Courses</Link>
                <div className="nav-divider" />
                <button className="notification-bell" style={{background:'none',border:'none',cursor:'pointer',display:'flex'}}>
                  <Bell size={19} />
                  <div className="notif-dot" />
                </button>
                <button className="nav-profile-btn" title={user.name}>{user.name[0].toUpperCase()}</button>
              </>
            ) : (
              <>
                <Link to="/login">Sign In</Link>
                <Link to="/register" className="btn-primary" style={{padding:'0.4rem 1rem',fontSize:'0.82rem'}}>Register</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Body */}
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
            <Route path="/dashboard" element={user ? <><div className="content-header"><LayoutDashboard size={16}/><span>Dashboard</span></div><div className="content-inner"><Dashboard /></div></> : <Navigate to="/login" />} />
            <Route path="/courses" element={<><div className="content-header"><BookOpen size={16}/><span>Course Catalog</span></div><div className="content-inner"><CourseList /></div></>} />
            <Route path="/course/:id" element={user ? <CourseDetails /> : <Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
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

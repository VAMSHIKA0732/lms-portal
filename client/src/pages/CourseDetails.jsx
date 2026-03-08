import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, CheckCircle, Clock as ClockIcon, FileText, Plus, Send, ChevronRight, User } from 'lucide-react';

const CourseDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [newAssign, setNewAssign] = useState({ title: '', description: '', dueDate: '' });
  const [submitting, setSubmitting] = useState(null); // Assignment ID being submitted
  const [submissionContent, setSubmissionContent] = useState('');
  const [mySubmissions, setMySubmissions] = useState({}); // { assignId: submission }
  const [discussions, setDiscussions] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [materials, setMaterials] = useState([]);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ title: '', url: '', type: 'Document' });

  useEffect(() => {
    fetchDetails();
    fetchDiscussions();
    fetchMaterials();
  }, [id]);

  const fetchMaterials = async () => {
    try {
      const res = await api.get(`/materials/${id}`);
      setMaterials(res.data);
    } catch (err) {
      console.error('Error fetching materials', err);
    }
  };

  const handleCreateMaterial = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/materials/${id}`, newMaterial);
      setShowMaterialForm(false);
      setNewMaterial({ title: '', url: '', type: 'Document' });
      fetchMaterials();
    } catch (err) {
      alert('Failed to upload material');
    }
  };

  const fetchDiscussions = async () => {
    try {
      const res = await api.get(`/discussions/${id}`);
      setDiscussions(res.data);
    } catch (err) {
      console.error('Error fetching discussions', err);
    }
  };

  const handlePostMessage = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/discussions/${id}`, { content: newMsg });
      setNewMsg('');
      fetchDiscussions();
    } catch (err) {
      alert('Failed to post message');
    }
  };

  const fetchDetails = async () => {
    try {
      const courseRes = await api.get(`/courses/${id}`);
      setCourse(courseRes.data);

      const assignRes = await api.get(`/assignments/course/${id}`);
      setAssignments(assignRes.data);

      if (user?.role === 'Teacher') {
        const subRes = await api.get(`/assignments/course/${id}/submissions`);
        setSubmissions(subRes.data);
      } else if (user?.role === 'Student') {
        const subPromises = assignRes.data.map(a => 
          api.get(`/assignments/${a._id}/my-submission`).then(res => ({ id: a._id, data: res.data }))
        );
        const subResults = await Promise.all(subPromises);
        const subMap = {};
        subResults.forEach(r => { if(r.data) subMap[r.id] = r.data; });
        setMySubmissions(subMap);
      }
    } catch (err) {
      console.error('Error fetching details', err);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/assignments', { ...newAssign, courseId: id });
      setShowAssignForm(false);
      setNewAssign({ title: '', description: '', dueDate: '' });
      fetchDetails();
    } catch (err) {
      alert('Failed to create assignment');
    }
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/assignments/${submitting}/submit`, { content: submissionContent });
      setSubmitting(null);
      setSubmissionContent('');
      fetchDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed');
    }
  };

  const handleGrade = async (subId, grade, feedback) => {
    try {
      await api.post(`/assignments/submission/${subId}/grade`, { grade, feedback });
      fetchDetails();
    } catch (err) {
      alert('Grading failed');
    }
  };

  if (!course) return <div className="loading">Loading course details...</div>;

  return (
    <div className="course-details-page fade-in">
      <div className="course-banner">
        <div className="banner-content">
          <span className="badge-primary">{course.duration}</span>
          <h1>{course.title}</h1>
          <p>{course.description}</p>
          <div className="banner-meta">
            <div className="meta-item"><User size={18} /> <span>{course.teacher.name}</span></div>
            <div className="meta-item"><Calendar size={18} /> <span>{new Date(course.createdAt).toLocaleDateString()}</span></div>
          </div>
        </div>
      </div>

      <div className="details-grid">
        <div className="main-col">
          <div className="materials-section">
            <div className="section-header">
              <h3>Resources</h3>
            </div>
            <div className="material-grid">
              {materials.map(mat => (
                <a key={mat._id} href={mat.url} target="_blank" rel="noreferrer" className="material-card">
                  <FileText size={20} />
                  <div>
                    <p className="mat-title">{mat.title}</p>
                    <p className="mat-type">{mat.type}</p>
                  </div>
                </a>
              ))}
              {materials.length === 0 && <p className="empty-msg">No resources uploaded yet.</p>}
            </div>
          </div>

          <div className="section-header">
            <h2>Assignments</h2>
            {user?.role === 'Teacher' && (
              <button className="btn-primary flex-center" onClick={() => setShowAssignForm(true)}>
                <Plus size={18} /> New Assignment
              </button>
            )}
          </div>

          <div className="assignment-list">
            {assignments.length > 0 ? assignments.map(assign => (
              <div key={assign._id} className="assignment-card">
                <div className="assign-header">
                  <h3>{assign.title}</h3>
                  <div className={`due-badge ${new Date(assign.dueDate) < new Date() ? 'overdue' : ''}`}>
                    <ClockIcon size={14} /> <span>Due: {new Date(assign.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <p>{assign.description}</p>
                
                {user?.role === 'Student' && (
                  <div className="assign-footer">
                    {mySubmissions[assign._id] ? (
                      <div className="submission-status success">
                        <CheckCircle size={16} /> 
                        <span>Submitted {new Date(mySubmissions[assign._id].submittedAt).toLocaleDateString()}</span>
                        {mySubmissions[assign._id].grade !== undefined && (
                          <span className="grade-badge">Grade: {mySubmissions[assign._id].grade}/100</span>
                        )}
                      </div>
                    ) : (
                      <button className="btn-outline-primary" onClick={() => setSubmitting(assign._id)}>
                        Submit Assignment
                      </button>
                    )}
                  </div>
                )}
              </div>
            )) : <p className="empty-msg">No assignments posted yet.</p>}
          </div>

          <div className="section-header">
            <h2>Discussion Forum</h2>
          </div>
          <div className="discussion-box">
            <div className="msg-list">
              {discussions.map(msg => (
                <div key={msg._id} className={`msg-item ${msg.user._id === user.id ? 'own-msg' : ''}`}>
                  <div className="msg-header">
                    <span className="msg-user">{msg.user.name}</span>
                    <span className="msg-role">{msg.user.role}</span>
                  </div>
                  <div className="msg-body">{msg.content}</div>
                  <div className="msg-footer">{new Date(msg.createdAt).toLocaleString()}</div>
                </div>
              ))}
              {discussions.length === 0 && <p className="empty-msg">No messages yet. Start the conversation!</p>}
            </div>
            <form onSubmit={handlePostMessage} className="post-form">
              <input 
                type="text" 
                value={newMsg} 
                onChange={e => setNewMsg(e.target.value)} 
                placeholder="Type your message..." 
                required 
              />
              <button type="submit" className="btn-primary">Send</button>
            </form>
          </div>
        </div>

        <div className="side-col">
          {user?.role === 'Teacher' && (
            <>
              <div className="materials-panel">
                <div className="panel-header">
                  <h3>Course Materials</h3>
                  <button className="btn-icon" onClick={() => setShowMaterialForm(true)}><Plus size={18} /></button>
                </div>
                <div className="sub-list">
                  {materials.map(mat => (
                    <div key={mat._id} className="sub-item">
                      <div className="sub-user">
                        <a href={mat.url} target="_blank" rel="noreferrer"><strong>{mat.title}</strong></a>
                        <span>{mat.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="submissions-panel">
                <h3>Submissions</h3>
                <div className="sub-list">
                  {submissions.length > 0 ? submissions.map(sub => (
                    <div key={sub._id} className="sub-item">
                      <div className="sub-user">
                        <strong>{sub.student.name}</strong>
                        <span>{sub.assignment.title}</span>
                      </div>
                      <div className="sub-actions">
                        {sub.grade !== undefined ? (
                          <span className="graded-badge">{sub.grade}%</span>
                        ) : (
                          <button className="btn-text" onClick={() => {
                            const grade = prompt('Enter Grade (0-100):');
                            const feedback = prompt('Enter Feedback:');
                            if (grade) handleGrade(sub._id, Number(grade), feedback);
                          }}>Grade</button>
                        )}
                      </div>
                    </div>
                  )) : <p>No submissions yet.</p>}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Forms Modals */}
      {showAssignForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>New Assignment</h2>
            <form onSubmit={handleCreateAssignment}>
              <div className="form-group">
                <label>Title</label>
                <input type="text" value={newAssign.title} onChange={e => setNewAssign({...newAssign, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Instructions</label>
                <textarea value={newAssign.description} onChange={e => setNewAssign({...newAssign, description: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" value={newAssign.dueDate} onChange={e => setNewAssign({...newAssign, dueDate: e.target.value})} required />
              </div>
              <div className="modal-btns">
                <button type="button" className="btn-secondary" onClick={() => setShowAssignForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Post</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMaterialForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add Course Material</h2>
            <form onSubmit={handleCreateMaterial}>
              <div className="form-group">
                <label>Title</label>
                <input type="text" value={newMaterial.title} onChange={e => setNewMaterial({...newMaterial, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>URL (Link or File Path)</label>
                <input type="text" value={newMaterial.url} onChange={e => setNewMaterial({...newMaterial, url: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select value={newMaterial.type} onChange={e => setNewMaterial({...newMaterial, type: e.target.value})}>
                  <option value="Document">Document</option>
                  <option value="Video">Video</option>
                  <option value="Link">Link</option>
                  <option value="Quiz">Quiz</option>
                </select>
              </div>
              <div className="modal-btns">
                <button type="button" className="btn-secondary" onClick={() => setShowMaterialForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {submitting && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Submit Assignment</h2>
            <form onSubmit={handleSubmitAssignment}>
              <div className="form-group">
                <label>Your Workspace (Link or Text)</label>
                <textarea 
                  value={submissionContent} 
                  onChange={e => setSubmissionContent(e.target.value)} 
                  placeholder="Paste your submission here..."
                  required 
                />
              </div>
              <div className="modal-btns">
                <button type="button" className="btn-secondary" onClick={() => setSubmitting(null)}>Cancel</button>
                <button type="submit" className="btn-primary flex-center">
                  <Send size={16} /> Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CourseDetails;

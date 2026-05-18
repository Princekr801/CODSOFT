import React, { useState, useEffect } from 'react';
import { toast } from '../utils/toast';
import { useAuth } from '../context/AuthContext';

export default function CandidateDashboard({ onNavigate }) {
  const { user, token, updateProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState('apps'); // 'apps', 'profile', 'saved'
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  
  const [loadingApps, setLoadingApps] = useState(true);
  const [loadingSaved, setLoadingSaved] = useState(false);

  // Profile Form States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Sync Form States with user Context on mount/change
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setTitle(user.title || '');
      setBio(user.bio || '');
      setSkills(user.skills ? user.skills.join(', ') : '');
    }
  }, [user]);

  // Fetch candidate applications & notifications
  const fetchDashData = async () => {
    setLoadingApps(true);
    try {
      // Fetch Applications
      const appRes = await fetch('/api/applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (appRes.ok) {
        const appData = await appRes.json();
        setApplications(appData);
      }

      // Fetch Notifications
      const notifyRes = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (notifyRes.ok) {
        const notifyData = await notifyRes.json();
        setNotifications(notifyData);
      }
    } catch (err) {
      console.error('Error fetching candidate dashboard data:', err);
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    if (token) fetchDashData();
  }, [token]);

  // Fetch saved jobs details when the 'saved' tab is clicked
  useEffect(() => {
    const fetchSavedDetails = async () => {
      if (!user || !user.savedJobs || user.savedJobs.length === 0) {
        setSavedJobs([]);
        return;
      }
      
      setLoadingSaved(true);
      try {
        const res = await fetch('/api/jobs');
        if (res.ok) {
          const allJobs = await res.json();
          // Filter matching saved job IDs
          const matched = allJobs.filter(j => user.savedJobs.includes(j.id || j._id));
          setSavedJobs(matched);
        }
      } catch (err) {
        console.error('Error loading saved jobs details: ', err);
      } finally {
        setLoadingSaved(false);
      }
    };

    if (activeTab === 'saved') {
      fetchSavedDetails();
    }
  }, [activeTab, user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    
    const result = await updateProfile({
      firstName,
      lastName,
      title,
      bio,
      skills
    });
    
    setSavingProfile(false);
    if (result.success) {
      toast('Profile updated successfully! 💾', "info");
    } else {
      alert(result.error || 'Failed to update profile.');
    }
  };

  // Compute profile completeness strength percentage
  const calculateCompleteness = () => {
    if (!user) return 0;
    let strength = 20; // base register strength
    if (user.firstName && user.lastName) strength += 20;
    if (user.title) strength += 20;
    if (user.bio) strength += 20;
    if (user.skills && user.skills.length > 0) strength += 20;
    return strength;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Review': return 'sp-blue';
      case 'Interview': return 'sp-amber';
      case 'Offer': return 'sp-green';
      case 'Rejected': return 'sp-red';
      default: return 'sp-blue';
    }
  };

  return (
    <div className="page active" id="page-candidate-dash">
      <div className="dashboard-layout">
        <div className="dash-header">
          <h1>My Dashboard</h1>
          <p>Track your applications and manage your profile</p>
        </div>

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'apps' ? 'active' : ''}`}
            onClick={() => setActiveTab('apps')}
          >
            Applications
          </button>
          <button 
            className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            My Profile
          </button>
          <button 
            className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            Saved Jobs
          </button>
        </div>

        {activeTab === 'apps' && (
          <div id="cand-apps">
            {/* Notify Banners center */}
            {notifications.slice(0, 2).map((note, index) => (
              <div className="notify-banner" key={note.id || note._id || index}>
                <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div className="notify-dot"></div>
                  <div>
                    <strong>Update on Application!</strong>{' '}
                    <span style={{ color: 'var(--text2)', fontSize: '0.88rem' }}>{note.text}</span>
                  </div>
                </div>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => toast('Confirmation simulated! 📅', "info")}
                >
                  Confirm Receipt
                </button>
              </div>
            ))}

            <div className="dash-grid">
              <div className="metric-card">
                <div className="metric-n" style={{ color: 'var(--accent)' }}>
                  {applications.length}
                </div>
                <div className="metric-l">Applications Sent</div>
              </div>
              <div className="metric-card">
                <div className="metric-n" style={{ color: 'var(--amber)' }}>
                  {applications.filter(a => a.status === 'Interview').length}
                </div>
                <div className="metric-l">Interviews Scheduled</div>
              </div>
              <div className="metric-card">
                <div className="metric-n" style={{ color: 'var(--teal)' }}>
                  {applications.filter(a => a.status === 'Offer').length}
                </div>
                <div className="metric-l">Offers Received</div>
              </div>
              <div className="metric-card">
                <div className="metric-n" style={{ color: 'var(--green)' }}>
                  {calculateCompleteness()}%
                </div>
                <div className="metric-l">Profile Strength</div>
              </div>
            </div>

            <div className="dash-card" style={{ marginBottom: '1.5rem' }}>
              <h3>Application Tracker</h3>
              {loadingApps ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text2)' }}>
                  Loading applications log...
                </div>
              ) : applications.length === 0 ? (
                <div className="empty-state" style={{ border: 'none', padding: '2rem' }}>
                  <h3>No Active Submissions</h3>
                  <p>You haven't submitted any job applications yet. Go find your dream role!</p>
                  <button className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }} onClick={() => onNavigate('listings')}>
                    Find Jobs
                  </button>
                </div>
              ) : (
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Role</th>
                      <th>Applied Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map(app => (
                      <tr key={app.id || app._id} style={{ cursor: 'pointer' }} onClick={() => onNavigate('job-detail', app.jobId)}>
                        <td>{app.company}</td>
                        <td>{app.jobTitle}</td>
                        <td>{app.appliedDate}</td>
                        <td>
                          <span className={`status-pill ${getStatusClass(app.status)}`}>
                            {app.status === 'Offer' ? 'Offer!' : app.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div id="cand-profile">
            <form onSubmit={handleProfileSave}>
              <div className="form-section">
                <h3>Personal Info</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    background: 'var(--accent-glow)',
                    border: '2px solid var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    color: 'var(--accent)'
                  }}>
                    {firstName ? firstName.substring(0, 1).toUpperCase() : 'J'}
                    {lastName ? lastName.substring(0, 1).toUpperCase() : 'S'}
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-ghost btn-sm"
                    onClick={() => toast('Photo upload simulated!', "info")}
                  >
                    Change Photo
                  </button>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input 
                      type="text" 
                      required 
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input 
                      type="text" 
                      required 
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Professional Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Senior Product Designer"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Bio</label>
                  <textarea 
                    placeholder="Tell recruiters about yourself..."
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                  ></textarea>
                </div>
              </div>

              <div className="form-section">
                <h3>Skills & Qualifications</h3>
                <div className="form-group">
                  <label>Skills (comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Figma, React, TypeScript, user testing"
                    value={skills}
                    onChange={e => setSkills(e.target.value)}
                  />
                </div>
                
                {user && user.skills && user.skills.length > 0 && (
                  <div className="skill-tags" style={{ marginBottom: '1.5rem' }}>
                    {user.skills.map((s, idx) => (
                      <span className="skill-tag" key={idx}>{s}</span>
                    ))}
                  </div>
                )}

                <div className="form-group">
                  <label>Profile Completeness</label>
                  <div className="progress-bar" style={{ marginTop: '6px' }}>
                    <div className="progress-fill" style={{ width: `${calculateCompleteness()}%` }}></div>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text3)', marginTop: '6px' }}>
                    {calculateCompleteness()}% completed — Add all title and skill tags to reach 100%!
                  </p>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={savingProfile}
              >
                {savingProfile ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'saved' && (
          <div id="cand-saved">
            {loadingSaved ? (
              <div className="loader">Retrieving saved jobs... 📡</div>
            ) : savedJobs.length === 0 ? (
              <div className="empty-state">
                <h3>No Bookmarked Vacancies</h3>
                <p>Bookmarks help you remember interesting opportunities. Browse jobs to save them here!</p>
                <button className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }} onClick={() => onNavigate('listings')}>
                  Browse Opportunities
                </button>
              </div>
            ) : (
              <div className="job-list">
                {savedJobs.map(j => {
                  const jobId = j.id || j._id;
                  return (
                    <div 
                      key={jobId} 
                      className="job-list-item" 
                      onClick={() => onNavigate('job-detail', jobId)}
                    >
                      <div 
                        className="jli-logo" 
                        style={{ background: j.logoColor || '#1e1e40', color: j.logoText || '#a593ff' }}
                      >
                        {j.logo}
                      </div>
                      <div className="jli-info">
                        <h3>{j.title}</h3>
                        <p>{j.company} · {j.location}</p>
                      </div>
                      <div className="jli-tags">
                        <span className="badge badge-type">{j.type}</span>
                        <span className="badge badge-remote">{j.mode}</span>
                      </div>
                      <div className="jli-salary">{j.salary}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function EmployerDashboard({ onNavigate }) {
  const { user, token } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'post', 'applicants'
  const [myJobs, setMyJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  // Job Post Form States
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [jobType, setJobType] = useState('Full-time');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [location, setLocation] = useState('San Francisco, CA');
  const [workMode, setWorkMode] = useState('Remote');
  const [experience, setExperience] = useState('Mid Level (3-5 yrs)');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [perks, setPerks] = useState('');
  const [deadline, setDeadline] = useState('');

  // Fetch employer listings and active applicants
  const fetchEmployerData = async () => {
    setLoading(true);
    try {
      // Get all jobs to filter employer's jobs
      const jobsRes = await fetch('/api/jobs');
      if (jobsRes.ok) {
        const allJobs = await jobsRes.json();
        const filteredJobs = allJobs.filter(j => j.employerId === (user.id || user._id));
        setMyJobs(filteredJobs);
      }

      // Get applications for this employer's jobs
      const appsRes = await fetch('/api/applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApplicants(appsData);
      }
    } catch (err) {
      console.error('Error loading employer dashboard details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user) {
      fetchEmployerData();
    }
  }, [token, user]);

  const handlePostJob = async (e) => {
    e.preventDefault();
    
    if (!jobTitle || !minSalary || !maxSalary || !description || !deadline) {
      alert('Please fill out all mandatory job post fields!');
      return;
    }

    setIsPosting(true);
    
    try {
      const salaryRange = `$${parseInt(minSalary, 10) / 1000}k–$${parseInt(maxSalary, 10) / 1000}k`;
      const mappedExp = experience.includes('Entry') ? 'Entry' : experience.includes('Mid') ? 'Mid' : experience.includes('Senior') ? 'Senior' : 'Lead';

      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: jobTitle,
          location,
          type: jobType,
          mode: workMode,
          salary: salaryRange,
          exp: mappedExp,
          description,
          requirements,
          perks,
          deadline
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert('🎉 Job posted successfully! Added to listings.');
        
        // Reset form
        setJobTitle('');
        setMinSalary('');
        setMaxSalary('');
        setDescription('');
        setRequirements('');
        setPerks('');
        setDeadline('');
        
        // Fetch fresh listings & switch back to overview
        await fetchEmployerData();
        setActiveTab('overview');
      } else {
        alert(data.msg || 'Failed to post job listing.');
      }
    } catch (err) {
      console.error(err);
      alert('Connection error occurred while posting job.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        alert(`Application status advanced to: ${newStatus}! Seeker notified.`);
        fetchEmployerData(); // reload
      } else {
        const errData = await res.json();
        alert(errData.msg || 'Failed to update status.');
      }
    } catch (err) {
      console.error(err);
      alert('Connection error occurred during updating status.');
    }
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
    <div className="page active" id="page-employer-dash">
      <div className="dashboard-layout">
        <div className="dash-header">
          <h1>Employer Dashboard</h1>
          <p>Manage your job postings and track applicant files</p>
        </div>

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab ${activeTab === 'post' ? 'active' : ''}`}
            onClick={() => setActiveTab('post')}
          >
            Post a Job
          </button>
          <button 
            className={`tab ${activeTab === 'applicants' ? 'active' : ''}`}
            onClick={() => setActiveTab('applicants')}
          >
            Applicants
          </button>
        </div>

        {activeTab === 'overview' && (
          <div id="emp-overview">
            <div className="dash-grid">
              <div className="metric-card">
                <div className="metric-n" style={{ color: 'var(--accent)' }}>
                  {myJobs.length}
                </div>
                <div className="metric-l">Active Listings</div>
                <div className="metric-delta delta-up">↑ 2 this week</div>
              </div>
              <div className="metric-card">
                <div className="metric-n" style={{ color: 'var(--teal)' }}>
                  {applicants.length}
                </div>
                <div className="metric-l">Total Applicants</div>
                <div className="metric-delta delta-up">↑ 14% vs last month</div>
              </div>
              <div className="metric-card">
                <div className="metric-n" style={{ color: 'var(--amber)' }}>
                  {applicants.filter(a => a.status === 'Interview').length}
                </div>
                <div className="metric-l">Interviews Scheduled</div>
                <div className="metric-delta delta-up">↑ 4 active</div>
              </div>
              <div className="metric-card">
                <div className="metric-n" style={{ color: 'var(--green)' }}>
                  {applicants.filter(a => a.status === 'Offer').length}
                </div>
                <div className="metric-l">Offers Sent</div>
                <div className="metric-delta delta-up">↑ 2 accepted</div>
              </div>
            </div>

            <div className="dash-two-col">
              <div className="dash-card">
                <h3>Recent Applications</h3>
                {loading ? (
                  <p style={{ color: 'var(--text3)' }}>Loading applicant logs...</p>
                ) : applicants.length === 0 ? (
                  <p style={{ color: 'var(--text3)' }}>No applications submitted yet.</p>
                ) : (
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Candidate</th>
                        <th>Role</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applicants.slice(0, 5).map(app => (
                        <tr key={app.id || app._id}>
                          <td>{app.firstName} {app.lastName}</td>
                          <td>{app.jobTitle}</td>
                          <td>
                            <span className={`status-pill ${getStatusClass(app.status)}`}>
                              {app.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="dash-card">
                <h3>Top Performing Jobs</h3>
                {loading ? (
                  <p style={{ color: 'var(--text3)' }}>Loading active listings statistics...</p>
                ) : myJobs.length === 0 ? (
                  <p style={{ color: 'var(--text3)' }}>No posted jobs yet. Get started by posting a listing!</p>
                ) : (
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Job Title</th>
                        <th>Salary Band</th>
                        <th>Deadline</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myJobs.slice(0, 5).map(job => (
                        <tr key={job.id || job._id} style={{ cursor: 'pointer' }} onClick={() => onNavigate('job-detail', job.id || job._id)}>
                          <td>{job.title}</td>
                          <td>{job.salary}</td>
                          <td>{job.deadline}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'post' && (
          <div id="emp-post">
            <form onSubmit={handlePostJob}>
              <div className="form-section">
                <h3>Job Details</h3>
                <div className="form-group">
                  <label>Job Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Senior Frontend Engineer" 
                    required
                    value={jobTitle}
                    onChange={e => setJobTitle(e.target.value)}
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Department</label>
                    <select value={department} onChange={e => setDepartment(e.target.value)}>
                      <option value="Engineering">Engineering</option>
                      <option value="Design">Design</option>
                      <option value="Product">Product</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Job Type</label>
                    <select value={jobType} onChange={e => setJobType(e.target.value)}>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Min Salary ($ / year)</label>
                    <input 
                      type="number" 
                      placeholder="80000" 
                      required
                      value={minSalary}
                      onChange={e => setMinSalary(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Max Salary ($ / year)</label>
                    <input 
                      type="number" 
                      placeholder="150000" 
                      required
                      value={maxSalary}
                      onChange={e => setMaxSalary(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Location</label>
                    <input 
                      type="text" 
                      placeholder="San Francisco, CA" 
                      required
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Work Mode</label>
                    <select value={workMode} onChange={e => setWorkMode(e.target.value)}>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="On-site">On-site</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Experience Required</label>
                  <select value={experience} onChange={e => setExperience(e.target.value)}>
                    <option value="Entry Level (0-2 yrs)">Entry Level (0-2 yrs)</option>
                    <option value="Mid Level (3-5 yrs)">Mid Level (3-5 yrs)</option>
                    <option value="Senior (5+ yrs)">Senior (5+ yrs)</option>
                    <option value="Lead (8+ yrs)">Lead (8+ yrs)</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Job Description</label>
                  <textarea 
                    placeholder="Describe the role, responsibilities, and ideal candidate..." 
                    required
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  ></textarea>
                </div>
                
                <div className="form-group">
                  <label>Requirements (one requirement per line)</label>
                  <textarea 
                    placeholder="5+ years of React experience&#10;Strong TypeScript skills&#10;Experience with GraphQL"
                    value={requirements}
                    onChange={e => setRequirements(e.target.value)}
                  ></textarea>
                </div>
                
                <div className="form-group">
                  <label>Perks (one perk per line)</label>
                  <textarea 
                    placeholder="Competitive salary&#10;Unlimited PTO&#10;Flexible remote working options"
                    value={perks}
                    onChange={e => setPerks(e.target.value)}
                  ></textarea>
                </div>
                
                <div className="form-group">
                  <label>Application Deadline</label>
                  <input 
                    type="date" 
                    required
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={isPosting}>
                {isPosting ? 'Publishing Job Listing...' : 'Post Job Listing'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'applicants' && (
          <div id="emp-applicants">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Active Candidates Queue</h3>
            {loading ? (
              <div className="loader">Loading applications... 📡</div>
            ) : applicants.length === 0 ? (
              <div className="empty-state">
                <h3>No Applications Yet</h3>
                <p>Applications submitted for your job postings will show up here.</p>
              </div>
            ) : (
              <div className="job-list">
                {applicants.map(app => (
                  <div 
                    key={app.id || app._id} 
                    className="job-list-item" 
                    style={{ alignItems: 'flex-start', flexDirection: 'column', gap: '1rem', cursor: 'default' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', width: '100%' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'var(--accent-glow)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent)',
                        fontWeight: 700,
                        fontSize: '0.9rem'
                      }}>
                        {app.firstName ? app.firstName.substring(0,1).toUpperCase() : 'C'}
                        {app.lastName ? app.lastName.substring(0,1).toUpperCase() : 'S'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text)' }}>
                          {app.firstName} {app.lastName}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>
                          Applied for: <strong style={{ color: 'var(--accent2)' }}>{app.jobTitle}</strong> · {app.appliedDate}
                        </div>
                      </div>
                      <span className={`status-pill ${getStatusClass(app.status)}`}>
                        {app.status}
                      </span>
                    </div>

                    <div style={{ paddingLeft: '52px', width: '100%' }}>
                      <div style={{ fontSize: '0.88rem', color: 'var(--text2)', marginBottom: '8px', lineHeight: 1.6 }}>
                        <strong>Email:</strong> {app.email} | <strong>Phone:</strong> {app.phone} <br />
                        {app.linkedin && <><strong>LinkedIn:</strong> <a href={app.linkedin} target="_blank" rel="noreferrer" style={{color: 'var(--accent)'}}>{app.linkedin}</a> | </>}
                        {app.portfolio && <><strong>Portfolio:</strong> <a href={app.portfolio} target="_blank" rel="noreferrer" style={{color: 'var(--accent)'}}>{app.portfolio}</a></>}
                      </div>

                      {app.coverLetter && (
                        <div style={{
                          background: 'var(--bg3)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          fontSize: '0.82rem',
                          color: 'var(--text2)',
                          marginBottom: '1rem',
                          lineHeight: 1.6
                        }}>
                          <strong>Cover Letter:</strong> <br />
                          {app.coverLetter}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        <span className="skill-tag">Exp: {app.experience}</span>
                        <span className="skill-tag">US Auth: {app.authorized.split(',')[0]}</span>
                        <span 
                          className="skill-tag" 
                          style={{ borderColor: 'var(--teal)', color: 'var(--teal)', cursor: 'pointer' }}
                          onClick={() => alert('Opening simulated resume download file!')}
                        >
                          📄 Download Resume
                        </span>
                      </div>

                      {app.status === 'Review' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => handleStatusChange(app.id || app._id, 'Interview')}
                          >
                            📅 Schedule Interview
                          </button>
                          <button 
                            className="btn btn-outline btn-sm"
                            onClick={() => handleStatusChange(app.id || app._id, 'Offer')}
                          >
                            🤝 Make Offer
                          </button>
                          <button 
                            className="btn btn-ghost btn-sm"
                            style={{ borderColor: 'var(--red)', color: 'var(--red)' }}
                            onClick={() => handleStatusChange(app.id || app._id, 'Rejected')}
                          >
                            ✕ Reject
                          </button>
                        </div>
                      )}

                      {app.status === 'Interview' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => handleStatusChange(app.id || app._id, 'Offer')}
                          >
                            🤝 Make Offer
                          </button>
                          <button 
                            className="btn btn-ghost btn-sm"
                            style={{ borderColor: 'var(--red)', color: 'var(--red)' }}
                            onClick={() => handleStatusChange(app.id || app._id, 'Rejected')}
                          >
                            ✕ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

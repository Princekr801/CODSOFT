import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function JobDetail({ jobId, onNavigate, onOpenAuth }) {
  const { user, toggleSaveJob } = useAuth();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch job details on load
  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        if (res.ok) {
          const data = await res.json();
          setJob(data);
        }
      } catch (err) {
        console.error('Error fetching job details: ', err);
      } finally {
        setLoading(false);
      }
    };
    if (jobId) fetchDetail();
  }, [jobId]);

  const handleApplyClick = () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    
    if (user.role === 'employer') {
      alert('Recruiters cannot apply for jobs. Please log in with a Job Seeker account.');
      return;
    }
    
    onNavigate('apply', jobId);
  };

  const handleSaveClick = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    await toggleSaveJob(jobId);
  };

  const isSaved = () => {
    return user && user.savedJobs && user.savedJobs.includes(jobId);
  };

  if (loading) {
    return (
      <div className="page active">
        <div className="loader">Fetching job specifications... 📡</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="page active">
        <div className="empty-state">
          <h3>Job Vacancy Not Found</h3>
          <p>The job you are looking for may have been filled or deleted.</p>
          <button className="btn btn-primary" onClick={() => onNavigate('listings')} style={{ marginTop: '1rem' }}>
            Back to Job Listings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page active" id="page-job-detail">
      <div className="job-detail-layout">
        <div className="detail-main">
          <button 
            className="btn btn-ghost btn-sm" 
            onClick={() => onNavigate('listings')} 
            style={{ marginBottom: '1.5rem' }}
          >
            ← Back to Listings
          </button>

          <div className="detail-head">
            <div className="dh-top">
              <div 
                className="detail-logo" 
                style={{ background: job.logoColor || '#1e1e40', color: job.logoText || '#a593ff' }}
              >
                {job.logo}
              </div>
              <div>
                <div className="detail-title">{job.title}</div>
                <div className="detail-company">{job.company} · {job.location}</div>
              </div>
            </div>
            <div className="dh-meta">
              <div className="meta-chip">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                {job.type}
              </div>
              <div className="meta-chip">
                <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                {job.mode}
              </div>
              <div className="meta-chip">
                <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                {job.location}
              </div>
              <div className="meta-chip">
                <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
                {job.exp} Exp
              </div>
            </div>
          </div>

          <div className="section-block">
            <h3>About the Role</h3>
            <p>{job.description}</p>
          </div>

          {job.requirements && job.requirements.length > 0 && (
            <div className="section-block">
              <h3>Requirements</h3>
              <ul className="req-list">
                {job.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {job.perks && job.perks.length > 0 && (
            <div className="section-block">
              <h3>Perks & Benefits</h3>
              <div className="perks-grid">
                {job.perks.map((perk, index) => (
                  <div className="perk" key={index}>{perk}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="detail-sidebar">
          <div className="apply-card">
            <div className="salary-big">{job.salary}</div>
            <div className="deadline">Application closes {job.deadline}</div>
            
            <button 
              className="btn btn-primary btn-lg" 
              style={{ width: '100%', marginBottom: '10px' }} 
              onClick={handleApplyClick}
            >
              Apply Now
            </button>
            
            {(!user || user.role === 'candidate') && (
              <button 
                className={`btn ${isSaved() ? 'btn-primary' : 'btn-ghost'}`} 
                style={{ width: '100%' }}
                onClick={handleSaveClick}
              >
                {isSaved() ? '♥ Saved' : '♡ Save Job'}
              </button>
            )}

            <hr className="apply-divider" />
            <div style={{ fontSize: '0.82rem', color: 'var(--text2)', lineHeight: 1.8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Posted</span><span style={{ color: 'var(--text)' }}>{job.posted}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Applicants</span><span style={{ color: 'var(--text)' }}>248</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Views</span><span style={{ color: 'var(--text)' }}>1,842</span>
              </div>
            </div>
          </div>

          <div className="dash-card" style={{ borderRadius: 'var(--r2)' }}>
            <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>About {job.company}</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text2)', lineHeight: 1.7 }}>
              {job.company} is a leading enterprise in tech. They focus on delivering high impact services and creating amazing work environments for their employees.
            </p>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="skill-tag">Product Corp</span>
              <span className="skill-tag">Fast Growing</span>
              <span className="skill-tag">Top-tier Benefits</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

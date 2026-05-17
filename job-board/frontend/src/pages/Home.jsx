import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AutoSuggestInput from '../components/AutoSuggestInput';

const JOB_ROLES = ['Design', 'Engineering', 'Data Science', 'Product', 'Marketing', 'Remote'];
const JOB_LOCATIONS = ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'London, UK', 'Remote'];

export default function Home({ onNavigate, onOpenAuth, onSearchJobs }) {
  const { user, toggleSaveJob } = useAuth();
  
  const [searchVal, setSearchVal] = useState('');
  const [locVal, setLocVal] = useState('');
  
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch featured jobs from database
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch('/api/jobs');
        if (res.ok) {
          const data = await res.json();
          // Display first 6 jobs as featured listings
          setFeaturedJobs(data.slice(0, 6));
        }
      } catch (err) {
        console.error('Failed to load featured jobs: ', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearchSubmit = () => {
    onSearchJobs(searchVal, locVal);
    onNavigate('listings');
  };

  const handleTagClick = (tag) => {
    onSearchJobs(tag, '');
    onNavigate('listings');
  };

  const handleSaveToggle = async (e, jobId) => {
    e.stopPropagation();
    if (!user) {
      onOpenAuth();
      return;
    }
    await toggleSaveJob(jobId);
  };

  const isSaved = (jobId) => {
    return user && user.savedJobs && user.savedJobs.includes(jobId);
  };

  return (
    <div className="page active" id="page-home">
      <section className="hero">
        <div className="hero-orb hero-orb1"></div>
        <div className="hero-orb hero-orb2"></div>
        <div className="hero-content">
          <div className="hero-badge">🟢 12,400+ active jobs right now</div>
          <h1>Find work that<br /><em>moves you forward</em></h1>
          <p>Connect with top companies hiring across tech, design, marketing, and more. Your next opportunity is one search away.</p>
          
          <div className="hero-search">
            <AutoSuggestInput 
              placeholder="Job title, skill, or company..." 
              id="hero-search-input"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearchSubmit()}
              suggestionsList={JOB_ROLES}
              style={{ flex: 1 }}
              inputStyle={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontFamily: "'DM Sans', sans-serif", fontSize: '.95rem', padding: '8px 12px', width: '100%' }}
            />
            <AutoSuggestInput 
              placeholder="Location or Remote" 
              value={locVal}
              onChange={e => setLocVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearchSubmit()}
              suggestionsList={JOB_LOCATIONS}
              style={{ flex: 0.6 }}
              inputStyle={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontFamily: "'DM Sans', sans-serif", fontSize: '.95rem', padding: '8px 12px', borderLeft: '1px solid var(--border2)', width: '100%' }}
            />
            <button className="btn btn-primary" onClick={handleSearchSubmit}>Search Jobs</button>
          </div>
          
          <div className="hero-tags">
            <span className="tag" onClick={() => handleTagClick('Design')}>🎨 Design</span>
            <span className="tag" onClick={() => handleTagClick('Engineering')}>💻 Engineering</span>
            <span className="tag" onClick={() => handleTagClick('Data Science')}>📊 Data Science</span>
            <span className="tag" onClick={() => handleTagClick('Product')}>🚀 Product</span>
            <span className="tag" onClick={() => handleTagClick('Marketing')}>💼 Marketing</span>
            <span className="tag" onClick={() => handleTagClick('Remote')}>🏠 Remote</span>
          </div>
        </div>
      </section>

      <div className="stats-bar">
        <div className="stat"><div className="stat-n">87K+</div><div className="stat-l">Companies Hiring</div></div>
        <div className="stat"><div className="stat-n">1.2M</div><div className="stat-l">Jobs Posted</div></div>
        <div className="stat"><div className="stat-n">340K</div><div className="stat-l">Candidates Placed</div></div>
        <div className="stat"><div className="stat-n">4.9★</div><div className="stat-l">Average Rating</div></div>
      </div>

      <section className="featured-section">
        <div className="section-header">
          <h2 className="section-title">Featured <span>Opportunities</span></h2>
          <button className="btn btn-outline btn-sm" onClick={() => onNavigate('listings')}>
            View All Jobs →
          </button>
        </div>

        {loading ? (
          <div className="loader">Loading featured vacancies... 📡</div>
        ) : featuredJobs.length === 0 ? (
          <div className="empty-state">
            <h3>No Jobs Available</h3>
            <p>Check back later or register to post a job vacancy!</p>
          </div>
        ) : (
          <div className="job-grid" id="home-jobs">
            {featuredJobs.map(j => {
              const jobId = j.id || j._id;
              return (
                <div key={jobId} className="job-card" onClick={() => onNavigate('job-detail', jobId)}>
                  <div className="jc-head">
                    <div 
                      className="company-logo" 
                      style={{ background: j.logoColor || '#1e1e40', color: j.logoText || '#a593ff' }}
                    >
                      {j.logo}
                    </div>
                    {(!user || user.role === 'candidate') && (
                      <button 
                        className={`jc-save ${isSaved(jobId) ? 'saved' : ''}`}
                        onClick={(e) => handleSaveToggle(e, jobId)}
                      >
                        {isSaved(jobId) ? '♥' : '♡'}
                      </button>
                    )}
                  </div>
                  <div className="job-title">{j.title}</div>
                  <div className="company-name">{j.company} · {j.location}</div>
                  <div className="jc-tags">
                    <span className="badge badge-type">{j.type}</span>
                    <span className="badge badge-remote">{j.mode}</span>
                    <span className="badge badge-exp">{j.exp}</span>
                    {j.hot && <span className="badge badge-hot">🔥 Hot</span>}
                  </div>
                  <div className="jc-foot">
                    <div className="salary">{j.salary}</div>
                    <div className="posted">{j.posted}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

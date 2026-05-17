import React, { useState, useEffect } from 'react';

export default function Listings({ initialSearch, initialLocation, onNavigate, clearSearchQueries }) {
  // Search parameters
  const [searchVal, setSearchVal] = useState(initialSearch || '');
  const [sortVal, setSortVal] = useState('Newest First');
  
  // Filter checkboxes
  const [jobTypes, setJobTypes] = useState({
    'Full-time': true,
    'Part-time': false,
    'Contract': false,
    'Freelance': false,
    'Internship': false
  });
  
  const [experience, setExperience] = useState({
    'Entry Level': false,
    'Mid': true, // matches seed exp strings ('Mid', 'Senior')
    'Senior': false,
    'Lead / Manager': false
  });
  
  const [workModes, setWorkModes] = useState({
    'Remote': true,
    'Hybrid': true,
    'On-site': false
  });
  
  const [salaryMin, setSalaryMin] = useState(80); // Slider default
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync with initial queries if they change
  useEffect(() => {
    if (initialSearch !== undefined) setSearchVal(initialSearch);
  }, [initialSearch]);

  // Load and apply filters
  const fetchJobs = async () => {
    setLoading(true);
    try {
      // 1. Build Query Parameters
      const params = new URLSearchParams();
      if (searchVal) params.append('search', searchVal);
      if (initialLocation) params.append('location', initialLocation);
      
      // Types filter
      const activeTypes = Object.keys(jobTypes).filter(k => jobTypes[k]).join(',');
      if (activeTypes) params.append('type', activeTypes);
      
      // Experience filter
      // Let's map UX experience names to standard DB strings:
      // Entry Level -> "Entry", Mid Level -> "Mid", Senior -> "Senior", Lead / Manager -> "Lead"
      const expKeys = [];
      if (experience['Entry Level']) expKeys.push('Entry');
      if (experience['Mid']) expKeys.push('Mid');
      if (experience['Senior']) expKeys.push('Senior');
      if (experience['Lead / Manager']) expKeys.push('Lead');
      if (expKeys.length > 0) params.append('exp', expKeys.join(','));
      
      // Modes filter
      const activeModes = Object.keys(workModes).filter(k => workModes[k]).join(',');
      if (activeModes) params.append('mode', activeModes);
      
      // Salary slider
      params.append('salaryMin', salaryMin);

      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (res.ok) {
        let data = await res.json();
        
        // Sorting logic (sort dynamically on frontend)
        if (sortVal === 'Highest Salary') {
          data.sort((a, b) => {
            const numA = parseInt(a.salary.replace(/[^0-9]/g, ''), 10);
            const numB = parseInt(b.salary.replace(/[^0-9]/g, ''), 10);
            return numB - numA;
          });
        } else if (sortVal === 'Newest First') {
          data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        
        setJobs(data);
      }
    } catch (err) {
      console.error('Error fetching filtered jobs: ', err);
    } finally {
      setLoading(false);
    }
  };

  // Run search on mount and when query variables change
  useEffect(() => {
    fetchJobs();
    
    // Clean up parent page queries so navigating back doesn't lock searches
    return () => {
      if (clearSearchQueries) clearSearchQueries();
    };
  }, [initialSearch, initialLocation, sortVal]);

  const handleTypeChange = (key) => {
    setJobTypes(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExpChange = (key) => {
    setExperience(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleModeChange = (key) => {
    setWorkModes(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  return (
    <div className="page active" id="page-listings">
      <div className="listings-layout">
        <aside className="filters-panel">
          <form onSubmit={handleApplyFilters}>
            <div className="filter-card">
              <div className="filter-title">Job Type</div>
              {Object.keys(jobTypes).map(key => (
                <div className="filter-option" key={key}>
                  <input 
                    type="checkbox" 
                    id={`ft-${key}`} 
                    checked={jobTypes[key]} 
                    onChange={() => handleTypeChange(key)}
                  />
                  <label htmlFor={`ft-${key}`}>{key}</label>
                </div>
              ))}
            </div>

            <div className="filter-card">
              <div className="filter-title">Experience</div>
              {Object.keys(experience).map(key => (
                <div className="filter-option" key={key}>
                  <input 
                    type="checkbox" 
                    id={`ex-${key}`} 
                    checked={experience[key]} 
                    onChange={() => handleExpChange(key)}
                  />
                  <label htmlFor={`ex-${key}`}>{key}</label>
                </div>
              ))}
            </div>

            <div className="filter-card">
              <div className="filter-title">Work Mode</div>
              {Object.keys(workModes).map(key => (
                <div className="filter-option" key={key}>
                  <input 
                    type="checkbox" 
                    id={`wm-${key}`} 
                    checked={workModes[key]} 
                    onChange={() => handleModeChange(key)}
                  />
                  <label htmlFor={`wm-${key}`}>{key}</label>
                </div>
              ))}
            </div>

            <div className="filter-card">
              <div className="filter-title">Salary Range</div>
              <input 
                type="range" 
                min="30" 
                max="300" 
                value={salaryMin} 
                style={{ width: '100%', accentColor: 'var(--accent)' }} 
                onChange={(e) => setSalaryMin(parseInt(e.target.value, 10))}
              />
              <p style={{ fontSize: '0.82rem', color: 'var(--text2)', marginTop: '8px' }}>
                ${salaryMin}k+
              </p>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Apply Filters
            </button>
          </form>
        </aside>

        <div className="listings-main">
          <div className="listings-bar">
            <span className="listings-count">
              <strong>{loading ? '...' : jobs.length}</strong> jobs found
            </span>
            
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Search jobs..."
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchJobs()}
              />
              <button className="search-btn" onClick={fetchJobs}>Search</button>
            </div>
            
            <select 
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                padding: '8px 12px',
                borderRadius: '8px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer'
              }}
              value={sortVal}
              onChange={e => setSortVal(e.target.value)}
            >
              <option value="Newest First">Newest First</option>
              <option value="Highest Salary">Highest Salary</option>
            </select>
          </div>

          {loading ? (
            <div className="loader">Searching job openings... 📡</div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <h3>No Jobs Matched Your Filters</h3>
              <p>Try resetting some checkboxes, adjusting the salary slider, or using a different keyword search.</p>
            </div>
          ) : (
            <div className="job-list" id="listing-jobs">
              {jobs.map(j => {
                const jobId = j.id || j._id;
                return (
                  <div 
                    key={jobId} 
                    className="job-list-item" 
                    onClick={() => onNavigate('job-detail', jobId)}
                  >
                    <div 
                      className="jli-logo" 
                      style={{ background: j.logoColor || '#1a2030', color: j.logoText || '#378add' }}
                    >
                      {j.logo}
                    </div>
                    <div className="jli-info">
                      <h3>{j.title}</h3>
                      <p>{j.company} · {j.location} · {j.posted}</p>
                    </div>
                    <div className="jli-tags">
                      <span className="badge badge-type">{j.type}</span>
                      <span className="badge badge-remote">{j.mode}</span>
                      {j.hot && <span className="badge badge-hot">🔥</span>}
                    </div>
                    <div className="jli-salary">{j.salary}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

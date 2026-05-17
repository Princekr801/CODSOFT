import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activePage, onNavigate, onOpenAuth }) {
  const { user, logout } = useAuth();

  const handleEmployerClick = () => {
    if (user) {
      if (user.role === 'employer') {
        onNavigate('employer-dash');
      } else {
        alert('Your account is registered as a Job Seeker. Please log in with an Employer account to access the recruiter dashboard.');
      }
    } else {
      onOpenAuth();
    }
  };

  const handleCandidateClick = () => {
    if (user) {
      if (user.role === 'candidate') {
        onNavigate('candidate-dash');
      } else {
        onNavigate('employer-dash'); // Redirect employer to their dash if they click Dashboard
      }
    } else {
      onOpenAuth();
    }
  };

  return (
    <nav>
      <div className="nav-logo" onClick={() => onNavigate('home')}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M4 20L14 4L24 20" stroke="#7c6dfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8.5 14H19.5" stroke="#00d9b8" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        Talent<span>Hub</span>
      </div>
      <div className="nav-links">
        <a 
          className={activePage === 'listings' ? 'active' : ''} 
          onClick={() => onNavigate('listings')}
        >
          Find Jobs
        </a>
        <a 
          className={activePage === 'employer-dash' ? 'active' : ''} 
          onClick={handleEmployerClick}
        >
          For Employers
        </a>
        <a 
          className={activePage === 'candidate-dash' ? 'active' : ''} 
          onClick={handleCandidateClick}
        >
          Dashboard
        </a>
      </div>
      <div className="nav-cta">
        {user ? (
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '0.85rem',
              color: 'var(--text2)',
              gap: '8px'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--teal)'
              }}></span>
              Hi, <strong style={{ color: 'var(--text)' }}>{user.firstName}</strong>
            </div>
            <button className="btn btn-ghost" onClick={() => { logout(); onNavigate('home'); }}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-ghost" onClick={onOpenAuth}>Log In</button>
            <button className="btn btn-primary" onClick={onOpenAuth}>Get Started</button>
          </>
        )}
      </div>
    </nav>
  );
}

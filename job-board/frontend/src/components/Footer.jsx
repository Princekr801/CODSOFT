import React from 'react';

export default function Footer() {
  const handleFeatureClick = (e) => {
    e.preventDefault();
    alert('Thank you for your interest! This feature will be available in the next release.');
  };

  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="footer-logo">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <path d="M4 20L14 4L24 20" stroke="#7c6dfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8.5 14H19.5" stroke="#00d9b8" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Talent<span>Hub</span>
          </div>
          <p className="footer-tagline">Connecting top talent with innovative companies worldwide.</p>
        </div>
        
        <div className="footer-links-group">
          <h4>Platform</h4>
          <a href="#" onClick={handleFeatureClick}>Browse Jobs</a>
          <a href="#" onClick={handleFeatureClick}>Companies</a>
          <a href="#" onClick={handleFeatureClick}>Salary Guide</a>
        </div>
        
        <div className="footer-links-group">
          <h4>Resources</h4>
          <a href="#" onClick={handleFeatureClick}>Help Center</a>
          <a href="#" onClick={handleFeatureClick}>Contact Us</a>
          <a href="#" onClick={handleFeatureClick}>Support Us</a>
        </div>
        
        <div className="footer-links-group">
          <h4>Legal</h4>
          <a href="#" onClick={handleFeatureClick}>Privacy Policy</a>
          <a href="#" onClick={handleFeatureClick}>Terms of Service</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} TalentHub. All rights reserved.</p>
      </div>
    </footer>
  );
}

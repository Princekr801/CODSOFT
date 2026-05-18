import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Apply({ jobId, onNavigate }) {
  const { user, token } = useAuth();
  
  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [experience, setExperience] = useState('3-4 years');
  const [authorized, setAuthorized] = useState('Yes, US citizen/permanent resident');
  
  const [resumeName, setResumeName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prefill details from authenticated user context
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Fetch job brief
  useEffect(() => {
    const fetchBrief = async () => {
      setLoadingJob(true);
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        if (res.ok) {
          const data = await res.json();
          setJob(data);
        }
      } catch (err) {
        console.error('Error fetching job details for application:', err);
      } finally {
        setLoadingJob(false);
      }
    };
    if (jobId) fetchBrief();
  }, [jobId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!resumeName) {
      alert('Please attach your resume to complete the application process!');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          jobId,
          firstName,
          lastName,
          email,
          phone,
          linkedin,
          portfolio,
          coverLetter,
          experience,
          authorized
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert('🎉 Application submitted successfully! Good luck!\n\nYou\'ll receive a confirmation email shortly.');
        onNavigate('candidate-dash');
      } else {
        alert(data.msg || 'Failed to submit application.');
      }
    } catch (err) {
      console.error(err);
      alert('A connection error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResumeSimulate = () => {
    // Simulate file picker choice
    const fileNames = ['Resume_Jane_Smith.pdf', 'Jane_Smith_Design_CV.pdf', 'CV_Jane_Smith_2026.pdf'];
    const selected = fileNames[Math.floor(Math.random() * fileNames.length)];
    setResumeName(selected);
  };

  if (loadingJob) {
    return (
      <div className="page active">
        <div className="loader">Preparing application portal... 📡</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="page active">
        <div className="empty-state">
          <h3>Failed to Prepare Application</h3>
          <p>The job you are applying for could not be verified.</p>
          <button className="btn btn-primary" onClick={() => onNavigate('listings')}>
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page active" id="page-apply">
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        <button 
          className="btn btn-ghost btn-sm" 
          onClick={() => onNavigate('job-detail', jobId)} 
          style={{ marginBottom: '1.5rem' }}
        >
          ← Back to Job Details
        </button>
        
        <h1 style={{ fontSize: '1.6rem', marginBottom: '.5rem' }}>
          Apply for {job.title}
        </h1>
        <p style={{ color: 'var(--text2)', marginBottom: '2rem' }}>
          at {job.company} · {job.location}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input 
                  type="text" 
                  placeholder="Jane" 
                  required 
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input 
                  type="text" 
                  placeholder="Doe" 
                  required 
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                placeholder="jane@example.com" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input 
                  type="tel" 
                  placeholder="+1 (555) 000-0000" 
                  required 
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>LinkedIn URL</label>
                <input 
                  type="text" 
                  placeholder="linkedin.com/in/..." 
                  value={linkedin}
                  onChange={e => setLinkedin(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Portfolio / Website</label>
              <input 
                type="text" 
                placeholder="yourportfolio.com" 
                value={portfolio}
                onChange={e => setPortfolio(e.target.value)}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Resume Upload</h3>
            <div 
              className="upload-zone" 
              onClick={handleResumeSimulate}
              style={{ borderColor: resumeName ? 'var(--teal)' : '' }}
            >
              <div className="upload-icon">📄</div>
              {resumeName ? (
                <>
                  <p style={{ fontSize: '0.88rem', margin: '4px 0', color: 'var(--teal)' }}>
                    🟢 <strong>Attached: {resumeName}</strong>
                  </p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>Click to replace file</p>
                </>
              ) : (
                <>
                  <p style={{ fontSize: '0.88rem', marginBottom: '4px' }}>
                    Drop your resume here or <strong>browse</strong>
                  </p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>
                    Supports PDF, DOCX · Max 10MB
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>Cover Letter</h3>
            <div className="form-group">
              <label>Why do you want to work at {job.company}?</label>
              <textarea 
                placeholder="Tell us what excites you about this role..."
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
              ></textarea>
            </div>
          </div>

          <div className="form-section">
            <h3>Screening Questions</h3>
            <div className="form-group">
              <label>Years of experience</label>
              <select value={experience} onChange={e => setExperience(e.target.value)}>
                <option value="1-2 years">1-2 years</option>
                <option value="3-4 years">3-4 years</option>
                <option value="5+ years">5+ years</option>
                <option value="8+ years">8+ years</option>
              </select>
            </div>
            <div className="form-group">
              <label>Are you authorized to work in the US?</label>
              <select value={authorized} onChange={e => setAuthorized(e.target.value)}>
                <option value="Yes, US citizen/permanent resident">Yes, US citizen/permanent resident</option>
                <option value="Yes, with visa sponsorship needed">Yes, with visa sponsorship needed</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg" 
            style={{ width: '100%' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}

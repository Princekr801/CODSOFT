import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from '../utils/toast';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  
  const [tab, setTab] = useState('login'); // 'login' or 'signup'
  const [role, setRole] = useState('candidate'); // 'candidate' or 'employer'
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 'login') {
        const result = await login(email, password);
        if (result.success) {
          onClose();
          resetForm();
          toast(`Welcome back to TalentHub! 👋`, 'success');
        } else {
          setError(result.error);
        }
      } else {
        const result = await register({
          email,
          password,
          firstName,
          lastName,
          role
        });
        if (result.success) {
          onClose();
          resetForm();
          toast(`Welcome to TalentHub! 👋 Account created successfully.`, 'success');
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      setError('An unexpected connection error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setError('');
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay open" onClick={handleOverlayClick}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>Welcome to TalentHub</h2>
        <p>Connect with opportunities that match your ambition</p>
        
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setError(''); }}
          >
            Log In
          </button>
          <button 
            className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => { setTab('signup'); setError(''); }}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(248,113,113,0.15)',
            border: '1px solid var(--red)',
            color: 'var(--red)',
            padding: '10px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {tab === 'signup' && (
            <>
              <div className="form-group">
                <label>I am a...</label>
              </div>
              <div className="role-select">
                <div 
                  className={`role-btn ${role === 'candidate' ? 'selected' : ''}`} 
                  onClick={() => setRole('candidate')}
                >
                  <div className="role-icon">👤</div>
                  <div className="role-label">Job Seeker</div>
                </div>
                <div 
                  className={`role-btn ${role === 'employer' ? 'selected' : ''}`} 
                  onClick={() => setRole('employer')}
                >
                  <div className="role-icon">🏢</div>
                  <div className="role-label">Employer</div>
                </div>
              </div>

              <div className="form-row" style={{ marginBottom: 0 }}>
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
            </>
          )}

          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              placeholder="you@example.com" 
              required 
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required 
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '12px', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : tab === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <div className="divider-text">or continue with</div>
        <button 
          className="btn btn-ghost" 
          style={{ width: '100%', padding: '12px' }}
          onClick={() => toast('OAuth setup simulated!', 'info')}
        >
          🔗 Continue with Google
        </button>
      </div>
    </div>
  );
}

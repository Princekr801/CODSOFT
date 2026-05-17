import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

const API_BASE = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Load user profile on startup if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/user`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          // Token is invalid/expired
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Error loading user profile on startup: ', err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // LOGIN
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || 'Login failed. Please verify credentials.');
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      
      // Load full user details
      const userRes = await fetch(`${API_BASE}/auth/user`, {
        headers: {
          'Authorization': `Bearer ${data.token}`
        }
      });
      const userData = await userRes.json();
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // REGISTER
  const register = async (userData) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || 'Registration failed.');
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      
      // Load profile
      const userRes = await fetch(`${API_BASE}/auth/user`, {
        headers: {
          'Authorization': `Bearer ${data.token}`
        }
      });
      const fullUserData = await userRes.json();
      setUser(fullUserData);

      return { success: true, user: fullUserData };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // UPDATE PROFILE
  const updateProfile = async (profileData) => {
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || 'Profile update failed.');
      }

      setUser(data);
      return { success: true, user: data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // TOGGLE SAVE JOB
  const toggleSaveJob = async (jobId) => {
    if (!user || reqCandidate()) return false;
    
    try {
      const res = await fetch(`${API_BASE}/auth/toggle-save/${jobId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok) {
        setUser(prev => ({
          ...prev,
          savedJobs: data.savedJobs
        }));
        return data.isSaved;
      }
    } catch (err) {
      console.error('Error saving job:', err);
    }
    return false;
  };

  const reqCandidate = () => {
    return user && user.role !== 'candidate';
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, toggleSaveJob }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

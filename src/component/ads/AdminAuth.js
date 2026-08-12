import React, { useState, useEffect, createContext, useContext } from 'react';
import { API_BASE, adLogger } from './config';
import './admin.css';

// Auth context
const AuthContext = createContext();

// Storage keys
const TOKEN_KEY = process.env.REACT_APP_TOKEN_KEY;
const USER_KEY = process.env.REACT_APP_USER_KEY;

// Get stored token
export const getToken = () => localStorage.getItem(TOKEN_KEY);

// Get stored user
export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
};

// Check if token is expired (decode JWT without library)
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

// Check if session is valid
const isSessionValid = () => {
  const token = getToken();
  return token && !isTokenExpired(token);
};

// Auth API helper with token
export const authFetch = async (url, options = {}) => {
  const token = getToken();
  adLogger.log('authFetch URL:', url);
  adLogger.log('authFetch Token exists:', !!token);
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  
  const res = await fetch(url, { ...options, headers });
  adLogger.log('authFetch Response:', res.status, res.statusText);
  
  // If unauthorized, clear token
  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.reload();
  }
  
  return res;
};

// Auth Provider
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(isSessionValid);
  const [user, setUser] = useState(getUser);
  const [loading, setLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      const token = getToken();
      if (!token || isTokenExpired(token)) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        // Optional: Verify token with backend
        const res = await fetch(`${API_BASE}/api/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setUser(data.user || getUser());
          setIsAuthenticated(true);
        } else {
          // Token invalid
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setIsAuthenticated(false);
        }
      } catch {
        // If verify endpoint doesn't exist, just check expiry
        setIsAuthenticated(!isTokenExpired(token));
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (username, password) => {
    try {
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
  
      const data = await res.json();
  
      if (!res.ok) {
        return { success: false, error: data.error || data.message || 'Login failed' };
      }

      // Store token and user
      localStorage.setItem(TOKEN_KEY, data.token);
      if (data.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        setUser(data.user);
      }
      
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      if (err.name === 'AbortError') {
        return { success: false, error: 'Request timed out. Is the server running?' };
      }
      return { success: false, error: 'Connection failed. Is the server running?' };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// Login Page Component
const LoginPage = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(username, password);
    
    if (!result.success) {
      setError(result.error);
      setPassword('');
    }
    setLoading(false);
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <div className="admin-login-header">
          <i className="fa fa-lock"></i>
          <h2>Admin Access</h2>
          <p>Enter your credentials to continue</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="admin-login-input-group">
            <i className="fa fa-user"></i>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              autoFocus
              disabled={loading}
            />
          </div>
          
          <div className="admin-login-input-group">
            <i className="fa fa-key"></i>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              disabled={loading}
            />
          </div>
          
          {error && <div className="admin-login-error"><i className="fa fa-exclamation-circle"></i> {error}</div>}
          
          <button type="submit" className="admin-login-btn" disabled={loading || !username || !password}>
            {loading ? <><i className="fa fa-spinner fa-spin"></i> Signing in...</> : <><i className="fa fa-sign-in"></i> Login</>}
          </button>
        </form>

        <div className="admin-login-footer">
          <a href="/"><i className="fa fa-arrow-left"></i> Back to Home</a>
        </div>
      </div>
    </div>
  );
};

// Protected Route Wrapper
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="admin-loading"><i className="fa fa-spinner fa-spin"></i> Verifying session...</div>;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return children;
};

// Admin Header with logout button
export const AdminHeader = ({ title }) => {
  const { logout, user } = useAuth();

  return (
    <div className="admin-header-bar">
      <h1><i className="fa fa-shield"></i> {title}</h1>
      <div className="admin-header-right">
        {user && <span className="admin-user"><i className="fa fa-user-circle"></i> {user.username || user.name}</span>}
        <button onClick={logout} className="admin-logout-btn">
          <i className="fa fa-sign-out"></i> Logout
        </button>
      </div>
    </div>
  );
};

export default ProtectedRoute;

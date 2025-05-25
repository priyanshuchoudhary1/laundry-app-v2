import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUser, FaUserShield, FaLock } from "react-icons/fa";
import "./../styles/Login.css";

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in both fields');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password,
          isAdmin 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (!data.success || !data.user || !data.token) {
        throw new Error('Invalid response from server');
      }

      // Check if user is trying to login as admin in user mode or vice versa
      if (isAdmin && data.user.role !== 'admin') {
        throw new Error('Invalid admin credentials');
      } else if (!isAdmin && data.user.role === 'admin') {
        throw new Error('Please use admin login for admin accounts');
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token);

      // Update auth context with user data
      const loginResult = login({ ...data.user, token: data.token });
      
      if (loginResult.success) {
        // Navigate based on user role
        if (data.user.role === 'admin') {
          navigate('/admin-dashboard', { replace: true });
        } else {
          navigate('/account', { replace: true });
        }
      } else {
        throw new Error(loginResult.error || 'Failed to update user state');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to log in');
      // Clear any existing token on error
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-type-selector">
        <button 
          className={`login-type-btn ${!isAdmin ? 'active' : ''}`}
          onClick={() => setIsAdmin(false)}
        >
          <FaUser /> User Login
        </button>
        <button 
          className={`login-type-btn ${isAdmin ? 'active' : ''}`}
          onClick={() => setIsAdmin(true)}
        >
          <FaUserShield /> Admin Login
        </button>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <h2>
          {isAdmin ? (
            <><FaUserShield /> Admin Login</>
          ) : (
            <><FaUser /> User Login</>
          )}
        </h2>
        
        {error && <p className="error-message">{error}</p>}
        
        <div className="input-icon">
          <FaUser />
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>
        <div className="input-icon">
          <FaLock />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="login-links">
        <Link to="/forgot-password">Forgot Password?</Link>
        {!isAdmin && (
          <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
        )}
      </div>
    </div>
  );
};

export default LoginPage; 
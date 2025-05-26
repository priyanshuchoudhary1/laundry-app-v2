import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaLock, FaUserShield } from 'react-icons/fa';
import '../styles/pages/Login.css';

function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    adminCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate required fields
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.phone) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Validate phone number
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      setLoading(false);
      return;
    }

    try {
      // Remove confirmPassword before sending to server
      const { confirmPassword, ...userData } = formData;
      
      const result = await register(userData);
      
      if (result.success) {
        // Registration successful, redirect to login
        navigate('/login');
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'An error occurred during registration');
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
          <FaUser /> User Sign Up
        </button>
        <button 
          className={`login-type-btn ${isAdmin ? 'active' : ''}`}
          onClick={() => setIsAdmin(true)}
        >
          <FaUserShield /> Admin Sign Up
        </button>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <h2>
          {isAdmin ? (
            <><FaUserShield /> Admin Sign Up</>
          ) : (
            <><FaUser /> User Sign Up</>
          )}
        </h2>

        {error && <p className="error-message">{error}</p>}

        <div className="input-icon">
          <FaUser />
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-icon">
          <FaUser />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-icon">
          <FaLock />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-icon">
          <FaLock />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-icon">
          <FaUser />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        {isAdmin && (
          <div className="input-icon">
            <FaUserShield />
            <input
              type="password"
              name="adminCode"
              placeholder="Admin Code"
              value={formData.adminCode}
              onChange={handleChange}
              required
            />
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>

      <div className="login-links">
        <p>Already have an account? <Link to="/login">Sign In</Link></p>
      </div>
    </div>
  );
}

export default SignUp;
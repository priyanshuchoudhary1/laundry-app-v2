import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCart } from './CartContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { clearCart } = useCart();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        const parsedUserData = JSON.parse(userData);
        setUser(parsedUserData);
      } else {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
      }
    } catch (err) {
      console.error('Auth check error:', err);
      setError(err.message);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch('http://localhost:4000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      if (!data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      return { success: true };
    } catch (err) {
      console.error('Registration error:', err);
      return { success: false, error: err.message };
    }
  };

  const login = (userData) => {
    try {
      if (!userData) {
        throw new Error('Invalid login data');
      }

      // Store in localStorage
      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.setItem('token', userData.token);
      
      // Update state immediately
      setUser(userData);
      setError(null);
      
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      setUser(null);
      setError(null);
      clearCart();
    } catch (err) {
      console.error('Logout error:', err);
      setError(err.message);
    }
  };

  const updateUser = (updatedData) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      const newUserData = { ...user, ...updatedData };
      localStorage.setItem('userData', JSON.stringify(newUserData));
      setUser(newUserData);
      setError(null);
      
      return { success: true };
    } catch (err) {
      console.error('Update user error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    updateUser,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 
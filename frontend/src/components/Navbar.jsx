import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiUser, FiMenu, FiX, FiClock, FiGrid, FiCreditCard } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={() => setIsOpen(false)}>
          <span className="logo-mark">✦</span>
          <span className="logo-text">
            <span className="logo-word-1">LUXE</span>
            <span className="logo-word-2">LAUNDRY</span>
          </span>
        </Link>

        <div className={`nav-menu ${isOpen ? 'open' : ''}`}>
          <div className="nav-links">
            {user?.role === 'admin' ? (
              <>
                <Link to="/admin-dashboard/dashboard" className="nav-link" onClick={() => setIsOpen(false)}>
                  <FiGrid className="link-icon" />
                  <span>Dashboard</span>
                </Link>
                <Link to="/admin-dashboard/users" className="nav-link" onClick={() => setIsOpen(false)}>
                  <FiUser className="link-icon" />
                  <span>Users</span>
                </Link>
                <Link to="/admin-dashboard/orders" className="nav-link" onClick={() => setIsOpen(false)}>
                  <FiClock className="link-icon" />
                  <span>Orders</span>
                </Link>
                <Link to="/admin-dashboard/payments" className="nav-link" onClick={() => setIsOpen(false)}>
                  <FiCreditCard className="link-icon" />
                  <span>Payments</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>
                  <span>Home</span>
                </Link>
                <Link to="/services" className="nav-link" onClick={() => setIsOpen(false)}>
                  <span>Services</span>
                </Link>
                <Link to="/cart" className="nav-link cart-link" onClick={() => setIsOpen(false)}>
                  <FiShoppingBag className="link-icon" />
                  <span>Cart</span>
                  {cartItems.length > 0 && (
                    <span className="cart-badge">{cartItems.length}</span>
                  )}
                </Link>
              </>
            )}
          </div>

          <div className="nav-actions">
            {user ? (
              <>
                <Link to="/account" className="account-link" onClick={() => setIsOpen(false)}>
                  <FiUser />
                  <span>{user.name || 'My Account'}</span>
                </Link>
                <button onClick={handleLogout} className="logout-btn">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="login-link" onClick={() => setIsOpen(false)}>
                  Sign In
                </Link>
                <Link to="/signup" className="signup-btn" onClick={() => setIsOpen(false)}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>

        <button 
          className="nav-toggle" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
        >
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
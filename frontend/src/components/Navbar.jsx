import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiUser, FiMenu, FiX, FiClock, FiGrid, FiCreditCard, FiMapPin } from 'react-icons/fi';
import { FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLocationCheck, setShowLocationCheck] = useState(false);
  const [pincode, setPincode] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');
  const [locationDetails, setLocationDetails] = useState(null);
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const popularCities = [
    { name: 'Delhi', pincode: '110001' },
    { name: 'Mumbai', pincode: '400001' },
    { name: 'Bangalore', pincode: '560001' },
    { name: 'Hyderabad', pincode: '500001' },
    { name: 'Chennai', pincode: '600001' },
    { name: 'Kolkata', pincode: '700001' },
    { name: 'Patna', pincode: '800001' }
  ];

  const serviceAvailablePincodes = [
    // Delhi
    '110001', '110002', '110003', '110004', '110005', '110006', '110007', '110008', '110009', '110010',
    // Mumbai
    '400001', '400002', '400003', '400004', '400005', '400006', '400007', '400008', '400009', '400010',
    // Bangalore
    '560001', '560002', '560003', '560004', '560005', '560006', '560007', '560008', '560009', '560010',
    // Hyderabad
    '500001', '500002', '500003', '500004', '500005', '500006', '500007', '500008', '500009', '500010',
    // Chennai
    '600001', '600002', '600003', '600004', '600005', '600006', '600007', '600008', '600009', '600010',
    // Kolkata
    '700001', '700002', '700003', '700004', '700005', '700006', '700007', '700008', '700009', '700010',
    // Patna
    '800001', '800002', '800003', '800004', '800005', '800006', '800007', '800008', '800009', '800010'
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const validatePincode = async (code) => {
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${code}`);
      const data = await response.json();
      
      if (data[0].Status === "Success") {
        const locationData = data[0].PostOffice[0];
        return {
          isValid: true,
          location: {
            district: locationData.District,
            state: locationData.State,
            city: locationData.Name
          }
        };
      }
      return { isValid: false };
    } catch (error) {
      console.error('Error validating pincode:', error);
      return { isValid: false };
    }
  };

  const checkAvailability = async (code) => {
    setIsChecking(true);
    setError('');
    setLocationDetails(null);
    setAvailabilityStatus(null);
    
    try {
      const validationResult = await validatePincode(code);
      
      if (!validationResult.isValid) {
        setError('Invalid pincode. Please enter a valid Indian pincode.');
      } else {
        setLocationDetails(validationResult.location);
        
        if (!serviceAvailablePincodes.includes(code)) {
          setAvailabilityStatus({
            available: false,
            message: `Service not available in ${validationResult.location.city}, ${validationResult.location.district} yet.`
          });
        } else {
          setAvailabilityStatus({
            available: true,
            message: `Service available in ${validationResult.location.city}, ${validationResult.location.district}!`
          });
        }
      }
    } catch (error) {
      setError('Error checking pincode. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const handlePincodeSubmit = async (e) => {
    e.preventDefault();
    if (pincode.length === 6) {
      setSelectedCity('');
      await checkAvailability(pincode);
    }
  };

  const handleCitySelect = async (city) => {
    setSelectedCity(city.name);
    setPincode(city.pincode);
    setError('');
    await checkAvailability(city.pincode);
  };

  const handlePincodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(value);
    setError('');
    setAvailabilityStatus(null);
    setLocationDetails(null);
    setSelectedCity('');
  };

  const handleNavigation = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  const handleLocationCheck = () => {
    setIsOpen(false);
    navigate('/');
    setTimeout(() => {
      const locationSection = document.getElementById('location-section');
      if (locationSection) {
        locationSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={() => setIsOpen(false)}>
          <span className="logo-mark">✦</span>
          <span className="logo-text">
            <span className="logo-word-1">Priyanshu</span>
            <span className="logo-word-2">LAUNDRY SERVICES</span>
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
                <button 
                  className="nav-link location-trigger" 
                  onClick={handleLocationCheck}
                >
                  <FiMapPin className="link-icon" />
                  <span>Check Location</span>
                </button>
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
import React, { useState } from "react";
import { FaTshirt, FaShippingFast, FaCheckCircle, FaCalendarAlt, FaStar, FaLeaf, FaUsers, FaClock, FaMapMarkerAlt, FaSearch, FaTimes } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { Snackbar, Alert } from '@mui/material';
import '../styles/pages/Home.css';
import heroImage from "../assets/engin-akyurt-yCYVV8-kQNM-unsplash.jpg";
import ManishPic from "../assets/ManishPic.JPG";
import AshuPic from "../assets/AshuPic.JPG";
import { submitReview, submitFeedback } from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pincode, setPincode] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');
  const [locationDetails, setLocationDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [review, setReview] = useState({
    rating: 0,
    message: ''
  });
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);

  const popularCities = [
    { name: 'Delhi', pincode: '110001' },
    { name: 'Mumbai', pincode: '400001' },
    { name: 'Bangalore', pincode: '560001' },
    { name: 'Hyderabad', pincode: '500001' },
    { name: 'Chennai', pincode: '600001' },
    { name: 'Kolkata', pincode: '700001' },
    { name: 'Patna', pincode: '800001' }
  ];

  // List of pincodes where service is available
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
      setSelectedCity(''); // Clear selected city when manually entering pincode
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
    setSelectedCity(''); // Clear selected city when input changes
  };

  const handleFeedbackChange = (e) => {
    const { id, value } = e.target;
    setFeedback(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleReviewChange = (e) => {
    const { id, value } = e.target;
    setReview(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleStarHover = (starIndex) => {
    setHoveredStar(starIndex);
  };

  const handleStarClick = (starIndex) => {
    setReview(prev => ({
      ...prev,
      rating: starIndex
    }));
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowLoginAlert(true);
      return;
    }
    try {
      await submitFeedback(feedback);
      setFeedbackSubmitted(true);
      setFeedback({
        name: '',
        email: '',
        message: ''
      });
      setTimeout(() => setFeedbackSubmitted(false), 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowLoginAlert(true);
      return;
    }
    try {
      await submitReview(review);
      setReviewSubmitted(true);
      setReview({
        rating: 0,
        message: ''
      });
      setTimeout(() => setReviewSubmitted(false), 3000);
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const openModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'auto'; // Re-enable scrolling
  };

  const processImage = "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";
  const testimonialImage = "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="home-container">
      {/* Hero Banner */}
      <section 
        className="hero-banner"
        style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.4)), url(${heroImage})` }}
      >
        <div className="hero-content">
          <h1 className="hero-title">Premium Laundry Care</h1>
          <p className="hero-subtitle">
            Experience the perfect blend of quality, speed, and convenience for all your laundry needs
          </p>
          <div className="hero-buttons">
            <Link to="/services" className="cta-button primary">
              Book Now <span className="arrow">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Location Check Section */}
      <section id="location-section" className="location-section">
        <div className="location-content">
          <h2 className="section-title">Check Service Availability</h2>
          <p className="section-subtitle">Enter your pincode or select your city to check if we serve your area</p>
          
          <div className="location-check-container">
            <form onSubmit={handlePincodeSubmit} className="pincode-form">
              <div className="input-group">
                <FaMapMarkerAlt className="input-icon" />
                <input
                  type="text"
                  placeholder="Enter your 6-digit pincode"
                  value={pincode}
                  onChange={handlePincodeChange}
                  maxLength="6"
                  pattern="\d{6}"
                  required
                />
                <button type="submit" className="check-button" disabled={isChecking || pincode.length !== 6}>
                  {isChecking ? 'Checking...' : <FaSearch />}
                </button>
              </div>
              {error && <p className="error-message">{error}</p>}
            </form>

            <div className="popular-cities">
              <h3>Popular Cities</h3>
              <div className="cities-grid">
                {popularCities.map((city) => (
                  <button
                    key={city.pincode}
                    className={`city-button ${selectedCity === city.name ? 'active' : ''}`}
                    onClick={() => handleCitySelect(city)}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </div>

            {availabilityStatus && (
              <div className={`availability-status ${availabilityStatus.available ? 'available' : 'unavailable'}`}>
                <FaCheckCircle className="status-icon" />
                <p>{availabilityStatus.message}</p>
                {availabilityStatus.available && (
                  <Link to="/services" className="cta-button secondary">
                    Book Now
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Our Services</h2>
        <p className="section-subtitle">Professional care for your garments</p>
        
        <div className="features-grid">
          <Link to="/quality-cleaning" className="feature-card">
            <div className="card-icon">
              <FaTshirt />
            </div>
            <h3>Quality Cleaning</h3>
            <p>Gentle yet effective cleaning methods for every fabric type with premium detergents.</p>
            <span className="learn-more">Learn more →</span>
          </Link>

          <Link to="/fast-delivery" className="feature-card">
            <div className="card-icon">
              <FaShippingFast />
            </div>
            <h3>Fast Delivery</h3>
            <p>24-hour turnaround with real-time tracking and convenient pickup/delivery.</p>
            <span className="learn-more">Learn more →</span>
          </Link>

          <div className="feature-card">
            <div className="card-icon">
              <FaCheckCircle />
            </div>
            <h3>Trusted Service</h3>
            <p>Rated 4.9/5 by thousands of satisfied customers with premium fabric care.</p>
          </div>

          <Link to="/services" className="feature-card">
            <div className="card-icon">
              <FaCalendarAlt />
            </div>
            <h3>Easy Booking</h3>
            <p>Schedule your laundry service in just a few taps with our mobile app.</p>
            <span className="learn-more">Get started →</span>
          </Link>
        </div>
      </section>

      {/* Process Section */}
      <section className="process-section">
        <div className="process-content">
          <div className="process-text">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Simple steps to clean clothes</p>
            <div className="process-steps">
              <div className="process-step">
                <div className="step-number">1</div>
                <h3>Schedule Pickup</h3>
                <p>Book a convenient time for us to collect your clothes</p>
              </div>
              <div className="process-step">
                <div className="step-number">2</div>
                <h3>Professional Cleaning</h3>
                <p>We carefully clean and care for your garments</p>
              </div>
              <div className="process-step">
                <div className="step-number">3</div>
                <h3>Fast Delivery</h3>
                <p>Get your clean clothes delivered to your doorstep</p>
              </div>
            </div>
          </div>
          <div className="process-image" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1582735689369-4fe89db7114c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)` }}></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <FaUsers className="stat-icon" />
            <h3>10,000+</h3>
            <p>Happy Customers</p>
          </div>
          <div className="stat-card">
            <FaClock className="stat-icon" />
            <h3>24/7</h3>
            <p>Service Available</p>
          </div>
          <div className="stat-card">
            <FaStar className="stat-icon" />
            <h3>4.9/5</h3>
            <p>Customer Rating</p>
          </div>
          <div className="stat-card">
            <FaLeaf className="stat-icon" />
            <h3>Eco-Friendly</h3>
            <p>Sustainable Practices</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2 className="section-title">What Our Customers Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-image" style={{ backgroundImage: `url(${ManishPic})` }}></div>
            <div className="testimonial-content">
              <p>"The best laundry service I've ever used. Fast, reliable, and my clothes always come back looking brand new!"</p>
              <h4>Manish Kumar </h4>
              <div className="rating">★★★★</div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-image" style={{ backgroundImage: `url(${AshuPic})` }}></div>
            <div className="testimonial-content">
              <p>"Their attention to detail is impressive. They handle my delicate fabrics with such care. Highly recommended!"</p>
              <h4>Ashutosh Singh </h4>
              <div className="rating">★★★★</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" style={{ 
        background: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="cta-content">
          <h2>Ready to Experience Premium Laundry Care?</h2>
          <p>Join thousands of satisfied customers who trust us with their garments</p>
          <Link to="/services" className="cta-button primary">
            Get Started Now <span className="arrow">→</span>
          </Link>
        </div>
      </section>

      {/* Feedback Button */}
      <div className="feedback-button-container">
        <button className="feedback-button" onClick={openModal}>
          Feedback & Review
        </button>
      </div>

      {/* Feedback Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <FaTimes />
            </button>
            
            <div className="feedback-container">
              <div className="feedback-content">
                <h2 className="section-title">Share Your Experience</h2>
                <p className="section-subtitle">We value your feedback and reviews</p>
                
                <div className="feedback-grid">
                  {/* Feedback Form */}
                  <div className="feedback-form-container">
                    <h3>Send Us Feedback</h3>
                    <form className="feedback-form" onSubmit={handleFeedbackSubmit}>
                      <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input
                          type="text"
                          id="name"
                          placeholder="Your name"
                          value={feedback.name}
                          onChange={handleFeedbackChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                          type="email"
                          id="email"
                          placeholder="Your email"
                          value={feedback.email}
                          onChange={handleFeedbackChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="message">Your Feedback</label>
                        <textarea
                          id="message"
                          rows="4"
                          placeholder="Share your thoughts with us..."
                          value={feedback.message}
                          onChange={handleFeedbackChange}
                          required
                        ></textarea>
                      </div>
                      <button type="submit" className="submit-feedback-btn">
                        {feedbackSubmitted ? 'Thank you for your feedback!' : 'Submit Feedback'}
                      </button>
                    </form>
                  </div>

                  {/* Review Section */}
                  <div className="review-section">
                    <h3>Write a Review</h3>
                    <div className="review-form">
                      <div className="rating-input">
                        <label>Your Rating</label>
                        <div className="star-rating">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                              key={star}
                              className={`star ${(hoveredStar >= star || review.rating >= star) ? 'active' : ''}`}
                              onMouseEnter={() => handleStarHover(star)}
                              onMouseLeave={() => handleStarHover(0)}
                              onClick={() => handleStarClick(star)}
                            />
                          ))}
                        </div>
                      </div>
                      <form onSubmit={handleReviewSubmit}>
                        <div className="form-group">
                          <label htmlFor="review">Your Review</label>
                          <textarea
                            id="review"
                            rows="4"
                            placeholder="Share your experience with our service..."
                            value={review.message}
                            onChange={handleReviewChange}
                            required
                          ></textarea>
                        </div>
                        <button type="submit" className="submit-review-btn">
                          {reviewSubmitted ? 'Thank you for your review!' : 'Submit Review'}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Alert Snackbar */}
      <Snackbar
        open={showLoginAlert}
        autoHideDuration={3000}
        onClose={() => setShowLoginAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowLoginAlert(false)} 
          severity="info" 
          sx={{ width: '100%' }}
          action={
            <button 
              onClick={handleLoginRedirect}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#1976d2', 
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Login Now
            </button>
          }
        >
          Please login to submit reviews and feedback!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Home;
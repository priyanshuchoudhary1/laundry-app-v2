import React from "react";
import { FaTshirt, FaShippingFast, FaCheckCircle, FaCalendarAlt, FaStar, FaLeaf, FaUsers, FaClock } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./Home.css";
import heroImage from "../assets/engin-akyurt-yCYVV8-kQNM-unsplash.jpg";


const Home = () => {
  
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
            <div className="testimonial-image" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)` }}></div>
            <div className="testimonial-content">
              <p>"The best laundry service I've ever used. Fast, reliable, and my clothes always come back looking brand new!"</p>
              <h4>Priyanshu Choudhary</h4>
              <div className="rating">★★★★★</div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-image" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)` }}></div>
            <div className="testimonial-content">
              <p>"Their attention to detail is impressive. They handle my delicate fabrics with such care. Highly recommended!"</p>
              <h4>Yash </h4>
              <div className="rating">★★★★★</div>
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
    </div>
  );
};

export default Home;
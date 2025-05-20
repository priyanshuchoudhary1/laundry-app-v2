import React from 'react';
import { FaLeaf, FaShippingFast, FaAward, FaUsers } from 'react-icons/fa';
import { MdEco, MdSupportAgent } from 'react-icons/md';
import './AboutUs.css';

const AboutUs = () => {
  // Using placeholder image URLs
  const teamPhoto = "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80";
  const ownerPhoto = "/images/DFAV0347.JPG";
  const heroImage = "https://images.unsplash.com/photo-1604176354204-9268737828e4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="about-us-container">
      {/* Hero Section */}
      <section 
        className="about-hero"
        style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${heroImage})` }}
      >
        <div className="hero-content">
          <h1>Our Story</h1>
          <p>Transforming laundry care with innovation and sustainability</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="mission-content">
          <h2>Our Mission</h2>
          <p>
            At Dhobi Ghat, we're revolutionizing laundry services by combining traditional 
            methods with modern technology to deliver exceptional cleaning while reducing 
            our environmental impact.
          </p>
          <div className="mission-stats">
            <div className="stat-item">
              <FaLeaf className="stat-icon" />
              <h3>Eco-Friendly</h3>
              <p>Using biodegradable detergents</p>
            </div>
            <div className="stat-item">
              <FaShippingFast className="stat-icon" />
              <h3>Fast Delivery</h3>
              <p>24-hour turnaround available</p>
            </div>
            <div className="stat-item">
              <FaUsers className="stat-icon" />
              <h3>10,000+</h3>
              <p>Satisfied customers</p>
            </div>
          </div>
        </div>
        <div className="mission-image">
          <img src={teamPhoto} alt="Our team at work" />
        </div>
      </section>

      {/* Owner Section */}
      <section className="owner-section">
        <div className="owner-image">
          <img src={ownerPhoto} alt="Priyanshu, Founder of Dhobi Ghat" />
        </div>
        <div className="owner-content">
          <h2>Meet Our Founder</h2>
          <h3>Priyanshu</h3>
          <p className="owner-title">CEO & Visionary</p>
          <p>
            With over 8 years of experience in the laundry industry, Priyanshu founded 
            Dhobi Ghat with a vision to modernize traditional laundry services while 
            maintaining the personal touch that customers love.
          </p>
          <div className="owner-quote">
            <blockquote>
              "We don't just clean clothes - we care for them like they're our own."
            </blockquote>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <h2>Our Core Values</h2>
        <div className="values-grid">
          <div className="value-card">
            <FaAward className="value-icon" />
            <h3>Quality</h3>
            <p>We use premium detergents and follow strict quality control measures</p>
          </div>
          <div className="value-card">
            <MdEco className="value-icon" />
            <h3>Sustainability</h3>
            <p>Eco-friendly processes that reduce water and energy consumption</p>
          </div>
          <div className="value-card">
            <MdSupportAgent className="value-icon" />
            <h3>Customer Care</h3>
            <p>24/7 support with real-time order tracking</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="about-cta">
        <h2>Ready to Experience Premium Laundry Service?</h2>
        <button className="cta-button">Book Your First Service</button>
      </section>
    </div>
  );
};

export default AboutUs;
import React from 'react';
import './QualityCleaning.css';

const QualityCleaning = () => {
  return (
    <section className="quality-section">
      <div className="quality-container">
        <h2 className="quality-heading">Quality Cleaning Services</h2>
        <p className="quality-subtext">
          We offer professional care for your clothes with our specialized cleaning services.
        </p>

        <div className="quality-grid">
          <div className="quality-card">
            <h3>Washing</h3>
            <p>Gentle and hygienic washing using top-quality detergents for all fabric types.</p>
          </div>
          <div className="quality-card">
            <h3>Ironing</h3>
            <p>Perfect wrinkle-free ironing with precision temperature control for each cloth type.</p>
          </div>
          <div className="quality-card">
            <h3>Dry Cleaning</h3>
            <p>Advanced dry cleaning to protect delicate fabrics and maintain quality.</p>
          </div>
          <div className="quality-card">
            <h3>Pickup & Delivery</h3>
            <p>We offer free doorstep pickup and delivery at your convenience.</p>
          </div>
          <div className="quality-card">
            <h3>Premium Fabric Care</h3>
            <p>Using high-grade detergents and methods to keep your clothes fresh and safe.</p>
          </div>
          <div className="quality-card">
            <h3>Fast Delivery</h3>
            <p>Quick turnaround with express options to meet your busy schedule.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QualityCleaning;

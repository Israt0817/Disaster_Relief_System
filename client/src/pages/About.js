import React from 'react';
import { Link } from 'react-router-dom';

const About = () => (
  <div className="home-root">
    <div className="glow-bg"></div>
    <nav className="navbar">
      <div className="logo"><span>Res</span>Q</div>
      <Link to="/" style={{color: 'white', textDecoration: 'none'}}>← Back</Link>
    </nav>
    <main className="hero">
      <div className="about-container">
        <h2>About ResQ</h2>
        <p>ResQ is a next-generation disaster response management system. We believe that in times of crisis, information and transparency are as vital as food and water.</p>
        <p style={{marginTop: '20px'}}>Our platform connects donors, volunteers, and administrators in a seamless, real-time ecosystem designed to save lives through data-driven logistics.</p>
      </div>
    </main>
  </div>
);

export default About;
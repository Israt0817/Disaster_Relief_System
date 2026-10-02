import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // FIXED: useNavigate ইম্পোর্ট করা হয়েছে
import BackgroundPopups from './BackgroundPopups'; // Handles the random popping images

const Home = () => {
  const [isSendingSOS, setIsSendingSOS] = useState(false);
  const navigate = useNavigate(); // FIXED: navigate ফাংশন ইনিশিয়ালিজ করা হয়েছে

  // Instant One-Tap SOS direct from Homepage (Automated to Backend Database via GPS Vectors)
  const handleInstantSOS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser configuration.");
      return;
    }

    setIsSendingSOS(true);
    
    // Request raw browser GPS coordinates
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        // Prepare payload with purely location telemetry configurations
        const payload = {
          victim_name: "Anonymous (Direct Home Panic)",
          request_type: "CRITICAL PANIC BEACON",
          people_count: 1,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          description: "EMERGENCY: User fired instant panic beacon directly from homepage hero window!"
        };

        try {
          // Send location data directly to the Express network server
          const response = await fetch("http://localhost:5000/api/sos/request", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          });

          const data = await response.json();

          if (response.ok && data.success) {
            alert("🔴 CRITICAL DISTRESS BEACON SENT! Core command routers have captured your GPS location. Help is being routed.");
          } else {
            alert("Server reached but database rejected entry: " + (data.message || "Unknown Error"));
          }
        } catch (error) {
          console.error("Network link failure during live SOS request broadcast:", error);
          alert("Could not reach backend server registry. Check if your Node server is running on port 5000.");
        } finally {
          setIsSendingSOS(false);
        }
      },
      (error) => {
        console.error("GPS telemetry access blocked:", error);
        alert("🔴 SOS Broadcast Blocked. Please reset browser location permissions to transmit live positioning vectors.");
        setIsSendingSOS(false);
      }
    );
  };

  // FIXED: "Donate Now" বাটনের জন্য কন্ডিশনাল হ্যান্ডলার
  const handleDonateClick = () => {
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');

    if (userId) {
      // ইউজার যদি অলরেডি লগইন করা থাকে, তবে তার রোল অনুযায়ী নির্দিষ্ট ড্যাশবোর্ডে পাঠানো হবে
      if (userRole === 'donor') {
        navigate('/donor-dashboard');
      } else if (userRole === 'admin') {
        navigate('/admin-dashboard');
      } else if (userRole === 'volunteer') {
        navigate('/volunteer-hub');
      } else {
        navigate('/login');
      }
    } else {
      // ইউজার লগইন করা না থাকলে সরাসরি লগইন পেজে রিডাইরেক্ট করবে
      alert("Please login first to access the donation panels.");
      navigate('/login');
    }
  };

  return (
    <div className="home-root">
      <BackgroundPopups />
      <div className="glow-bg"></div>
      
      <nav className="navbar">
        <div className="logo">Res<span>Q</span></div>
        <div className="nav-links">
          {/* FIXED: Changed path target from /map over to the new public open route /live-map */}
          <Link to="/live-map">Live Map</Link>
          
          {/* UPDATED NAME: Changed from Report Disaster to Request Relief Supplies */}
          <Link to="/request-relief" style={{ color: '#00ff88', fontWeight: 'bold' }}>Request Relief Supplies</Link>
          
          <Link to="/about">About Us</Link>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <Link to="/login" className="btn-outline" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>Login</Link>
          
          {/* FIXED: onClick ইভেন্টের মাধ্যমে নতুন হ্যান্ডলার যুক্ত করা হয়েছে */}
          <button onClick={handleDonateClick} className="btn-primary" style={{ cursor: 'pointer' }}>
            Donate Now
          </button>
        </div>
      </nav>

      <main className="hero">
        <div className="status-pill-container">
          <div className="status-pill">SYSTEM STATUS: OPERATIONAL</div>
        </div>
        <h1>Disrupting<br /><span className="gradient-text">Disaster Response</span></h1>
        <p className="hero-sub">A production-grade network built for transparency. Every taka tracked, every volunteer verified, every life prioritized.</p>
        
        <div className="hero-actions" style={{ gap: '20px' }}>
          <Link to="/login" className="btn-main">Enter Command Center</Link>
          
          {/* UPDATED: Fires immediate location drop directly without changing pages */}
          <button 
            onClick={handleInstantSOS} 
            className="btn-outline"
            style={{ 
              borderColor: '#ff4d4d', 
              color: '#ff4d4d', 
              background: 'rgba(255,77,77,0.05)',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {isSendingSOS ? "SENDING LOCATION..." : "⚠️ NEED URGENT RESCUE?"}
          </button>
        </div>
      </main>

      <footer className="stats-footer">
        <div className="stat-item"><span className="stat-val">৳ 4.2M</span><span className="stat-label">Distributed</span></div>
        <div className="stat-item"><span className="stat-val">12.4K</span><span className="stat-label">Volunteers Active</span></div>
        <div className="stat-item"><span className="stat-val">100%</span><span className="stat-label">Audit Clarity</span></div>
      </footer>
    </div>
  );
};

export default Home;
import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

const SOS = () => {
  const [status, setStatus] = useState('');

  const sendAlert = async () => {
    // Basic verification: user must be logged in to send their ID
    const victimId = localStorage.getItem('userId');
    
    if (!victimId) {
      alert("Please login first to send an SOS signal.");
      return;
    }

    // Check if the browser or hardware context supports tracking telemetry
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser software. Sending with default coordinates.");
      transmitSOSPayload(victimId, 23.8103, 90.4125); // Baseline Dhaka Fallback Coordinates
      return;
    }

    setStatus('Acquiring GPS...');

    // Extract device GPS satellite matrix properties
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const liveLat = position.coords.latitude;
        const liveLng = position.coords.longitude;
        transmitSOSPayload(victimId, liveLat, liveLng);
      },
      (error) => {
        console.error("GPS Acquisition Error Code:", error.code);
        alert("Could not automatically retrieve GPS point. Sending request with default command center coordinates.");
        transmitSOSPayload(victimId, 23.8103, 90.4125);
      },
      { 
        enableHighAccuracy: true, // Forces phone hardware to utilize GPS instead of coarse network approximations
        timeout: 10000            // 10 second timeout limit
      }
    );
  };

  // Dedicated function to transmit data packet to backend architecture
  const transmitSOSPayload = async (victimId, lat, lng) => {
    setStatus('Sending...');

    try {
      const response = await fetch('http://localhost:5000/api/sos/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          victim_id: victimId,         // Dynamic ID from localStorage
          disaster_id: 1,              // Default ID
          request_type: 'Emergency',   // Matches your ENUM/Varchar database constraints
          people_count: 1,             
          lat: lat,                    // Dynamic tracked Latitude
          lng: lng                     // Dynamic tracked Longitude
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('SUCCESS');
        alert(`🚨 SOS Distress Signal Broadcasted Successfully! Telemetry Logged: Lat ${lat.toFixed(4)} | Lng ${lng.toFixed(4)}`);
      } else {
        setStatus('FAILED');
        alert(data.message || "Failed to send signal upstream.");
      }
    } catch (err) {
      console.error("SOS Transmission Network Error:", err);
      setStatus('ERROR');
      alert("Network failure. Check if your backend server is running.");
    } finally {
      // Reset status after 3 seconds
      setTimeout(() => setStatus(''), 3000);
    }
  };

  return (
    <div className="sos-body">
      <main className="sos-container">
        <div className="sos-card">
          <AlertCircle color="#ff4d4d" size={48} />
          <h1>Emergency SOS</h1>
          <p>
            {status === 'Acquiring GPS...' && "Interrogating device satellites..."}
            {status === 'Sending...' && "Transmitting telemetry points to Command Center..."}
            {status === 'SUCCESS' && "Connection Secure. Response units notified."}
            {!status && "Your active location telemetry will be securely sent to the command center monitoring grids."}
          </p>
          
          <button 
            className="btn-sos" 
            onClick={sendAlert}
            disabled={status === 'Sending...' || status === 'Acquiring GPS...'}
            style={{
              cursor: (status === 'Sending...' || status === 'Acquiring GPS...') ? 'not-allowed' : 'pointer',
              opacity: (status === 'Sending...' || status === 'Acquiring GPS...') ? 0.7 : 1,
              transition: '0.3s'
            }}
          >
            {status === 'SUCCESS' ? 'SIGNAL SENT' : 'SEND ALERT'}
          </button>

          {status === 'ERROR' && (
            <p style={{ color: '#ff4d4d', fontSize: '0.8rem', marginTop: '10px' }}>
              Connection Error. Ensure server is active.
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default SOS;
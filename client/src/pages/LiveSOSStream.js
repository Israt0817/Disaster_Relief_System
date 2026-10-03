import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Radio, HeartHandshake, Phone, Users, 
  MapPin, AlertOctagon, CheckCircle2, Flame, Droplet, Activity
} from 'lucide-react';

const LiveSOSStream = () => {
  const navigate = useNavigate();
  const [sosAlerts, setSosAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Fetch live pending SOS signals from the database
  const fetchPendingSOS = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/sos-requests'); 
      if (!response.ok) throw new Error('Failed to capture stream data from scanner array.');
      
      const data = await response.json();
      
      // Filter out anything that isn't 'Pending' so dispatched items don't crowd the stream
      const pendingAlerts = data.filter(item => item.status.toLowerCase() === 'pending');
      setSosAlerts(pendingAlerts);
      setError('');
    } catch (err) {
      console.error("Stream sync error:", err);
      setError('Telemetry interface offline. Verification link to database failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingSOS();
    
    // Optional: Real-time scanner polling simulation every 10 seconds
    const interval = setInterval(fetchPendingSOS, 10000);
    return () => clearInterval(interval);
  }, []);

  // 2. Handle volunteer intercepting and taking ownership of the live emergency dispatch row
  const handleAcceptSOS = async (sosId, rawDbId, location, description, lat, lng) => {
    try {
      // Execute database update to move state from 'Pending' to 'Dispatched'
      const response = await fetch(`http://localhost:5000/api/sos-requests/${rawDbId}/intercept`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Dispatched' })
      });

      if (!response.ok) throw new Error('Could not secure intercept authorization row.');

      alert(`SOS Request ${sosId} assigned to you. Dispatch log generated successfully.`);
      
      // Redirect directly to your live map, passing the exact coordinates from the DB row
      navigate('/map', { 
        state: { 
          targetMission: {
            title: `SOS Rescue Intercept: ${sosId}`,
            location: location,
            description: description,
            lat: parseFloat(lat) || 23.8103, 
            lng: parseFloat(lng) || 90.4125
          } 
        } 
      });
    } catch (err) {
      console.error(err);
      alert('Failed to intercept beacon. Another responder may have already claimed this objective.');
      fetchPendingSOS(); // Refresh stream data
    }
  };

  // Icon selector based on request payload type
  const getCrisisIcon = (type) => {
    if (!type) return <Droplet size={18} color="#3b82f6" />;
    const normalized = type.toUpperCase();
    if (normalized.includes('MED')) return <Activity size={18} color="#ef4444" />;
    if (normalized.includes('STRUCT') || normalized.includes('FIRE')) return <Flame size={18} color="#f97316" />;
    return <Droplet size={18} color="#3b82f6" />;
  };

  if (loading && sosAlerts.length === 0) {
    return (
      <div style={{ width: '100%', minHeight: '100vh', background: '#030303', color: '#ff4d4d', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <Radio size={32} className="animate-pulse" style={{ marginBottom: '10px' }} />
          <div style={{ fontSize: '0.9rem', letterSpacing: '1px' }}>SYNCHRONIZING SCANNERS TO SATELLITE CORES...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#030303', color: 'white', fontFamily: 'sans-serif', boxSizing: 'border-box', padding: '20px' }}>
      
      {/* Dynamic Streaming Page Header */}
      <header style={{ marginBottom: '40px', borderBottom: '1px solid #18181b', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '2.5rem', color: '#00ff88', margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '800' }}>
              <Radio size={36} style={{ color: '#ff4d4d' }} /> Live SOS Stream
            </h1>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid rgba(255, 77, 77, 0.2)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff4d4d', display: 'inline-block' }}></span> LIVE RECEIVER TERMINAL ON
            </span>
          </div>
          <p style={{ color: '#888888', marginTop: '10px', fontSize: '1rem' }}>Intercept passive emergency civilian beacon signals broadcasted near your location sector.</p>
        </div>
      </header>

      {error && (
        <div style={{ padding: '15px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '8px', marginBottom: '25px', fontWeight: '600' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Primary SOS Grid Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {sosAlerts.map((alert) => (
          <div key={alert.id} style={{ ...sosBoxStyle, borderLeft: alert.people_count > 3 ? '4px solid #ef4444' : '4px solid #f97316' }}>
            
            {/* Top Row Grid Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#555555', fontWeight: '700' }}>ID: SOS-{alert.id}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#888888', background: '#141416', padding: '2px 8px', borderRadius: '4px' }}>
                    {getCrisisIcon(alert.request_type)} {alert.request_type}
                  </span>
                </div>
                <h3 style={{ margin: '6px 0 2px 0', fontSize: '1.4rem', fontWeight: '700', color: '#ffffff' }}>
                  Target Name: {alert.victim_name || 'Anonymous Civilian'}
                </h3>
              </div>

              {/* Urgency Severity Tag */}
              <span style={{ 
                padding: '6px 12px', 
                borderRadius: '6px', 
                fontSize: '0.75rem', 
                fontWeight: '800', 
                textTransform: 'uppercase',
                background: alert.people_count > 3 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(249, 115, 22, 0.1)',
                color: alert.people_count > 3 ? '#ef4444' : '#f97316',
                border: `1px solid ${alert.people_count > 3 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(249, 115, 22, 0.2)'}`
              }}>
                {alert.people_count > 3 ? 'Critical' : 'High'} Risk
              </span>
            </div>

            {/* Middle Section Context Blocks */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div style={infoLineStyle}>
                <MapPin size={16} color="#ef4444" style={{ minWidth: '16px' }} />
                <span style={{ color: '#aaaaaa', fontSize: '0.95rem' }}><b>Coordinates Zone:</b> Lat {alert.location_lat}, Lng {alert.location_lng}</span>
              </div>
              <div style={infoLineStyle}>
                <Users size={16} color="#00ff88" />
                <span style={{ color: '#aaaaaa', fontSize: '0.95rem' }}><b>Civilian Density Count:</b> {alert.people_count || 1} Transmissions</span>
              </div>
              <div style={infoLineStyle}>
                <Phone size={16} color="#3b82f6" />
                <span style={{ color: '#aaaaaa', fontSize: '0.95rem' }}><b>Comms Bridge Line:</b> <span style={{ color: '#3b82f6' }}>{alert.phone || 'No Contact Number Supplied'}</span></span>
              </div>
              <div style={infoLineStyle}>
                <AlertOctagon size={16} color="#a855f7" />
                <span style={{ color: '#aaaaaa', fontSize: '0.95rem' }}><b>Timestamp Received:</b> {new Date(alert.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            </div>

            {/* Distress Context Report Box */}
            <p style={{ color: '#dddddd', fontSize: '0.95rem', lineHeight: '1.5', margin: '0 0 20px 0', background: '#09090b', padding: '14px 18px', borderRadius: '8px', border: '1px solid #141416', fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>
              "{alert.description}"
            </p>

            {/* Bottom Form Action Dispatch Control bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '15px', borderTop: '1px solid #141416' }}>
              <button 
                onClick={() => handleAcceptSOS(`SOS-${alert.id}`, alert.id, `Coordinates Sector: [${alert.location_lat}, ${alert.location_lng}]`, alert.description, alert.location_lat, alert.location_lng)}
                style={acceptBtnStyle}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#ff4d4d';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 77, 77, 0.05)';
                  e.currentTarget.style.color = '#ff4d4d';
                }}
              >
                <HeartHandshake size={16} /> Intercept & Deploy Route
              </button>
            </div>

          </div>
        ))}

        {/* Empty Distress Feed State */}
        {sosAlerts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', background: '#0d0d0f', borderRadius: '15px', border: '1px dashed #18181b', color: '#555555' }}>
            <CheckCircle2 size={40} style={{ marginBottom: '10px', color: '#00ff88' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#888888' }}>All Distress Sectors Secure</div>
            <p style={{ fontSize: '0.85rem', color: '#444', margin: '4px 0 0 0' }}>No live emergency broadcasts captured on scanner arrays.</p>
          </div>
        )}
      </div>

    </div>
  );
};

const sosBoxStyle = { background: '#0d0d0f', padding: '24px', borderRadius: '14px', border: '1px solid #18181b', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' };
const infoLineStyle = { display: 'flex', alignItems: 'center', gap: '8px', background: '#070708', padding: '10px 12px', borderRadius: '6px', border: '1px solid #141416' };
const acceptBtnStyle = { background: 'rgba(255, 77, 77, 0.05)', border: '1px solid #ff4d4d', color: '#ff4d4d', padding: '10px 20px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s all' };

export default LiveSOSStream;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, CheckCircle, Clock, AlertCircle, 
  MapPin, ShieldAlert, CheckSquare, Navigation 
} from 'lucide-react';

const VolunteerMissions = ({ volunteerId = 1 }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('Active'); 
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Fetch live active/open operations from the server
  const fetchLiveMissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/missions/active');
      if (!response.ok) throw new Error('Roster download failure.');
      const data = await response.json();

      // Transform backend schema rows to match your UI variable naming strategy
      const structuredMissions = data.map(m => {
        const extractedLat = parseFloat(m.description?.match(/Lat\s+([-\d.]+)/)?.[1] || 23.8103);
        const extractedLng = parseFloat(m.description?.match(/Lng\s+([-\d.]+)/)?.[1] || 90.4125);
        
        return {
          id: `MS-${m.id}`,
          rawId: m.id, 
          title: m.title,
          location: m.description?.match(/Victim Profile:\s*(.*?)\s*\(/)?.[1] 
                    ? `Assigned Victim: ${m.description.match(/Victim Profile:\s*(.*?)\s*\(/)[1]}` 
                    : "Emergency Response Vector Zone",
          lat: extractedLat,
          lng: extractedLng,
          priority: m.title.toLowerCase().includes('critical') || m.title.toLowerCase().includes('urgent') ? 'Critical' : 'High',
          assignedTime: "Live Deployment Track",
          description: m.description,
          status: m.status === 'open' || m.status === 'ongoing' ? 'Active' : 'Completed'
        };
      });

      setMissions(structuredMissions);
      setErrorMessage('');
    } catch (err) {
      console.error("Error connecting to database pipelines:", err);
      setErrorMessage('Could not initialize connections to system mission tables.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveMissions();
  }, []);

  // 2. Handle a volunteer signing off on a mission
  const handleUpdateStatus = (id, rawId) => {
    setMissions(prev => prev.map(m => m.id === id ? { ...m, status: 'Completed' } : m));
    alert(`Mission ${id} successfully logged as COMPLETED.`);
  };

  const activeCount = missions.filter(m => m.status === 'Active').length;
  const completedCount = missions.filter(m => m.status === 'Completed').length;

  if (loading) {
    return (
      <div style={{ width: '100%', minHeight: '100vh', background: '#030303', color: '#888888', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <Clock size={32} style={{ color: '#00ff88', marginBottom: '10px' }} />
          <div>Synchronizing operational response matrices...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#030303', color: 'white', fontFamily: 'sans-serif', boxSizing: 'border-box', padding: '20px' }}>
      
      <header style={{ marginBottom: '40px', borderBottom: '1px solid #18181b', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', color: '#00ff88', margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '800' }}>
            <ClipboardList size={36} /> My Deployment Missions
          </h1>
          <p style={{ color: '#888888', marginTop: '10px', fontSize: '1rem' }}>Track assigned field objectives and submit verification telemetry.</p>
        </div>
        
        <div style={{ display: 'flex', background: '#09090b', padding: '4px', borderRadius: '8px', border: '1px solid #18181b' }}>
          <button 
            onClick={() => setFilter('Active')} 
            style={{ ...toggleBtnStyle, background: filter === 'Active' ? 'rgba(0, 255, 136, 0.08)' : 'transparent', color: filter === 'Active' ? '#00ff88' : '#888888' }}
          >
            Active ({activeCount})
          </button>
          <button 
            onClick={() => setFilter('Completed')} 
            style={{ ...toggleBtnStyle, background: filter === 'Completed' ? 'rgba(168, 85, 247, 0.08)' : 'transparent', color: filter === 'Completed' ? '#a855f7' : '#888888' }}
          >
            History ({completedCount})
          </button>
        </div>
      </header>

      {errorMessage && (
        <div style={{ padding: '15px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '8px', marginBottom: '25px', fontWeight: '600' }}>
          ⚠️ {errorMessage}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '35px' }}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#00ff88' }}>
            <Clock size={20} /> <span style={{ fontSize: '0.9rem', color: '#888888', fontWeight: '600' }}>Active Tasks Pending</span>
          </div>
          <h2 style={{ fontSize: '2.2rem', margin: '10px 0 0 0', fontWeight: '800' }}>{activeCount} Actions</h2>
        </div>
        
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a855f7' }}>
            <CheckCircle size={20} /> <span style={{ fontSize: '0.9rem', color: '#888888', fontWeight: '600' }}>Completed Operations</span>
          </div>
          <h2 style={{ fontSize: '2.2rem', margin: '10px 0 0 0', fontWeight: '800' }}>{completedCount} Cleared</h2>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {missions.filter(m => m.status === filter).map((mission) => (
          <div key={mission.id} style={{ ...missionCardStyle, borderLeft: mission.status === 'Completed' ? '4px solid #a855f7' : mission.priority === 'Critical' ? '4px solid #ef4444' : '4px solid #00ff88' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#555555', fontWeight: '700', letterSpacing: '0.5px' }}>ID: {mission.id}</span>
                <h3 style={{ margin: '4px 0 6px 0', fontSize: '1.4rem', fontWeight: '700', color: '#ffffff' }}>{mission.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#888888', fontSize: '0.9rem' }}>
                  <MapPin size={14} color="#00ff88" /> {mission.location}
                </div>
              </div>

              <span style={{ 
                padding: '6px 12px', 
                borderRadius: '6px', 
                fontSize: '0.75rem', 
                fontWeight: '800', 
                textTransform: 'uppercase',
                background: mission.status === 'Completed' ? 'rgba(168,85,247,0.1)' : mission.priority === 'Critical' ? 'rgba(239,68,68,0.1)' : 'rgba(0,255,136,0.1)',
                color: mission.status === 'Completed' ? '#a855f7' : mission.priority === 'Critical' ? '#ef4444' : '#00ff88',
                border: `1px solid ${mission.status === 'Completed' ? 'rgba(168,85,247,0.2)' : mission.priority === 'Critical' ? 'rgba(239,68,68,0.2)' : 'rgba(0,255,136,0.2)'}`
              }}>
                {mission.status === 'Completed' ? 'Cleared' : `${mission.priority} Priority`}
              </span>
            </div>

            <p style={{ color: '#aaaaaa', fontSize: '0.95rem', lineHeight: '1.5', margin: '0 0 20px 0', background: '#09090b', padding: '12px 16px', borderRadius: '8px', border: '1px solid #141416', whitespace: 'pre-wrap' }}>
              {mission.description}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', borderTop: '1px solid #141416' }}>
              <span style={{ fontSize: '0.85rem', color: '#555555', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={14} /> Tracking: {mission.assignedTime}
              </span>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => navigate('/map', { state: { targetMission: mission } })}
                  style={{ ...actionBtnStyle, borderColor: '#18181b', color: '#ffffff' }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Navigation size={14} /> Waypoint Map
                </button>

                {mission.status === 'Active' && (
                  <button 
                    onClick={() => handleUpdateStatus(mission.id, mission.rawId)}
                    style={{ ...actionBtnStyle, borderColor: '#00ff88', color: '#00ff88', background: 'rgba(0,255,136,0.02)' }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,255,136,0.08)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,255,136,0.02)'}
                  >
                    <CheckSquare size={14} /> Complete Assignment
                  </button>
                )}
              </div>
            </div>

          </div>
        ))}

        {childrenEmptyCheck(missions, filter)}
      </div>

    </div>
  );
};

const childrenEmptyCheck = (missions, filter) => {
  if (missions.filter(m => m.status === filter).length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', background: '#0d0d0f', borderRadius: '15px', border: '1px dashed #18181b', color: '#555555' }}>
        <ShieldAlert size={40} style={{ marginBottom: '10px' }} />
        <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>No missions found in this category log.</div>
      </div>
    );
  }
  return null;
};

const toggleBtnStyle = { border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer', transition: '0.2s all' };
const cardStyle = { background: '#0d0d0f', padding: '20px 24px', borderRadius: '12px', border: '1px solid #18181b', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' };
const missionCardStyle = { background: '#0d0d0f', padding: '24px', borderRadius: '14px', border: '1px solid #18181b', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' };
const actionBtnStyle = { background: 'transparent', border: '1px solid', padding: '8px 16px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s all' };

export default VolunteerMissions;
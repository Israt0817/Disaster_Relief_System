import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldAlert, MapPin, Phone, Users, 
  Truck, Flame, Shield, AlertTriangle, CheckCircle 
} from 'lucide-react';

const AdminSOS = () => {
  const [sosList, setSosList] = useState([]);
  const [filter, setFilter] = useState('Pending');

  const fetchLiveSignals = useCallback(() => {
    // 💡 Hardcoded items are strictly a backup for offline network crashes
    const offlineEmergencyPings = [
      {
        id: "SOS-9110",
        victim_name: "Imtiaz Ahmed (Offline Fallback)",
        phone: "+880 1711-555999",
        request_type: "Medical Outbreak / Evacuation Needed",
        location_lat: "23.8103",
        location_lng: "90.4125",
        people_count: 5,
        description: "CRITICAL: Multiple elderly individuals trapped on roof. Medical attention crew required.",
        timestamp: "Offline Mode",
        status: "Pending"
      }
    ];

    fetch('http://localhost:5000/api/admin/sos-list')
      .then(res => res.json())
      .then(data => {
        // ✅ Trust backend data array explicitly if it answers successfully
        if (Array.isArray(data)) {
          setSosList(data);
        } else {
          setSosList([]);
        }
      })
      .catch(err => {
        console.error("SOS Live Hook Error, loading offline backup metrics:", err);
        setSosList(offlineEmergencyPings);
      });
  }, []);

  useEffect(() => {
    fetchLiveSignals();
  }, [fetchLiveSignals]);

  const handleDispatchService = async (id, serviceType) => {
    const confirmation = window.confirm(`Authorize deployment of ${serviceType.toUpperCase()} to target zone?`);
    if (!confirmation) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/sos/${id}/dispatch`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'Dispatched', // Safe short word to prevent string truncation
          dispatched_service: serviceType 
        })
      });

      if (response.ok) {
        alert(`🚨 EMERGENCY ASSETS DEPLOYED: ${serviceType} successfully routed via system networks.`);
        fetchLiveSignals(); // Re-fetch clean data straight from the database
      } else {
        alert(`⚠️ Server rejected update request packet.`);
      }
    } catch (err) {
      console.error("Database link connection down:", err);
      alert(`🚨 Connection error. Could not reach server to persist dispatch changes.`);
    }
  };

  return (
    <div style={{ flex: 1, padding: '40px', color: 'white', height: '100vh', overflowY: 'auto', boxSizing: 'border-box', fontFamily: 'sans-serif', background: '#09090b' }}>
      
      <header style={{ marginBottom: '40px', borderBottom: '1px solid #27272a', paddingBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', color: '#ff4d4d', margin: 0, display: 'flex', alignItems: 'center', gap: '14px', fontWeight: '800' }}>
            <ShieldAlert size={38} /> SOS Emergency Dispatch Monitor
          </h1>
          <p style={{ color: '#888', marginTop: '10px' }}>Immediate life-safety triage gateway for Fire Service, Ambulance, and Rescue team distribution.</p>
        </div>

        <div style={{ display: 'flex', background: '#161616', padding: '4px', borderRadius: '8px', border: '1px solid #252525' }}>
          <button 
            onClick={() => setFilter('Pending')}
            style={{ 
              ...filterBtnStyle, 
              background: filter === 'Pending' ? 'rgba(255,77,77,0.1)' : 'transparent', 
              color: filter === 'Pending' ? '#ff4d4d' : '#666' 
            }}
          >
            Live Distress Signals ({sosList.filter(p => !p.status || p.status.toLowerCase().includes('pending') || !p.status.toLowerCase().includes('dispatch')).length})
          </button>
          <button 
            onClick={() => setFilter('Dispatched')}
            style={{ 
              ...filterBtnStyle, 
              background: filter === 'Dispatched' ? 'rgba(0,255,136,0.1)' : 'transparent', 
              color: filter === 'Dispatched' ? '#00ff88' : '#666' 
            }}
          >
            On Route / Resolved ({sosList.filter(p => p.status?.toLowerCase().includes('dispatch')).length})
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {sosList.filter(p => filter === 'Pending' ? (!p.status?.toLowerCase().includes('dispatch')) : p.status?.toLowerCase().includes('dispatch')).length > 0 ? (
          sosList.filter(p => filter === 'Pending' ? (!p.status?.toLowerCase().includes('dispatch')) : p.status?.toLowerCase().includes('dispatch')).map((ping) => (
            <div key={ping.id} style={{ ...emergencyCardStyle, borderLeft: filter === 'Pending' ? '5px solid #ff4d4d' : '5px solid #00ff88' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: '#fff' }}>
                    {ping.request_type || "URGENT RESCUE REQUIRED"}
                  </h3>
                  <div style={{ display: 'flex', gap: '20px', marginTop: '8px', color: '#aaa', fontSize: '0.9rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} color="#3b82f6" /> {ping.victim_name || "Victim"} ({ping.phone || ping.phone_number || "No Number Specified"})</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={14} color="#a855f7" /> Person Count: {ping.people_count || 1}</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>{ping.timestamp || "Just Now"}</div>
              </div>

              <div style={{ background: '#09090b', border: '1px solid #252525', borderRadius: '10px', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#eee', fontSize: '0.95rem' }}>
                  <MapPin size={16} color="#ff4d4d" />
                  <span><b>Telemetry Point:</b> Lat: <code style={codeStyle}>{ping.location_lat || ping.lat || '0'}</code> | Lng: <code style={codeStyle}>{ping.location_lng || ping.lng || '0'}</code></span>
                </div>
                <a href={`https://www.google.com/maps/search/?api=1&query=${ping.location_lat || ping.lat || 0},${ping.location_lng || ping.lng || 0}`} target="_blank" rel="noreferrer" style={{ color: '#00d2ff', fontSize: '0.85rem', fontWeight: '700', textDecoration: 'none' }}>
                  Track Geolocation ↗
                </a>
              </div>

              <p style={{ margin: '0 0 20px 0', fontSize: '0.95rem', color: '#ddd', lineHeight: '1.6', background: '#161616', padding: '16px', borderRadius: '8px', border: '1px solid #252525' }}>
                <b>Situation Note:</b> {ping.description || ping.notes || "User triggered high-priority emergency panic signal configuration."}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #252525', paddingTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: filter === 'Pending' ? '#ff8888' : '#00ff88', fontSize: '0.9rem', fontWeight: '700' }}>
                  <AlertTriangle size={15} /> Operational Layer: {ping.status ? ping.status.toUpperCase() : 'PENDING'}
                </div>

                {filter === 'Pending' ? (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => handleDispatchService(ping.id, 'Fire Service')} style={{ ...actionBtnStyle, background: '#f97316' }}>
                      <Flame size={15} /> Dispatch Fire Service
                    </button>
                    <button onClick={() => handleDispatchService(ping.id, 'Ambulance')} style={{ ...actionBtnStyle, background: '#ef4444' }}>
                      <Truck size={15} /> Dispatch Ambulance
                    </button>
                    <button onClick={() => handleDispatchService(ping.id, 'Military Air/Water Rescue')} style={{ ...actionBtnStyle, background: '#3b82f6' }}>
                      <Shield size={15} /> Deploy Military Units
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00ff88', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    <CheckCircle size={16} /> Force deployment successfully authorized on target zone.
                  </div>
                )}
              </div>

            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '60px', border: '1px dashed #27272a', borderRadius: '12px', color: '#71717a' }}>
            No missions found matching this category view window context.
          </div>
        )}
      </div>
    </div>
  );
};

const filterBtnStyle = { border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer' };
const emergencyCardStyle = { background: '#161616', padding: '24px', borderRadius: '16px', border: '1px solid #252525', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' };
const codeStyle = { color: '#00ff88', background: '#09090b', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' };
const actionBtnStyle = { display: 'flex', alignItems: 'center', gap: '8px', border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold', color: 'white', cursor: 'pointer' };

export default AdminSOS;
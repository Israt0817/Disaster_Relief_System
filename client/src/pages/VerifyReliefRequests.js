import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, Check, ShieldAlert, XCircle, MapPin, 
  Phone, Users, ShoppingBag, Calendar, AlertCircle, Eye
} from 'lucide-react';

const VerifyReliefRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('Pending Verification');

  useEffect(() => {
    // Fallback baseline mock array for the logistics tracker if storage is empty
    const defaultLogisticsPool = [
      {
        id: "REQ-8841",
        reporterName: "Asif Reja",
        phone: "+880 1611-222333",
        incidentType: "RELIEF: Dry Rations & Water",
        location: "Rowmari Cyclone Shelter, Kurigram",
        severity: "High",
        description: "Family Unit Size: 3-5 People. Needs Breakdown: No clean drinking water left inside the shelter block. Need dry biscuits, ORS packets, and water purification tablets urgently.",
        timestamp: "1 Hour Ago",
        status: "Pending Verification"
      },
      {
        id: "REQ-7712",
        reporterName: "Sultana Razia",
        phone: "+880 1912-888444",
        incidentType: "RELIEF: Medical Supplies",
        location: "Feni Government College Ground, Block B",
        severity: "Medium",
        description: "Family Unit Size: 6+ Large Family Group. Needs Breakdown: Disinfectants, gauze pads, and basic paracetamol supply stocks needed for children showing early fever symptoms.",
        timestamp: "3 Hours Ago",
        status: "Approved for Dispatch"
      }
    ];

    // Read unified disasterReports array populated by the frontend form
    const loadedReports = JSON.parse(localStorage.getItem('disasterReports') || '[]');
    
    // Filter down to only show reports that start with "RELIEF:" or fit the logistics parameters
    const reliefOnly = loadedReports.filter(r => r.incidentType.startsWith('RELIEF:'));
    
    if (reliefOnly.length === 0 && loadedReports.length === 0) {
      // Seed default logistics pool if nothing exists anywhere
      localStorage.setItem('disasterReports', JSON.stringify(defaultLogisticsPool));
      setRequests(defaultLogisticsPool);
    } else {
      setRequests(reliefOnly.length > 0 ? reliefOnly : defaultLogisticsPool);
    }
  }, []);

  // Update administrative approval tracking logs
  const handleStatusChange = (id, newStatus) => {
    // Fetch global reports database array
    const globalReports = JSON.parse(localStorage.getItem('disasterReports') || '[]');
    
    // Update target item status
    const updatedGlobal = globalReports.map(item => 
      item.id === id ? { ...item, status: newStatus } : item
    );

    // Commit to localStorage
    localStorage.setItem('disasterReports', JSON.stringify(updatedGlobal));
    
    // Refresh local viewport state
    setRequests(updatedGlobal.filter(r => r.incidentType.startsWith('RELIEF:')));
    alert(`Relief Request status successfully logged as: ${newStatus.toUpperCase()}`);
  };

  const pendingCount = requests.filter(r => r.status === 'Pending Verification').length;
  const approvedCount = requests.filter(r => r.status === 'Approved for Dispatch').length;

  return (
    <div style={{ width: '100%', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      
      {/* Panel Top Heading Area */}
      <header style={{ marginBottom: '40px', borderBottom: '1px solid #18181b', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', color: '#00ff88', margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '800' }}>
            <HeartHandshake size={36} /> Supply Logistics Allocation
          </h1>
          <p style={{ color: '#888888', marginTop: '10px', fontSize: '1rem' }}>Verify itemized community requests for food, clothes, money, and medical kits before authorizing inventory release.</p>
        </div>

        {/* Navigation Toggles between Request Pools */}
        <div style={{ display: 'flex', background: '#09090b', padding: '4px', borderRadius: '8px', border: '1px solid #18181b' }}>
          <button 
            onClick={() => setFilter('Pending Verification')} 
            style={{ ...toggleBtnStyle, background: filter === 'Pending Verification' ? 'rgba(168, 85, 247, 0.08)' : 'transparent', color: filter === 'Pending Verification' ? '#a855f7' : '#888888' }}
          >
            Pending Verification ({pendingCount})
          </button>
          <button 
            onClick={() => setFilter('Approved for Dispatch')} 
            style={{ ...toggleBtnStyle, background: filter === 'Approved for Dispatch' ? 'rgba(0, 255, 136, 0.08)' : 'transparent', color: filter === 'Approved for Dispatch' ? '#00ff88' : '#888888' }}
          >
            Approved Queue ({approvedCount})
          </button>
        </div>
      </header>

      {/* Grid Stack List View */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {requests.filter(r => r.status === filter).map((req) => (
          <div key={req.id} style={{ ...requestCardStyle, borderLeft: req.status === 'Approved for Dispatch' ? '4px solid #00ff88' : '4px solid #a855f7' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#555555', fontWeight: '700' }}>BATCH ID: {req.id}</span>
                <h3 style={{ margin: '4px 0 6px 0', fontSize: '1.4rem', fontWeight: '700', color: '#ffffff' }}>
                  {req.incidentType.replace('RELIEF: ', '📦 Allocation Need: ')}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#888888', fontSize: '0.9rem' }}>
                  <MapPin size={14} color="#ef4444" /> {req.location}
                </div>
              </div>

              <span style={{ 
                padding: '6px 12px', 
                borderRadius: '6px', 
                fontSize: '0.75rem', 
                fontWeight: '800', 
                background: req.status === 'Approved for Dispatch' ? 'rgba(0,255,136,0.1)' : 'rgba(168,85,247,0.1)',
                color: req.status === 'Approved for Dispatch' ? '#00ff88' : '#a855f7',
                border: `1px solid ${req.status === 'Approved for Dispatch' ? 'rgba(0,255,136,0.2)' : 'rgba(168,85,247,0.2)'}`
              }}>
                {req.status}
              </span>
            </div>

            {/* Structured Itemization Parameters */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div style={infoLineStyle}>
                <Phone size={14} color="#3b82f6" />
                <span style={{ color: '#aaaaaa', fontSize: '0.9rem' }}><b>Recipient Head:</b> {req.reporterName} ({req.phone})</span>
              </div>
              <div style={infoLineStyle}>
                <Users size={14} color="#a855f7" />
                <span style={{ color: '#aaaaaa', fontSize: '0.9rem' }}><b>Target Population Density:</b> {req.description.split('.')[0]}</span>
              </div>
            </div>

            {/* Description Text Area Block */}
            <p style={{ color: '#dddddd', fontSize: '0.95rem', lineHeight: '1.5', margin: '0 0 20px 0', background: '#09090b', padding: '14px', borderRadius: '8px', border: '1px solid #141416' }}>
              <b>Supply Specifications Note:</b> {req.description.includes('Needs Breakdown:') ? req.description.split('Needs Breakdown:')[1] : req.description}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', borderTop: '1px solid #141416' }}>
              <span style={{ fontSize: '0.85rem', color: '#555555', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} /> Received Timestamp: {req.timestamp}
              </span>

              {/* Functional Verification Control Bar */}
              {req.status === 'Pending Verification' && (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => handleStatusChange(req.id, 'Rejected / Invalid')}
                    style={{ ...actionBtnStyle, borderColor: '#ef4444', color: '#ef4444' }}
                  >
                    <XCircle size={14} /> Reject Request
                  </button>
                  <button 
                    onClick={() => handleStatusChange(req.id, 'Approved for Dispatch')}
                    style={{ ...actionBtnStyle, borderColor: '#00ff88', color: '#00ff88', background: 'rgba(0,255,136,0.02)' }}
                  >
                    <Check size={14} /> Approve & Allocate Inventory
                  </button>
                </div>
              )}
            </div>

          </div>
        ))}

        {/* Empty State Layout Fallback */}
        {requests.filter(r => r.status === filter).length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', background: '#0d0d0f', borderRadius: '15px', border: '1px dashed #18181b', color: '#555555' }}>
            <ShieldAlert size={40} style={{ marginBottom: '10px' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#888888' }}>No requests cataloged inside this active logistical layer.</div>
          </div>
        )}
      </div>

    </div>
  );
};

// Internal Styling Definitions Modules
const toggleBtnStyle = { border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer', transition: '0.2s all' };
const requestCardStyle = { background: '#0d0d0f', padding: '24px', borderRadius: '14px', border: '1px solid #18181b', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' };
const infoLineStyle = { display: 'flex', alignItems: 'center', gap: '8px', background: '#070708', padding: '10px 12px', borderRadius: '6px', border: '1px solid #141416' };
const actionBtnStyle = { background: 'transparent', border: '1px solid', padding: '8px 16px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s all' };

export default VerifyReliefRequests;
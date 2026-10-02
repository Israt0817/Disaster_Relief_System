import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, Users, Package, ShieldAlert, HeartHandshake, 
  Check, XCircle, MapPin, Phone, Radio, ChevronRight, Truck, Clock
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ volunteers: 0, inventory: 0, disasters: 0 });
  const [sosRequests, setSosRequests] = useState([]);
  const [volunteers, setVolunteers] = useState([]); 
  const [reliefRequests, setReliefRequests] = useState([]);
  
  // 🌟 ডোনার আইটেম এবং একটিভ ভলান্টিয়ারদের ট্র্যাক করার স্টেট
  const [donorItems, setDonorItems] = useState([]);
  const [activeVolunteers, setActiveVolunteers] = useState([]);
  const [selectedVolunteers, setSelectedVolunteers] = useState({});

  const currentAdminId = localStorage.getItem('userId') || 1; 

  const fetchData = () => {
    // Fetch Core Stats
    fetch('http://localhost:5000/api/admin/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Stats Error:", err));

    // Fetch Live SOS Feed (Used to get active counts)
    fetch('http://localhost:5000/api/admin/sos-list')
      .then(res => res.json())
      .then(data => setSosRequests(data))
      .catch(err => console.error("SOS Feed Error:", err));

    // Fetch Pending/Active Volunteers Matrix
    fetch('http://localhost:5000/api/volunteers')
      .then(res => res.json())
      .then(data => setVolunteers(data))
      .catch(err => console.error("Volunteer Fetch Error:", err));

    // Hydrate relief request metrics from local ledger array
    const loadedReports = JSON.parse(localStorage.getItem('disasterReports') || '[]');
    const reliefOnly = loadedReports.filter(r => r.incidentType && r.incidentType.startsWith('RELIEF:'));
    setReliefRequests(reliefOnly);

    // 🌟 ডোনারদের পাঠানো সামগ্রী এবং ভলান্টিয়ার ড্রপডাউন ডেটা নিয়ে আসা
    fetch('http://localhost:5000/api/admin/item-donations')
      .then(res => res.json())
      .then(data => setDonorItems(data))
      .catch(err => console.error("Donor Items Fetch Error:", err));

    fetch('http://localhost:5000/api/admin/active-volunteers')
      .then(res => res.json())
      .then(data => setActiveVolunteers(data))
      .catch(err => console.error("Active Volunteers Error:", err));
  };

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') navigate('/login');

    fetchData();
  }, [navigate]);

  const handleApproveVolunteer = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/volunteers/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'volunteer', adminId: currentAdminId })
      });

      if (response.ok) {
        alert("Volunteer application has been verified and approved successfully!");
        fetchData(); 
      }
    } catch (err) {
      console.error("Volunteer approval submission failure:", err);
    }
  };

  const handleUpdateReliefStatus = (id, newStatus) => {
    const globalReports = JSON.parse(localStorage.getItem('disasterReports') || '[]');
    const updatedGlobal = globalReports.map(item => 
      item.id === id ? { ...item, status: newStatus } : item
    );
    localStorage.setItem('disasterReports', JSON.stringify(updatedGlobal));
    alert(`Relief allocation state updated to: ${newStatus.toUpperCase()}`);
    fetchData();
  };

  // 🌟 ভলান্টিয়ার নিয়োগ করার হ্যান্ডলার
  const handleAssignVolunteer = async (id) => {
    const volunteerId = selectedVolunteers[id];
    if (!volunteerId) {
      alert("Please select a volunteer from the dropdown first.");
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/admin/item-donations/${id}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volunteer_id: volunteerId })
      });
      if (res.ok) {
        alert("Courier agent dispatched for pickup successfully!");
        fetchData();
      }
    } catch (err) {
      console.error("Assign error:", err);
    }
  };

  // 🌟 জিনিস রিসিভ করে মূল ইনভেন্টরিতে স্টক যুক্ত করার হ্যান্ডলার
  const handleStockInItem = async (id) => {
    if (!window.confirm("Verify goods received at warehouse? This will instantly credit your Main Inventory.")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/item-donations/${id}/collect`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        alert("Success! Items successfully sorted and added to live Inventory.");
        fetchData();
      }
    } catch (err) {
      console.error("Stock In error:", err);
    }
  };

  return (
    <div style={{ flex: 1, padding: '40px', color: 'white', height: '100vh', overflowY: 'auto', boxSizing: 'border-box', background: '#09090b' }}>
      
      {/* --- CLEAN HEADER --- */}
      <header style={{ marginBottom: '50px', borderBottom: '1px solid #27272a', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#a855f7', margin: 0, fontWeight: '800' }}>Command Center</h1>
        <p style={{ color: '#888', marginTop: '10px' }}>Admin Dashboard | ResQ System Live Tracking Node</p>
      </header>

      {/* --- STAT CARDS GRID SECTION (4 COLUMNS WITH INTERACTIVE SOS BOX) --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '25px' }}>
        <div style={{ ...cardStyle, borderColor: '#38bdf8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h4 style={{ color: '#888', margin: 0 }}>Active Missions</h4>
            <Activity size={20} color="#38bdf8" />
          </div>
          <h2 style={{ fontSize: '2.8rem', color: '#38bdf8', margin: '15px 0 0 0' }}>{stats.disasters}</h2>
        </div>

        <div style={{ ...cardStyle, borderColor: '#00ff88' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h4 style={{ color: '#888', margin: 0 }}>Active Responders</h4>
            <Users size={20} color="#00ff88" />
          </div>
          <h2 style={{ fontSize: '2.8rem', color: '#00ff88', margin: '15px 0 0 0' }}>{stats.volunteers}</h2>
        </div>

        <div style={{ ...cardStyle, borderColor: '#a855f7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h4 style={{ color: '#888', margin: 0 }}>Inventory Stock</h4>
            <Package size={20} color="#a855f7" />
          </div>
          <h2 style={{ fontSize: '2.8rem', color: '#a855f7', margin: '15px 0 0 0' }}>{stats.inventory}</h2>
        </div>

        {/* INTERACTIVE SOS BOX (LINKS TO DEDICATED SOS MONITOR PAGE) */}
        <div 
          onClick={() => navigate('/admin-sos')} 
          style={{ 
            ...cardStyle, 
            borderColor: '#ff4d4d', 
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2a1212 100%)',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 77, 77, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ color: '#ff8888', margin: 0, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Radio size={16} className="animate-pulse" style={{ color: '#ff4d4d' }} /> LIVE SOS PINGS
            </h4>
            <ChevronRight size={18} color="#ff4d4d" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '15px' }}>
            <h2 style={{ fontSize: '2.8rem', color: '#ff4d4d', margin: 0 }}>{sosRequests.length}</h2>
            <span style={{ fontSize: '0.8rem', color: '#aaa', borderBottom: '1px solid #ff4d4d', paddingBottom: '2px' }}>View Monitor</span>
          </div>
        </div>
      </div>

      {/* --- SECTION 1: VOLUNTEER ONBOARDING APPROVALS --- */}
      <div style={{ marginTop: '50px' }}>
        <h3 style={{ color: '#00d2ff', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px', fontWeight: '700' }}>
          <ShieldAlert size={22} /> Pending Responder Verification Apps
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {volunteers.filter(v => v.role === 'pending').length > 0 ? (
            volunteers.filter(v => v.role === 'pending').map(vol => (
              <div key={vol.id} style={innerBlockStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #222', paddingBottom: '12px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>{vol.full_name}</h4>
                    <span style={{ color: '#666', fontSize: '0.85rem' }}>{vol.email} | {vol.phone_number || "No Form Info Submitted"}</span>
                  </div>
                  {vol.phone_number && (
                    <button 
                      onClick={() => handleApproveVolunteer(vol.id)}
                      style={{ ...actionBtnStyle, background: '#00c853' }}
                    >
                      Verify & Approve
                    </button>
                  )}
                </div>

                {vol.phone_number ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', fontSize: '0.9rem' }}>
                    <div>
                      <div style={{ color: '#888', marginBottom: '4px' }}>Personal Specs</div>
                      <div>Age: <span style={{ color: '#fff' }}>{vol.age}</span> | Profession: <span style={{ color: '#fff' }}>{vol.profession}</span></div>
                      <div style={{ color: '#ff4d4d', marginTop: '2px', fontSize: '0.85rem' }}>Blood Group: {vol.blood_group}</div>
                    </div>
                    <div>
                      <div style={{ color: '#888', marginBottom: '4px' }}>Deployment / Ops Metrics</div>
                      <div style={{ color: '#00d2ff' }}>Availability: {vol.availability === 'on-call' ? '24/7 Crisis On-Call' : vol.availability}</div>
                      <div style={{ color: '#aaa', fontSize: '0.8rem' }}>Emerg. Contact: {vol.emergency_contact}</div>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <div style={{ color: '#888', marginBottom: '4px' }}>Experience & Capabilities Context</div>
                      <div style={{ fontSize: '0.85rem', color: '#ddd' }}><strong>Skills:</strong> {vol.primary_skills}</div>
                      <div style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '4px' }}><strong>Prior History:</strong> {vol.prior_experience}</div>
                      <div style={{ fontSize: '0.85rem', color: '#ffaa00', marginTop: '4px' }}><strong>Medical Constraints:</strong> {vol.medical_conditions}</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: '#ff4d4d', fontSize: '0.9rem', fontStyle: 'italic' }}>
                    User has chosen volunteer account type but has not filled out the background onboarding form questionnaire yet.
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={emptyStateStyle}>No pending onboarding profiles require action.</div>
          )}
        </div>
      </div>

      {/* --- SECTION 2: Donor Item Contributions Pipeline Matrix --- */}
      <div style={{ marginTop: '50px' }}>
        <h3 style={{ color: '#a855f7', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px', fontWeight: '700' }}>
          <Package size={22} /> Donor Material Relief Pipeline
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {donorItems.filter(item => item.status !== 'collected').length > 0 ? (
            donorItems.filter(item => item.status !== 'collected').map(item => (
              <div key={item.id} style={{ ...innerBlockStyle, borderLeft: '4px solid #a855f7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>{item.item_details} ({item.quantity} Units)</h4>
                    <span style={{ color: '#666', fontSize: '0.85rem' }}>Donor: {item.donor_name} | Category: <strong style={{ color: '#a855f7' }}>{item.item_category}</strong></span>
                  </div>

                  {/* ডায়নামিক অ্যাকশন বোতাম */}
                  <div>
                    {item.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <select 
                          onChange={(e) => setSelectedVolunteers({...selectedVolunteers, [item.id]: e.target.value})}
                          style={{ padding: '8px 12px', background: '#1c1c1f', border: '1px solid #333', color: '#fff', borderRadius: '6px', fontSize: '0.85rem' }}
                          defaultValue=""
                        >
                          <option value="" disabled>Select Courier...</option>
                          {activeVolunteers.map(v => <option key={v.id} value={v.id}>{v.full_name}</option>)}
                        </select>
                        <button 
                          onClick={() => handleAssignVolunteer(item.id)}
                          style={{ ...smallBtnStyle, background: '#3b82f6', color: 'white' }}
                        >
                          Dispatch Agent
                        </button>
                      </div>
                    )}

                    {item.status === 'assigned' && (
                      <button 
                        onClick={() => handleStockInItem(item.id)}
                        style={{ ...smallBtnStyle, background: '#00c853', color: 'white' }}
                      >
                        Receive & Stock In
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', marginTop: '5px' }}>
                  <span style={{
                    padding: '3px 8px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px',
                    background: item.status === 'pending' ? 'rgba(234,179,8,0.1)' : 'rgba(59,130,246,0.1)',
                    color: item.status === 'pending' ? '#eab308' : '#3b82f6'
                  }}>
                    {item.status === 'pending' ? <Clock size={12} /> : <Truck size={12} />}
                    Relief Status: {item.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div style={emptyStateStyle}>No active donor goods in transit or pending collection.</div>
          )}
        </div>
      </div>

      {/* --- SECTION 3: RELIEF GOODS REQUESTS ALLOCATION MATRIX --- */}
      <div style={{ marginTop: '50px', marginBottom: '40px' }}>
        <h3 style={{ color: '#00ff88', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px', fontWeight: '700' }}>
          <HeartHandshake size={22} /> Incoming Relief Goods & Supply Requests
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {reliefRequests.filter(r => r.status === 'Pending Verification').length > 0 ? (
            reliefRequests.filter(r => r.status === 'Pending Verification').map(req => (
              <div key={req.id} style={{ ...innerBlockStyle, borderLeft: '4px solid #00ff88' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#555', fontWeight: 'bold' }}>ID: {req.id}</span>
                    <h4 style={{ margin: '4px 0 6px 0', fontSize: '1.25rem', color: '#fff' }}>
                      {req.incidentType.replace('RELIEF: ', '📦 Requested Needs: ')}
                    </h4>
                    <div style={{ display: 'flex', gap: '15px', color: '#aaa', fontSize: '0.85rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} color="#ef4444" /> {req.location}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} color="#3b82f6" /> {req.reporterName} ({req.phone})</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => handleUpdateReliefStatus(req.id, 'Rejected')}
                      style={{ ...smallBtnStyle, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                    >
                      <XCircle size={14} /> Deny
                    </button>
                    <button 
                      onClick={() => handleUpdateReliefStatus(req.id, 'Approved for Dispatch')}
                      style={{ ...smallBtnStyle, background: '#00c853', color: 'white' }}
                    >
                      <Check size={14} /> Approve Allocation
                    </button>
                  </div>
                </div>
                <p style={{ margin: '12px 0 0 0', padding: '10px 14px', background: '#09090b', borderRadius: '8px', border: '1px solid #1f1f23', fontSize: '0.9rem', color: '#ccc', lineHeight: '1.5' }}>
                  <strong>Logistics Specs:</strong> {req.description}
                </p>
              </div>
            ))
          ) : (
            <div style={emptyStateStyle}>No active pending goods requests require warehouse allocation.</div>
          )}
        </div>
      </div>

    </div>
  );
};

// Reusable Styles Architecture Definitions
const cardStyle = { background: '#1a1a1a', padding: '30px', borderRadius: '15px', border: '1px solid #333' };
const innerBlockStyle = { background: '#161616', border: '1px solid #252525', padding: '25px', borderRadius: '15px', display: 'flex', flexDirection: 'column', gap: '15px' };
const actionBtnStyle = { background: '#ff4d4d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const smallBtnStyle = { display: 'flex', alignItems: 'center', gap: '6px', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700' };
const emptyStateStyle = { textAlign: 'center', padding: '40px', border: '1px dashed #222', borderRadius: '15px', color: '#555', fontSize: '0.95rem' };

export default AdminDashboard;
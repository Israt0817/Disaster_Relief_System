import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, AlertTriangle, CheckCircle, Clock, Shield, Map as MapIcon, Loader2, Truck } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Custom Map Marker styling to prevent broken Leaflet icons
const disasterIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/564/564619.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35]
});

const VolunteerHub = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Volunteer');
  const [userId, setUserId] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ১. মিক্সড টাস্ক স্টেট (কিছু স্ট্যাটিক এবং বাকিগুলো ডাটাবেজ থেকে রিয়েল-টাইম লোড হবে)
  const [tasks, setTasks] = useState([
    { id: 'static-101', title: "Medical Supply Delivery", location: "Sector 7 - Emergency Shelter", status: "Active", isItemDonation: false },
    { id: 'static-102', title: "Flood Victim Evacuation", location: "Riverside Area - Block C", status: "Active", isItemDonation: false }
  ]);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    // ফিক্স: কিছু সিস্টেমে 'userId' আবার কিছু সিস্টেমে 'id' নামে সেভ থাকতে পারে, দুটোই চেক করা হলো
    const id = localStorage.getItem('userId') || localStorage.getItem('id'); 
    
    if (name) setUserName(name);
    if (id) setUserId(id);

    // Security Guardrail
    if (role !== 'volunteer') {
      alert("Access Denied: You must be an approved volunteer to access this terminal.");
      navigate('/login');
      return;
    }

    // Fetch live infrastructure data for the volunteer view
    const fetchHubData = async () => {
      try {
        const vId = id || 2; // ব্যাকআপ টেস্টিং আইডি ২ যদি লোকালস্টোরেজে আইডি না থাকে
        
        const [disasterRes, sosRes, liveTasksRes] = await Promise.all([
          fetch('http://localhost:5000/api/map/incidents'),
          fetch('http://localhost:5000/api/admin/sos-list'),
          fetch(`http://localhost:5000/api/volunteer/tasks/${vId}`) // ভলান্টিয়ারের নির্দিষ্ট আইডি পুশ করা হচ্ছে
        ]);

        const disasterData = await disasterRes.json();
        const sosData = await sosRes.json();
        const liveTasksData = await liveTasksRes.json();

        // ২. ডাটাবেজ থেকে পাওয়া আইটেম ডোনেশনগুলোকে ফ্রন্টএন্ড টাস্ক ফরমেটে রূপান্তর করা
        const formattedLiveTasks = Array.isArray(liveTasksData) ? liveTasksData.map(item => ({
          id: item.id, 
          title: `Collect: ${item.item_details} (${item.quantity} Pcs)`,
          location: `Donor Name: ${item.donor_name} | Section: ${item.item_category}`,
          status: item.status === 'assigned' ? 'Active' : 'Completed',
          isItemDonation: true 
        })) : [];

        setIncidents(Array.isArray(disasterData) ? disasterData : []);
        setSosAlerts(Array.isArray(sosData) ? sosData : []);
        
        // স্ট্যাটিক টাস্কগুলোর সাথে ডাটাবেজের লাইভ টাস্ক মার্চ করা হচ্ছে
        setTasks(prev => [
          ...prev.filter(t => t.id.toString().startsWith('static-')), 
          ...formattedLiveTasks
        ]);

        setLoading(false);
      } catch (err) {
        console.error("Error loading operational telemetry:", err);
        setIncidents([]);
        setSosAlerts([]);
        setLoading(false);
      }
    };

    fetchHubData();
  }, [navigate]);

  // ৩. টাস্ক কমপ্লিট বা কালেকশন করার হ্যান্ডলার
  const handleCompleteTask = async (task) => {
    if (task.isItemDonation) {
      try {
        const res = await fetch(`http://localhost:5000/api/admin/item-donations/${task.id}/collect`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        
        if (data.success) {
          alert(`Success: Items received and instantly integrated into main warehouse storage!`);
          // ফ্রন্টএন্ডে টাস্কটি সাথে সাথে Completed স্টেটাসে পরিবর্তন করা
          setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: "Completed" } : t));
        } else {
          alert(data.message || "Error finalizing asset collection.");
        }
      } catch (err) {
        console.error("Collection submission failed:", err);
        alert("Network Error updating live assets.");
      }
    } else {
      // স্ট্যাটিক সাধারণ টাস্কের জন্য লজিক
      setTasks(prevTasks => 
        prevTasks.map(t => t.id === task.id ? { ...t, status: "Completed" } : t)
      );
      alert(`Mission #${task.id} marked as complete! Great work.`);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', color: '#00ff88', background: '#030303' }}>
      <Loader2 className="animate-spin" size={40} />
    </div>
  );

  return (
    <div style={{ padding: '40px', color: 'white', background: '#030303', minHeight: '100vh' }}>
      {/* Header Section */}
      <header style={{ marginBottom: '40px', borderBottom: '1px solid #222', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', color: '#00ff88', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={32} /> Volunteer Dispatch Station
          </h1>
          <p style={{ color: '#888', marginTop: '10px' }}>Welcome back, {userName} | Logged In ID: {userId || 'Testing Node'} | Status: Active & Ready</p>
        </div>
        <button 
          onClick={() => { localStorage.clear(); navigate('/login'); }}
          style={{ background: 'transparent', border: '1px solid #ff4d4d', color: '#ff4d4d', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Sign Out
        </button>
      </header>

      {/* Quick Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={cardStyle}>
          <Clock color="#00ff88" size={24} />
          <h4 style={labelStyle}>My Active Missions</h4>
          <h2 style={valueStyle}>{tasks.filter(t => t.status === 'Active').length}</h2>
        </div>
        <div style={cardStyle}>
          <CheckCircle color="#9d4edd" size={24} />
          <h4 style={labelStyle}>Missions Completed</h4>
          <h2 style={valueStyle}>{14 + tasks.filter(t => t.status === 'Completed').length}</h2>
        </div>
        <div style={cardStyle}>
          <AlertTriangle color="#ff4d4d" size={24} />
          <h4 style={labelStyle}>Active Network Crises</h4>
          <h2 style={valueStyle}>{incidents.length}</h2>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px', alignItems: 'start' }}>
        
        {/* Left Side: Field Map */}
        <div>
          <h3 style={{ marginBottom: '20px', color: '#3a86ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapIcon size={20} /> Field Map Operations
          </h3>
          <div style={{ height: '450px', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
            <MapContainer center={[23.8103, 90.4125]} zoom={7} className="leaflet-container">
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              />
              {incidents.map((incident) => (
                <Marker 
                  key={incident.id} 
                  position={[incident.latitude || 23.81, incident.longitude || 90.41]} 
                  icon={disasterIcon}
                >
                  <Popup>
                    <div style={{ color: '#111' }}>
                      <strong style={{ color: '#ff4d4d' }}>{incident.title}</strong><br />
                      <span>Type: {incident.type}</span><br />
                      <span style={{ textTransform: 'uppercase', fontSize: '0.8rem', color: '#9d4edd', fontWeight: 'bold' }}>Severity: {incident.severity}</span>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Right Side: Active Dispatch Task Feed */}
        <div>
          <h3 style={{ marginBottom: '20px', color: '#9d4edd' }}>My Active Dispatch Orders</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '40px' }}>
            {tasks.map(task => (
              <div key={task.id} style={taskItemStyle}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ margin: '0 0 5px 0', color: task.status === 'Completed' ? '#555' : '#fff', textDecoration: task.status === 'Completed' ? 'line-through' : 'none' }}>
                      {task.title}
                    </h4>
                    {task.isItemDonation && task.status === 'Active' && (
                      <span style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                        <Truck size={10} /> PICKUP
                      </span>
                    )}
                  </div>
                  <p style={{ color: '#666', fontSize: '0.85rem', margin: 0 }}>
                    <MapPin size={12} /> {task.location}
                  </p>
                </div>
                {task.status === 'Active' ? (
                  <button onClick={() => handleCompleteTask(task)} style={actionButtonStyle}>
                    {task.isItemDonation ? "Stock In Warehouse" : "Complete Task"}
                  </button>
                ) : (
                  <span style={{ color: '#00ff88', fontSize: '0.85rem', fontWeight: 'bold' }}>✓ Done</span>
                )}
              </div>
            ))}
          </div>

          {/* SOS Broadcast Feed */}
          <h3 style={{ marginBottom: '20px', color: '#ff4d4d', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} /> Nearby Crisis Stream
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '200px', overflowY: 'auto', paddingRight: '5px' }}>
            {sosAlerts.slice(0, 4).map(alert => (
              <div key={alert.id} style={{ background: '#0d0d0f', padding: '15px', borderRadius: '10px', border: '1px solid rgba(255, 77, 77, 0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: '#ff4d4d', fontWeight: 'bold' }}>{alert.request_type?.toUpperCase()}</span>
                  <span style={{ color: '#8b8b8f' }}>Count: {alert.people_count}</span>
                </div>
                <div style={{ color: '#8b8b8f', fontSize: '0.8rem', marginTop: '5px' }}>
                  Target Contact: {alert.victim_name || "Unknown Civilian"}
                </div>
              </div>
            ))}
            {sosAlerts.length === 0 && (
              <div style={{ color: '#444', fontStyle: 'italic', fontSize: '0.9rem' }}>No passive secondary emergency signals detected.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// Styling structures
const cardStyle = { background: '#0d0d0f', padding: '25px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '10px' };
const labelStyle = { color: '#8b8b8f', margin: 0, fontSize: '0.9rem', fontWeight: '400' };
const valueStyle = { fontSize: '2rem', margin: 0, fontWeight: '800' };
const taskItemStyle = { background: '#0d0d0f', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' };
const actionButtonStyle = { background: 'transparent', border: '1px solid #00ff88', color: '#00ff88', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' };

export default VolunteerHub;
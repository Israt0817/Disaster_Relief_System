import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Calendar, Shield, Award, 
  Clock, Heart, Edit3, Save, X, CheckCircle 
} from 'lucide-react';

const VolunteerProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  
  // Base Profile States - Pulling default fallback string info
  const [profile, setProfile] = useState({
    name: localStorage.getItem('userName') || "Tanvir Ahmed",
    email: localStorage.getItem('userEmail') || "tanvir.volunteer@resq.org",
    phone: "+880 1712-345678",
    joinedDate: "October 2025",
    role: "Senior Field Agent",
    status: "Active & Deployable",
    bloodGroup: "O+",
    skills: ["First Aid Certified", "Flood Extraction", "Logistics Routing", "Disaster Comms"],
    metrics: {
      hoursLogged: 142,
      missionsCleared: 18,
      rating: "4.9/5.0"
    }
  });

  // Edit Buffer state holding updates temporarily
  const [editForm, setEditForm] = useState({ ...profile });

  const handleSave = (e) => {
    e.preventDefault();
    setProfile({ ...editForm });
    setIsEditing(false);
    alert("Field Agent Profile updated successfully.");
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#030303', color: 'white', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      
      {/* Page Header Layout */}
      <header style={{ marginBottom: '40px', borderBottom: '1px solid #18181b', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', color: '#00ff88', margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '800' }}>
            <User size={36} /> Agent Profile Terminal
          </h1>
          <p style={{ color: '#888888', marginTop: '10px', fontSize: '1rem' }}>Manage your active responder credentials, skill certifications, and operational telemetry logs.</p>
        </div>
        
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} style={editBtnStyle}>
            <Edit3 size={16} /> Edit Profile Data
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => { setEditForm({ ...profile }); setIsEditing(false); }} style={{ ...actionBtnStyle, borderColor: '#18181b', color: '#ffffff' }}>
              <X size={16} /> Cancel
            </button>
            <button onClick={handleSave} style={{ ...actionBtnStyle, borderColor: '#00ff88', color: '#00ff88', background: 'rgba(0,255,136,0.02)' }}>
              <Save size={16} /> Save Telemetry
            </button>
          </div>
        )}
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Profile Summary Card & Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '10px 0' }}>
              <div style={avatarCircleStyle}>
                <User size={48} color="#00ff88" />
              </div>
              <h2 style={{ margin: '15px 0 4px 0', fontSize: '1.6rem', fontWeight: '800' }}>{profile.name}</h2>
              <span style={{ fontSize: '0.85rem', color: '#a855f7', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', padding: '2px 10px', borderRadius: '12px', fontWeight: '700', textTransform: 'uppercase' }}>
                {profile.role}
              </span>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00ff88', fontSize: '0.9rem', marginTop: '15px', fontWeight: '600' }}>
                <CheckCircle size={14} /> {profile.status}
              </div>
            </div>
          </div>

          {/* Operational Milestones / Achievements panel */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 15px 0', color: '#a855f7', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} /> Service Medals
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={badgeStyle}>🏅 Elite Responder (100+ Hours)</div>
              <div style={badgeStyle}>🛶 Flood Rescue Deployment Vanguard</div>
              <div style={badgeStyle}>❤️ Medical Emergency Relief Hero</div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Realtime Statistics Grid & Edit Forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Statistics Grid Blocks */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <div style={statBoxStyle}>
              <Clock size={20} color="#00ff88" />
              <span style={statLabelStyle}>Hours Contributed</span>
              <h3 style={statValueStyle}>{profile.metrics.hoursLogged} Hrs</h3>
            </div>
            <div style={statBoxStyle}>
              <Shield size={20} color="#a855f7" />
              <span style={statLabelStyle}>Missions Completed</span>
              <h3 style={statValueStyle}>{profile.metrics.missionsCleared} Active</h3>
            </div>
            <div style={statBoxStyle}>
              <Heart size={20} color="#ef4444" />
              <span style={statLabelStyle}>Performance Rating</span>
              <h3 style={statValueStyle}>{profile.metrics.rating}</h3>
            </div>
          </div>

          {/* Master Profile Form Field Layout Card */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 20px 0', borderBottom: '1px solid #18181b', paddingBottom: '10px', fontSize: '1.25rem', fontWeight: '700' }}>
              Core Infrastructure Credentials
            </h3>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={formGridStyle}>
                <div>
                  <label style={labelStyle}><User size={14} /> Full Legal Identity Name</label>
                  <input 
                    type="text" 
                    value={editForm.name} 
                    disabled={!isEditing}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    style={inputStyle(isEditing)} 
                  />
                </div>

                <div>
                  <label style={labelStyle}><Mail size={14} /> Secure Comm Channel Email</label>
                  <input 
                    type="email" 
                    value={editForm.email} 
                    disabled={true} // Lock email string for identification integrity
                    style={inputStyle(false)} 
                  />
                </div>

                <div>
                  <label style={labelStyle}><Phone size={14} /> Crisis Telephone Line</label>
                  <input 
                    type="text" 
                    value={editForm.phone} 
                    disabled={!isEditing}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    style={inputStyle(isEditing)} 
                  />
                </div>

                <div>
                  <label style={labelStyle}><Calendar size={14} /> Network Induction Date</label>
                  <input 
                    type="text" 
                    value={profile.joinedDate} 
                    disabled={true} 
                    style={inputStyle(false)} 
                  />
                </div>

                <div>
                  <label style={labelStyle}><Heart size={14} /> Blood Classification</label>
                  <input 
                    type="text" 
                    value={profile.bloodGroup} 
                    disabled={true} 
                    style={inputStyle(false)} 
                  />
                </div>

                <div>
                  <label style={labelStyle}><Shield size={14} /> System Operational Status</label>
                  {isEditing ? (
                    <select 
                      value={editForm.status} 
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      style={selectStyle}
                    >
                      <option value="Active & Deployable">Active & Deployable</option>
                      <option value="On Standby Logistics Only">On Standby Logistics Only</option>
                      <option value="Inactive / Off Duty Leave">Inactive / Off Duty Leave</option>
                    </select>
                  ) : (
                    <input type="text" value={profile.status} disabled={true} style={inputStyle(false)} />
                  )}
                </div>
              </div>

              {/* Verified Field Capability Tags */}
              <div style={{ marginTop: '10px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: '#888888', fontWeight: '600' }}>Verified Field Tactical Capability Skills:</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {profile.skills.map((skill, index) => (
                    <span key={index} style={skillTagStyle}>✓ {skill}</span>
                  ))}
                </div>
              </div>
            </form>
          </div>

        </div>
      </div>

    </div>
  );
};

// Styling Rules Blocks
const cardStyle = { background: '#0d0d0f', padding: '24px', borderRadius: '14px', border: '1px solid #18181b', boxSizing: 'border-box' };
const avatarCircleStyle = { width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(0, 255, 136, 0.03)', border: '2px dashed #00ff88', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' };
const badgeStyle = { background: '#070708', border: '1px solid #141416', padding: '12px 14px', borderRadius: '8px', fontSize: '0.9rem', color: '#cccccc', fontWeight: '500' };
const statBoxStyle = { background: '#0d0d0f', padding: '20px', borderRadius: '12px', border: '1px solid #18181b', display: 'flex', flexDirection: 'column', gap: '8px', boxSizing: 'border-box' };
const statLabelStyle = { color: '#888888', fontSize: '0.85rem', fontWeight: '600' };
const statValueStyle = { fontSize: '1.6rem', margin: 0, fontWeight: '800' };
const formGridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 24px' };
const labelStyle = { display: 'flex', alignItems: 'center', gap: '6px', color: '#888888', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' };
const inputStyle = (editable) => ({ width: '100%', padding: '12px 16px', background: editable ? '#121214' : '#070708', border: editable ? '1px solid #333' : '1px solid #141416', borderRadius: '8px', color: editable ? '#ffffff' : '#888888', fontSize: '0.95rem', cursor: editable ? 'text' : 'not-allowed', transition: '0.2s border', boxSizing: 'border-box' });
const selectStyle = { width: '100%', padding: '12px 16px', background: '#121214', border: '1px solid #333', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' };
const skillTagStyle = { background: 'rgba(0, 255, 136, 0.05)', color: '#00ff88', border: '1px solid rgba(0, 255, 136, 0.15)', padding: '6px 14px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600' };
const editBtnStyle = { background: 'transparent', border: '1px solid #18181b', color: '#ffffff', padding: '10px 20px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s all' };
const actionBtnStyle = { background: 'transparent', border: '1px solid', padding: '10px 20px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s all' };

export default VolunteerProfile;
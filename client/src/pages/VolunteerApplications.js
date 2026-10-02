import React, { useState, useEffect } from 'react';
import { Users, Check, X, Search, Mail, Loader2 } from 'lucide-react';

const VolunteerApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); 
  
  // FIX: Read current logged-in admin ID for the audit logger payload
  const currentAdminId = localStorage.getItem('userId') || 1; 

  const fetchApplications = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/volunteers');
      const data = await response.json();
      setApplications(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching volunteers:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleAction = async (id, newRole) => {
    try {
      const response = await fetch(`http://localhost:5000/api/volunteers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          role: newRole,
          adminId: currentAdminId // FIX: Added adminId parameter so backend logAction doesn't fail
        })
      });
      if (response.ok) {
        alert(`Application status successfully updated to ${newRole}!`);
        fetchApplications();
      } else {
        alert("Failed to update status on the server.");
      }
    } catch (err) {
      console.error("Database update error:", err);
    }
  };

  const filteredApplications = applications.filter(user => 
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', color: '#a855f7' }}>
      <Loader2 className="animate-spin" size={40} />
    </div>
  );

  return (
    <div style={{ padding: '40px', color: 'white' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Users size={35} color="#a855f7" /> Volunteer Management
        </h1>
        <p style={{ color: '#888', marginTop: '10px' }}>Real-time search and database management</p>
      </header>

      <div style={searchContainerStyle}>
        <Search size={20} color="#666" />
        <input 
          type="text" 
          placeholder="Search by name or email..." 
          style={searchInputStyle} 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
      </div>

      <div style={tableWrapperStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #333', color: '#a855f7' }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Full Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Current Role</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map((user) => (
              <tr key={user.id} style={trStyle}>
                <td style={tdStyle}>#{user.id}</td>
                <td style={tdStyle}><strong>{user.full_name}</strong></td>
                <td style={tdStyle}><Mail size={12} style={{marginRight: '8px'}}/>{user.email}</td>
                <td style={tdStyle}>
                  <span style={{ 
                    color: user.role === 'volunteer' ? '#00ff88' : user.role === 'pending' ? '#eab308' : '#ff4d4d',
                    textTransform: 'capitalize', fontWeight: 'bold'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={tdStyle}>
                  {user.role === 'pending' ? (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => handleAction(user.id, 'volunteer')} style={approveBtnStyle}><Check size={16} /></button>
                      <button onClick={() => handleAction(user.id, 'rejected')} style={rejectBtnStyle}><X size={16} /></button>
                    </div>
                  ) : (
                    <span style={{ color: '#444', fontSize: '0.8rem' }}>Settled</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredApplications.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#555' }}>No results found for "{searchTerm}"</div>
        )}
      </div>
    </div>
  );
};

const searchContainerStyle = { display: 'flex', alignItems: 'center', gap: '10px', background: '#1a1a1a', padding: '12px 20px', borderRadius: '12px', border: '1px solid #333', marginBottom: '30px', maxWidth: '500px' };
const searchInputStyle = { background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%', fontSize: '1rem' };
const tableWrapperStyle = { background: '#111', borderRadius: '20px', border: '1px solid #222', padding: '20px' };
const thStyle = { padding: '15px', fontSize: '0.9rem' };
const tdStyle = { padding: '15px', borderBottom: '1px solid #1a1a1a' };
const trStyle = { transition: '0.3s' };
const approveBtnStyle = { background: 'rgba(0, 255, 136, 0.1)', color: '#00ff88', border: '1px solid #00ff88', padding: '6px', borderRadius: '8px', cursor: 'pointer' };
const rejectBtnStyle = { background: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d', border: '1px solid #ff4d4d', padding: '6px', borderRadius: '8px', cursor: 'pointer' };

export default VolunteerApplications;
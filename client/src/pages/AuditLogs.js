import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ShieldCheck, Activity } from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Auth Check
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
      navigate('/login');
      return;
    }

    // 2. Fetch Data (Fixed setLogs typo)
    fetch('http://localhost:5000/api/logs')
      .then(res => res.json())
      .then(data => {
        // Ensure data is an array before setting state
        setLogs(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error("Logs error:", err));
  }, [navigate]);

  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <header style={{ marginBottom: '30px' }}>
        <h2 className="gradient-text" style={{ 
          fontSize: '2rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          margin: 0 
        }}>
          <ShieldCheck color="#a855f7" /> System Audit Logs
        </h2>
        <p style={{ color: '#888', marginTop: '10px' }}>Tracking all administrative changes in real-time.</p>
      </header>

      <div style={{ 
        background: '#111', 
        borderRadius: '20px', 
        border: '1px solid #222', 
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1a1a1a', textAlign: 'left', borderBottom: '1px solid #333' }}>
              <th style={{ padding: '20px', color: '#a855f7' }}>Admin (ID)</th>
              <th style={{ padding: '20px', color: '#a855f7' }}>Event Type</th>
              <th style={{ padding: '20px', color: '#a855f7' }}>Changes</th>
              <th style={{ padding: '20px', color: '#a855f7' }}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.length > 0 ? logs.map(log => (
              <tr key={log.id} style={{ borderBottom: '1px solid #222', transition: '0.3s' }}>
                <td style={{ padding: '20px' }}>
                  <span style={{ fontWeight: 'bold', color: '#fff' }}>{log.admin_name || 'System'}</span>
                  <div style={{ fontSize: '0.75rem', color: '#666' }}>ID: {log.admin_id}</div>
                </td>
                <td style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={14} color="#00ff88" />
                    {log.action_type}
                  </div>
                </td>
                <td style={{ padding: '20px', fontSize: '0.9rem' }}>
                  {log.old_value && <div style={{ color: '#ff4d4d' }}>Old: {log.old_value}</div>}
                  {log.new_value && <div style={{ color: '#00ff88' }}>New: {log.new_value}</div>}
                  {!log.old_value && !log.new_value && <span style={{ color: '#666' }}>Target ID: {log.target_id}</span>}
                </td>
                <td style={{ padding: '20px', color: '#888' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Clock size={14} /> {new Date(log.timestamp).toLocaleString()}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
                  No security logs recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogs;
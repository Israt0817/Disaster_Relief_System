import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartHandshake, MapPin, CheckCircle, Send, ShoppingBag, Users, Phone } from 'lucide-react';

const RequestRelief = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    recipientName: '',
    phone: '',
    familySize: '1-2 People',
    location: '',
    primaryNeed: 'Dry Rations & Water',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const reliefPayload = {
      id: `REQ-${Date.now().toString().slice(-4)}`,
      reporterName: formData.recipientName,
      phone: formData.phone,
      incidentType: `RELIEF: ${formData.primaryNeed}`,
      location: formData.location,
      severity: 'Medium', // Logistics requests start at standard priority triage
      description: `Family Unit Size: ${formData.familySize}. Needs Breakdown: ${formData.description}`,
      timestamp: 'Just Now',
      status: 'Pending Verification'
    };

    const existingReports = JSON.parse(localStorage.getItem('disasterReports') || '[]');
    localStorage.setItem('disasterReports', JSON.stringify([reliefPayload, ...existingReports]));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#030303', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ background: '#0d0d0f', padding: '40px', borderRadius: '16px', border: '1px solid #18181b', textAlign: 'center', maxWidth: '500px' }}>
          <CheckCircle size={60} color="#00ff88" style={{ margin: '0 auto 20px auto' }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 10px 0' }}>Request Cataloged</h2>
          <p style={{ color: '#aaa', lineHeight: '1.6', marginBottom: '25px', fontSize: '0.95rem' }}>
            Your request for supply provisions has been logged. Admin verification panels are cross-checking supply chain logs to deploy inventory tracking to your sector coordinates.
          </p>
          <button onClick={() => navigate('/')} style={{ background: '#00ff88', color: '#030303', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', width: '100%' }}>
            Back to Home Node
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#030303', color: 'white', fontFamily: 'sans-serif', padding: '40px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: '#0d0d0f', padding: '40px', borderRadius: '16px', border: '1px solid #18181b', maxWidth: '650px', width: '100%', boxSizing: 'border-box' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'inline-flex', background: 'rgba(0, 255, 136, 0.05)', color: '#00ff88', padding: '12px', borderRadius: '50%', marginBottom: '15px', border: '1px solid rgba(0, 255, 136, 0.1)' }}>
            <HeartHandshake size={32} />
          </div>
          <h1 style={{ fontSize: '2.2rem', margin: '0 0 8px 0', fontWeight: '800' }}>Request Relief Support</h1>
          <p style={{ color: '#888', fontSize: '0.95rem' }}>Are you safely extracted but in need of life essentials? Submit an itemized logistical request below.</p>
        </header>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Your Name / Family Head</label>
              <input type="text" required placeholder="Full Name" value={formData.recipientName} onChange={(e) => setFormData({...formData, recipientName: e.target.value})} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}><Phone size={13} style={{ marginRight: '6px' }} /> Active Contact Line</label>
              <input type="text" required placeholder="Mobile phone number" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={labelStyle}><ShoppingBag size={13} style={{ marginRight: '6px' }} /> Primary Resource Deficit</label>
              <select value={formData.primaryNeed} onChange={(e) => setFormData({...formData, primaryNeed: e.target.value})} style={selectStyle}>
                <option value="Dry Rations & Water">🍲 Dry Rations & Pure Water</option>
                <option value="Clothing & Blankets">👕 Clothing & Winter Blankets</option>
                <option value="Medical Supplies">💊 Medical Kits / First Aid</option>
                <option value="Emergency Funding Support">💸 Direct Financial Token Aid</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}><Users size={13} style={{ marginRight: '6px' }} /> Total Dependent Size</label>
              <select value={formData.familySize} onChange={(e) => setFormData({...formData, familySize: e.target.value})} style={selectStyle}>
                <option value="1-2 People">1 - 2 Individuals</option>
                <option value="3-5 People">3 - 5 Individuals</option>
                <option value="6+ People">6+ Large Family Group</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}><MapPin size={13} style={{ marginRight: '6px' }} /> Delivery Drop Point Address</label>
            <input type="text" required placeholder="Specify your current shelter, camp room, or house coordinates..." value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Specific Itemization Details</label>
            <textarea required rows="4" placeholder="Please mention infant requirements, specific medicine formulas needed, sizes for clothes, or urgent monetary status..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} style={textareaStyle}></textarea>
          </div>

          <button type="submit" style={submitBtnStyle}>
            <Send size={14} /> Submit Supply Request
          </button>
        </form>

      </div>
    </div>
  );
};

// Styles Architecture Definitions
const labelStyle = { display: 'flex', alignItems: 'center', color: '#888', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' };
const inputStyle = { width: '100%', padding: '12px 16px', background: '#121214', border: '1px solid #1c1c1f', borderRadius: '8px', color: 'white', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none' };
const selectStyle = { width: '100%', padding: '12px 16px', background: '#121214', border: '1px solid #1c1c1f', borderRadius: '8px', color: 'white', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none' };
const textareaStyle = { width: '100%', padding: '12px 16px', background: '#121214', border: '1px solid #1c1c1f', borderRadius: '8px', color: 'white', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', resize: 'vertical', fontFamily: 'sans-serif' };
const submitBtnStyle = { background: '#00ff88', border: 'none', color: '#030303', padding: '14px', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px', transition: '0.2s all' };

export default RequestRelief;
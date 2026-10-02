import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Common style definitions for consistency
const inputContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  marginBottom: '20px',
  width: '100%',
};

const labelStyle = {
  fontSize: '0.85rem',
  color: '#aaa',
  marginBottom: '6px',
  fontWeight: '500',
  letterSpacing: '0.5px',
};

const inputBaseStyle = {
  width: '100%',
  padding: '12px',
  fontSize: '0.95rem',
  background: '#111111', 
  border: '1px solid #222', 
  borderRadius: '8px',
  color: '#e0e0e0',
  boxSizing: 'border-box',
};

const textareaStyle = {
  ...inputBaseStyle,
  height: '100px', 
  resize: 'none', 
};

const fieldsetStyle = {
  border: 'none',
  padding: 0,
  margin: 0,
  marginBottom: '25px',
  width: '100%',
};

const legendStyle = {
  fontSize: '1.15rem',
  fontWeight: '600',
  color: '#00d2ff', 
  marginBottom: '15px',
  borderBottom: '1px solid #222',
  paddingBottom: '10px',
  width: '100%',
};

const CustomSelect = ({ value, onChange, options, ...props }) => {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{
        ...inputBaseStyle,
        appearance: 'none', 
        backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23aaa\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', 
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 10px center', 
        backgroundSize: '1.2em',
      }}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} style={{ background: '#111', color: '#e0e0e0' }}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

const VerifyVolunteer = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone_number: '',
    nid_passport: '',
    age: '',
    profession: '', // Added to state tracking
    blood_group: '',
    availability: '',
    primary_skills: '',
    prior_experience: '',
    medical_conditions: '',
    emergency_contact: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');

    if (!userId) {
      alert("Session expired. Please log in again.");
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/volunteers/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          ...formData
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("Application submitted! Your profile is pending manual review by our admin board.");
        localStorage.clear(); 
        navigate('/login');
      } else {
        alert(data.message || "Form submission failed.");
      }
    } catch (err) {
      console.error("Verification submit error:", err);
      alert("Could not connect to backend server.");
    }
  };

  return (
    <div className="home-root" style={{ minHeight: '100vh', padding: '40px 20px', boxSizing: 'border-box' }}>
      <div className="glow-bg"></div>
      
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        <div
          className="auth-card"
          style={{
            width: '100%',
            maxWidth: '650px', 
            padding: '40px',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)', 
            border: '1px solid rgba(255, 255, 255, 0.05)', 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxSizing: 'border-box',
            position: 'relative',
            zIndex: 2
          }}
        >
          <div className="logo" style={{ marginBottom: '15px', textAlign: 'center' }}>
            Res<span>Q</span>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '35px', width: '100%' }}>
            <h1 style={{ fontSize: '1.65rem', fontWeight: '700', marginBottom: '10px', color: '#fff' }}>Volunteer Onboarding Profile</h1>
            <p style={{ fontSize: '0.88rem', color: '#888', maxWidth: '500px', margin: '0 auto', lineHeight: '1.4' }}>
              Please fill out your capabilities accurately. This profile dictates deployment matching inside crisis zones.
            </p>
          </div>

          <form onSubmit={handleVerifySubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            
            {/* Section 1: IDENTITY & CRITICAL INFO */}
            <fieldset style={fieldsetStyle}>
              <legend style={legendStyle}>1. Identity & Critical Info</legend>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', width: '100%' }}>
                <div style={inputContainerStyle}>
                  <label style={labelStyle}>Phone Number</label>
                  <input
                    name="phone_number"
                    type="tel"
                    placeholder="+8801---------" 
                    required
                    value={formData.phone_number}
                    onChange={handleChange}
                    style={inputBaseStyle}
                  />
                </div>

                <div style={inputContainerStyle}>
                  <label style={labelStyle}>NID / Passport Number</label>
                  <input
                    name="nid_passport"
                    type="text"
                    placeholder="National Identifier No."
                    required
                    value={formData.nid_passport}
                    onChange={handleChange}
                    style={inputBaseStyle}
                  />
                </div>
              </div>

              {/* TWO COLUMN ROW: AGE & PROFESSION */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '20px', width: '100%' }}>
                <div style={inputContainerStyle}>
                  <label style={labelStyle}>Age</label>
                  <input
                    name="age"
                    type="number"
                    min="18"
                    max="99"
                    placeholder="18"
                    required
                    value={formData.age}
                    onChange={handleChange}
                    style={inputBaseStyle}
                  />
                </div>

                <div style={inputContainerStyle}>
                  <label style={labelStyle}>Profession / Occupation</label>
                  <input
                    name="profession"
                    type="text"
                    placeholder="e.g., Student, Doctor, Engineer, Firefighter..."
                    required
                    value={formData.profession}
                    onChange={handleChange}
                    style={inputBaseStyle}
                  />
                </div>
              </div>

              {/* TWO COLUMN ROW: BLOOD GROUP & AVAILABILITY */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', width: '100%' }}>
                <div style={inputContainerStyle}>
                  <label style={labelStyle}>Blood Group</label>
                  <CustomSelect
                    name="blood_group"
                    required
                    value={formData.blood_group}
                    onChange={handleChange}
                    options={[
                      { value: '', label: 'Select Blood Group' },
                      { value: 'A+', label: 'A+' },
                      { value: 'A-', label: 'A-' },
                      { value: 'B+', label: 'B+' },
                      { value: 'B-', label: 'B-' },
                      { value: 'AB+', label: 'AB+' },
                      { value: 'AB-', label: 'AB-' },
                      { value: 'O+', label: 'O+' },
                      { value: 'O-', label: 'O-' },
                    ]}
                  />
                </div>

                <div style={inputContainerStyle}>
                  <label style={labelStyle}>Deployment Availability</label>
                  <CustomSelect
                    name="availability"
                    required
                    value={formData.availability}
                    onChange={handleChange}
                    options={[
                      { value: '', label: 'Select Availability' },
                      { value: 'on-call', label: '24/7 On-Call Crisis Alert' },
                      { value: 'weekends', label: 'Weekends Only' },
                      { value: 'remote', label: 'Remote Coordination Only' },
                    ]}
                  />
                </div>
              </div>
            </fieldset>

            {/* Section 2: CAPABILITIES & FIELD EXPERIENCE */}
            <fieldset style={fieldsetStyle}>
              <legend style={legendStyle}>2. Capabilities & Field Experience</legend>

              <div style={inputContainerStyle}>
                <label style={labelStyle}>Primary Skills / Certifications</label>
                <textarea
                  name="primary_skills"
                  placeholder="e.g., Medical (Paramedic), Search & Rescue (Diving), Heavy Machinery Ops..."
                  required
                  value={formData.primary_skills}
                  onChange={handleChange}
                  style={textareaStyle}
                />
              </div>

              <div style={inputContainerStyle}>
                <label style={labelStyle}>Prior Field Experience</label>
                <textarea
                  name="prior_experience"
                  placeholder="Detail active roles in disaster relief, firefighting, flood management, etc."
                  required
                  value={formData.prior_experience}
                  onChange={handleChange}
                  style={textareaStyle}
                />
              </div>
            </fieldset>

            {/* Section 3: HEALTH & SAFETY */}
            <fieldset style={fieldsetStyle}>
              <legend style={legendStyle}>3. Field Safety Metrics</legend>

              <div style={inputContainerStyle}>
                <label style={labelStyle}>Medical Conditions / Physical Limitations (Write 'None' if clear)</label>
                <textarea
                  name="medical_conditions"
                  placeholder="List asthma, drug allergies, heart criteria, or write 'None'..."
                  required
                  value={formData.medical_conditions}
                  onChange={handleChange}
                  style={textareaStyle}
                />
              </div>

              <div style={inputContainerStyle}>
                <label style={labelStyle}>Emergency Contact (Name, Relation, Phone)</label>
                <input
                  name="emergency_contact"
                  type="text"
                  placeholder="e.g., Rahat Rahman (Father) - +88017--------"
                  required
                  value={formData.emergency_contact}
                  onChange={handleChange}
                  style={inputBaseStyle}
                />
              </div>
            </fieldset>

            {/* Form Submit Button */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px', width: '100%' }}>
              <button type="submit" className="btn-main" style={{ width: '100%', padding: '14px' }}>
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyVolunteer;
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(''); // নতুন স্টেট
  const [password, setPassword] = useState('');
  const [chosenRole, setChosenRole] = useState('volunteer'); // Default selection
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          full_name: fullName, 
          email, 
          phone_number: phoneNumber, // ব্যাকঅ্যান্ডে পাঠানো হচ্ছে
          password,
          role: chosenRole 
        })
      });

      const data = await response.json();

      if (response.ok) {
        // AUTOMATIC SESSION SETUP FOR IMMEDIATE FORM ACCESS
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userName', fullName);
        localStorage.setItem('userRole', data.role);

        if (data.role === 'pending') {
          // Send unverified volunteers INSTANTLY to the form
          alert("Registration successful! Please complete your verification profile now.");
          navigate('/verify-volunteer');
        } else {
          // Donors go straight to their dashboard or home
          alert("Registration successful!");
          navigate('/login');
        }
      } else {
        alert(data.message || "Registration failed.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      alert("Cannot connect to server.");
    }
  };

  return (
    <div className="home-root">
      <div className="glow-bg"></div>
      <div className="auth-container">
        <div className="auth-card">
          <div className="logo" style={{ marginBottom: '30px', textAlign: 'center' }}>
            Res<span>Q</span>
          </div>
          <h2 style={{ textAlign: 'center' }}>Create Account</h2>
          
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                required 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                placeholder="john@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>

            {/* 🆕 নতুন ফোন নম্বর ফিল্ড */}
            <div className="form-group">
              <label>Phone Number</label>
              <input 
                type="text" 
                placeholder="017XXXXXXXX" 
                required 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)} 
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>

            {/* NEW ROLE SELECT DROPDOWN */}
            <div className="form-group">
              <label>Join As</label>
              <select 
                value={chosenRole} 
                onChange={(e) => setChosenRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '1rem',
                  marginTop: '5px'
                }}
              >
                <option value="volunteer">Volunteer (Requires Approval)</option>
                <option value="donor">Donor (Instant Access)</option>
              </select>
            </div>
            
            <button type="submit" className="btn-main" style={{ width: '100%', marginTop: '10px' }}>
              Register Account
            </button>
          </form>

          <div className="auth-footer">
            <span>Already have an account? </span>
            <Link to="/login" className="auth-link">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
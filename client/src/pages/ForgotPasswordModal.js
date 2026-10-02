import React, { useState } from 'react';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1); // Step 1: Info, Step 2: OTP, Step 3: New Password
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // স্টেপ ১: ইমেইল এবং ফোন নাম্বার চেক করা
  const handleVerifyInfo = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('http://localhost:5000/api/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone_number: phoneNumber })
      });

      const data = await res.json();

      if (res.ok) {
        setGeneratedOtp(data.otp); // ব্যাকএন্ড থেকে পাঠানো টেস্ট ওটিপি সেভ করা
        setStep(2); // ওটিপি স্ক্রিনে নিয়ে যাওয়া
        setMessage('');
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      setMessage('❌ Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  // স্টেপ ২: ওটিপি কোড মেলানো
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otpInput.trim() === generatedOtp.toString()) {
      setStep(3); // পাসওয়ার্ড চেঞ্জ স্ক্রিনে নিয়ে যাওয়া
      setMessage('');
    } else {
      setMessage('❌ Invalid verification code. Please check again.');
    }
  };

  // স্টেপ ৩: নতুন পাসওয়ার্ড ডাটাবেজে সেভ করা
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('http://localhost:5000/api/direct-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('✅ Password updated successfully! Closing modal...');
        setTimeout(() => {
          setStep(1);
          setEmail('');
          setPhoneNumber('');
          setOtpInput('');
          setNewPassword('');
          onClose();
        }, 2500);
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      setMessage('❌ Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0, 0, 0, 0.85)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)'
    }}>
      <div style={{
        background: '#161619', border: '1px solid #27272a', padding: '30px',
        borderRadius: '16px', width: '100%', maxWidth: '400px', boxSizing: 'border-box'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '1.4rem' }}>
          {step === 1 && 'Identity Verification'}
          {step === 2 && 'Enter Verification Code'}
          {step === 3 && 'Set New Password'}
        </h3>

        {step === 1 && (
          <form onSubmit={handleVerifyInfo} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ color: '#a1a1aa', fontSize: '0.9rem', margin: 0 }}>Provide your profile parameters to receive a verification code.</p>
            <div>
              <label style={{ color: '#a1a1aa', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>Registered Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@resq.gov" style={inputStyle} />
            </div>
            <div>
              <label style={{ color: '#a1a1aa', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>Registered Phone Number</label>
              <input type="text" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="017XXXXXXXX" style={inputStyle} />
            </div>
            {message && <div style={{ fontSize: '0.85rem', color: '#f43f5e', background: 'rgba(244,63,94,0.1)', padding: '10px', borderRadius: '6px' }}>{message}</div>}
            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button type="button" onClick={onClose} style={btnSecondaryStyle}>Cancel</button>
              <button type="submit" disabled={loading} style={btnPrimaryStyle}>{loading ? 'Checking...' : 'Send Code'}</button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ color: '#a855f7', fontSize: '0.9rem', margin: 0, fontWeight: 'bold', background: 'rgba(168,85,247,0.1)', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
              🔑 LOCALHOST TEST CODE: {generatedOtp}
            </p>
            <p style={{ color: '#a1a1aa', fontSize: '0.85rem', margin: 0 }}>Enter the verification code shown above to verify it's you.</p>
            <div>
              <label style={{ color: '#a1a1aa', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>6-Digit Code</label>
              <input type="text" maxLength="6" required value={otpInput} onChange={(e) => setOtpInput(e.target.value)} placeholder="000000" style={{...inputStyle, letterSpacing: '8px', textAlign: 'center', fontSize: '1.2rem'}} />
            </div>
            {message && <div style={{ fontSize: '0.85rem', color: '#f43f5e', background: 'rgba(244,63,94,0.1)', padding: '10px', borderRadius: '6px' }}>{message}</div>}
            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button type="button" onClick={() => setStep(1)} style={btnSecondaryStyle}>Back</button>
              <button type="submit" style={btnPrimaryStyle}>Verify Code</button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ color: '#a1a1aa', fontSize: '0.9rem', margin: 0 }}>Create a strong new password for your account.</p>
            <div>
              <label style={{ color: '#a1a1aa', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>New Password</label>
              <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
            </div>
            {message && <div style={{ fontSize: '0.85rem', color: message.startsWith('❌') ? '#f43f5e' : '#10b981', padding: '10px', borderRadius: '6px' }}>{message}</div>}
            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button type="submit" disabled={loading} style={btnPrimaryStyle}>{loading ? 'Updating...' : 'Reset Password'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const inputStyle = { width: '100%', padding: '12px', background: '#1c1c1f', border: '1px solid #27272a', borderRadius: '8px', color: '#fff', outline: 'none', boxSizing: 'border-box' };
const btnPrimaryStyle = { flex: 1, padding: '12px', background: '#a855f7', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600' };
const btnSecondaryStyle = { flex: 1, padding: '12px', background: 'transparent', border: '1px solid #27272a', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600' };

export default ForgotPasswordModal;
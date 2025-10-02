import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OtpPage = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!otp.trim()) {
      setError('OTP code is required');
      return;
    }

    if (otp.length < 4) {
      setError('OTP code must be at least 4 characters');
      return;
    }

    // Clear any previous errors
    setError('');
    
    // Simulate OTP validation (static check)
    if (otp === '1234') {
      setSuccess('OTP verified successfully!');
      // In a real app, you might navigate to a dashboard or home page
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError('Invalid OTP code');
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="container">
      <h1>Enter OTP Code</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="otp">One-Time Password:</label>
          <input
            type="text"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter your OTP code"
            maxLength="6"
          />
        </div>
        
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        
        <button type="submit">Submit OTP</button>
        <button 
          type="button" 
          onClick={handleBackToLogin}
          style={{ marginTop: '0.5rem', backgroundColor: '#6c757d' }}
        >
          Back to Login
        </button>
      </form>
      
      <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666', textAlign: 'center' }}>
        <p>Demo: Use "1234" as the OTP code</p>
      </div>
    </div>
  );
};

export default OtpPage;

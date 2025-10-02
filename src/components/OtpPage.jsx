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
    <div className="auth-card">
      <h1 className="auth-title">One Time Password</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            id="otp"
            className="form-input"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter your OTP code"
            maxLength="6"
          />
        </div>
        
        {error && <div className="message message-error">{error}</div>}
        {success && <div className="message message-success">{success}</div>}
        
        <button type="submit" className="btn btn-primary">Submit OTP</button>
        <button 
          type="button" 
          onClick={handleBackToLogin}
          className="btn btn-secondary"
        >
          Back to Login
        </button>
      </form>
      
      <div className="demo-hint">
        <p>For Testing : Use "1234" as the OTP code</p>
      </div>
    </div>
  );
};

export default OtpPage;

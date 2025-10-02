import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OtpPage = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleOtpChange = (e) => {
    const value = e.target.value;
    // Only allow numeric input (0-9)
    const numericValue = value.replace(/[^0-9]/g, '');
    setOtp(numericValue);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!otp.trim()) {
      setError('OTP code is required');
      return;
    }

    if (otp.length !== 6) {
      setError('OTP code must be exactly 6 digits');
      return;
    }

    // Clear any previous errors
    setError('');
    
    // Simulate OTP validation (static check)
    if (otp === '123456') {
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
            onChange={handleOtpChange}
            placeholder="Enter 6-digit OTP code"
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
        <p>For Testing : Use "123456" as the OTP code</p>
      </div>
    </div>
  );
};

export default OtpPage;

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
const OtpPage = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { user_id, email } = location.state || {};
  const [isGenerating, setIsGenerating] = useState(false); 
  const [sessionId, setSessionId] = useState(null);
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const handleOtpChange = (e) => {
    const value = e.target.value;
    // Only allow numeric input (0-9)
    const numericValue = value.replace(/[^0-9]/g, '');
    setOtp(numericValue);
  };
  const API_BASE = "http://127.0.0.1:5000";

  const generateotp = async() => {
    setIsGenerating(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_BASE}/generate_otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to generate OTP');

      setGeneratedOtp(data.otp);
      setSessionId(data.sessionId);

      const otpWindow = window.open('', '_blank');
      if (otpWindow) {
        otpWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Your OTP Code</title>
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  font-family: 'Segoe UI', sans-serif;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }
                .otp-container {
                  background: white;
                  padding: 3rem;
                  border-radius: 20px;
                  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                  text-align: center;
                }
                .otp-code {
                  font-size: 3rem;
                  font-weight: bold;
                  color: #667eea;
                  margin: 2rem 0;
                  font-family: 'Courier New', monospace;
                }
              </style>
            </head>
            <body>
              <div class="otp-container">
                <h1>Your One-Time Password</h1>
                <div class="otp-code">${data.otp}</div>
                <p>Expires in <span id="countdown">15</span> seconds</p>
              </div>
              <script>
                let timeLeft = 15;
                const countdown = document.getElementById('countdown');
                const interval = setInterval(() => {
                  timeLeft--;
                  countdown.textContent = timeLeft;
                  if (timeLeft <= 0) {
                    clearInterval(interval);
                    countdown.textContent = 'Expired';
                    setTimeout(() => window.close(), 2000);
                  }
                }, 1000);
              </script>
            </body>
          </html>
        `);
      }

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };
  const handleSubmit = async (e) => {
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

  if (!user_id || !sessionId) {
    setError('Missing user ID or session ID');
    return;
  }

  // Clear previous messages
  setError('');
  setSuccess('');

  try {
    const res = await fetch(`${API_BASE}/verify_otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id,     
        otp          
      }),
    });

    const data = await res.json();

    if (data.success) {
      setSuccess('OTP verified successfully!');
      setOtp('');
      setSessionId(null);
      setGeneratedOtp(null); // if you have this state
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } else {
      setError(data.error || 'Verification failed');
    }

  } catch (err) {
    console.error(err);
    setError('Failed to verify OTP.');
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
        <button type="button" className="btn btn-generate" onClick={generateotp}>Generate OTP</button>
        <button type="submit" className="btn btn-primary">Submit OTP</button>
        <button 
          type="button" 
          onClick={handleBackToLogin}
          className="btn btn-secondary"
        >
          Back to Login
        </button>
      </form>
      
    </div>
  );
};

export default OtpPage;
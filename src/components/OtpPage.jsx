// =============================================================================
// OTP VERIFICATION PAGE COMPONENT
// =============================================================================
// This component handles the second factor of authentication (2FA)
// Features 6 individual input boxes for OTP entry with auto-navigation
// Generates OTP popup window and verifies user input

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * OtpPage Component
 * Handles OTP generation, display, and verification
 * Features modern 6-box input design with auto-navigation
 * Displays OTP in popup window with countdown timer
 */
const OtpPage = () => {
  // State management for OTP input and verification
  const [otp, setOtp] = useState(['', '', '', '', '', '']);  // Array of 6 OTP digits
  const [error, setError] = useState('');                    // Error messages
  const [success, setSuccess] = useState('');                // Success messages
  const navigate = useNavigate();                            // React Router navigation
  const location = useLocation();                            // Access to route state
  const { user_id, email } = location.state || {};          // User data from login
  const [isGenerating, setIsGenerating] = useState(false);   // OTP generation loading state
  const [sessionId, setSessionId] = useState(null);          // Session tracking
  const [generatedOtp, setGeneratedOtp] = useState(null);    // Generated OTP for display
  
  /**
   * handleOtpChange Function
   * Handles input changes for individual OTP boxes
   * Only allows numeric input and auto-navigates to next box
   * Prevents multiple characters in single input
   */
  const handleOtpChange = (index, value) => {
    // Only allow numeric input (0-9)
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = numericValue;
      setOtp(newOtp);
      
      // Auto-focus next input when digit is entered
      if (numericValue && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };
  
  /**
   * handleKeyDown Function
   * Handles keyboard navigation between OTP input boxes
   * Enables backspace to move to previous input when current is empty
   */
  const handleKeyDown = (index, e) => {
    // Handle backspace to move to previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };
  const API_BASE = "http://127.0.0.1:5000";

  /**
   * generateotp Function
   * Generates a new OTP for the current user
   * Creates popup window with OTP display and countdown timer
   * Handles loading states and error management
   */
  const generateotp = async() => {
    setIsGenerating(true);
    setError('');
    setSuccess('');

    try {
      // Request OTP generation from backend
      const res = await fetch(`${API_BASE}/generate_otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id,email })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to generate OTP');

      // Store OTP data for verification
      setGeneratedOtp(data.otp);
      setSessionId(data.sessionId);

      // Create popup window to display OTP with countdown timer
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
                <p>Expires in <span id="countdown">30</span> seconds</p>
              </div>
              <script>
                // 30-second countdown timer
                let timeLeft = 30;
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

  // Convert array to string for validation
  const otpString = otp.join('');
  
  // Basic validation
  if (!otpString.trim()) {
    setError('OTP code is required');
    return;
  }

  if (otpString.length !== 6) {
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
        otp: otpString          
      }),
    });

    const data = await res.json();

    if (data.success) {
      setSuccess('OTP verified successfully!');
      setOtp(['', '', '', '', '', '']);
      setSessionId(null);
      setGeneratedOtp(null); // if you have this state
      setTimeout(() => {
        navigate('/game');
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
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                id={`otp-${index}`}
                className="otp-input"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                maxLength="1"
                autoComplete="off"
              />
            ))}
          </div>
        </div>
        
        {error && <div className="message message-error">{error}</div>}
        {success && <div className="message message-success">{success}</div>}
        
        <div className="button-group">
          <button type="button" className="btn btn-generate" onClick={generateotp}>
            {isGenerating ? 'Generating...' : 'Generate OTP'}
          </button>
          <button type="submit" className="btn btn-primary">Submit OTP</button>
        </div>
        
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
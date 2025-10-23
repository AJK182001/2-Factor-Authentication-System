// =============================================================================
// LOGIN PAGE COMPONENT
// =============================================================================
// This component handles user authentication and determines the next step
// in the 2FA process based on user role (admin or regular user).

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/*
 * LoginPage Component
 * Handles user authentication with username/password
 * Supports both admin and regular user login
 * Redirects to appropriate page based on user role
 */
const LoginPage = () => {
  // State management for form inputs and user feedback
  const [username, setUsername] = useState('');        // User's email/username
  const [password, setPassword] = useState('');        // User's password
  const [error, setError] = useState('');              // Error messages
  const [success, setSuccess] = useState('');          // Success messages
  const navigate = useNavigate();                      // React Router navigation

  /*
   * handleSubmit Function
   * Processes user login form submission
   * Validates credentials with backend API
   * Routes user based on their role (admin vs regular user)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validation
    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    try {
      // Send login request to backend API
      const response = await fetch('http://127.0.0.1:5000/check_login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: username,
          password: password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Route based on user role
        if (data.role === 'admin') {
          // Admin users go directly to admin panel
          setSuccess('Admin login successful! Redirecting...');
          setTimeout(() => navigate('/admin'), 1200);
        } else {
          // Regular users must complete 2FA process
          setSuccess('Verification successful! Redirecting to OTP...');
          setTimeout(() =>{      
            navigate('/otp',{state: {user_id: data.user_id, email: username}})
              }, 1500);
        }
      } else {
        setError(data.error || 'Invalid username or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Server error. Please try again.');
    }
  };

  return (
    <div className="auth-card">
      <h1 className="auth-title">Login</h1>
      <form onSubmit={handleSubmit}>
        {/* Username/Email input field */}
        <div className="form-group">
          <input
            type="text"
            id="username"
            className="form-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
        </div>

        {/* Password input field */}
        <div className="form-group">
          <input
            type="password"
            id="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>

        {/* Error and success message display */}
        {error && <div className="message message-error">{error}</div>}
        {success && <div className="message message-success">{success}</div>}

        {/* Login submit button */}
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;

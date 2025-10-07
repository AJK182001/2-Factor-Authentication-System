import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase'; // adjust path to your firebase.js

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    // Check for admin credentials first
    if (username === 'admin' && password === 'admin1234') {
      setError('');
      setSuccess('Admin login successful! Redirecting to Admin Panel...');
      setTimeout(() => {
        navigate('/admin');
      }, 1200);
      return;
    }

    try {
      // Query Firestore users collection
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('email', '==', username),
        where('password', '==', password)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Clear errors and show success
        setError('');
        setSuccess('Verification successful! Redirecting to OTP...');
        
        // Redirect to OTP after short delay
        setTimeout(() => {
          navigate('/otp');
        }, 1500);
      } else {
        setError('Invalid username or password');
        setSuccess('');
      }
    } catch (err) {
      console.error('Error checking login:', err);
      setError('Something went wrong. Please try again.');
      setSuccess('');
    }
  };

  return (
    <div className="auth-card">
      <h1 className="auth-title">Login</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username" className="form-label">Username</label>
          <input
            type="text"
            id="username"
            className="form-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            id="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>
        
        {error && <div className="message message-error">{error}</div>}
        {success && <div className="message message-success">{success}</div>}
        
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;

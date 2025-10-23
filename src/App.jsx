// =============================================================================
// 2-FACTOR AUTHENTICATION SYSTEM - MAIN APPLICATION
// =============================================================================
// This is the main React application component that handles routing
// between different pages of the 2FA system with Snake Game integration.

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import OtpPage from './components/OtpPage';
import './App.css';
import AdminPage from './components/AdminPage';
import Game from './components/Game';

/**
 * Main App Component
 * Sets up routing for the entire 2FA application
 * Routes:
 * - "/" → redirects to "/login"
 * - "/login" → Login page for user authentication
 * - "/otp" → OTP verification page
 * - "/admin" → Admin panel for user management
 * - "/game" → Protected Snake game (requires 2FA)
 */
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Default route redirects to login page */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* User authentication page */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* OTP verification page for 2FA */}
          <Route path="/otp" element={<OtpPage />} />
          
          {/* Admin panel for user management */}
          <Route path="/admin" element={<AdminPage />} />
          
          {/* Protected Snake game - requires successful 2FA */}
          <Route path="/game" element={<Game />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

// Also update Login.js with hints
import React, { useState } from "react";
import { login } from "../firebase";
import "./Login.css";

function Login({ onLoginSuccess, onSwitchToSignup }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validation
    if (!username || !password) {
      setError("Both fields are required");
      setLoading(false);
      return;
    }

    try {
      const result = await login(username, password);
      
      if (result.success) {
        onLoginSuccess(result.user);
      } else {
        if (result.error.includes("user-not-found") || result.error.includes("auth/user-not-found")) {
          setError("Username not found. Please sign up first.");
        } else if (result.error.includes("wrong-password") || result.error.includes("auth/invalid-credential")) {
          setError("Wrong password. Please try again.");
        } else if (result.error.includes("invalid-email") || result.error.includes("auth/invalid-email")) {
          setError("Invalid username format.");
        } else {
          setError("Wrong password. Please try again.");
        }
      }
    } catch (err) {
      setError("Wrong password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <h1 className="logo">EDUDICE</h1>
      
      <h2 className="login-title">LOG IN</h2>
      
      <form onSubmit={handleLogin} className="login-form">
        <div className="input-group">
          <span className="input-label">USERNAME</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-field"
            disabled={loading}
            placeholder="Enter your username"
          />
        </div>

        <div className="input-group">
          <span className="input-label">PASSWORD</span>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field password-field"
              disabled={loading}
              placeholder="Enter your password"
            />
            <span 
              className="password-toggle" 
              onClick={togglePasswordVisibility}
              role="button"
              tabIndex={0}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </span>
          </div>
        </div>

        <p className="signup-link" onClick={onSwitchToSignup}>
          DON'T HAVE ACCOUNT? SIGN UP
        </p>

        <button 
          type="submit" 
          className="login-button"
          disabled={loading}
        >
          {loading ? "LOGGING IN..." : "LOGIN"}
        </button>

        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
}

export default Login;
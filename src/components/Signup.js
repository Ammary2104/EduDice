import React, { useState } from "react";
import { signUp } from "../firebase";
import "./Signup.css";

function Signup({ onSignupSuccess, onSwitchToLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validation
    if (!username || !password || !confirmPassword) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters");
      setLoading(false);
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      setLoading(false);
      return;
    }

    if (/\s/.test(username)) {
      setError("Username cannot contain spaces");
      setLoading(false);
      return;
    }

    try {
      const result = await signUp(username, password);
      
      if (result.success) {
        onSignupSuccess(result.user);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="signup-container">
      <h1 className="logo">EDUDICE</h1>
      
      <h2 className="signup-title">SIGN UP</h2>
      
      <form onSubmit={handleSignUp} className="signup-form">
        <div className="input-group">
          <span className="input-label">USERNAME</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-field"
            disabled={loading}
            placeholder="Enter your username (min. 3 characters)"
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
              placeholder="Min. 6 characters"
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

        <div className="input-group">
          <span className="input-label">CONFIRM PASSWORD</span>
          <div className="password-input-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field password-field"
              disabled={loading}
              placeholder="Re-enter your password"
            />
            <span 
              className="password-toggle" 
              onClick={toggleConfirmPasswordVisibility}
              role="button"
              tabIndex={0}
            >
              {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
            </span>
          </div>
        </div>

        <p className="login-link" onClick={onSwitchToLogin}>
          ALREADY HAVE ACCOUNT? LOG IN
        </p>

        <button 
          type="submit" 
          className="signup-button"
          disabled={loading}
        >
          {loading ? "CREATING ACCOUNT..." : "SIGNUP"}
        </button>

        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
}

export default Signup;
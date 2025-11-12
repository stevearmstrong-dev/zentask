import React, { useState } from 'react';
import { supabase } from '../../services/supabase';

function SignIn({ onSignInSuccess, onSwitchToSignUp, onSwitchToReset }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('Please enter your email');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!formData.password) {
      setError('Please enter your password');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) throw error;

      // Clear form
      setFormData({
        email: '',
        password: ''
      });

      // Call success callback
      if (onSignInSuccess) {
        onSignInSuccess(data.user);
      }

    } catch (error) {
      console.error('Error signing in:', error);

      if (error.message.includes('Email not confirmed')) {
        setError('Please verify your email before signing in. Check your inbox for the verification link.');
      } else if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(error.message || 'Failed to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  return (
    <div className="auth-overlay">
      <div className="auth-container">
        <div className="auth-content">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">
            Sign in to access your tasks from anywhere
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <input
              type="email"
              name="email"
              className="auth-input"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleInputChange}
              disabled={loading}
              autoFocus
            />

            <input
              type="password"
              name="password"
              className="auth-input"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              disabled={loading}
            />

            {error && <p className="auth-error">{error}</p>}

            <button
              type="button"
              className="forgot-password-link"
              onClick={onSwitchToReset}
              disabled={loading}
            >
              Forgot password?
            </button>

            <button
              type="submit"
              className="auth-button primary-button"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            <p className="auth-switch">
              Don't have an account?{' '}
              <button
                className="auth-link"
                onClick={onSwitchToSignUp}
                disabled={loading}
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;

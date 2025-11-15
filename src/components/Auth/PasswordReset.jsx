import React, { useState } from 'react';
import { supabase } from '../../services/supabase';

function PasswordReset({ onBackToSignIn }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = () => {
    if (!email.trim()) {
      setError('Please enter your email');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail()) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/react-todo-app`
      });

      if (error) throw error;

      setEmailSent(true);
      setEmail('');

    } catch (error) {
      console.error('Error sending reset email:', error);
      setError(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="auth-overlay">
        <div className="auth-container">
          <div className="auth-content">
            <div className="verification-success">
              <div className="success-icon">✉️</div>
              <h2 className="auth-title">Check Your Email</h2>
              <p className="verification-message">
                We've sent a password reset link to your email.
              </p>
              <p className="verification-subtitle">
                Click the link in the email to reset your password.
              </p>
              <button
                className="auth-button secondary-button"
                onClick={onBackToSignIn}
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-overlay">
      <div className="auth-container">
        <div className="auth-content">
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">
            Enter your email and we'll send you a link to reset your password
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <input
              type="email"
              className="auth-input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              disabled={loading}
              autoFocus
            />

            {error && <p className="auth-error">{error}</p>}

            <button
              type="submit"
              className="auth-button primary-button"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="auth-footer">
            <p className="auth-switch">
              Remember your password?{' '}
              <button
                className="auth-link"
                onClick={onBackToSignIn}
                disabled={loading}
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PasswordReset;

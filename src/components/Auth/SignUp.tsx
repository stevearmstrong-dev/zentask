import React, { useState } from 'react';
import { supabase } from '../../services/supabase';

interface SignUpProps {
  onSignUpSuccess?: () => void;
  onSwitchToSignIn?: () => void;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function SignUp({ onSignUpSuccess, onSwitchToSignIn }: SignUpProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState<boolean>(false);

  const validateForm = (): boolean => {
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
      setError('Please enter a password');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name || formData.email.split('@')[0]
          },
          emailRedirectTo: `${window.location.origin}/react-todo-app`
        }
      });

      if (error) throw error;

      // Show verification message
      setShowVerificationMessage(true);

      // Clear form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });

      // Call success callback after showing message
      setTimeout(() => {
        if (onSignUpSuccess) {
          onSignUpSuccess();
        }
      }, 3000);

    } catch (error: any) {
      console.error('Error signing up:', error);
      setError(error.message || 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  if (showVerificationMessage) {
    return (
      <div className="auth-overlay">
        <div className="auth-container">
          <div className="auth-content">
            <div className="verification-success">
              <div className="success-icon">✉️</div>
              <h2 className="auth-title">Check Your Email</h2>
              <p className="verification-message">
                We've sent a verification link to <strong>{formData.email}</strong>
              </p>
              <p className="verification-subtitle">
                Click the link in the email to verify your account and start using the app.
              </p>
              <button
                className="auth-button secondary-button"
                onClick={onSwitchToSignIn}
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
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">
            Sign up to sync your tasks across all devices
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <input
              type="text"
              name="name"
              className="auth-input"
              placeholder="Your name (optional)"
              value={formData.name}
              onChange={handleInputChange}
              disabled={loading}
            />

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
              placeholder="Password (min 6 characters)"
              value={formData.password}
              onChange={handleInputChange}
              disabled={loading}
            />

            <input
              type="password"
              name="confirmPassword"
              className="auth-input"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              disabled={loading}
            />

            {error && <p className="auth-error">{error}</p>}

            <button
              type="submit"
              className="auth-button primary-button"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="auth-footer">
            <p className="auth-switch">
              Already have an account?{' '}
              <button
                className="auth-link"
                onClick={onSwitchToSignIn}
                disabled={loading}
              >
                Sign In
              </button>
            </p>
          </div>

          <p className="auth-privacy-note">
            By signing up, you agree to receive verification emails.
            We don't send spam or share your data.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;

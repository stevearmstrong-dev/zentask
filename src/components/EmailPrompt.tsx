import React, { useState } from 'react';

interface EmailPromptProps {
  onComplete: (email: string) => void;
}

function EmailPrompt({ onComplete }: EmailPromptProps) {
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Store email in localStorage
    localStorage.setItem('userEmail', email);

    // Call onComplete with the email
    onComplete(email);
  };

  const handleSkip = (): void => {
    // User can skip and use app without sync
    onComplete('');
  };

  return (
    <div className="email-prompt-overlay">
      <div className="email-prompt-container">
        <button className="skip-button" onClick={handleSkip}>Skip</button>

        <div className="email-prompt-content">
          <h1 className="email-prompt-title">Welcome!</h1>
          <p className="email-prompt-subtitle">
            Enter your email to sync your tasks across all devices
          </p>

          <form onSubmit={handleSubmit} className="email-form">
            <input
              type="email"
              className="email-input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              autoFocus
            />
            {error && <p className="email-error">{error}</p>}

            <button type="submit" className="email-submit-button">
              Continue
            </button>
          </form>

          <p className="email-privacy-note">
            Your email is only used to sync your tasks. We don't send emails or share your data.
          </p>
        </div>
      </div>
    </div>
  );
}

export default EmailPrompt;

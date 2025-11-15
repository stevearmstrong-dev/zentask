import React, { useState, useEffect } from 'react';
import googleCalendarService from '../services/googleCalendar';

function GoogleCalendarButton({ onSignInChange }) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    // Initialize Google API on component mount
    googleCalendarService
      .init()
      .then((signedIn) => {
        setIsSignedIn(signedIn);
        setIsInitializing(false);
        if (signedIn) {
          const profile = googleCalendarService.getUserProfile();
          setUserProfile(profile);
          onSignInChange(true);
        }
      })
      .catch((error) => {
        console.error('Failed to initialize Google Calendar:', error);
        setIsInitializing(false);
      });
  }, [onSignInChange]);

  const handleSignIn = async () => {
    try {
      await googleCalendarService.signIn();
      setIsSignedIn(true);
      const profile = googleCalendarService.getUserProfile();
      setUserProfile(profile);
      onSignInChange(true);
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await googleCalendarService.signOut();
      setIsSignedIn(false);
      setUserProfile(null);
      onSignInChange(false);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  if (isInitializing) {
    return (
      <div className="google-calendar-button loading">
        <span>Initializing...</span>
      </div>
    );
  }

  if (isSignedIn && userProfile) {
    return (
      <div className="google-calendar-connected">
        <div className="calendar-status">
          <span className="calendar-icon">📅</span>
          <div className="calendar-info">
            <span className="calendar-label">Google Calendar</span>
            <span className="calendar-email">{userProfile.email}</span>
          </div>
        </div>
        <button className="disconnect-button" onClick={handleSignOut}>
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button className="google-calendar-button" onClick={handleSignIn}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M17.64 9.20443C17.64 8.56625 17.5827 7.95262 17.4764 7.36353H9V10.8449H13.8436C13.635 11.9699 13.0009 12.9231 12.0477 13.5613V15.8194H14.9564C16.6582 14.2526 17.64 11.9453 17.64 9.20443Z"
          fill="#4285F4"
        />
        <path
          d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z"
          fill="#34A853"
        />
        <path
          d="M3.96409 10.7099C3.78409 10.1699 3.68182 9.59309 3.68182 8.99991C3.68182 8.40673 3.78409 7.82991 3.96409 7.28991V4.95809H0.957273C0.347727 6.17309 0 7.54764 0 8.99991C0 10.4522 0.347727 11.8267 0.957273 13.0417L3.96409 10.7099Z"
          fill="#FBBC05"
        />
        <path
          d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z"
          fill="#EA4335"
        />
      </svg>
      Connect Google Calendar
    </button>
  );
}

export default GoogleCalendarButton;

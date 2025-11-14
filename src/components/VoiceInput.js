import React, { useState, useEffect, useRef } from 'react';

function VoiceInput({ onTranscript, onError }) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    // Initialize speech recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (onTranscript) {
        onTranscript(transcript);
      }
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);

      if (onError) {
        let errorMessage = 'Voice recognition failed';
        if (event.error === 'no-speech') {
          errorMessage = 'No speech detected. Please try again.';
        } else if (event.error === 'not-allowed') {
          errorMessage = 'Microphone access denied. Please enable it in your browser settings.';
        } else if (event.error === 'network') {
          errorMessage = 'Network error. Please check your connection.';
        }
        onError(errorMessage);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onTranscript, onError]);

  const toggleListening = () => {
    if (!isSupported) {
      if (onError) {
        onError('Voice recognition is not supported in your browser. Please try Chrome or Edge.');
      }
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting recognition:', error);
        if (onError) {
          onError('Failed to start voice recognition. Please try again.');
        }
      }
    }
  };

  if (!isSupported) {
    return null; // Don't show the button if not supported
  }

  return (
    <button
      type="button"
      className={`voice-input-btn ${isListening ? 'listening' : ''}`}
      onClick={toggleListening}
      title={isListening ? 'Stop recording' : 'Add task by voice'}
    >
      {isListening ? (
        <>
          <span className="mic-icon recording">🎙️</span>
          <span className="recording-pulse"></span>
        </>
      ) : (
        <span className="mic-icon">🎤</span>
      )}
    </button>
  );
}

export default VoiceInput;

import React, { useState, useEffect, useRef } from 'react';

function VoiceInput({ onTranscript, onInterimTranscript, onError }) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    // Initialize speech recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Keep listening
    recognition.interimResults = true; // Get real-time results
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = finalTranscriptRef.current;

      // Process all results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      finalTranscriptRef.current = finalTranscript;

      // Send interim results for real-time feedback
      if (interimTranscript && onInterimTranscript) {
        onInterimTranscript(finalTranscript + interimTranscript);
      }

      // Send final transcript when we have it
      if (finalTranscript && onTranscript) {
        onTranscript(finalTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);

      // Don't stop on 'no-speech' - user might just be pausing
      if (event.error === 'no-speech') {
        // Just continue listening
        return;
      }

      setIsListening(false);

      if (onError) {
        let errorMessage = 'Voice recognition failed';
        if (event.error === 'aborted') {
          // Intentionally stopped, no error
          return;
        } else if (event.error === 'not-allowed') {
          errorMessage = 'Microphone access denied. Please enable it in your browser settings.';
        } else if (event.error === 'network') {
          errorMessage = 'Network error. Please check your connection.';
        }
        onError(errorMessage);
      }
    };

    recognition.onend = () => {
      // Only stop if user manually stopped
      if (isListening && finalTranscriptRef.current) {
        if (onTranscript) {
          onTranscript(finalTranscriptRef.current.trim());
        }
      }
      setIsListening(false);
      finalTranscriptRef.current = '';
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onTranscript, onInterimTranscript, onError, isListening]);

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
    <div className="voice-input-wrapper">
      <button
        type="button"
        className={`voice-input-btn ${isListening ? 'listening' : ''}`}
        onClick={toggleListening}
        title={isListening ? 'Click to stop' : 'Add task by voice'}
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
      {isListening && (
        <span className="listening-indicator">Listening...</span>
      )}
    </div>
  );
}

export default VoiceInput;

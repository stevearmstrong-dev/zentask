import React, { useState, useEffect, useRef } from 'react';

function VoiceInput({ onTranscript, onInterimTranscript, onError, onAddTask }) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [speechCaptured, setSpeechCaptured] = useState(false);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const isListeningRef = useRef(false);

  // Store callbacks in refs so they're always up-to-date
  const onTranscriptRef = useRef(onTranscript);
  const onInterimTranscriptRef = useRef(onInterimTranscript);
  const onErrorRef = useRef(onError);
  const onAddTaskRef = useRef(onAddTask);

  // Update refs when callbacks change
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
    onInterimTranscriptRef.current = onInterimTranscript;
    onErrorRef.current = onError;
    onAddTaskRef.current = onAddTask;
  }, [onTranscript, onInterimTranscript, onError, onAddTask]);

  useEffect(() => {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    // Initialize speech recognition with SIMPLE mode
    const recognition = new SpeechRecognition();
    recognition.continuous = false; // One utterance at a time (more reliable)
    recognition.interimResults = true; // Show real-time results
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

      // Always update the input field with the latest (final + interim)
      const combinedTranscript = finalTranscript + interimTranscript;

      if (combinedTranscript && onInterimTranscriptRef.current) {
        onInterimTranscriptRef.current(combinedTranscript);
      }

      // Also call onTranscript for final results so they're saved
      if (finalTranscript && onTranscriptRef.current) {
        onTranscriptRef.current(finalTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      // Don't stop on 'no-speech' - user might just be pausing
      if (event.error === 'no-speech') {
        return;
      }

      setIsListening(false);

      if (onErrorRef.current) {
        let errorMessage = 'Voice recognition failed';
        if (event.error === 'aborted') {
          // Intentionally stopped, no error
          return;
        } else if (event.error === 'not-allowed') {
          errorMessage = 'Microphone access denied. Please enable it in your browser settings.';
        } else if (event.error === 'network') {
          errorMessage = 'Network error. Please check your connection.';
        }
        onErrorRef.current(errorMessage);
      }
    };

    recognition.onend = () => {
      // In simple mode, recognition ends automatically after speech
      // Just finalize and stop
      setIsListening(false);
      isListeningRef.current = false;

      if (finalTranscriptRef.current && onTranscriptRef.current) {
        onTranscriptRef.current(finalTranscriptRef.current.trim());
        // Set speechCaptured to true to show "Add Task" button
        setSpeechCaptured(true);
      }

      finalTranscriptRef.current = '';
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []); // Empty dependencies - recognition instance doesn't need to be recreated

  const handleButtonClick = () => {
    if (!isSupported) {
      if (onErrorRef.current) {
        onErrorRef.current('Voice recognition is not supported in your browser. Please try Chrome or Edge.');
      }
      return;
    }

    // If speech was captured, clicking adds the task
    if (speechCaptured) {
      if (onAddTaskRef.current) {
        onAddTaskRef.current();
      }
      setSpeechCaptured(false);
      return;
    }

    // Otherwise, toggle listening
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      isListeningRef.current = false;
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        isListeningRef.current = true;
      } catch (error) {
        if (onErrorRef.current) {
          onErrorRef.current('Failed to start voice recognition. Please try again.');
        }
      }
    }
  };

  // Reset function to be called after task is added
  const reset = () => {
    setSpeechCaptured(false);
  };

  if (!isSupported) {
    return null; // Don't show the button if not supported
  }

  return (
    <div className="voice-input-wrapper">
      <button
        type="button"
        className={`voice-input-btn ${isListening ? 'listening' : ''} ${speechCaptured ? 'add-task' : ''}`}
        onClick={handleButtonClick}
        title={speechCaptured ? 'Click to add task' : isListening ? 'Click to stop' : 'Add task by voice'}
      >
        {speechCaptured ? (
          <span className="add-task-text">✓ Add Task</span>
        ) : isListening ? (
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

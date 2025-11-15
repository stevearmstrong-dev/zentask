import React, { useState, useEffect } from 'react';

function TimeTracker({ task, onUpdateTime }) {
  const [displayTime, setDisplayTime] = useState(task.timeSpent || 0);

  // Update display time every second when tracking
  useEffect(() => {
    if (task.isTracking && task.trackingStartTime) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - task.trackingStartTime) / 1000);
        setDisplayTime((task.timeSpent || 0) + elapsed);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setDisplayTime(task.timeSpent || 0);
    }
  }, [task.isTracking, task.trackingStartTime, task.timeSpent]);

  const formatTime = (seconds) => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  };

  const handleStartStop = () => {
    if (task.isTracking) {
      // Stop tracking
      const elapsed = Math.floor((Date.now() - task.trackingStartTime) / 1000);
      const newTimeSpent = (task.timeSpent || 0) + elapsed;
      onUpdateTime(task.id, {
        timeSpent: newTimeSpent,
        isTracking: false,
        trackingStartTime: null,
      });
    } else {
      // Start tracking
      onUpdateTime(task.id, {
        timeSpent: task.timeSpent || 0,
        isTracking: true,
        trackingStartTime: Date.now(),
      });
    }
  };

  const handleReset = () => {
    onUpdateTime(task.id, {
      timeSpent: 0,
      isTracking: false,
      trackingStartTime: null,
    });
  };

  return (
    <div className="time-tracker">
      <div className="time-display">
        <span className="time-icon">{task.isTracking ? '⏱️' : '⏱'}</span>
        <span className="time-value">{formatTime(displayTime)}</span>
      </div>
      <div className="time-controls">
        <button
          className={`time-btn ${task.isTracking ? 'btn-stop' : 'btn-start'}`}
          onClick={handleStartStop}
          disabled={task.completed}
          title={task.isTracking ? 'Stop timer' : 'Start timer'}
        >
          {task.isTracking ? '⏸' : '▶'}
        </button>
        {displayTime > 0 && (
          <button
            className="time-btn btn-reset"
            onClick={handleReset}
            disabled={task.isTracking}
            title="Reset timer"
          >
            ↻
          </button>
        )}
      </div>
    </div>
  );
}

export default TimeTracker;

import React, { useState, useEffect, useRef } from 'react';

function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); // 'work', 'shortBreak', 'longBreak'
  const [sessions, setSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  // Customizable durations (in minutes)
  const [workDuration, setWorkDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);

  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    // Create audio element for notifications
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYGGGm98OScTQwOUKzn77RnHAU0jdXzzn0vBSh+zPLaizsIGGS57OihUBELTKXh8bllHQYuhM/z1YU2BhVns+znm08MClCq5O+zaBwGM4rT8s+AMAYnfcvx2Ik5BxdlvO7mnE4LDE6k4PG2ZRwFLoXQ89WFNgYVaLPr5JdQDApPpuPwtGYcBTKJ0vPQgzAHJnzL8diJOQcXZbzu5p1OCwxMo+Dxt2UcBS6Fz/PWhTYGFWiz6+SXUAwKT6bj8LRmHAUyidLz0IMwByZ8y/HYiTkHF2W87uadTgsMTKPg8bdlHAUuhdDz1YU2BhVos+vkl1AMCk+m4/C0ZhwGMonS89CDMAcmfMvx2Ik5BxdlvO7mnU4LDE2j4PG3ZRwFLoXQ89WFNgYVaLPr5JdQDApPpuPwtGYcBTKJ0vPQgzAHJnzL8diJOQcXZbzu5p1OCwxMo+Dxt2UcBS6Fz/PWhTYGFWiz6+SXUAwKT6bj8LRmHAUyidLz0IMwByZ8y/HYiTkHF2W87uadTgsMTKPg8bdlHAUuhdDz1YU2BhVos+vkl1AMCk+m4/C0ZhwFMonS89CDMAcmfMvx2Ik5BxdlvO7mnU4LDE2j4PG3ZRwFLoXQ89WFNgYVaLPr5JdQDApPpuPwtGYcBTKJ0vPQgzAHJnzL8diJOQcXZbzu5p1OCwxMo+Dxt2UcBS6F0PPVhTYGFWiz6+SXUAwKT6bj8LRmHAUyidLz0IMwByZ8y/HYiTkHF2W87uadTgsMTKPg8bdlHAUuhdDz1YU2BhVos+vkl1AMCk+m4/C0ZhwFMonS89CDMAcmfMvx2Ik5BxdlvO7mnU4LDE2j4PG3ZRwFLoXQ89WFNgYVaLPr5JdQDApPpuPwtGYcBTKJ0vPQgzAHJnzL8diJOQcXZbzu5p1OCwxMo+Dxt2UcBS6F0PPVhTYGFWiz6+SXUAwKT6bj8LRmHAUyidLz0IMwByZ8y/HYiTkHF2W87uadTgsMTaPg8bdlHAVDV9'); // Simple beep sound
  }, []);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft]);

  const handleTimerComplete = () => {
    setIsActive(false);

    // Play notification sound
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }

    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const message = mode === 'work'
        ? 'Work session complete! Time for a break.'
        : 'Break time over! Ready to focus?';
      new Notification('Pomodoro Timer', { body: message });
    }

    // Auto-switch to next mode
    if (mode === 'work') {
      setSessions(prev => prev + 1);
      const nextMode = (sessions + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
      switchMode(nextMode);
    } else {
      switchMode('work');
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);

    switch (newMode) {
      case 'work':
        setTimeLeft(workDuration * 60);
        break;
      case 'shortBreak':
        setTimeLeft(shortBreakDuration * 60);
        break;
      case 'longBreak':
        setTimeLeft(longBreakDuration * 60);
        break;
      default:
        break;
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    switch (mode) {
      case 'work':
        setTimeLeft(workDuration * 60);
        break;
      case 'shortBreak':
        setTimeLeft(shortBreakDuration * 60);
        break;
      case 'longBreak':
        setTimeLeft(longBreakDuration * 60);
        break;
      default:
        break;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const total = mode === 'work' ? workDuration * 60
                 : mode === 'shortBreak' ? shortBreakDuration * 60
                 : longBreakDuration * 60;
    return ((total - timeLeft) / total) * 100;
  };

  const getModeColor = () => {
    switch (mode) {
      case 'work': return '#73ABFF';
      case 'shortBreak': return '#34C759';
      case 'longBreak': return '#FF9500';
      default: return '#73ABFF';
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case 'work': return 'Focus Time';
      case 'shortBreak': return 'Short Break';
      case 'longBreak': return 'Long Break';
      default: return 'Focus Time';
    }
  };

  return (
    <div className="pomodoro-timer">
      <div className="pomodoro-header">
        <h3 className="pomodoro-title">
          <span className="pomodoro-icon">🍅</span>
          Pomodoro
        </h3>
        <button
          className="pomodoro-settings-btn"
          onClick={() => setShowSettings(!showSettings)}
          title="Settings"
        >
          ⚙️
        </button>
      </div>

      {showSettings ? (
        <div className="pomodoro-settings">
          <div className="setting-group">
            <label>Work Duration (min)</label>
            <input
              type="number"
              min="1"
              max="60"
              value={workDuration}
              onChange={(e) => setWorkDuration(Number(e.target.value))}
            />
          </div>
          <div className="setting-group">
            <label>Short Break (min)</label>
            <input
              type="number"
              min="1"
              max="30"
              value={shortBreakDuration}
              onChange={(e) => setShortBreakDuration(Number(e.target.value))}
            />
          </div>
          <div className="setting-group">
            <label>Long Break (min)</label>
            <input
              type="number"
              min="1"
              max="60"
              value={longBreakDuration}
              onChange={(e) => setLongBreakDuration(Number(e.target.value))}
            />
          </div>
          <button
            className="settings-close-btn"
            onClick={() => setShowSettings(false)}
          >
            Done
          </button>
        </div>
      ) : (
        <>
          <div className="pomodoro-mode" style={{ color: getModeColor() }}>
            {getModeLabel()}
          </div>

          <div className="pomodoro-display">
            <svg className="progress-ring" width="200" height="200">
              <circle
                className="progress-ring-circle-bg"
                stroke="#e0e0e0"
                strokeWidth="8"
                fill="transparent"
                r="90"
                cx="100"
                cy="100"
              />
              <circle
                className="progress-ring-circle"
                stroke={getModeColor()}
                strokeWidth="8"
                fill="transparent"
                r="90"
                cx="100"
                cy="100"
                style={{
                  strokeDasharray: `${2 * Math.PI * 90}`,
                  strokeDashoffset: `${2 * Math.PI * 90 * (1 - getProgress() / 100)}`,
                  transform: 'rotate(-90deg)',
                  transformOrigin: '50% 50%',
                  transition: 'stroke-dashoffset 0.3s ease'
                }}
              />
              <text
                x="100"
                y="100"
                textAnchor="middle"
                dy=".3em"
                className="timer-text"
              >
                {formatTime(timeLeft)}
              </text>
            </svg>
          </div>

          <div className="pomodoro-controls">
            <button
              className={`pomodoro-btn ${isActive ? 'pause' : 'start'}`}
              onClick={toggleTimer}
            >
              {isActive ? '⏸ Pause' : '▶ Start'}
            </button>
            <button
              className="pomodoro-btn reset"
              onClick={resetTimer}
            >
              ↻ Reset
            </button>
          </div>

          <div className="pomodoro-mode-selector">
            <button
              className={`mode-btn ${mode === 'work' ? 'active' : ''}`}
              onClick={() => switchMode('work')}
            >
              Work
            </button>
            <button
              className={`mode-btn ${mode === 'shortBreak' ? 'active' : ''}`}
              onClick={() => switchMode('shortBreak')}
            >
              Short Break
            </button>
            <button
              className={`mode-btn ${mode === 'longBreak' ? 'active' : ''}`}
              onClick={() => switchMode('longBreak')}
            >
              Long Break
            </button>
          </div>

          <div className="pomodoro-sessions">
            <div className="sessions-label">Sessions Today</div>
            <div className="sessions-count">
              {Array.from({ length: Math.min(sessions, 8) }, (_, i) => (
                <span key={i} className="session-dot">🍅</span>
              ))}
              {sessions > 8 && <span className="session-more">+{sessions - 8}</span>}
            </div>
            <div className="sessions-total">{sessions} completed</div>
          </div>
        </>
      )}
    </div>
  );
}

export default PomodoroTimer;

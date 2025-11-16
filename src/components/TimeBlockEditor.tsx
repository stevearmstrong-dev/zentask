import React, { useState } from 'react';
import { Task } from '../types';

interface TimeBlockEditorProps {
  task: Task;
  onSave: (updates: Partial<Task>) => void;
  onClose: () => void;
}

function TimeBlockEditor({ task, onSave, onClose }: TimeBlockEditorProps) {
  const taskDate = task.scheduledStart ? new Date(task.scheduledStart) : new Date();

  const [hours, setHours] = useState(taskDate.getHours());
  const [minutes, setMinutes] = useState(taskDate.getMinutes());
  const [duration, setDuration] = useState(task.scheduledDuration || 60);

  const handleSave = () => {
    const startTime = new Date(taskDate);
    startTime.setHours(hours, minutes, 0, 0);

    onSave({
      scheduledStart: startTime.toISOString(),
      scheduledDuration: duration,
    });
    onClose();
  };

  // Generate hour options (0-23)
  const hourOptions = Array.from({ length: 24 }, (_, i) => i);

  // Generate minute options (0, 15, 30, 45)
  const minuteOptions = [0, 15, 30, 45];

  // Duration presets
  const durationPresets = [
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
    { label: '45 min', value: 45 },
    { label: '1 hour', value: 60 },
    { label: '1.5 hours', value: 90 },
    { label: '2 hours', value: 120 },
    { label: '3 hours', value: 180 },
  ];

  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="time-block-editor" onClick={(e) => e.stopPropagation()}>
        <div className="editor-header">
          <h3>⏰ Edit Time Block</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="editor-content">
          <div className="task-name">
            <strong>{task.text}</strong>
          </div>

          <div className="time-section">
            <label>Start Time</label>
            <div className="time-inputs">
              <select
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="time-select"
              >
                {hourOptions.map(h => {
                  const period = h >= 12 ? 'PM' : 'AM';
                  const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
                  return <option key={h} value={h}>{displayHour} {period}</option>;
                })}
              </select>
              <span className="time-separator">:</span>
              <select
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="time-select"
              >
                {minuteOptions.map(m => (
                  <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                ))}
              </select>
            </div>
            <div className="start-time-preview">
              Starts at {formatTime(hours, minutes)}
            </div>
          </div>

          <div className="duration-section">
            <label>Duration</label>
            <div className="duration-presets">
              {durationPresets.map(preset => (
                <button
                  key={preset.value}
                  className={`duration-preset ${duration === preset.value ? 'active' : ''}`}
                  onClick={() => setDuration(preset.value)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="custom-duration">
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min="5"
                max="480"
                step="5"
                className="duration-input"
              />
              <span>minutes</span>
            </div>
          </div>

          <div className="end-time-display">
            {(() => {
              const endTime = new Date(taskDate);
              endTime.setHours(hours, minutes + duration, 0, 0);
              return `Ends at ${formatTime(endTime.getHours(), endTime.getMinutes())}`;
            })()}
          </div>
        </div>

        <div className="editor-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="save-btn" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default TimeBlockEditor;

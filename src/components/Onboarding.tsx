import React, { useState } from 'react';

interface NewTask {
  text: string;
  priority: string;
  dueDate: string;
  dueTime: string;
  category: string;
  reminderMinutes: null;
}

interface OnboardingProps {
  onComplete: () => void;
  addTask: (task: NewTask) => void;
}

function Onboarding({ onComplete, addTask }: OnboardingProps) {
  const [taskInputs, setTaskInputs] = useState<string[]>(['', '', '']);

  const suggestedTasks: string[] = [
    'Do laundry',
    'Plan a trip to...',
    'Call back...',
    'Buy birthday gift for...',
    'Schedule dentist appointment',
    'Prepare weekly meal plan',
    'Review monthly budget',
    'Organize workspace'
  ];

  const handleInputChange = (index: number, value: string): void => {
    const newInputs = [...taskInputs];
    newInputs[index] = value;
    setTaskInputs(newInputs);
  };

  const handleAddSuggestedTask = (task: string): void => {
    const emptyIndex = taskInputs.findIndex(input => input === '');
    if (emptyIndex !== -1) {
      const newInputs = [...taskInputs];
      newInputs[emptyIndex] = task;
      setTaskInputs(newInputs);
    }
  };

  const handleComplete = (): void => {
    // Add all non-empty tasks
    taskInputs.forEach(task => {
      if (task.trim()) {
        addTask({
          text: task.trim(),
          priority: 'medium',
          dueDate: '',
          dueTime: '',
          category: '',
          reminderMinutes: null
        });
      }
    });

    // Mark onboarding as complete
    localStorage.setItem('hasCompletedOnboarding', 'true');
    onComplete();
  };

  const handleSkip = (): void => {
    localStorage.setItem('hasCompletedOnboarding', 'true');
    onComplete();
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-container">
        <button className="skip-button" onClick={handleSkip}>Skip</button>

        <h1 className="onboarding-title">Add your first tasks</h1>

        <div className="onboarding-inputs">
          {taskInputs.map((task, index) => (
            <input
              key={index}
              type="text"
              className={`onboarding-input ${index === 0 ? 'focused' : ''}`}
              placeholder={index === 0 ? 'Do laundry' : index === 1 ? 'Plan a trip to' : 'Call back'}
              value={task}
              onChange={(e) => handleInputChange(index, e.target.value)}
            />
          ))}
        </div>

        <div className="suggested-tasks">
          {suggestedTasks.slice(0, 4).map((suggestion, index) => (
            <button
              key={index}
              className="suggested-task-btn"
              onClick={() => handleAddSuggestedTask(suggestion)}
            >
              <span className="plus-icon">+</span>
              {suggestion}
            </button>
          ))}
        </div>

        <button
          className="continue-button"
          onClick={handleComplete}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export default Onboarding;

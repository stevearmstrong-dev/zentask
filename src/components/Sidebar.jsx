import React from 'react';

function Sidebar({ activeView, onViewChange, userName, onSignOut, darkMode, onToggleDarkMode }) {
  const menuItems = [
    { id: 'today', icon: '📅', label: 'Today' },
    { id: 'tasks', icon: '✓', label: 'All Tasks' },
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'matrix', icon: '⊞', label: 'Matrix' },
    { id: 'pomodoro', icon: '🍅', label: 'Pomodoro' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-logo">
          <span className="logo-icon">◯</span>
          Zentask
        </h2>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-nav-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <span className="sidebar-avatar">{userName.charAt(0).toUpperCase()}</span>
          <span className="sidebar-username">{userName}</span>
        </div>

        <div className="sidebar-controls">
          <button
            className="sidebar-control-btn"
            onClick={onToggleDarkMode}
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button
            className="sidebar-control-btn"
            onClick={onSignOut}
            title="Sign Out"
          >
            ⎋
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;

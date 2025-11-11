import React from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard({ tasks }) {
  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const activeTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Priority breakdown
  const highPriority = tasks.filter(task => task.priority === 'high' && !task.completed).length;
  const mediumPriority = tasks.filter(task => task.priority === 'medium' && !task.completed).length;
  const lowPriority = tasks.filter(task => task.priority === 'low' && !task.completed).length;

  // Overdue tasks
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) < new Date();
  }).length;

  // Category breakdown
  const categoryCount = {};
  tasks.forEach(task => {
    if (task.category && !task.completed) {
      categoryCount[task.category] = (categoryCount[task.category] || 0) + 1;
    }
  });

  // Tasks due this week
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const dueThisWeek = tasks.filter(task => {
    if (!task.dueDate || task.completed) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate >= today && dueDate <= nextWeek;
  }).length;

  // Completion Chart Data
  const completionChartData = {
    labels: ['Completed', 'Active'],
    datasets: [
      {
        data: [completedTasks, activeTasks],
        backgroundColor: ['#51cf66', '#667eea'],
        borderColor: ['#40c057', '#5568d3'],
        borderWidth: 2,
      },
    ],
  };

  // Priority Chart Data
  const priorityChartData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        label: 'Active Tasks by Priority',
        data: [highPriority, mediumPriority, lowPriority],
        backgroundColor: ['#ff6b6b', '#ffd43b', '#51cf66'],
        borderColor: ['#ee5a5a', '#fcc419', '#40c057'],
        borderWidth: 2,
      },
    ],
  };

  // Category Chart Data
  const categoryChartData = {
    labels: Object.keys(categoryCount).length > 0 ? Object.keys(categoryCount) : ['No Categories'],
    datasets: [
      {
        data: Object.keys(categoryCount).length > 0 ? Object.values(categoryCount) : [1],
        backgroundColor: [
          '#667eea',
          '#764ba2',
          '#f093fb',
          '#4facfe',
          '#43e97b',
          '#fa709a',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Dashboard</h2>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <div className="stat-value">{totalTasks}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-value">{completedTasks}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-info">
            <div className="stat-value">{activeTasks}</div>
            <div className="stat-label">Active</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-info">
            <div className="stat-value">{completionRate}%</div>
            <div className="stat-label">Completion Rate</div>
          </div>
        </div>

        <div className="stat-card alert">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <div className="stat-value">{overdueTasks}</div>
            <div className="stat-label">Overdue</div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <div className="stat-value">{dueThisWeek}</div>
            <div className="stat-label">Due This Week</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-container">
          <h3 className="chart-title">Task Completion</h3>
          {totalTasks > 0 ? (
            <Pie data={completionChartData} options={chartOptions} />
          ) : (
            <p className="no-data">No tasks to display</p>
          )}
        </div>

        <div className="chart-container">
          <h3 className="chart-title">Active Tasks by Priority</h3>
          {activeTasks > 0 ? (
            <Bar data={priorityChartData} options={barChartOptions} />
          ) : (
            <p className="no-data">No active tasks</p>
          )}
        </div>

        <div className="chart-container">
          <h3 className="chart-title">Active Tasks by Category</h3>
          {Object.keys(categoryCount).length > 0 ? (
            <Doughnut data={categoryChartData} options={chartOptions} />
          ) : (
            <p className="no-data">No categorized tasks</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

import React, { useState, useEffect } from 'react';

const HomeScreen = ({ userEmail }) => {
  const [newTask, setNewTask] = useState('');
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, [userEmail]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/get-tasks/${userEmail}`);
      const data = await response.json();
      if (data.status === 'success') {
        setTasks(data.tasks);
      } else {
        console.error('Failed to fetch tasks:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAddTask = async () => {
    if (newTask.trim() === '') return;

    try {
      const response = await fetch('/api/add-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userEmail: userEmail, text: newTask })
      });

      const data = await response.json();
      if (data.status === 'success') {
        setTasks([...tasks, data.task]);
        setNewTask('');
      } else {
        console.error('Failed to save task:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="todo-container">
      <input
        type="text"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="Enter task"
      />
      <button onClick={handleAddTask}>הוסף משימה</button>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>{task.text}</li>
        ))}
      </ul>
    </div>
  );
};

export default HomeScreen;
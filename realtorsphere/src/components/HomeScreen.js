import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const HomeScreen = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [calendarDays, setCalendarDays] = useState([]);
  const [todoList, setTodoList] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [events, setEvents] = useState([]);
  const [newEventDetails, setNewEventDetails] = useState({
    date: '',
    name: '',
    hour: '',
    details: ''
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [userName, setUserName] = useState('');
  const [navigationLinks] = useState([
    { name: 'נכסים', url: '/' },
    { name: 'ניהול לקוחות', url: '/clients' },
    { name: 'מסמכים', url: '/documents' },
    { name: 'דוא"ל', url: '/email' },
    { name: 'סיכומי פגישות', url: '/meetings' },
    { name: 'אנשי קשר', url: '/contacts' },
    { name: 'עריכת פרופיל', url: '/edit-profile' },
  ]);

  // Fetch user data
  const fetchUserData = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/homescreen', { withCredentials: true });
      if (response.status === 200) {
        setUserName(response.data.firstName);
        setTodoList(response.data.tasks || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, []);

  // Fetch events for the logged-in user
  const fetchUserEvents = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/events', { withCredentials: true });
      if (response.status === 200) {
        setEvents(response.data.events || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }, []);

  useEffect(() => {
    generateCalendarDays(currentYear, currentMonth);
    fetchUserData();
    fetchUserEvents();
  }, [currentYear, currentMonth, fetchUserData, fetchUserEvents]);

  // Add new event
  const addEvent = async () => {
    try {
      const response = await axios.post('http://localhost:5000/events', newEventDetails, { withCredentials: true });
      if (response.status === 200) {
        setEvents([...events, response.data.event]);
        setNewEventDetails({ date: '', name: '', hour: '', details: '' });
      }
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  // Edit an event
  const editEvent = async (eventId, updatedEventDetails) => {
    try {
      const response = await axios.put(`http://localhost:5000/events/${eventId}`, updatedEventDetails, { withCredentials: true });
      if (response.status === 200) {
        setEvents(events.map(event => event.id === eventId ? response.data.event : event));
      }
    } catch (error) {
      console.error('Error editing event:', error);
    }
  };

  // Delete an event
  const deleteEvent = async (eventId) => {
    try {
      await axios.delete(`http://localhost:5000/events/${eventId}`, { withCredentials: true });
      setEvents(events.filter(event => event.id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  // Check for event alerts
  useEffect(() => {
    const checkAlerts = () => {
      events.forEach(event => {
        const eventDate = new Date(`${event.date} ${event.hour}`);
        const now = new Date();
        const timeDiff = eventDate - now;

        if (timeDiff <= 86400000 && timeDiff > 0) {
          alert(`Reminder: 24 hours until event ${event.name}`);
        } else if (timeDiff <= 3600000 && timeDiff > 0) {
          alert(`Reminder: 1 hour until event ${event.name}`);
        }
      });
    };

    checkAlerts();
  }, [events]);

  const generateCalendarDays = (year, month) => {
    const numDays = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const calendarDays = Array.from({ length: firstDay }, () => null);

    for (let day = 1; day <= numDays; day++) {
      calendarDays.push({ day });
    }
    setCalendarDays(calendarDays);
  };

  const handleMonthChange = (increment) => {
    setCurrentMonth((prevMonth) => {
      let newMonth = prevMonth + increment;
      if (newMonth < 0) {
        setCurrentYear((prevYear) => prevYear - 1);
        newMonth = 11;
      } else if (newMonth > 11) {
        setCurrentYear((prevYear) => prevYear + 1);
        newMonth = 0;
      }
      return newMonth;
    });
  };

  const addTask = async () => {
    if (newTask.trim()) {
      try {
        const response = await axios.post('http://localhost:5000/tasks', { text: newTask }, { withCredentials: true });
        if (response.status === 200) {
          setTodoList([...todoList, response.data.task]);
          setNewTask('');
        }
      } catch (error) {
        console.error('Error adding task:', error);
      }
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await axios.post('http://localhost:5000/tasks_update', { id: taskId, status: newStatus }, { withCredentials: true });
      if (response.status === 200) {
        setTodoList(todoList.map(task => task.id === taskId ? { ...task, status: newStatus } : task));
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const selectDate = (day) => {
    setSelectedDate(new Date(currentYear, currentMonth, day));
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/';
  };

  return (
    <main className="flex flex-col items-center bg-cover bg-center min-h-screen p-4" style={{ backgroundImage: `url('/RealtorSphereHomeScreen2.png')` }}>
      <div className="flex justify-end items-center w-full p-4">
        <div className="text-right text-white font-bold text-2xl mr-4">
          {userName ? `שלום, ${userName}` : 'Loading...'}
        </div>
        <div className="text-white text-4xl">🔔</div>
        <div className="text-white text-4xl" onClick={logout}>Logout</div>
      </div>

      <div className="flex flex-row-reverse justify-between w-full max-w-7xl mt-4">
        <div className="flex flex-col items-center w-[275px] p-4 border-solid border-zinc-100 shadow-[0px_4px_25px_rgba(0,0,0,0.25)] bg-white rounded bg-opacity-80 fixed top-0 right-0 mt-20 mr-4">
          <h2 className="text-xl font-semibold mb-4">ניווט</h2>
          <ul className="space-y-2">
            {navigationLinks.map((link, index) => (
              <li key={index}>
                <a href={link.url} className="block text-white bg-blue-500 hover:bg-blue-700 py-2 px-4 rounded">
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-row-reverse justify-between gap-10 w-full max-w-7xl pr-[310px]">
          <div className="flex flex-col w-full md:w-1/3 p-4 bg-white rounded shadow-md bg-opacity-80 ml-16">
            <h2 className="text-xl font-semibold mb-4">משימות</h2>
            <ul>
              {todoList.map((task, index) => (
                <li key={index} className="mb-2">
                  <span className={task.status ? 'line-through' : ''}>{task.text}</span>
                  <button onClick={() => updateTaskStatus(task.id, !task.status)}>
                    {task.status ? 'Mark Incomplete' : 'Mark Complete'}
                  </button>
                </li>
              ))}
            </ul>
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="mt-2 p-2 border rounded w-full"
              placeholder="משימה חדשה"
            />
            <button onClick={addTask} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2">הוסף</button>
          </div>

          <div className="flex flex-col w-full md:w-2/3 p-4 bg-white rounded shadow-md bg-opacity-80">
            <h2 className="text-xl font-semibold mb-4">אירועים</h2>
            <div className="flex justify-between mb-2">
              <button onClick={() => handleMonthChange(-1)}>Previous</button>
              <div>{new Date(currentYear, currentMonth).toLocaleDateString('he-IL', { year: 'numeric', month: 'long' })}</div>
              <button onClick={() => handleMonthChange(1)}>Next</button>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => (
                <div key={index} className="border border-gray-300 p-2 text-center" onClick={() => day && selectDate(day.day)}>
                  {day ? day.day : ''}
                  {day && events.filter(event => new Date(event.date).getDate() === day.day && new Date(event.date).getMonth() === currentMonth).map((event, idx) => (
                    <div key={idx} className="text-xs text-red-500 mt-1">{event.name}</div>
                  ))}
                </div>
              ))}
            </div>

            {selectedDate && (
              <div className="mt-4">
                <h3>הוסף אירוע ל-{selectedDate.toLocaleDateString('he-IL')}</h3>
                <input
                  type="text"
                  value={newEventDetails.name}
                  onChange={(e) => setNewEventDetails({ ...newEventDetails, name: e.target.value })}
                  className="mt-2 p-2 border rounded w-full"
                  placeholder="שם האירוע"
                />
                <input
                  type="time"
                  value={newEventDetails.hour}
                  onChange={(e) => setNewEventDetails({ ...newEventDetails, hour: e.target.value })}
                  className="mt-2 p-2 border rounded w-full"
                />
                <textarea
                  value={newEventDetails.details}
                  onChange={(e) => setNewEventDetails({ ...newEventDetails, details: e.target.value })}
                  className="mt-2 p-2 border rounded w-full"
                  placeholder="פרטים"
                />
                <button onClick={addEvent} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2">הוסף אירוע</button>
              </div>
            )}

            <div className="mt-4">
              <h3>אירועים קרובים:</h3>
              <ul>
                {events.map((event, index) => (
                  <li key={index} className="mb-2">
                    <div>{event.name} - {new Date(`${event.date} ${event.hour}`).toLocaleString('he-IL')}</div>
                    <button onClick={() => editEvent(event.id, { ...event, name: 'New Name' })}>Edit</button>
                    <button onClick={() => deleteEvent(event.id)}>Delete</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HomeScreen;

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
    details: '',
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
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

  const fetchUserData = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/homescreen', { withCredentials: true });
      if (response.status === 200) {
        setUserName(response.data.firstName);
        setTodoList(response.data.tasks || []);
        setEvents(response.data.events || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, []);

  useEffect(() => {
    generateCalendarDays(currentYear, currentMonth);
    fetchUserData();
  }, [currentYear, currentMonth, fetchUserData]);

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

  const editEvent = async (eventId, updatedEventDetails) => {
    try {
      const response = await axios.put(`http://localhost:5000/events/${eventId}`, updatedEventDetails, {
        withCredentials: true,
      });
      if (response.status === 200) {
        setEvents(events.map(event => (event.id === eventId ? response.data.event : event)));
      }
    } catch (error) {
      console.error('Error editing event:', error);
    }
  };

  const deleteEvent = async eventId => {
    try {
      await axios.delete(`http://localhost:5000/events/${eventId}`, { withCredentials: true });
      setEvents(events.filter(event => event.id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

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
      const date = new Date(year, month, day);
      const dayEvents = events.filter(event => new Date(event.date).toDateString() === date.toDateString());
      calendarDays.push({ day, events: dayEvents });
    }
    setCalendarDays(calendarDays);
  };

  const handleMonthChange = increment => {
    setCurrentMonth(prevMonth => {
      let newMonth = prevMonth + increment;
      if (newMonth < 0) {
        setCurrentYear(prevYear => prevYear - 1);
        newMonth = 11;
      } else if (newMonth > 11) {
        setCurrentYear(prevYear => prevYear + 1);
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
      const response = await axios.post(
        'http://localhost:5000/tasks_update',
        { id: taskId, status: newStatus },
        { withCredentials: true }
      );
      if (response.status === 200) {
        setTodoList(todoList.map(task => (task.id === taskId ? { ...task, status: newStatus } : task)));
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const selectDate = day => {
    const date = new Date(currentYear, currentMonth, day);
    const dayEvents = events.filter(event => new Date(event.date).toDateString() === date.toDateString());
    setSelectedDate(date);
    setSelectedEvents(dayEvents);
    setShowEventModal(true);
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
        <div className="text-white text-4xl" onClick={logout}>
          Logout
        </div>
      </div>

      <div className="flex flex-row-reverse justify-between w-full max-w-7xl mt-4">
        <div
          className="flex flex-col items-center w-[275px] p-4 border-solid border-zinc-100 shadow-[0px_4px_25px_rgba(0,0,0,0.25)] bg-white rounded bg-opacity-80 fixed top-0 right-0 mt-20 mr-4"
        >
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

        <div className="flex flex-grow mt-20 mr-4">
          <div className="flex flex-col w-1/2 p-4 bg-white rounded shadow-md bg-opacity-80 mr-4">
            <h2 className="text-xl font-semibold mb-4 text-right">יומן</h2>
            <div className="flex justify-between items-center mb-2">
              <button onClick={() => handleMonthChange(-1)}>{'<'}</button>
              <h2 className="text-xl font-semibold">
                {new Date(currentYear, currentMonth).toLocaleString('he-IL', {
                  month: 'long',
                  year: 'numeric',
                })}
              </h2>
              <button onClick={() => handleMonthChange(1)}>{'>'}</button>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'].map(day => (
                <div key={day} className="text-center font-semibold">
                  {day}
                </div>
              ))}
              {calendarDays.map((day, index) =>
                day ? (
                  <div
                    key={index}
                    onClick={() => selectDate(day.day)}
                    className={`text-center p-2 rounded cursor-pointer ${
                      day.events.length > 0 ? 'bg-blue-500 text-white' : 'bg-gray-100'
                    }`}
                  >
                    {day.day}
                  </div>
                ) : (
                  <div key={index}></div>
                )
              )}
            </div>
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-4 text-right">אירועים</h2>
              {selectedDate && (
                <div>
                  <h3 className="text-lg font-semibold text-right">{selectedDate.toLocaleDateString('he-IL')}</h3>
                  <ul>
                    {selectedEvents.length > 0 ? (
                      selectedEvents.map(event => (
                        <li key={event.id} className="mb-2">
                          <h4 className="font-semibold">{event.name}</h4>
                          <p>{event.hour}</p>
                          <p>{event.details}</p>
                          <button onClick={() => editEvent(event.id, { ...event })}>ערוך</button>
                          <button onClick={() => deleteEvent(event.id)}>מחק</button>
                        </li>
                      ))
                    ) : (
                      <p className="text-right">אין אירועים ביום זה</p>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col w-1/2 p-4 bg-white rounded shadow-md bg-opacity-80">
            <h2 className="text-xl font-semibold mb-4 text-right">משימות</h2>
            <div>
              <ul className="space-y-2">
                {todoList.map(task => (
                  <li key={task.id} className="flex items-center justify-between">
                    <span>{task.text}</span>
                    <input
                      type="checkbox"
                      checked={task.status === 'completed'}
                      onChange={() => updateTaskStatus(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                    />
                  </li>
                ))}
              </ul>
              <div className="flex items-center mt-4">
                <input
                  type="text"
                  value={newTask}
                  onChange={e => setNewTask(e.target.value)}
                  placeholder="הוסף משימה חדשה"
                  className="w-full px-3 py-2 border rounded"
                />
                <button onClick={addTask} className="ml-2 bg-blue-500 text-white py-2 px-4 rounded">
                  הוסף
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showEventModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded">
            <h3 className="text-lg font-semibold text-right">אירועים</h3>
            <input
              type="date"
              value={newEventDetails.date}
              onChange={e => setNewEventDetails({ ...newEventDetails, date: e.target.value })}
              className="block w-full mt-2"
            />
            <input
              type="text"
              value={newEventDetails.name}
              onChange={e => setNewEventDetails({ ...newEventDetails, name: e.target.value })}
              placeholder="שם אירוע"
              className="block w-full mt-2"
            />
            <input
              type="time"
              value={newEventDetails.hour}
              onChange={e => setNewEventDetails({ ...newEventDetails, hour: e.target.value })}
              className="block w-full mt-2"
            />
            <textarea
              value={newEventDetails.details}
              onChange={e => setNewEventDetails({ ...newEventDetails, details: e.target.value })}
              placeholder="פרטים נוספים"
              className="block w-full mt-2"
            />
            <div className="flex justify-end mt-4">
              <button onClick={() => setShowEventModal(false)} className="bg-gray-300 px-4 py-2 rounded">
                בטל
              </button>
              <button onClick={addEvent} className="bg-blue-500 text-white px-4 py-2 rounded ml-2">
                שמור
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default HomeScreen;

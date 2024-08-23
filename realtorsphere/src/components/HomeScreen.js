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
  const [editingEventId, setEditingEventId] = useState(null);
  const [userName, setUserName] = useState('');
  const [navigationLinks] = useState([
    { name: 'נכסים', url: '/propertyPage' },
    { name: 'ניהול לקוחות', url: '/clientProfessionalPage' },
    { name: 'מסמכים', url: '/documents' },
    { name: 'דוא"ל', url: '/sendMessage' },
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
        setShowEventModal(false); // Close modal after adding event
      }
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const editEvent = async () => {
    if (!editingEventId) return;

    try {
      const response = await axios.put(`http://localhost:5000/events/${editingEventId}`, newEventDetails, {
        withCredentials: true,
      });
      if (response.status === 200) {
        setEvents(events.map(event => (event.id === editingEventId ? response.data.event : event)));
        setNewEventDetails({ date: '', name: '', hour: '', details: '' });
        setEditingEventId(null); // Clear editing state
        setShowEventModal(false); // Close modal after editing event
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

  const openEditModal = event => {
    setNewEventDetails({ date: event.date, name: event.name, hour: event.hour, details: event.details });
    setEditingEventId(event.id);
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
          התנתק
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
          <div className="flex flex-col w-1/3 p-4 bg-white rounded shadow-md bg-opacity-80 mr-4">
            <h2 className="text-xl font-semibold mb-4">רשימת משימות</h2>
            <ul className="space-y-2">
              {todoList.map(task => (
                <li key={task.id} className="flex justify-between items-center">
                  <span className={`flex-grow ${task.status === 'completed' ? 'line-through' : ''}`}>
                    {task.text}
                  </span>
                  <input
                      type="checkbox"
                      checked={task.status === 'completed'}
                      onChange={() => updateTaskStatus(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                  />

                </li>
              ))}
            </ul>
            <div className="mt-4">
              <input
                  type="text"
                  value={newTask}
                  onChange={e => setNewTask(e.target.value)}
                  placeholder="New Task"
                className="border border-gray-300 p-2 rounded w-full"
              />
              <button onClick={addTask} className="mt-2 bg-blue-500 text-white py-2 px-4 rounded">
                הוסף משימה
              </button>
            </div>
          </div>

          <div className="flex flex-col w-1/3 p-4 bg-white rounded shadow-md bg-opacity-80">
            <h2 className="text-xl font-semibold mb-4">לוח שנה</h2>
            <div className="flex justify-between mb-4">
              <button onClick={() => handleMonthChange(-1)}>&lt;</button>
              <h3 className="text-lg font-bold">{`${new Date(currentYear, currentMonth).toLocaleString('en-US', { month: 'long' })} ${currentYear}`}</h3>
              <button onClick={() => handleMonthChange(1)}>&gt;</button>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`border p-2 text-center ${day ? 'cursor-pointer' : 'bg-gray-100'}`}
                  onClick={() => day && selectDate(day.day)}
                >
                  {day && (
                    <>
                      <div className="font-bold">{day.day}</div>
                      <ul>
                        {day.events.map(event => (
                          <li key={event.id} className="text-sm">
                            {event.name}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-bold">
                  {selectedDate && selectedDate.toDateString()} אירועים ב
              </h3>
              <ul>
                {selectedEvents.map(event => (
                  <li key={event.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-bold">{event.name}</div>
                      <div className="text-sm">{`${event.hour} - ${event.details}`}</div>
                    </div>
                    <div>
                      <button onClick={() => openEditModal(event)} className="mr-2 text-blue-500">
                        ערוך
                      </button>
                      <button onClick={() => deleteEvent(event.id)} className="text-red-500">
                        מחק
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {showEventModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              {editingEventId ? 'Edit Event' : 'Add New Event'}
            </h3>
            <input
              type="date"
              value={newEventDetails.date}
              onChange={e => setNewEventDetails({ ...newEventDetails, date: e.target.value })}
              className="border border-gray-300 p-2 rounded w-full mb-2"
            />
            <input
              type="text"
              value={newEventDetails.name}
              onChange={e => setNewEventDetails({ ...newEventDetails, name: e.target.value })}
              placeholder="Event Name"
              className="border border-gray-300 p-2 rounded w-full mb-2"
            />
            <input
              type="time"
              value={newEventDetails.hour}
              onChange={e => setNewEventDetails({ ...newEventDetails, hour: e.target.value })}
              className="border border-gray-300 p-2 rounded w-full mb-2"
            />
            <textarea
              value={newEventDetails.details}
              onChange={e => setNewEventDetails({ ...newEventDetails, details: e.target.value })}
              placeholder="Event Details"
              className="border border-gray-300 p-2 rounded w-full mb-2"
            />
            <div className="flex justify-end">
              <button onClick={() => setShowEventModal(false)} className="mr-2 bg-gray-500 text-white py-2 px-4 rounded">
                לבטל
              </button>
              <button
                onClick={editingEventId ? editEvent : addEvent}
                className="bg-blue-500 text-white py-2 px-4 rounded"
              >
                {editingEventId ? 'לשמור שינויים' : 'הוסף אירוע'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default HomeScreen;

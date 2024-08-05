import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HomeScreen = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [calendarDays, setCalendarDays] = useState([]);
  const [todoList, setTodoList] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [events, setEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [newEvent, setNewEvent] = useState('');
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

  useEffect(() => {
    generateCalendarDays(currentYear, currentMonth);
    fetchUserData();
  }, [currentYear, currentMonth]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get('/homescreen');
      if (response.status === 200) {
        setUserName(response.data.firstName);
        setTodoList(response.data.tasks || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

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
        const response = await axios.post('/tasks', { text: newTask });
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
      const response = await axios.post('/tasks_update', { id: taskId, status: newStatus });
      if (response.status === 200) {
        setTodoList(todoList.map(task => task.id === taskId ? { ...task, status: newStatus } : task));
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const addEvent = () => {
    if (newEvent.trim() && selectedDate) {
      const dateKey = selectedDate.toDateString();
      const newEvents = { ...events, [dateKey]: [...(events[dateKey] || []), newEvent] };
      setEvents(newEvents);
      setNewEvent('');
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
            <button onClick={addTask} className="mt-2 p-2 bg-blue-500 text-white rounded w-full">הוסף משימה</button>
          </div>

          <div className="flex flex-col w-full md:w-1/3 p-4 bg-white rounded shadow-md bg-opacity-80 mt-20 ml-16">
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => handleMonthChange(-1)} className="px-4 py-2 bg-gray-200 rounded-md">Prev</button>
              <h2 className="text-xl font-semibold">{`${new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} ${currentYear}`}</h2>
              <button onClick={() => handleMonthChange(1)} className="px-4 py-2 bg-gray-200 rounded-md">Next</button>
            </div>
            <div className="grid grid-cols-7 gap-4">
              {calendarDays.map((calendarDay, index) => (
                <div key={index} className={`text-center py-1 cursor-pointer ${calendarDay ? 'bg-gray-100' : ''}`} onClick={() => selectDate(calendarDay?.day)}>
                  {calendarDay ? calendarDay.day : ''}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HomeScreen;

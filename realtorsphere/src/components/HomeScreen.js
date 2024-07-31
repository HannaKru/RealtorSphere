import React, { useState, useEffect } from 'react';

const HomeScreen = ({ user }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [calendarDays, setCalendarDays] = useState([]);
  const [todoList, setTodoList] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [navigationLinks, setNavigationLinks] = useState([
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
  }, [currentYear, currentMonth]);

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

  const addTask = () => {
    if (newTask.trim()) {
      setTodoList([...todoList, newTask]);
      setNewTask('');
    }
  };

  return (
    <main
      className="flex flex-col justify-center items-center bg-cover bg-center min-h-screen p-4"
      style={{ backgroundImage: `url('/RealtorSphereHomeScreen2.png')` }}
    >
      {/* Greeting */}
      <div className="text-right text-white font-bold text-2xl mt-4 mr-4">
        שלום, {user?.name || 'אורח'}
      </div>
      <div className="flex flex-col gap-5 md:flex-row max-w-7xl w-full">
        {/* Calendar */}
        <div className="flex flex-col w-full md:w-1/3 p-4 bg-white rounded shadow-md bg-opacity-80">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => handleMonthChange(-1)} className="px-4 py-2 bg-gray-200 rounded-md">Prev</button>
            <h2 className="text-xl font-semibold">{`${new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} ${currentYear}`}</h2>
            <button onClick={() => handleMonthChange(1)} className="px-4 py-2 bg-gray-200 rounded-md">Next</button>
          </div>
          <div className="grid grid-cols-7 gap-4">
            {calendarDays.map((calendarDay, index) => (
              <div key={index} className="text-center py-1">
                {calendarDay ? calendarDay.day : ''}
              </div>
            ))}
          </div>
        </div>

        {/* To-Do List */}
        <div className="flex flex-col w-full md:w-1/3 p-4 bg-white rounded shadow-md bg-opacity-80">
          <h2 className="text-xl font-semibold mb-4">לעשות</h2>
          <ul>
            {todoList.map((task, index) => (
              <li key={index} className="mb-2">{task}</li>
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

        {/* Navigation */}
        <div className="flex flex-col w-full md:w-1/3 p-4 bg-white rounded shadow-md bg-opacity-80">
          <h2 className="text-xl font-semibold mb-4">ניווט</h2>
          <ul className="space-y-2">
            {navigationLinks.map((link, index) => (
              <li key={index}><a href={link.url} className="block text-blue-600 hover:text-blue-800">{link.name}</a></li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
};

export default HomeScreen;

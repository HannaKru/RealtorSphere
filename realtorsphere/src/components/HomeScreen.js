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
      className="flex flex-col items-center bg-cover bg-center min-h-screen p-4"
      style={{ backgroundImage: `url('/RealtorSphereHomeScreen2.png')` }}
    >
      {/* Top Bar */}
      <div className="flex justify-end items-center w-full p-4">
        {/* Greeting */}
        <div className="text-right text-white font-bold text-2xl mr-4">
          שלום, {user?.name || 'אורח'}
        </div>
        {/* Event Alert Icon */}
        <div className="text-white text-4xl">🔔</div>
      </div>

      <div className="flex flex-row-reverse justify-between w-full max-w-7xl mt-4">
        {/* Navigation */}
        <div className="flex flex-col items-center w-[275px] p-4 border-solid border-zinc-100 shadow-[0px_4px_25px_rgba(0,0,0,0.25)] bg-white rounded bg-opacity-80 fixed top-0 right-0 mt-20 mr-4">
          <h2 className="text-xl font-semibold mb-4">ניווט</h2>
          <ul className="space-y-2">
            {navigationLinks.map((link, index) => (
              <li key={index}>
                <a
                  href={link.url}
                  className="block text-white bg-blue-500 hover:bg-blue-700 py-2 px-4 rounded"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-row-reverse justify-between gap-10 w-full max-w-7xl pr-[310px]">
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

          {/* Calendar */}
          <div className="flex flex-col w-full md:w-1/3 p-4 bg-white rounded shadow-md bg-opacity-80 mt-8">
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => handleMonthChange(-1)} className="px-4 py-2 bg-gray-200 rounded-md">Prev</button>
              <h2 className="text-xl font-semibold">{`${new Date(currentYear, currentMonth).toLocaleString('default', {month: 'long'})} ${currentYear}`}</h2>
              <button onClick={() => handleMonthChange(1)} className="px-4 py-2 bg-gray-200 rounded-md">Next</button>
            </div>
            <div className="grid grid-cols-7 gap-4">
              {calendarDays.map((calendarDay, index) => (
                  <div key={index} className="text-center py-1">
                    {calendarDay ? calendarDay.day : ''}
                  </div>
              ))}
            </div>

          {/* Events of the Day */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">אירועים להיום</h3>
            <ul>
              {/* Replace with actual events data */}
              <li className="mb-2">No events scheduled for today.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

  {/* Progress Bar */
  }

  <div className="w-1/3 bg-gray-300 mt-6 fixed bottom-4 left-[45%] transform -translate-x-[40%]">
    <div className="bg-blue-500 h-2" style={{width: '85%'}}></div>
  </div>
</main>
)
  ;
};

export default HomeScreen;

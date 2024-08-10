import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [idNumber, setIdNumber] = useState('');

  const handleSend = async (event) => {
  event.preventDefault();
  if (!email || !idNumber) {
    alert('נא למלא את כל השדות');
    return;
  }

  try {
    const response = await fetch('/forgotPass', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, id: idNumber }),
    });

    if (response.ok) {
      const result = await response.json();
      alert(result.message);
      window.location.href = '/';
    } else {
      const errorText = await response.text();  // Get the error as text (likely HTML)
      console.error('Server Error:', errorText);
      alert('Error: ' + response.statusText);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

  return (
    <div
      className="flex items-center justify-center min-h-screen text-blue-950 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url('/RealtorSphere.jpg')` }}
    >
      <div className="relative w-full max-w-md p-4 md:p-8 lg:p-12 mt-32 bg-white bg-opacity-75 rounded-lg shadow-lg">
        <div dir="rtl" className="mb-4">
          <h1 className="text-2xl font-bold mb-4 text-center">אימייל</h1>
          <input
            type="email"
            id="email"
            className="w-full px-4 py-2 mb-4 text-xl text-sky-900 border-2 border-sky-800 rounded-3xl shadow-lg"
            placeholder="הכנס כתובת אימייל"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div dir="rtl" className="mb-4">
          <h1 className="text-2xl font-bold mb-4 text-center">תעודת זהות</h1>
          <input
            type="text"
            id="id"
            className="w-full px-4 py-2 mb-4 text-xl text-sky-900 border-2 border-sky-800 rounded-3xl shadow-lg"
            placeholder="הכנס תעודת זהות"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
          />
        </div>
        <div dir="rtl">
          <button
            onClick={handleSend}
            className="block w-full px-8 py-4 mt-6 text-xl text-white bg-blue-900 border-blue-900 rounded-3xl shadow-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
          >
            שלח סיסמה לאימייל
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;

import React, { useState } from 'react';
import './tailwind.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (event) => {
        event.preventDefault();
        console.log('Attempting to log in with:', email, password);
        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });

            const result = await response.json();
            console.log('Login response:', result);
            if (response.status === 200) {
                window.location.href = '/homescreen';
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="min-h-screen grid place-items-center bg-cover bg-center bg-fixed text-blue-950" style={{ backgroundImage: `url('/RealtorSphere.jpg')` }}>
            <form
                onSubmit={handleLogin}  // Attach handleLogin to the form's submit event
                className="grid grid-cols-1 gap-4 max-w-md p-6 md:p-8 lg:p-12 mt-32 bg-white bg-opacity-75 rounded-lg shadow-lg"
            >
                <div dir="rtl">
                    <h1 className="text-2xl font-bold mb-4 text-center">אימייל</h1>
                    <input
                        type="email"
                        id="email"
                        className="w-full px-4 py-2 mb-4 text-xl text-sky-900 border-2 border-sky-800 rounded-3xl shadow-lg"
                        placeholder="הכנס כתובת אימייל"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required  // Make email required
                    />
                </div>
                <div dir="rtl">
                    <h1 className="text-2xl font-bold mb-4 text-center">סיסמה</h1>
                    <input
                        type="password"
                        id="password"
                        className="w-full px-4 py-2 mb-4 text-xl text-sky-900 border-2 border-sky-800 rounded-3xl shadow-lg"
                        placeholder="הכנס סיסמה"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required  // Make password required
                    />
                </div>
                <div dir="rtl">
                    <button
                        type="submit"  // Change the button type to "submit"
                        className="block w-full px-8 py-4 text-xl text-white bg-blue-900 border-blue-900 rounded-3xl shadow-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
                    >
                        התחבר
                    </button>
                </div>
                <a href="/forgotPass" className="block mt-4 text-center text-lg text-sky-900 highlight px-2 rounded-md">
                    שכחתי סיסמה
                </a>
                <a href="/registration" className="block mt-2 text-center text-lg text-sky-900 highlight px-2 rounded-md">
                    אין משתמש? הירשם עכשיו
                </a>
            </form>
        </div>
    );
}

export default Login;
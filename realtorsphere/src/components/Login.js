import React, { useState } from 'react';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (event) => {
        event.preventDefault();
        console.log('Attempting to log in with:', email, password);
        try {
            const response = await fetch('http://localhost:5000/login', {  // Ensure the URL matches your backend's address
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include',  // Include credentials
            });

            const result = await response.json();
            console.log('Login response:', result);
            if (response.status === 200) {
                window.location.href = '/homescreen';  // Redirect to Home screen
            } else {
                alert(result.message);  // Display the error message
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen text-blue-950 bg-cover bg-center bg-fixed" style={{ backgroundImage: `url('/RealtorSphere.jpg')` }}>
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
                    <h1 className="text-2xl font-bold mb-4 text-center">סיסמה</h1>
                    <input
                        type="password"
                        id="password"
                        className="w-full px-4 py-2 mb-4 text-xl text-sky-900 border-2 border-sky-800 rounded-3xl shadow-lg"
                        placeholder="הכנס סיסמה"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div dir="rtl">
                    <button
                        onClick={handleLogin}
                        className="block w-full px-8 py-4 mt-6 text-xl text-white bg-blue-900 border-blue-900 rounded-3xl shadow-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
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
            </div>
        </div>
    );
}

export default Login;

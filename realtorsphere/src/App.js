import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import HomeScreen from './components/HomeScreen';
import Registration from './components/Registration';
function App() {
  return (
      <Router>
        <div className="App">
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/homescreen" element={<HomeScreen />} />
                <Route path="/registration" element={<Registration />} />
                {/* Add more routes as needed */}
            </Routes>
        </div>
      </Router>
  );
}

export default App;

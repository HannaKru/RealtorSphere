import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import HomeScreen from './components/HomeScreen';
import Registration from './components/Registration';
import ForgotPass from "./components/ForgotPass";
import PropertyPage from "./components/PropertyPage";
import SendMessage from "./components/SendMessage";
import ClientProfessionalPage from "./components/ClientProfessionalPage";
import DealsPage from "./components/DealsPage";
import MatchPage from "./components/match";
import ReportPage from "./components/ReportPage";
function App() {
  return (
      <Router>
        <div className="App">
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/homescreen" element={<HomeScreen />} />
                <Route path="/registration" element={<Registration />} />
                <Route path="/forgotPass" element={<ForgotPass />} />
                <Route path="/propertyPage" element={<PropertyPage />} />
                <Route path="/sendMessage" element={<SendMessage />} />
                <Route path="/clientProfessionalPage" element={<ClientProfessionalPage />} />
                <Route path="/deals" element={<DealsPage />} />
                <Route path="/getClients" element={<MatchPage />} />
                <Route path="/ReportPage" element={<ReportPage />} />
            </Routes>
        </div>
      </Router>
  );
}

export default App;

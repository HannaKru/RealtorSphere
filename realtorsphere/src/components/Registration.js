import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function Registration() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    id: '',
    phonePrefix: '050',
    phone: '',
    email: '',
    password: '',
    passwordRepeat: '',
    license: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validatePhone = () => {
    if (formData.phone.length !== 7 || isNaN(formData.phone)) {
      alert('מספר הטלפון חייב להיות בדיוק 7 ספרות');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validatePhone()) {
      try {
        const response = await axios.post('http://localhost:5000/registration', formData);
        if (response.status === 200) {
          // Successfully registered
          console.log('Form data:', formData);
          navigate('/success');
        } else {
          // Handle the case where registration was not successful
          alert(response.data.message);
        }
      } catch (error) {
        // Handle the error
        console.error('There was an error registering!', error);
        alert('Registration failed, please try again.');
      }
    }
  };

  return (
    <div className="flex items-start justify-start min-h-screen bg-fixed bg-center bg-cover" style={{ backgroundImage: "url('/RealtorSphereRegistration.jpg')" }}>
      <div className="form-container rtl bg-white bg-opacity-80 p-8 rounded-lg shadow-lg max-w-4xl mx-4 md:w-3/4 lg:w-1/2 xl:w-1/3">
        <h1 className="text-3xl font-bold mb-4 text-center">רישום משתמש חדש</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="firstName" className="block text-xl font-semibold mb-2">שם פרטי</label>
            <input type="text" id="firstName" name="firstName" className="input-field px-4 py-2 text-lg text-sky-900 border-2 border-sky-800 rounded-3xl shadow-lg w-full" placeholder="הכנס שם פרטי" value={formData.firstName} onChange={handleChange} required />
          </div>

          <div className="mb-4">
            <label htmlFor="lastName" className="block text-xl font-semibold mb-2">שם משפחה</label>
            <input type="text" id="lastName" name="lastName" className="input-field px-4 py-2 text-lg text-sky-900 border-2 border-sky-800 rounded-3xl shadow-lg w-full" placeholder="הכנס שם משפחה" value={formData.lastName} onChange={handleChange} required />
          </div>

          <div className="mb-4">
            <label htmlFor="id" className="block text-xl font-semibold mb-2">מס. זהות</label>
            <input type="text" id="id" name="id" maxLength="9" className="input-field px-4 py-2 text-lg text-sky-900 border-2 border-sky-800 rounded-3xl shadow-lg w-full" placeholder="הכנס מספר זהות" value={formData.id} onChange={handleChange} required />
          </div>

          <div className="mb-4">
            <label htmlFor="phone" className="block text-xl font-semibold mb-2">טלפון</label>
            <div className="flex">
              <select id="phonePrefix" name="phonePrefix" className="phone-prefix input-field px-4 py-2 text-lg text-sky-900 border-2 border-sky-800 rounded-3xl shadow-lg ltr" value={formData.phonePrefix} onChange={handleChange}>
                <option value="050">050</option>
                <option value="052">052</option>
                <option value="053">053</option>
                <option value="054">054</option>
                <option value="058">058</option>
              </select>
              <input type="tel" id="phone" name="phone" maxLength="7" className="phone-input input-field px-4 py-2 text-lg text-sky-900 border-2 border-sky-800 rounded-3xl shadow-lg w-full" placeholder="הכנס מספר טלפון" value={formData.phone} onChange={handleChange} required />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-xl font-semibold mb-2">אימייל</label>
            <input type="email" id="email" name="email" className="input-field px-4 py-2 text-lg text-sky-900 border-2 border-sky-800 rounded-3xl shadow-lg w-full" placeholder="הכנס כתובת אימייל" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-xl font-semibold mb-2">סיסמה</label>
            <input type="password" id="password" name="password" className="input-field px-4 py-2 text-lg text-sky-900 border-2 border-sky-800 rounded-3xl shadow-lg w-full" placeholder="הכנס סיסמה" value={formData.password} onChange={handleChange} required />
          </div>

          <div className="mb-4">
            <label htmlFor="passwordRepeat" className="block text-xl font-semibold mb-2">וידוי סיסמה</label>
            <input type="password" id="passwordRepeat" name="passwordRepeat" className="input-field px-4 py-2 text-lg text-sky-900 border-2 border-sky-800 rounded-3xl shadow-lg w-full" placeholder="הכנס סיסמה פעם נוספת" value={formData.passwordRepeat} onChange={handleChange} required />
          </div>

          <div className="mb-4">
            <label htmlFor="license" className="block text-xl font-semibold mb-2">מספר רישיון</label>
            <input type="text" id="license" name="license" className="input-field px-4 py-2 text-lg text-sky-900 border-2 border-sky-800 rounded-3xl shadow-lg w-full" placeholder="הכנס מספר רישיון" value={formData.license} onChange={handleChange} required />
          </div>

          <button type="submit" className="block w-full px-8 py-4 mt-6 text-xl text-white bg-blue-900 border-blue-900 rounded-3xl shadow-lg">הירשם</button>
        </form>
      </div>
    </div>
  );
}

export default Registration;

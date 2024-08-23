import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SendMessage = () => {
    const [emails, setEmails] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [dbFiles, setDbFiles] = useState([]);
    const [selectedDbFile, setSelectedDbFile] = useState('');

    useEffect(() => {
        // Fetch available files from the database
        const fetchFilesFromDB = async () => {
            try {
                const response = await axios.get('http://localhost:5000/getFiles');
                setDbFiles(response.data.files || []);
            } catch (error) {
                console.error('Error fetching files from database:', error);
            }
        };
        fetchFilesFromDB();
    }, []);

    const handleSend = async () => {
        const formData = new FormData();
        formData.append('emails', emails);
        formData.append('subject', subject);
        formData.append('message', message);
        if (attachment) {
            formData.append('attachment', attachment);
        }
        if (selectedDbFile) {
            formData.append('dbFile', selectedDbFile);
        }

        try {
            const response = await axios.post('http://localhost:5000/sendMessage', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Email sent successfully:', response.data);
        } catch (error) {
            console.error('Error sending email:', error);
        }
    };

    const handleFileChange = (e) => {
        setAttachment(e.target.files[0]);
    };

    const handleDbFileChange = (e) => {
        setSelectedDbFile(e.target.value);
    };

    return (
        <div className="bg-gray-50 min-h-screen rtl">
            <header className="bg-blue-900 p-4 text-white text-center">
                <h1 className="text-4xl">RealtorSphere</h1>
                <p className="text-lg">Makes Real Estate Easy</p>
            </header>

            <div className="p-6">
                {/* Email Addresses */}
                <div dir="rtl" className="mb-4">
                    <h1 className="text-2xl font-bold mb-4 text-center">אימייל</h1>
                    <input
                        type="email"
                        id="email"
                        className="w-full px-4 py-2 mb-4 text-xl text-sky-900 border-2 border-sky-800 rounded-3xl shadow-lg"
                        placeholder="הכנס כתובת אימייל (ניתן להוסיף כמה כתובות מופרדות בפסיקים)"
                        value={emails}
                        onChange={(e) => setEmails(e.target.value)}
                        multiple
                    />
                </div>

                {/* Subject */}
                <div dir="rtl" className="mb-4">
                    <h1 className="text-2xl font-bold mb-4 text-center">נושא</h1>
                    <input
                        type="text"
                        id="subject"
                        className="w-full px-4 py-2 mb-4 text-xl text-sky-900 border-2 border-sky-800 rounded-3xl shadow-lg"
                        placeholder="הכנס נושא"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                    />
                </div>

                {/* Message Body */}
                <div dir="rtl" className="mb-4">
                    <h1 className="text-2xl font-bold mb-4 text-center">הודעה</h1>
                    <textarea
                        id="message"
                        className="w-full px-4 py-2 mb-4 text-xl text-sky-900 border-2 border-sky-800 rounded-3xl shadow-lg"
                        placeholder="הכנס את ההודעה שלך כאן"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows="5"
                    />
                </div>

                {/* File Attachment from Device */}
                <div dir="rtl" className="mb-4">
                    <h1 className="text-2xl font-bold mb-4 text-center">צרף קובץ מהמכשיר</h1>
                    <input
                        type="file"
                        id="attachment"
                        className="w-full px-4 py-2 mb-4 text-xl text-sky-900 border-2 border-sky-800 rounded-3xl shadow-lg"
                        onChange={handleFileChange}
                    />
                </div>

                {/* File Attachment from Database */}
                <div dir="rtl" className="mb-4">
                    <h1 className="text-2xl font-bold mb-4 text-center">צרף קובץ ממערכת</h1>
                    <select
                        id="dbFile"
                        className="w-full px-4 py-2 mb-4 text-xl text-sky-900 border-2 border-sky-800 rounded-3xl shadow-lg"
                        value={selectedDbFile}
                        onChange={handleDbFileChange}
                    >
                        <option value="">בחר קובץ ממסד הנתונים</option>
                        {dbFiles.map((file, index) => (
                            <option key={index} value={file.url}>
                                {file.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Send Button */}
                <div dir="rtl">
                    <button
                        onClick={handleSend}
                        className="block w-full px-8 py-4 mt-6 text-xl text-white bg-blue-900 border-blue-900 rounded-3xl shadow-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
                    >
                        שלח אימייל
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SendMessage;

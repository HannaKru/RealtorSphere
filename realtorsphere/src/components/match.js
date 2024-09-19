import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MatchPage = () => {
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState('');
    const [propertyMatches, setPropertyMatches] = useState([]);
    const [userName, setUserName] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [clientEmail, setClientEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [emailStatus, setEmailStatus] = useState({});

    const fetchClients = async () => {
        try {
            const response = await axios.get('http://localhost:5000/getClients', { withCredentials: true });
            if (response.data && Array.isArray(response.data.clients)) {
                setClients(response.data.clients);
                setUserName(response.data.first_name);
            } else {
                console.error('Unexpected data format:', response.data);
                setError('Unexpected data format.');
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
            setError('Failed to load clients. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleClientChange = (e) => {
        setSelectedClient(e.target.value);
        const client = clients.find(c => c.id === e.target.value);
        if (client) {
            setClientEmail(client.email);
        }
    };

    const handleGenerateMatches = async () => {
        if (!selectedClient) return;
        const client = clients.find(c => c.id === selectedClient);
        if (!client) {
            console.error('Selected client not found');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/matchProperties', {
                clientId: selectedClient,
                clientData: client,
            }, { withCredentials: true });

            if (response.data.error) {
                setError(response.data.error);
            } else {
                setPropertyMatches(response.data);
                setIsPopupOpen(true);
            }
        } catch (error) {
            console.error('Error generating matches:', error);
            setError('Error while fetching matches.');
        }
    };

    const handleSendEmail = async (propertyId) => {
        try {
            setEmailStatus(prevStatus => ({
                ...prevStatus,
                [propertyId]: 'sending'
            }));

            const response = await axios.post('http://localhost:5000/sendMatches', {
                clientId: selectedClient,
                propertyId: propertyId,
                email: clientEmail
            }, { withCredentials: true });

            if (response.status === 200) {
                alert(`Property matches for property ID ${propertyId} sent to client.`);
                setEmailStatus(prevStatus => ({
                    ...prevStatus,
                    [propertyId]: 'sent'
                }));
            } else {
                console.error('Failed to send email:', response.status);
                setEmailStatus(prevStatus => ({
                    ...prevStatus,
                    [propertyId]: 'failed'
                }));
            }
        } catch (error) {
            console.error('Error sending matches via email:', error);
            setEmailStatus(prevStatus => ({
                ...prevStatus,
                [propertyId]: 'failed'
            }));
        }
    };

    const logout = async () => {
        try {
            const response = await axios.get('http://localhost:5000/logout', { withCredentials: true });
            if (response.status === 200) {
                localStorage.removeItem('currentUser');
                window.location.href = '/';
            } else {
                console.error('Failed to log out:', response.status);
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen rtl">
            {/* Header */}
            <header className="bg-blue-900 p-4 text-white sm:text-left sm:pl-8">
                <h1 className="text-3xl sm:text-4xl">RealtorSphere - Match Page</h1>
                <p className="text-lg sm:text-xl">Matching Clients with Properties</p>
            </header>

            {/* Greeting and Logout */}
            <div className="flex justify-between p-4 lg:p-6">
                <div className="text-right text-blue-900 font-bold text-xl lg:text-2xl">
                    {loading ? 'Loading...' : userName ? `שלום, ${userName}` : 'No Clients Found'}
                </div>
                <div className="text-blue-950 text-xl lg:text-2xl cursor-pointer" onClick={logout}>
                    התנתק
                </div>
            </div>

            <div className="p-4 sm:p-6">
                {/* Show loading or error messages */}
                {loading && <p>Loading clients...</p>}
                {error && <p className="text-red-500">{error}</p>}

                {/* Client Dropdown and Generate Button */}
                {!loading && clients.length > 0 && (
                    <div className="flex flex-col sm:flex-row justify-center mb-6">
                        <select
                            value={selectedClient}
                            onChange={handleClientChange}
                            className="p-2 mb-4 sm:mb-0 sm:mr-4 border rounded-md text-right"
                        >
                            <option value="">בחר לקוח</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>
                                    {client.first_name} {client.last_name} - {client.id}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={handleGenerateMatches}
                            className="bg-green-500 text-white p-2 rounded-md"
                            disabled={!selectedClient}
                        >
                            בצע התאמה
                        </button>
                    </div>
                )}

                {/* Popup Window for Viewing Property Matches */}
                {isPopupOpen && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-6 sm:w-full sm:max-w-lg rounded-md shadow-lg max-h-screen overflow-y-auto relative">
                            {error && <p className="text-red-500">{error}</p>}
                            <button
                                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                onClick={() => setIsPopupOpen(false)}
                            >
                                ×
                            </button>
                            <h2 className="text-2xl mb-4 text-center">נכסים מותאמים</h2>

                            {propertyMatches.length > 0 ? (
                                <ul>
                                    {propertyMatches.map((property, index) => (
                                        <li key={index} className="mb-4">
                                            <strong>מספר זיהוי הנכס:</strong> {property['Property ID']} <br/>
                                            <strong>מיקום:</strong> {property.Location} <br/>
                                            <strong>מחיר:</strong> {property.Price} <br/>
                                            <strong>גודל:</strong> {property.Size} sqm <br/>
                                            <strong>מספר חדרים:</strong> {property.Rooms} <br/>
                                            <strong>סוג נכס:</strong> {property.type} <br/>
                                            <button
                                                className={`ml-2 bg-blue-600 text-white p-1 rounded-md ${emailStatus[property['Property ID']] === 'sending' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                onClick={() => handleSendEmail(property['Property ID'])}
                                                disabled={emailStatus[property['Property ID']] === 'sending'}
                                            >
                                                {emailStatus[property['Property ID']] === 'sent' ? 'Sent' : 'Send Info'}
                                            </button>
                                            {emailStatus[property['Property ID']] === 'failed' && (
                                                <span className="text-red-500">השליחה נכשלה</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>לא נמצאו התאמות</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MatchPage;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MatchPage = () => {
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState('');
    const [propertyMatches, setPropertyMatches] = useState([]);
    const [userName, setUserName] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [clientEmail, setClientEmail] = useState(''); // Assuming client email to send property details

    const fetchClients = async () => {
        try {
            const response = await axios.get('http://localhost:5000/getClients', { withCredentials: true });
            setUserName(response.data.firstName);
            setClients(response.data);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    const handleClientChange = (e) => {
        const clientId = e.target.value;
        setSelectedClient(clientId);

        // Optionally, set the client email for sending property details
        const client = clients.find(c => c.id === clientId);
        if (client) {
            setClientEmail(client.email);
        }
    };

    const handleGenerateMatches = async () => {
        try {
            const response = await axios.post('http://localhost:5000/matchProperties', { clientId: selectedClient }, { withCredentials: true });
            setPropertyMatches(response.data);
            setIsPopupOpen(true);
        } catch (error) {
            console.error('Error generating matches:', error);
        }
    };

    const handleSendEmail = async () => {
        try {
            const response = await axios.post('http://localhost:5000/sendMatches', { clientId: selectedClient, properties: propertyMatches, email: clientEmail }, { withCredentials: true });
            if (response.status === 200) {
                alert('Property matches sent to client.');
            } else {
                console.error('Failed to send email:', response.status);
            }
        } catch (error) {
            console.error('Error sending matches via email:', error);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

const logout = async () => {
    try {
        // Send a logout request to the Flask backend
        const response = await axios.get('http://localhost:5000/logout', { withCredentials: true });

        if (response.status === 200) {
            // Remove local storage or any other frontend data
            localStorage.removeItem('currentUser');

            // Redirect to the login or homepage
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
            <header className="bg-blue-900 p-4 text-white text-center">
                <h1 className="text-4xl">RealtorSphere - Match Page</h1>
                <p className="text-lg">Matching Clients with Properties</p>

            </header>
            <div className="text-right text-white font-bold text-2xl mr-4">
                {userName ? `שלום, ${userName}` : 'Loading...'}
            </div>
            <div className="text-white text-4xl">🔔</div>
            <div className="text-white text-4xl" onClick={logout}>
                התנתק
            </div>


            <div className="p-6">
                {/* Client Dropdown and Generate Button */}
                <div className="flex justify-center mb-6">
                    <select
                        value={selectedClient}
                        onChange={handleClientChange}
                        className="p-2 border rounded-md text-right"
                    >
                        <option value="">בחר לקוח</option>
                        {clients.map(client => (
                            <option key={client.id} value={client.id}>
                                {client.firstName} {client.lastName} - {client.id}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={handleGenerateMatches}
                        className="bg-green-500 text-white p-2 rounded-md ml-4"
                        disabled={!selectedClient}
                    >
                        Generate Matches
                    </button>
                </div>

                {/* Popup Window for Viewing Property Matches */}
                {isPopupOpen && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-6 rounded-md shadow-lg w-96 max-h-screen overflow-y-auto relative">
                            <button
                                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                onClick={() => setIsPopupOpen(false)}
                            >
                                ×
                            </button>
                            <h2 className="text-2xl mb-4 text-center">Matched Properties</h2>

                            {propertyMatches.length > 0 ? (
                                <>
                                    <ul>
                                        {propertyMatches.map((property, index) => (
                                            <li key={index} className="mb-4">
                                                <strong>Property ID:</strong> {property.id} <br/>
                                                <strong>Location:</strong> {property.city}, {property.street} <br/>
                                                <strong>Price:</strong> {property.price} <br/>
                                                <strong>Size:</strong> {property.size} sqm <br/>
                                                <strong>Rooms:</strong> {property.roomsNum}
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        className="bg-blue-600 text-white p-2 rounded-md w-full mt-4"
                                        onClick={handleSendEmail}
                                    >
                                        Send to Client
                                    </button>
                                </>
                            ) : (
                                <p>No matches found.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MatchPage;

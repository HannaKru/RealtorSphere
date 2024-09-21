import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DealsPage = () => {
    const [deals, setDeals] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [realtorName, setRealtorName] = useState('Realtor');  // Placeholder for realtor's name
    const [selectedDeal, setSelectedDeal] = useState(null);  // For the popup window
    const [newPrice, setNewPrice] = useState('');  // New price suggestion
    const [suggester, setSuggester] = useState('owner');  // Default suggester is 'owner'
    const [newNote, setNewNote] = useState('');  // New note suggestion
    const [showNewDealForm, setShowNewDealForm] = useState(false);  // For the new deal form

    const [clients, setClients] = useState([]);
    const [owners, setOwners] = useState([]);
    const [properties, setProperties] = useState([]);

    const [selectedClientId, setSelectedClientId] = useState('');
    const [selectedOwnerId, setSelectedOwnerId] = useState('');
    const [selectedPropertyId, setSelectedPropertyId] = useState('');
    const [newStartDate, setNewStartDate] = useState('');
    const [newFirstPrice, setNewFirstPrice] = useState('');
    const [endDate, setEndDate] = useState('');


    // Define fetchDeals function so it can be used inside both useEffect and handleCreateNewDeal
    const fetchDeals = async () => {
        try {
            const response = await axios.get('http://localhost:5000/deals', { withCredentials: true });
            setDeals(response.data.deals);  // Set the deals
            setRealtorName(response.data.first_name);  // Set the realtor's first name
        } catch (error) {
            console.error('Error fetching deals:', error);
        }
    };

    useEffect(() => {
        fetchDeals();
    }, []);

  useEffect(() => {
    const fetchDropdownData = async () => {
        try {
            const [clientsResponse, ownersResponse, propertiesResponse] = await Promise.all([
                axios.get('http://localhost:5000/clients', { withCredentials: true }),
                axios.get('http://localhost:5000/owners', { withCredentials: true }),
                axios.get('http://localhost:5000/properties', { withCredentials: true })
            ]);
            console.log(clientsResponse.data);  // Log fetched data
            console.log(ownersResponse.data);   // Log fetched data
            console.log(propertiesResponse.data);  // Log fetched data
            setClients(clientsResponse.data[0]);
            setOwners(ownersResponse.data[0]);
            setProperties(propertiesResponse.data[0]);
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
        }
    };

    fetchDropdownData();
}, []);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredDeals = deals.filter(deal =>
        deal.id.includes(searchTerm) ||
        deal.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.client.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenPricePopup = async (deal) => {
        try {
            const response = await axios.get(`http://localhost:5000/dealDetails/${deal.id}`, { withCredentials: true });
            setSelectedDeal(response.data);
        } catch (error) {
            console.error('Error fetching deal details:', error);
        }
    };

    const handleClosePopup = () => {
        setSelectedDeal(null);
        // Close the popup
    };

    const handleClosePopup2 = () => {
        setShowNewDealForm(null);
        // Close the popup
    };

    const handleAddPriceSuggestion = async () => {
        if (!newPrice) {
            alert("Please enter a price.");
            return;
        }

        try {
            const suggesterName = suggester === 'owner' ? selectedDeal.owner : selectedDeal.client;

            const newSuggestion = {
                amount: parseInt(newPrice),
                suggester: suggesterName,
                note: newNote  // Add the note here
            };

            // Send new price suggestion to the backend
            await axios.post(`http://localhost:5000/dealPrice/${selectedDeal.id}`, newSuggestion, { withCredentials: true });

            // Update local state with the new suggestion
            setSelectedDeal(prev => ({
                ...prev,
                price: [...prev.price, newSuggestion]
            }));

            setNewPrice('');
            setNewNote('');  // Reset the note input
        } catch (error) {
            console.error('Error adding price suggestion:', error);
        }
    };

    const handleCreateNewDeal = async () => {
        try {
            const newDealData = {
                clientId: selectedClientId,
                ownerId: selectedOwnerId,
                propertyId: selectedPropertyId,
                startDate: newStartDate,
                firstPrice: parseInt(newFirstPrice),
                suggester: suggester || 'Realtor',  // Default to 'Realtor'
                note: newNote
            };

            await axios.post('http://localhost:5000/createDeal', newDealData, { withCredentials: true });

            // Reset the form after successful creation
            setSelectedClientId('');
            setSelectedOwnerId('');
            setSelectedPropertyId('');
            setNewStartDate('');
            setNewFirstPrice('');
            setNewNote('');
            setShowNewDealForm(false);

            // Refresh the deals list after adding a new one
            fetchDeals();
        } catch (error) {
            console.error('Error creating new deal:', error);
        }
    };
const handleCloseDeal = async (dealId) => {
    const today = new Date().toISOString().slice(0, 10); // Gets current date in YYYY-MM-DD format
    try {
        const response = await axios.post(`http://localhost:5000/closeDeal/${dealId}`, { endDate: new Date().toISOString() }, { withCredentials: true });
            if(response.status === 200) {
                fetchDeals(); // Re-fetch deals to get the updated status
            }
    } catch (error) {
        console.error('Error closing deal:', error);
        alert('Failed to close the deal.');
    }
};

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
        <div className="bg-cover bg-center min-h-screen text-white font-sans" style={{ backgroundImage: `url('/RealtorSphereMain.jpg')` }}>
            <header className="flex flex-col sm:flex-row justify-between items-center p-4 bg-blue-900 bg-opacity-75">
                <div>
                    <h1 className="text-3xl font-bold">RealtorSphere</h1>
                    <p className="text-lg">Makes Real Estate Easy</p>
                </div>
                <div className="flex items-center">
                    <span className="mr-4">,שלום {realtorName}!</span> {/* Display the realtor's first name */}
                </div>
                <div className="text-blue-950 text-xl lg:text-2xl cursor-pointer" onClick={logout}>
                    התנתק
                </div>
            </header>

            <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <input
                        type="text"
                        placeholder="חפש לפי מזהה עסקה, בעלים או לקוח"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full sm:w-2/3 p-2 rounded-md border border-gray-300 text-gray-900"
                    />
                    <button className="w-full sm:w-auto mt-4 sm:mt-0 bg-pink-700 hover:bg-pink-600 text-white p-2 rounded-md"
                        onClick={() => setShowNewDealForm(true)}>
                        הוסף עסקה חדשה
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white text-gray-800 rounded-md overflow-hidden text-right" dir="rtl">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-3 text-right">מזהה עסקה</th>
                                <th className="p-3 text-right">בעלים</th>
                                <th className="p-3 text-right">נכס</th>
                                <th className="p-3 text-right">לקוח</th>
                                <th className="p-3 text-right">פעולות</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDeals.map(deal => (
                                <tr key={deal.id} className="border-t border-gray-200">
                                    <td className="p-3">{deal.id}</td>
                                    <td className="p-3">{deal.owner}</td>
                                    <td className="p-3">{deal.property}</td>
                                    <td className="p-3">{deal.client}</td>
                                    <td className="p-3 flex space-x-2 justify-end">
                                        <button
                                            className="bg-green-500 hover:bg-green-400 text-white p-2 rounded-md"
                                            onClick={() => handleOpenPricePopup(deal)}
                                        >
                                            פתח
                                        </button>

                                    </td>
                                    <td>
                                {deal.status === 'closed' ? (
                                    <span>סגור</span>
                                ) : (
                                    <button onClick={() => handleCloseDeal(deal.id)} className="bg-red-500 hover:bg-red-400 text-white p-2 rounded-md">
                                        סגור
                                    </button>
                                )}
                            </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Popup window for price suggestions */}
            {selectedDeal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-black p-6 rounded-md shadow-lg w-96">
                        <button onClick={handleClosePopup} className="absolute top-0 right-0 text-white p-2 text-lg">
                            X {/* Simple X button */}
                        </button>
                        <h2 className="text-2xl mb-4">הצעות מחיר עבור נכס {selectedDeal.id}</h2>
                        <ul className="mb-4">
                            {selectedDeal.price && selectedDeal.price.length > 0 ? (
                                selectedDeal.price.map((price, index) => (
                                    price && price.amount ? ( // Add null/undefined checks here
                                        <li key={index}>
                                            {price.amount} ₪ - {price.suggester || 'Unknown'} -
                                            הערה: {price.note || 'ללא הערה'}
                                        </li>
                                    ) : (
                                        <li key={index}>איו מידע על הצעות</li>
                                    )
                                ))
                            ) : (
                                <li>הצעות לא זמינות</li>
                            )}
                        </ul>

                        <div className="mb-4">
                            <input
                                type="number"
                                placeholder="הכנס סכום"
                                value={newPrice}
                                onChange={(e) => setNewPrice(e.target.value)}
                                className="w-full text-black p-2 border rounded-md"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="mr-2">:מציע</label>
                            <select
                                value={suggester}
                                onChange={(e) => setSuggester(e.target.value)}
                                className="w-full text-black p-2 border rounded-md"
                            >
                                <option value="owner">בעלים</option>
                                <option value="client">לקוח</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <textarea
                                placeholder="הוסף הערה"
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                className="w-full text-black p-2 border rounded-md"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button className="bg-green-500 text-black p-2 rounded-md mr-2"
                                    onClick={handleAddPriceSuggestion}>
                                הוסף מחיר
                            </button>
                            <button className="bg-gray-300 text-black p-2 rounded-md" onClick={handleClosePopup}>
                                סגור
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Popup for creating a new deal */}
            {showNewDealForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-black p-6 rounded-md shadow-lg w-96">
                        <button onClick={handleClosePopup2} className="absolute top-0 right-0 text-white p-2 text-lg">
                            X {/* Simple X button */}
                        </button>
                        <h2 className="text-2xl mb-4">הוסף עסקה חדשה</h2>

                        <label>לקוח:</label>
                        <select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)}
                                className="w-full text-black p-2 border rounded-md mb-4">>
                            <option value="">Select a client</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>{client.name}</option>
                            ))}
                        </select>

                        <label>בעלים:</label>
                        <select value={selectedOwnerId} onChange={(e) => setSelectedOwnerId(e.target.value)}
                                className="w-full text-black p-2 border rounded-md mb-4">>
                            <option value="">Select an owner</option>
                            {owners.map(owner => (
                                <option key={owner.id} value={owner.id}>{owner.name}</option>
                            ))}
                        </select>

                        <label>נכס:</label>
                        <select value={selectedPropertyId} onChange={(e) => setSelectedPropertyId(e.target.value)}
                                className="w-full text-black p-2 border rounded-md mb-4">>
                            <option value="">Select a property</option>
                            {properties.map(property => (
                                <option key={property.id} value={property.id}>{property.address}</option>
                            ))}
                        </select>

                        <input
                            type="date"
                            value={newStartDate}
                            onChange={(e) => setNewStartDate(e.target.value)}
                            className="w-full text-black p-2 border rounded-md mb-4"
                            placeholder="תאריך התחלה"
                        />

                        <input
                            type="number"
                            value={newFirstPrice}
                            onChange={(e) => setNewFirstPrice(e.target.value)}
                            className="w-full text-black p-2 border rounded-md mb-4"
                            placeholder="הכנס סכום"
                        />

                        <textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            className="w-full text-black p-2 border rounded-md mb-4"
                            placeholder="הוסף הערה"
                        />

                        <button
                            className="bg-green-500 text-black p-2 rounded-md"
                            onClick={handleCreateNewDeal}
                        >
                            צור עסקה חדשה
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DealsPage;

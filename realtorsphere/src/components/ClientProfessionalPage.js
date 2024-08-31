import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ClientProfessionalPage = () => {
    const [activeTab, setActiveTab] = useState('owners');
    const [searchFilters, setSearchFilters] = useState({
        name: '',
        city: '',
        id: '',
    });
    const [filteredData, setFilteredData] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false); // State to control popup visibility
    const [newPerson, setNewPerson] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        type: 'Owner', // Default type set to Owner
        realtor: sessionStorage.getItem('user_email'), // Set the logged-in realtor's email
        // Client-specific fields
        buyORrent: 'rent', // Default to rent for clients
        budget: '',
        minRooms: '',
        maxRooms: '',
        minSize: '',
        maxSize: '',
        propertiesList: [],
    });

    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:5000/clientProfessionalPage', {
                params: {
                    name: searchFilters.name,
                    city: searchFilters.city,
                    id: searchFilters.id,
                    tab: activeTab,
                },
                withCredentials: true
            });
            setFilteredData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [searchFilters, activeTab]);

    const handleSearchChange = (e) => {
        setSearchFilters({ ...searchFilters, [e.target.name]: e.target.value });
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        fetchData();
    };

    const handleNewPersonChange = (e) => {
        const { name, value } = e.target;
        setNewPerson(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleAddPerson = async () => {
        try {
            // Prepare data to send to the backend
            const personData = {
                firstName: newPerson.firstName,
                lastName: newPerson.lastName,
                phone: newPerson.phone,
                email: newPerson.email,
                id: newPerson.id,
                type: newPerson.type,
                realtor: newPerson.realtor,
            };

            // Add client-specific fields only if the type is Client
            if (newPerson.type === 'Client') {
                personData.buyORrent = newPerson.buyORrent;
                personData.budget = newPerson.budget;
                personData.minRooms = newPerson.minRooms;
                personData.maxRooms = newPerson.maxRooms;
                personData.minSize = newPerson.minSize;
                personData.maxSize = newPerson.maxSize;
                personData.propertiesList = newPerson.propertiesList;
            }

            // Send the data to the backend
            const response = await axios.post('http://localhost:5000/addPerson', personData, {
                withCredentials: true,
            });

            if (response.status === 200) {
                setIsPopupOpen(false); // Close the popup after saving
                fetchData(); // Refresh the data
            } else {
                console.error('Failed to save new person:', response.status);
            }
        } catch (error) {
            console.error('Error adding new person:', error);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen rtl">
            <header className="bg-blue-900 p-4 text-white text-center">
                <h1 className="text-4xl">RealtorSphere</h1>
                <p className="text-lg">Makes Real Estate Easy</p>
            </header>

            <div className="p-6">
                {/* Centered Search Filters */}
                <div className="flex flex-col justify-center items-center mb-6">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <input
                            type="text"
                            name="name"
                            placeholder="שם"
                            value={searchFilters.name}
                            onChange={handleSearchChange}
                            className="p-2 border rounded-md text-right"
                        />
                        <input
                            type="text"
                            name="city"
                            placeholder="עיר"
                            value={searchFilters.city}
                            onChange={handleSearchChange}
                            className="p-2 border rounded-md text-right"
                        />
                        <input
                            type="text"
                            name="id"
                            placeholder="ת.ז"
                            value={searchFilters.id}
                            onChange={handleSearchChange}
                            className="p-2 border rounded-md text-right"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={fetchData} className="bg-blue-600 text-white p-2 rounded-md">
                            חיפוש
                        </button>
                        <button onClick={() => setIsPopupOpen(true)} className="bg-purple-600 text-white p-2 rounded-md">
                            הוסף איש קשר
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex justify-around mb-4">
                    {['owners', 'clients'].map((tab, index) => (
                        <button
                            key={index}
                            className={`p-2 rounded-md ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                            onClick={() => handleTabChange(tab)}
                        >
                            {tab === 'owners' ? 'בעלים' : 'לקוחות'}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white text-right" dir="rtl">
                        <thead>
                            <tr>
                                <th className="p-2 border-b-2 border-gray-300 text-gray-600">ת.ז</th>
                                <th className="p-2 border-b-2 border-gray-300 text-gray-600">שם</th>
                                <th className="p-2 border-b-2 border-gray-300 text-gray-600">טלפון</th>
                                <th className="p-2 border-b-2 border-gray-300 text-gray-600">עיר</th>
                                <th className="p-2 border-b-2 border-gray-300 text-gray-600">סטטוס</th>
                                {activeTab === 'clients' && (
                                    <th className="p-2 border-b-2 border-gray-300 text-gray-600">תקציב</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((data, index) => (
                                <tr key={index}>
                                    <td className="p-2 border-b">{data.id}</td>
                                    <td className="p-2 border-b">{data.FirstName} {data.LastName}</td>
                                    <td className="p-2 border-b">{data.Phone}</td>
                                    <td className="p-2 border-b">{data.city || 'N/A'}</td>
                                    <td className="p-2 border-b">
                                        {activeTab === 'clients' ? data.Type.Client?.buyORrent || 'N/A' : data.Type.Owner?.sellORrent || 'N/A'}
                                    </td>
                                    {activeTab === 'clients' && (
                                        <td className="p-2 border-b">{data.Type.Client?.budget || 'N/A'}</td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Popup Window */}
                {isPopupOpen && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-6 rounded-md shadow-lg w-96 max-h-screen overflow-y-auto">
                            <h2 className="text-2xl mb-4">Add New Person</h2>
                            <div className="mb-4">
                                <label className="block text-right">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={newPerson.firstName}
                                    onChange={handleNewPersonChange}
                                    className="w-full p-2 border rounded-md"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-right">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={newPerson.lastName}
                                    onChange={handleNewPersonChange}
                                    className="w-full p-2 border rounded-md"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-right">Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={newPerson.phone}
                                    onChange={handleNewPersonChange}
                                    className="w-full p-2 border rounded-md"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-right">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={newPerson.email}
                                    onChange={handleNewPersonChange}
                                    className="w-full p-2 border rounded-md"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-right">ID</label>
                                <input
                                    type="text"
                                    name="id"
                                    value={newPerson.id}
                                    onChange={handleNewPersonChange}
                                    className="w-full p-2 border rounded-md"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-right">Type</label>
                                <select
                                    name="type"
                                    value={newPerson.type}
                                    onChange={handleNewPersonChange}
                                    className="w-full p-2 border rounded-md"
                                >
                                    <option value="Owner">Owner</option>
                                    <option value="Client">Client</option>
                                </select>
                            </div>
                            {/* Conditional fields for clients */}
                            {newPerson.type === 'Client' && (
                                <>
                                    <div className="mb-4">
                                        <label className="block text-right">Budget</label>
                                        <input
                                            type="number"
                                            name="budget"
                                            value={newPerson.budget}
                                            onChange={handleNewPersonChange}
                                            className="w-full p-2 border rounded-md"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-right">Rent or Buy</label>
                                        <select
                                            name="buyORrent"
                                            value={newPerson.buyORrent}
                                            onChange={handleNewPersonChange}
                                            className="w-full p-2 border rounded-md"
                                        >
                                            <option value="rent">Rent</option>
                                            <option value="buy">Buy</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-right">Min Rooms</label>
                                            <input
                                                type="number"
                                                name="minRooms"
                                                value={newPerson.minRooms}
                                                onChange={handleNewPersonChange}
                                                className="w-full p-2 border rounded-md"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-right">Max Rooms</label>
                                            <input
                                                type="number"
                                                name="maxRooms"
                                                value={newPerson.maxRooms}
                                                onChange={handleNewPersonChange}
                                                className="w-full p-2 border rounded-md"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-right">Min Size (sqm)</label>
                                            <input
                                                type="number"
                                                name="minSize"
                                                value={newPerson.minSize}
                                                onChange={handleNewPersonChange}
                                                className="w-full p-2 border rounded-md"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-right">Max Size (sqm)</label>
                                            <input
                                                type="number"
                                                name="maxSize"
                                                value={newPerson.maxSize}
                                                onChange={handleNewPersonChange}
                                                className="w-full p-2 border rounded-md"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                            <div className="flex justify-end">
                                <button onClick={() => setIsPopupOpen(false)}
                                        className="bg-gray-300 p-2 rounded-md mr-2">
                                    Cancel
                                </button>
                                <button onClick={handleAddPerson} className="bg-blue-600 text-white p-2 rounded-md">
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientProfessionalPage;

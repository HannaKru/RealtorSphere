import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ClientProfessionalPage = () => {
    const [activeTab, setActiveTab] = useState('owners');
    const [searchFilters, setSearchFilters] = useState({
        name: '',
        id: '',
    });
    const [filteredData, setFilteredData] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isNewPersonPopupOpen, setIsNewPersonPopupOpen] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [newCity, setNewCity] = useState('');
    const [newProperty, setNewProperty] = useState(''); // For managing the new property input
    const [availableProperties, setAvailableProperties] = useState([]); // For managing available properties
    const propertyTypes = ["Apartment", "Duplex Apartment", "Private Home", "Two-Family", "House Penthouse"];

    const [newPerson, setNewPerson] = useState({
        id: '',
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        type: 'Client',
        budget: '',
        buyORrent: 'rent',
        minRooms: '',
        maxRooms: '',
        minSize: '',
        maxSize: '',
        propertyType: '',
        cities: [],
    });

    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:5000/clientProfessionalPage', {
                params: {
                    name: searchFilters.name,
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

    const handleViewDetails = async (personId) => {
        try {
            const response = await axios.get(`http://localhost:5000/personDetails/${personId}`, {
                withCredentials: true
            });
            setSelectedPerson(response.data);
            setIsPopupOpen(true);
        } catch (error) {
            console.error('Error fetching person details:', error);
        }
    };

    const handleRemovePerson = async (personId) => {
        try {
            const response = await axios.delete(`http://localhost:5000/removePerson/${personId}`, {
                withCredentials: true
            });
            if (response.status === 200) {
                alert('Person removed successfully');
                fetchData(); // Refresh the data
            } else {
                console.error('Failed to remove person:', response.status);
            }
        } catch (error) {
            console.error('Error removing person:', error);
        }
    };

    const closePopup = () => {
        setIsPopupOpen(false);
        setSelectedPerson(null);
    };

    const handleEditPerson = async () => {
        try {
            const response = await axios.post('http://localhost:5000/editPerson', selectedPerson, { withCredentials: true });
            if (response.status === 200) {
                alert('Person updated successfully');
                setIsPopupOpen(false);
                fetchData(); // Refresh the data
            } else {
                console.error('Failed to update person:', response.status);
            }
        } catch (error) {
            console.error('Error updating person:', error);
        }
    };

    const handleNewPersonChange = (e) => {
        const { name, value } = e.target;
        setNewPerson((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddCity = () => {
        if (newCity.trim() !== "") {
            setNewPerson((prevPerson) => ({
                ...prevPerson,
                cities: [...prevPerson.cities, newCity.trim()],
            }));
            setNewCity(''); // Clear input after adding
        }
    };

    const handleRemoveCity = (index) => {
        setNewPerson((prevPerson) => ({
            ...prevPerson,
            cities: prevPerson.cities.filter((_, idx) => idx !== index),
        }));
    };

    const handleAddCityForEditing = () => {
    if (newCity.trim() !== "") {
        setSelectedPerson(prevPerson => ({
            ...prevPerson,
            Type: {
                ...prevPerson.Type,
                Client: {
                    ...prevPerson.Type.Client,
                    searchCity: [...(prevPerson.Type.Client.searchCity || []), newCity.trim()]
                }
            }
        }));
        setNewCity(''); // Clear the input after adding
    }
};

const handleRemoveCityForEditing = (cityToRemove) => {
    setSelectedPerson(prevPerson => ({
        ...prevPerson,
        Type: {
            ...prevPerson.Type,
            Client: {
                ...prevPerson.Type.Client,
                searchCity: prevPerson.Type.Client.searchCity.filter(city => city !== cityToRemove)
            }
        }
    }));
};

    const handleAddPerson = async () => {
        try {
            const response = await axios.post('http://localhost:5000/addPerson', newPerson, {
                withCredentials: true,
            });

            if (response.status === 200) {
                setIsNewPersonPopupOpen(false); // Close the popup after saving
                fetchData(); // Refresh the data
            } else {
                console.error('Failed to save new person:', response.status);
            }
        } catch (error) {
            console.error('Error adding new person:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedPerson((prevPerson) => ({
            ...prevPerson,
            [name]: value,
        }));
    };

    const handleClientChange = (e) => {
        const { name, value } = e.target;
        setSelectedPerson((prevPerson) => ({
            ...prevPerson,
            Type: {
                ...prevPerson.Type,
                Client: {
                    ...prevPerson.Type.Client,
                    [name]: value,
                },
            },
        }));
    };

    const handleAddProperty = (propertyInput) => {
        if (propertyInput.trim() !== "") {
            setSelectedPerson(prevPerson => ({
                ...prevPerson,
                Type: {
                    ...prevPerson.Type,
                    Client: {
                        ...prevPerson.Type.Client,
                        PropertiesList: [...(prevPerson.Type.Client.PropertiesList || []), propertyInput]
                    }
                }
            }));
            setNewProperty(''); // Clear input after adding
        }
    };

    const handleRemoveProperty = (propertyId) => {
        setSelectedPerson(prevPerson => ({
            ...prevPerson,
            Type: {
                ...prevPerson.Type,
                Client: {
                    ...prevPerson.Type.Client,
                    PropertiesList: prevPerson.Type.Client.PropertiesList.filter(id => id !== propertyId)
                }
            }
        }));
    };

    return (
        <div className="bg-gray-50 min-h-screen rtl">
            <header className="bg-blue-900 p-4 text-white text-center">
                <h1 className="text-4xl">RealtorSphere</h1>
                <p className="text-lg">Makes Real Estate Easy</p>
            </header>

            <div className="p-6">
                {/* Search Filters */}
                <div className="flex flex-col justify-center items-center mb-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
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
                        <button onClick={() => setIsNewPersonPopupOpen(true)} className="bg-purple-600 text-white p-2 rounded-md">
                            הוסף איש קשר חדש
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
                                <th className="p-2 border-b-2 border-gray-300 text-gray-600">סטטוס</th>
                                <th className="p-2 border-b-2 border-gray-300 text-gray-600">לצפייה</th>
                                <th className="p-2 border-b-2 border-gray-300 text-gray-600">הסר</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((data, index) => (
                                <tr key={index}>
                                    <td className="p-2 border-b">{data.id}</td>
                                    <td className="p-2 border-b">{data.FirstName} {data.LastName}</td>
                                    <td className="p-2 border-b">{data.Phone}</td>
                                    <td className="p-2 border-b">
                                        {activeTab === 'clients' ? data.Type.Client?.buyORrent || 'N/A' : data.Type.Owner ? 'Owner' : 'N/A'}
                                    </td>
                                    <td className="p-2 border-b">
                                        <button className="bg-blue-500 text-white p-2 rounded-md"
                                                onClick={() => handleViewDetails(data.id)}>
                                            צפייה
                                        </button>
                                    </td>
                                    <td className="p-2 border-b">
                                        <button className="bg-red-500 text-white p-2 rounded-md"
                                                onClick={() => handleRemovePerson(data.id)}>
                                            הסר
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Popup Window for Viewing and Editing Details */}
            {isPopupOpen && selectedPerson && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center overflow-auto">
                    <div className="bg-white p-6 rounded-md shadow-lg w-96 max-h-full overflow-y-auto">
                        <h2 className="text-2xl mb-4">Details for {selectedPerson.FirstName} {selectedPerson.LastName}</h2>
                        <p><strong>Phone:</strong> <input type="text" name="Phone" value={selectedPerson.Phone} onChange={handleInputChange} className="w-full p-2 border rounded-md" /></p>
                        <p><strong>Email:</strong> <input type="text" name="email" value={selectedPerson.email} onChange={handleInputChange} className="w-full p-2 border rounded-md" /></p>

                        {selectedPerson?.Type?.Client && (
                            <>
                                <h3 className="text-xl mt-4">Client Preferences</h3>
                                <p><strong>Budget:</strong> <input type="text" name="budget" value={selectedPerson?.Type?.Client?.budget} onChange={handleClientChange} className="w-full p-2 border rounded-md" /></p>
                                <p><strong>Rooms:</strong> <input type="text" name="minRooms" value={selectedPerson?.Type?.Client?.minRooms} onChange={handleClientChange} className="w-full p-2 border rounded-md" /> - <input type="text" name="maxRooms" value={selectedPerson?.Type?.Client?.maxRooms} onChange={handleClientChange} className="w-full p-2 border rounded-md" /></p>
                                <p><strong>Size:</strong> <input type="text" name="minSize" value={selectedPerson?.Type?.Client?.minSize} onChange={handleClientChange} className="w-full p-2 border rounded-md" /> - <input type="text" name="maxSize" value={selectedPerson?.Type?.Client?.maxSize} onChange={handleClientChange} className="w-full p-2 border rounded-md" /> sqm</p>

                                <p><strong>Property Type:</strong></p>
                                <select
                                    name="propertyType"
                                    value={selectedPerson?.Type?.Client?.propertyType || ''}
                                    onChange={handleClientChange}
                                    className="w-full p-2 border rounded-md"
                                >
                                    <option value="">Select Property Type</option>
                                    {propertyTypes.map((type, index) => (
                                        <option key={index} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>

                                <h3 className="text-xl mt-4">Preferred Cities</h3>
                                <ul>
                                    {(selectedPerson?.Type?.Client?.searchCity  || []).map((city, index) => (
                                        <li key={index} className="flex justify-between">
                                            {city}
                                            <button onClick={() => handleRemoveCityForEditing(city)} className="bg-red-500 text-white p-1 rounded-md ml-2">Remove</button>
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex">
                                    <input
                                        type="text"
                                        placeholder="Add City"
                                        value={newCity}
                                        onChange={(e) => setNewCity(e.target.value)}
                                        className="w-full p-2 border rounded-md mb-4"
                                    />
                                    <button onClick={handleAddCityForEditing} className="bg-green-500 text-white p-2 rounded-md ml-2">Add</button>
                                </div>

                                <h3 className="text-xl mt-4">Properties Liked</h3>
                                <ul>
                                    {(selectedPerson?.Type?.Client?.PropertiesList || []).map((property, index) => (
                                        <li key={index}>
                                            {property}
                                            <button onClick={() => handleRemoveProperty(property)} className="bg-red-500 text-white p-1 rounded-md ml-2">Remove</button>
                                        </li>
                                    ))}
                                </ul>

                                <h3 className="text-xl mt-4">Add Property</h3>
                                <input
                                    type="text"
                                    placeholder="Enter Property Address or ID"
                                    value={newProperty}
                                    onChange={(e) => setNewProperty(e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                />
                                <button
                                    onClick={() => handleAddProperty(newProperty)}
                                    className="bg-green-500 text-white p-2 rounded-md ml-2 mt-2"
                                >
                                    Add
                                </button>
                            </>
                        )}

                        {selectedPerson?.Type?.Owner && (
                            <>
                                <h3 className="text-xl mt-4">Owned Properties</h3>
                                <ul>
                                    {(selectedPerson?.PropertiesOwned || []).map((property, index) => (
                                        <li key={index}>
                                            {property.address}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}

                        <div className="flex justify-end">
                            <button className="bg-blue-500 text-white p-2 rounded-md mr-2" onClick={handleEditPerson}>Save Changes</button>
                            <button className="bg-gray-300 p-2 rounded-md" onClick={closePopup}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Popup Window for Adding New Person */}
            {isNewPersonPopupOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-md shadow-lg w-96 max-h-screen overflow-y-auto relative">
                        <button
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                            onClick={() => setIsNewPersonPopupOpen(false)}
                        >
                            ×
                        </button>
                        <h2 className="text-2xl mb-4 text-center">Add New Person</h2>

                        {/* New Person Input Fields */}
                        <div className="mb-4">
                            <label className="block">ID</label>
                            <input
                                type="text"
                                name="id"
                                value={newPerson.id}
                                onChange={handleNewPersonChange}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block">First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                value={newPerson.firstName}
                                onChange={handleNewPersonChange}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                value={newPerson.lastName}
                                onChange={handleNewPersonChange}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block">Phone</label>
                            <input
                                type="text"
                                name="phone"
                                value={newPerson.phone}
                                onChange={handleNewPersonChange}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={newPerson.email}
                                onChange={handleNewPersonChange}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block">Type</label>
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

                        {/* Conditional fields for Client */}
                        {newPerson.type === 'Client' && (
                            <>
                                <div className="mb-4">
                                    <label className="block">Budget</label>
                                    <input
                                        type="number"
                                        name="budget"
                                        value={newPerson.budget}
                                        onChange={handleNewPersonChange}
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block">Rent or Buy</label>
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
                                        <label className="block">Min Rooms</label>
                                        <input
                                            type="number"
                                            name="minRooms"
                                            value={newPerson.minRooms}
                                            onChange={handleNewPersonChange}
                                            className="w-full p-2 border rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="block">Max Rooms</label>
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
                                        <label className="block">Min Size (sqm)</label>
                                        <input
                                            type="number"
                                            name="minSize"
                                            value={newPerson.minSize}
                                            onChange={handleNewPersonChange}
                                            className="w-full p-2 border rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="block">Max Size (sqm)</label>
                                        <input
                                            type="number"
                                            name="maxSize"
                                            value={newPerson.maxSize}
                                            onChange={handleNewPersonChange}
                                            className="w-full p-2 border rounded-md"
                                        />
                                    </div>
                                </div>
                                <p><strong>Property Type:</strong></p>
                                <select
                                    name="propertyType"
                                    value={newPerson.propertyType}
                                    onChange={handleNewPersonChange}
                                    className="w-full p-2 border rounded-md mb-4"
                                >
                                    <option value="">Select Property Type</option>
                                    {propertyTypes.map((type, index) => (
                                        <option key={index} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                                <h3 className="text-xl mb-4">Cities Considered</h3>
                                <ul>
                                    {(newPerson.cities || []).map((city, index) => (
                                        <li key={index} className="flex justify-between">
                                            {city}
                                            <button onClick={() => handleRemoveCity(index)} className="bg-red-500 text-white p-1 rounded-md ml-2">Remove</button>
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex">
                                    <input
                                        type="text"
                                        placeholder="Add City"
                                        value={newCity}
                                        onChange={(e) => setNewCity(e.target.value)}
                                        className="w-full p-2 border rounded-md mb-4"
                                    />
                                    <button onClick={handleAddCity} className="bg-green-500 text-white p-2 rounded-md ml-2">Add</button>
                                </div>
                            </>
                        )}

                        <button className="bg-blue-600 text-white p-2 rounded-md w-full" onClick={handleAddPerson}>
                            Save
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientProfessionalPage;

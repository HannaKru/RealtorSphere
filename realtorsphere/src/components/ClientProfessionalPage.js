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
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [availableProperties, setAvailableProperties] = useState([]);

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

    const fetchAvailableProperties = async () => {
        try {
            const response = await axios.get('http://localhost:5000/properties', {
                withCredentials: true
            });
            setAvailableProperties(response.data);
        } catch (error) {
            console.error('Error fetching properties:', error);
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
            await fetchAvailableProperties(); // Fetch properties when viewing details
            setIsPopupOpen(true);
        } catch (error) {
            console.error('Error fetching person details:', error);
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedPerson(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleClientChange = (e) => {
        const { name, value } = e.target;
        setSelectedPerson(prevState => ({
            ...prevState,
            Type: {
                ...prevState.Type,
                Client: {
                    ...prevState.Type.Client,
                    [name]: value
                }
            }
        }));
    };

    const handleOwnerChange = (e) => {
        const { name, value } = e.target;
        setSelectedPerson(prevState => ({
            ...prevState,
            Type: {
                ...prevState.Type,
                Owner: {
                    ...prevState.Type.Owner,
                    [name]: value
                }
            }
        }));
    };

    const handleAddProperty = (propertyId) => {
        setSelectedPerson(prevState => ({
            ...prevState,
            Type: {
                ...prevState.Type,
                Client: {
                    ...prevState.Type.Client,
                    PropertiesList: [...(prevState.Type.Client.PropertiesList || []), propertyId]
                }
            }
        }));
    };

    const handleRemoveProperty = (propertyId) => {
        setSelectedPerson(prevState => ({
            ...prevState,
            Type: {
                ...prevState.Type,
                Client: {
                    ...prevState.Type.Client,
                    PropertiesList: prevState.Type.Client.PropertiesList.filter(id => id !== propertyId)
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
                                <th className="p-2 border-b-2 border-gray-300 text-gray-600">לצפייה</th>
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
                                        {activeTab === 'clients' ? data.Type.Client?.buyORrent || 'N/A' : data.Type.Owner ? 'Owner' : 'N/A'}
                                    </td>
                                    <td className="p-2 border-b">
                                        <button className="bg-blue-500 text-white p-2 rounded-md" onClick={() => handleViewDetails(data.id)}>
                                            צפייה
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Popup Window for Viewing and Editing Details */}
                {isPopupOpen && selectedPerson && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center overflow-auto">
                        <div className="bg-white p-6 rounded-md shadow-lg w-96 max-h-full overflow-y-auto">
                            <h2 className="text-2xl mb-4">Details for {selectedPerson.FirstName} {selectedPerson.LastName}</h2>
                            <p><strong>Phone:</strong> <input type="text" name="Phone" value={selectedPerson.Phone} onChange={handleInputChange} className="w-full p-2 border rounded-md" /></p>
                            <p><strong>Email:</strong> <input type="text" name="email" value={selectedPerson.email} onChange={handleInputChange} className="w-full p-2 border rounded-md" /></p>

                            {selectedPerson.Type.Owner && (
                                <>
                                    <h3 className="text-xl mt-4">Properties Owned</h3>
                                    <ul>
                                        {(selectedPerson.PropertiesOwned || []).map((property, index) => (
                                            <li key={index}>{property.id} - {property.address}</li>
                                        ))}
                                    </ul>
                                </>
                            )}

                            {selectedPerson.Type.Client && (
                                <>
                                    <h3 className="text-xl mt-4">Client Preferences</h3>
                                    <p><strong>Budget:</strong> <input type="text" name="budget" value={selectedPerson.Type.Client.budget} onChange={handleClientChange} className="w-full p-2 border rounded-md" /></p>
                                    <p><strong>Rooms:</strong> <input type="text" name="minRooms" value={selectedPerson.Type.Client.minRooms} onChange={handleClientChange} className="w-full p-2 border rounded-md" /> - <input type="text" name="maxRooms" value={selectedPerson.Type.Client.maxRooms} onChange={handleClientChange} className="w-full p-2 border rounded-md" /></p>
                                    <p><strong>Size:</strong> <input type="text" name="minSize" value={selectedPerson.Type.Client.minSize} onChange={handleClientChange} className="w-full p-2 border rounded-md" /> - <input type="text" name="maxSize" value={selectedPerson.Type.Client.maxSize} onChange={handleClientChange} className="w-full p-2 border rounded-md" /> sqm</p>

                                    <h3 className="text-xl mt-4">Properties Liked</h3>
                                    <ul>
                                        {(selectedPerson.PropertiesLiked || []).map((property, index) => (
                                            <li key={index}>
                                                {property.id} - {property.address}
                                                <button onClick={() => handleRemoveProperty(property.id)} className="bg-red-500 text-white p-1 rounded-md ml-2">Remove</button>
                                            </li>
                                        ))}
                                    </ul>

                                    <h3 className="text-xl mt-4">Add Property</h3>
                                    <select onChange={(e) => handleAddProperty(e.target.value)} className="w-full p-2 border rounded-md">
                                        <option value="">Select Property</option>
                                        {availableProperties.map((property) => (
                                            <option key={property.id} value={property.id}>
                                                {property.id} - {property.Steet} {property.house}, {property.city}
                                            </option>
                                        ))}
                                    </select>
                                </>
                            )}

                            <div className="flex justify-end">
                                <button className="bg-blue-500 text-white p-2 rounded-md mr-2" onClick={handleEditPerson}>Save Changes</button>
                                <button className="bg-gray-300 p-2 rounded-md" onClick={closePopup}>Close</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientProfessionalPage;

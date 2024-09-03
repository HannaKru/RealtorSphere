import React, { useCallback, useEffect, useState } from 'react';
import axios from "axios";

const PropertyPage = () => {
    const [activeTab, setActiveTab] = useState('כל הנכסים');
    const [searchFilters, setSearchFilters] = useState({
        ownerName: '',
        roomNumberFrom: '',
        roomNumberTo: '',
        priceFrom: '',
        priceTo: '',
        city: '',
        propertyType: '',
        address: '',
    });

    const [properties, setProperties] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false); // For controlling the popup window
    const [newProperty, setNewProperty] = useState({
        street: '',
        city: '',
        house: '',
        neighborhood: '',
        propertyType: 'apartment', // Default to apartment
        roomsNum: '',
        price: '',
        ownerName: '',
        ownerID: '',
        startDate: '',
        file: null,
        size: '',
        ac: '',
        accessibility: false,
        age: '',
        bars: false,
        numberOfFloors: '',
        security: false,
        status: 'active', // default value
        floor: '',
        apNum: '',
        bathroomsNum: '',
        notes: '',
        rooms: [],
        parkingNumber: '',
        elevator: false,  // New elevator field
    });

    const fetchUserData = useCallback(async () => {
    try {
        const response = await axios.get('http://localhost:5000/propertyPage', {
            params: {
                ...searchFilters,
                transactionType: activeTab,
                email: sessionStorage.getItem('user_email'),
            },
            withCredentials: true
        });
        if (response.status === 200) {
            setProperties(response.data);
        } else {
            console.error('Failed to fetch data, status:', response.status);
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}, [searchFilters, activeTab]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    const handleSearchChange = (e) => {
        setSearchFilters({ ...searchFilters, [e.target.name]: e.target.value });
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        fetchUserData();
    };

    const handleNewPropertyChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewProperty(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleRoomChange = (index, e) => {
        const { name, value } = e.target;
        setNewProperty(prevState => {
            const updatedRooms = [...prevState.rooms];
            updatedRooms[index] = {
                ...updatedRooms[index],
                [name]: value
            };
            return {
                ...prevState,
                rooms: updatedRooms
            };
        });
    };

    const addRoom = () => {
        setNewProperty(prevState => ({
            ...prevState,
            rooms: [...prevState.rooms, { length: '', width: '', roomType: '' }]
        }));
    };

    const handleFileChange = (e) => {
        setNewProperty(prevState => ({
            ...prevState,
            file: e.target.files[0]
        }));
    };

    const handleAddProperty = async () => {
        try {
            const formData = new FormData();

            // Add the necessary fields to formData
            for (const key in newProperty) {
                if (key !== 'rooms') {
                    formData.append(key, newProperty[key]);
                }
            }

            // Add room data
            formData.append('rooms', JSON.stringify(newProperty.rooms));

            const response = await axios.post('http://localhost:5000/addProperty', formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response.status === 200) {
                setIsPopupOpen(false); // Close the popup after saving
                fetchUserData(); // Refresh the data
            } else {
                console.error('Failed to save new property:', response.status);
            }
        } catch (error) {
            console.error('Error adding new property:', error);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen rtl">
            <header className="bg-blue-900 p-4 text-white text-center">
                <h1 className="text-4xl">RealtorSphere</h1>
                <p className="text-lg">Makes Real Estate Easy</p>
            </header>

            <div className="p-6">
                {/* Search Filters */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                    <input
                        type="text"
                        name="ownerName"
                        placeholder="שם בעלים"
                        value={searchFilters.ownerName}
                        onChange={handleSearchChange}
                        className="p-2 border rounded-md text-right"
                    />
                    <input
                        type="number"
                        name="roomNumberFrom"
                        placeholder="מס׳ חדרים (מ-)"
                        value={searchFilters.roomNumberFrom}
                        onChange={handleSearchChange}
                        className="p-2 border rounded-md text-right"
                    />
                    <input
                        type="number"
                        name="roomNumberTo"
                        placeholder="מס׳ חדרים (עד-)"
                        value={searchFilters.roomNumberTo}
                        onChange={handleSearchChange}
                        className="p-2 border rounded-md text-right"
                    />
                    <input
                        type="number"
                        name="priceFrom"
                        placeholder="מחיר (מ-)"
                        value={searchFilters.priceFrom}
                        onChange={handleSearchChange}
                        className="p-2 border rounded-md text-right"
                    />
                    <input
                        type="number"
                        name="priceTo"
                        placeholder="מחיר (עד-)"
                        value={searchFilters.priceTo}
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
                        name="propertyType"
                        placeholder="סוג נכס"
                        value={searchFilters.propertyType}
                        onChange={handleSearchChange}
                        className="p-2 border rounded-md text-right"
                    />
                    <input
                        type="text"
                        name="address"
                        placeholder="כתובת"
                        value={searchFilters.address}
                        onChange={handleSearchChange}
                        className="p-2 border rounded-md text-right"
                    />
                    <button className="col-span-2 md:col-span-1 bg-blue-600 text-white p-2 rounded-md" onClick={fetchUserData}>
                        חיפוש
                    </button>

                    <button className="col-span-2 md:col-span-1 bg-pink-700 text-white p-2 rounded-md" onClick={() => setIsPopupOpen(true)}>
                        הוסף נכס חדש
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex justify-around mb-4">
                    {['כל הנכסים', 'להשכרה', 'למכירה', 'מקורות חיצוניים', 'ארכיון'].map(tab => (
                        <button
                            key={tab}
                            className={`p-2 rounded-md ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                            onClick={() => handleTabChange(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Property Table */}
                <table className="min-w-full bg-white text-right">
                    <thead>
                        <tr>
                            {['סטטוס', 'בעלים', 'מס׳ חדרים', 'מחיר', 'גודל במ"ר', 'כתובת', 'עיר', 'סוג נכס'].map(header => (
                                <th key={header} className="p-2 border-b-2 border-gray-300 text-gray-600">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {properties.map(property => (
                            <tr key={property.id}>
                                <td className="p-2 border-b">{property.status || 'N/A'}</td>
                                <td className="p-2 border-b">{property.owner || 'N/A'}</td>
                                <td className="p-2 border-b">{property.rooms || 'N/A'}</td>
                                <td className="p-2 border-b">{property.price || 'N/A'}</td>
                                <td className="p-2 border-b">{property.size || 'N/A'}</td>
                                <td className="p-2 border-b">{property.address || 'N/A'}</td>
                                <td className="p-2 border-b">{property.city || 'N/A'}</td>
                                <td className="p-2 border-b">{property.propertyType || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Popup Window for Adding New Property */}
            {isPopupOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center overflow-auto">
                    <div className="bg-white p-6 rounded-md shadow-lg w-96 max-h-full overflow-y-auto">
                        <h2 className="text-2xl mb-4">Add New Property</h2>
                        <div className="mb-4">
                            <label className="block text-right">Street</label>
                            <input
                                type="text"
                                name="street"
                                value={newProperty.street}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">City</label>
                            <input
                                type="text"
                                name="city"
                                value={newProperty.city}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">House Number</label>
                            <input
                                type="text"
                                name="house"
                                value={newProperty.house}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">Neighborhood</label>
                            <input
                                type="text"
                                name="neighborhood"
                                value={newProperty.neighborhood}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">Property Type</label>
                            <select
                                name="propertyType"
                                value={newProperty.propertyType}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="apartment">Apartment</option>
                                <option value="duplex apartment">Duplex Apartment</option>
                                <option value="private home">Private Home</option>
                                <option value="two-family house">Two-Family House</option>
                                <option value="penthouse">Penthouse</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">Rooms Number</label>
                            <input
                                type="number"
                                name="roomsNum"
                                value={newProperty.roomsNum}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">Price</label>
                            <input
                                type="number"
                                name="price"
                                value={newProperty.price}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">Size (sqm)</label>
                            <input
                                type="number"
                                name="size"
                                value={newProperty.size}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>

                        {/* Transaction Type Dropdown */}
                        <div className="mb-4">
                            <label className="block text-right">For Sale or Rent</label>
                            <select
                                name="transactionType"
                                value={newProperty.transactionType}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="rent">Rent</option>
                                <option value="sell">Sell</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-right">Number of Parking Spaces</label>
                            <input
                                type="number"
                                name="parkingNumber"
                                value={newProperty.parkingNumber}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">AC Units</label>
                            <input
                                type="number"
                                name="ac"
                                value={newProperty.ac}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">Accessibility</label>
                            <input
                                type="checkbox"
                                name="accessibility"
                                checked={newProperty.accessibility}
                                onChange={handleNewPropertyChange}
                                className="mr-2"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">Building Age (years)</label>
                            <input
                                type="number"
                                name="age"
                                value={newProperty.age}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">Bars on Windows</label>
                            <input
                                type="checkbox"
                                name="bars"
                                checked={newProperty.bars}
                                onChange={handleNewPropertyChange}
                                className="mr-2"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">Elevator</label>
                            <input
                                type="checkbox"
                                name="elevator"
                                checked={newProperty.elevator}
                                onChange={handleNewPropertyChange}
                                className="mr-2"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">Number of Floors</label>
                            <input
                                type="number"
                                name="numberOfFloors"
                                value={newProperty.numberOfFloors}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">Security Features</label>
                            <input
                                type="checkbox"
                                name="security"
                                checked={newProperty.security}
                                onChange={handleNewPropertyChange}
                                className="mr-2"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">Floor Number</label>
                            <input
                                type="number"
                                name="floor"
                                value={newProperty.floor}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">Apartment Number</label>
                            <input
                                type="number"
                                name="apNum"
                                value={newProperty.apNum}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">Bathroom Number</label>
                            <input
                                type="number"
                                name="bathroomsNum"
                                value={newProperty.bathroomsNum}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">Additional Notes</label>
                            <textarea
                                name="notes"
                                value={newProperty.notes}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>

                        {/* Dynamic Room Input Section */}
                        {newProperty.rooms.map((room, index) => (
                            <div key={index} className="mb-4 border p-2 rounded-md">
                                <h3 className="text-lg mb-2">Room {index + 1}</h3>
                                <div className="mb-4">
                                    <label className="block text-right">Length (m)</label>
                                    <input
                                        type="number"
                                        name="length"
                                        value={room.length}
                                        onChange={(e) => handleRoomChange(index, e)}
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-right">Width (m)</label>
                                    <input
                                        type="number"
                                        name="width"
                                        value={room.width}
                                        onChange={(e) => handleRoomChange(index, e)}
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-right">Room Type</label>
                                    <select
                                        name="roomType"
                                        value={room.roomType}
                                        onChange={(e) => handleRoomChange(index, e)}
                                        className="w-full p-2 border rounded-md"
                                    >
                                        <option value="">Select Room Type</option>
                                        <option value="bedroom">Bedroom</option>
                                        <option value="livingroom">Living Room</option>
                                        <option value="bathroom">Bathroom</option>
                                        <option value="balcony">Balcony</option>
                                        <option value="garden">Garden</option>
                                        <option value="saferoom">Safe Room</option>
                                        <option value="storage">Storage</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                        <button onClick={addRoom} className="bg-green-500 text-white p-2 rounded-md mb-4">
                            Add Another Room
                        </button>

                        <div className="mb-4">
                            <label className="block text-right">Owner Name</label>
                            <input
                                type="text"
                                name="ownerName"
                                value={newProperty.ownerName}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">Owner ID</label>
                            <input
                                type="text"
                                name="ownerID"
                                value={newProperty.ownerID}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">Start Date</label>
                            <input
                                type="date"
                                name="startDate"
                                value={newProperty.startDate}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">Picture</label>
                            <input
                                type="file"
                                name="file"
                                onChange={handleFileChange}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div className="flex justify-end">
                            <button onClick={() => setIsPopupOpen(false)}
                                    className="bg-gray-300 p-2 rounded-md mr-2">
                                Cancel
                            </button>
                            <button onClick={handleAddProperty} className="bg-blue-600 text-white p-2 rounded-md">
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PropertyPage;

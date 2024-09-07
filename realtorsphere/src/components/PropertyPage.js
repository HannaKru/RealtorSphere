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

    const [allProperties, setAllProperties] = useState([]); // Store all properties
    const [filteredProperties, setFilteredProperties] = useState([]); // Store filtered properties
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

     // Fetches all properties for the logged-in realtor when the component loads
    const fetchAllProperties = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:5000/propertyPage', {
                params: {
                    email: sessionStorage.getItem('user_email'),
                },
                withCredentials: true,
            });

            if (response.status === 200) {
                setProperties(response.data);
            } else {
                console.error('Failed to fetch data, status:', response.status);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }, []);

    // Fetches properties based on search filters
    const fetchFilteredProperties = useCallback(async () => {
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
                const fetchedProperties = response.data;

                if (Array.isArray(fetchedProperties) && fetchedProperties.length === 0) {
                    alert('אין רשומה מתאימה');  // Use alert for no results message
                } else {
                    setProperties(fetchedProperties); // Set properties if found
                }
            } else {
                console.error('Failed to fetch data, status:', response.status);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            alert('אין רשומה מתאימה');
        }
    }, [searchFilters, activeTab]);

    // Filter properties based on the active tab
    const filterPropertiesByTab = (tab) => {
    if (tab === 'למכירה') {
    return properties.filter(property => property.transactionType === 'sell' && property.status === 'active');
    } else if (tab === 'להשכרה') {
    return properties.filter(property => property.transactionType === 'rent' && property.status === 'active');
    } else if (tab === 'ארכיון') {
    return properties.filter(property => property.status === 'inactive');
    }
    return properties; // Show all properties for כל הנכסים
    };

    // Load all properties when the page loads
    useEffect(() => {
        fetchAllProperties();
    }, [fetchAllProperties]);

    useEffect(() => {
        const filtered = filterPropertiesByTab(activeTab);
        setFilteredProperties(filtered);
    }, [properties, activeTab]);




    const handleSearchChange = (e) => {
        setSearchFilters({ ...searchFilters, [e.target.name]: e.target.value });
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        const filtered = filterPropertiesByTab(tab);
        setFilteredProperties(filtered);
        //fetchFilteredProperties();
    };

    const handleSearchClick = () => {
        fetchFilteredProperties(); // Apply search when the search button is clicked
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
                fetchAllProperties(); // Refresh the data
            } else {
                console.error('Failed to save new property:', response.status);
            }
        } catch (error) {
            console.error('Error adding new property:', error);
        }
    };

    const handleSubmit = (e) => {
  e.preventDefault(); // Prevent the default form submission
  handleSearchClick(); // Call the existing search function
};


    return (
        <div className="bg-gray-50 min-h-screen rtl">
            <header className="bg-blue-900 p-4 text-white text-center">
                <h1 className="text-4xl">RealtorSphere</h1>
                <p className="text-lg">Makes Real Estate Easy</p>
            </header>

            <div className="p-6">
                {/* Search Filters */}
                <form onSubmit={handleSubmit} className="search-form">
                    <div className="form-row">
                        <input
                            type="text"
                            name="address"
                            placeholder="כתובת"
                            value={searchFilters.address}
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
                            name="city"
                            placeholder="עיר"
                            value={searchFilters.city}
                            onChange={handleSearchChange}
                            className="p-2 border rounded-md text-right"
                        />
                        <div className="input-group">
                            <input
                                type="number"
                                name="priceTo"
                                placeholder="מחיר (עד)"
                                value={searchFilters.priceTo}
                                onChange={handleSearchChange}
                                className="p-2 border rounded-md text-right"
                            />
                            <input
                                type="number"
                                name="priceFrom"
                                placeholder="מחיר (מ)"
                                value={searchFilters.priceFrom}
                                onChange={handleSearchChange}
                                className="p-2 border rounded-md text-right"
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="number"
                                name="roomNumberTo"
                                placeholder="חדרים (עד)"
                                value={searchFilters.roomNumberTo}
                                onChange={handleSearchChange}
                                className="p-2 border rounded-md text-right"
                            />
                            <input
                                type="number"
                                name="roomNumberFrom"
                                placeholder="חדרים (מ)"
                                value={searchFilters.roomNumberFrom}
                                onChange={handleSearchChange}
                                className="p-2 border rounded-md text-right"
                            />
                        </div>
                        <input
                            type="text"
                            name="ownerName"
                            placeholder="שם בעלים"
                            value={searchFilters.ownerName}
                            onChange={handleSearchChange}
                            className="p-2 border rounded-md text-right"
                        />
                    </div>

                    <div className="form-row">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white p-2 rounded-md"
                        >
                            חיפוש
                        </button>
                        <button
                            type="button"
                            className="bg-pink-700 text-white p-2 rounded-md"
                            onClick={() => setIsPopupOpen(true)}
                        >
                            הוסף נכס חדש
                        </button>
                    </div>
                </form>

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
                    {filteredProperties.map((property, index) => (
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
                    <div className="bg-white p-6 rounded-lg relative w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                        <button
                            onClick={() => setIsPopupOpen(false)}
                            className="absolute top-2 left-2 text-gray-600 hover:text-gray-800"
                        >
                            ✕
                        </button>
                        <h2 className="text-2xl mb-4">הוספת נכס חדש</h2>
                        <div className="mb-4">
                            <label className="block text-right">רחוב</label>
                            <input
                                type="text"
                                name="street"
                                value={newProperty.street}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                                dir="rtl"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">עיר</label>
                            <input
                                type="text"
                                name="city"
                                value={newProperty.city}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                                dir="rtl"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">מס' בית</label>
                            <input
                                type="text"
                                name="house"
                                value={newProperty.house}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                                dir="rtl"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">שכונה</label>
                            <input
                                type="text"
                                name="neighborhood"
                                value={newProperty.neighborhood}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                                dir="rtl"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">סוג הנכס</label>
                            <select
                                name="propertyType"
                                value={newProperty.propertyType}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                                dir="rtl"
                            >
                                <option value="apartment">דירה</option>
                                <option value="duplex apartment">דירת דופלקס</option>
                                <option value="private home">בית פרטי</option>
                                <option value="two-family house">בית דו-משפחתי</option>
                                <option value="penthouse">פנטהאוס</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">מס' חדרים</label>
                            <input
                                type="number"
                                name="roomsNum"
                                value={newProperty.roomsNum}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                                dir="rtl"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">מחיר</label>
                            <input
                                type="number"
                                name="price"
                                value={newProperty.price}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                                dir="rtl"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">גודל (במטרים מרובעים)</label>
                            <input
                                type="number"
                                name="size"
                                value={newProperty.size}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                                dir="rtl"
                            />
                        </div>

                        {/* Transaction Type Dropdown */}
                        <div className="mb-4">
                            <label className="block text-right">למכירה או להשכרה?</label>
                            <select
                                name="transactionType"
                                value={newProperty.transactionType}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                                dir="rtl"
                            >
                                <option value="rent">השכרה</option>
                                <option value="sell">מכירה</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-right">מס' חניות</label>
                            <input
                                type="number"
                                name="parkingNumber"
                                value={newProperty.parkingNumber}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                                dir="rtl"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">מס' מזגנים</label>
                            <input
                                type="number"
                                name="ac"
                                value={newProperty.ac}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                                dir="rtl"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">גישה לנכים</label>
                            <input
                                type="checkbox"
                                name="accessibility"
                                checked={newProperty.accessibility}
                                onChange={handleNewPropertyChange}
                                className="mr-2"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">גיל המבנה</label>
                            <input
                                type="number"
                                name="age"
                                value={newProperty.age}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                                dir="rtl"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">סורגים על חלונות</label>
                            <input
                                type="checkbox"
                                name="bars"
                                checked={newProperty.bars}
                                onChange={handleNewPropertyChange}
                                className="mr-2"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">מעלית</label>
                            <input
                                type="checkbox"
                                name="elevator"
                                checked={newProperty.elevator}
                                onChange={handleNewPropertyChange}
                                className="mr-2"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">מס' קומות בנכס</label>
                            <input
                                type="number"
                                name="numberOfFloors"
                                value={newProperty.numberOfFloors}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                                dir="rtl"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">אבטחה</label>
                            <input
                                type="checkbox"
                                name="security"
                                checked={newProperty.security}
                                onChange={handleNewPropertyChange}
                                className="mr-2"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">קומת הנכס</label>
                            <input
                                type="number"
                                name="floor"
                                value={newProperty.floor}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                                dir="rtl"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">מס' דירה</label>
                            <input
                                type="number"
                                name="apNum"
                                value={newProperty.apNum}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                                dir="rtl"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">מס' חדרי שירותים</label>
                            <input
                                type="number"
                                name="bathroomsNum"
                                value={newProperty.bathroomsNum}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                                dir="rtl"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">הערות נוספות</label>
                            <textarea
                                name="notes"
                                value={newProperty.notes}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                                dir="rtl"
                            />
                        </div>

                        {/* Dynamic Room Input Section */}
                        {newProperty.rooms.map((room, index) => (
                            <div key={index} className="mb-4 border p-2 rounded-md">
                                <h3 className="text-lg mb-2">Room {index + 1}</h3>
                                <div className="mb-4">
                                    <label className="block text-right">אורך (מ')</label>
                                    <input
                                        type="number"
                                        name="length"
                                        value={room.length}
                                        onChange={(e) => handleRoomChange(index, e)}
                                        className="w-full p-2 border rounded-md"
                                        dir="rtl"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-right">רוחב (מ')</label>
                                    <input
                                        type="number"
                                        name="width"
                                        value={room.width}
                                        onChange={(e) => handleRoomChange(index, e)}
                                        className="w-full p-2 border rounded-md"
                                        dir="rtl"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-right">סוג החדר:</label>
                                    <select
                                        name="roomType"
                                        value={room.roomType}
                                        onChange={(e) => handleRoomChange(index, e)}
                                        className="w-full p-2 border rounded-md"
                                    >
                                        <option value="">בחר את סוג החדר:</option>
                                        <option value="bedroom">חדר שינה</option>
                                        <option value="livingroom">סלון</option>
                                        <option value="bathroom">שירותים</option>
                                        <option value="balcony">מרפסת</option>
                                        <option value="garden">גינה</option>
                                        <option value="saferoom">ממ"ד</option>
                                        <option value="storage">מחסן</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                        <button onClick={addRoom} className="bg-green-500 text-white p-2 rounded-md mb-4">
                            הוספת חדר נוסף
                        </button>

                        <div className="mb-4">
                            <label className="block text-right">שם הבעלים</label>
                            <input
                                type="text"
                                name="ownerName"
                                value={newProperty.ownerName}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                                dir="rtl"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">ת"ז הבעלים</label>
                            <input
                                type="text"
                                name="ownerID"
                                value={newProperty.ownerID}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                                dir="rtl"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">תאריך תחילת העסקה</label>
                            <input
                                type="date"
                                name="startDate"
                                value={newProperty.startDate}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">תמונות</label>
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
                                בטל
                            </button>
                            <button onClick={handleAddProperty} className="bg-blue-600 text-white p-2 rounded-md">
                                שמור
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default PropertyPage;
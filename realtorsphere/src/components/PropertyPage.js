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

    const fetchUserData = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:5000/propertyPage', {
                params: {
                    ...searchFilters,
                    transactionType: activeTab,
                    email: sessionStorage.getItem('user_email'),  // Assuming email is stored in sessionStorage
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
        fetchUserData(); // Update properties when the tab is changed
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
                    {/* Input fields */}
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

                    <button className="col-span-2 md:col-span-1 bg-pink-700 text-white p-2 rounded-md">
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
        </div>
    );
};

export default PropertyPage;

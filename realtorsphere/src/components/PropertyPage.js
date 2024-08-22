import React, {useCallback, useEffect, useState} from 'react';
import axios from "axios";

const PropertyPage = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [searchFilters, setSearchFilters] = useState({
        ownerName: '',
        roomNumberFrom: '',
        roomNumberTo: '',
        priceFrom: '',
        priceTo: '',
        city: '',
        propertyType: '',
        address: '',
        transactionType: '',
    });

    const [properties, setProperties] = useState([]);

    // Fetch user data from API
    const fetchUserData = useCallback(async () => {
        try {
            console.log('Fetching user data...');
            const response = await axios.get('http://localhost:5000/propertyPage', { withCredentials: true });
            console.log('Response:', response);  // Debugging to check the response
            if (response.status === 200) {
                setProperties(response.data);
                console.log('Properties:', response.data);  // Check the fetched properties data
            } else {
                console.error('Failed to fetch data, status:', response.status);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }, []);

    // UseEffect to call fetchUserData when component mounts
    useEffect(() => {
        fetchUserData();  // Fetch data when component mounts
    }, [fetchUserData]);

    // Handle search filter input change
    const handleSearchChange = (e) => {
        setSearchFilters({ ...searchFilters, [e.target.name]: e.target.value });
    };

    // Handle tab change for filtering properties
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    // Filter properties based on search filters and active tab
    const filteredProperties = Array.isArray(properties)
        ? properties.filter(property => {
            return (
                (activeTab === 'all' || property.transactionType === activeTab) &&
                (searchFilters.ownerName === '' || property.owner.includes(searchFilters.ownerName)) &&
                (searchFilters.roomNumberFrom === '' || property.rooms >= parseInt(searchFilters.roomNumberFrom)) &&
                (searchFilters.roomNumberTo === '' || property.rooms <= parseInt(searchFilters.roomNumberTo)) &&
                (searchFilters.priceFrom === '' || property.price >= parseInt(searchFilters.priceFrom)) &&
                (searchFilters.priceTo === '' || property.price <= parseInt(searchFilters.priceTo)) &&
                (searchFilters.city === '' || property.city.includes(searchFilters.city)) &&
                (searchFilters.propertyType === '' || property.propertyType.includes(searchFilters.propertyType)) &&
                (searchFilters.address === '' || property.address.includes(searchFilters.address)) &&
                (searchFilters.transactionType === '' || property.transactionType.includes(searchFilters.transactionType))
            );
        })
        : [];

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
                    <input
                        type="text"
                        name="transactionType"
                        placeholder="סוג עסקה"
                        value={searchFilters.transactionType}
                        onChange={handleSearchChange}
                        className="p-2 border rounded-md text-right"
                    />
                    <button className="col-span-2 md:col-span-1 bg-blue-600 text-white p-2 rounded-md">
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
                            className={`p-2 rounded-md ${activeTab === tab.toLowerCase() ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                            onClick={() => handleTabChange(tab.toLowerCase())}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Property Table */}
                <table className="min-w-full bg-white">
                    <thead>
                    <tr>
                        {['סטטוס', 'בעלים', 'מס׳ חדרים', 'מחיר', 'גודל במ"ר', 'כתובת', 'עיר', 'סוג נכס'].map(header => (
                            <th key={header}
                                className="p-2 border-b-2 border-gray-300 text-right text-gray-600">{header}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {filteredProperties && filteredProperties.map(property => (
                        property && (
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
                        )
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PropertyPage;

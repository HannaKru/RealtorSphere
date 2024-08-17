import React, { useState } from 'react';

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

    const properties = [
        // Populate with property data
    ];

    const handleSearchChange = (e) => {
        setSearchFilters({ ...searchFilters, [e.target.name]: e.target.value });
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const filteredProperties = properties.filter(property => {
        // Implement filtering logic based on searchFilters and activeTab
    });

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
                                <th key={header} className="p-2 border-b-2 border-gray-300 text-right text-gray-600">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProperties.map(property => (
                            <tr key={property.id}>
                                <td className="p-2 border-b">{property.status}</td>
                                <td className="p-2 border-b">{property.owner}</td>
                                <td className="p-2 border-b">{property.rooms}</td>
                                <td className="p-2 border-b">{property.price}</td>
                                <td className="p-2 border-b">{property.size}</td>
                                <td className="p-2 border-b">{property.address}</td>
                                <td className="p-2 border-b">{property.city}</td>
                                <td className="p-2 border-b">{property.propertyType}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PropertyPage;

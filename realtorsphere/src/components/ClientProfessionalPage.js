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
                        <button className="bg-purple-600 text-white p-2 rounded-md">
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
            </div>
        </div>
    );
};

export default ClientProfessionalPage;

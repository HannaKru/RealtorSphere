import React, { useState } from 'react';

const ClientProfessionalPage = () => {
    const [activeTab, setActiveTab] = useState('clients');
    const [searchFilters, setSearchFilters] = useState({
        name: '',
        city: '',
        id: '',
    });

    const [clients, setClients] = useState([]); // Sample data for clients
    const [professionals, setProfessionals] = useState([]); // Sample data for professionals

    const handleSearchChange = (e) => {
        setSearchFilters({ ...searchFilters, [e.target.name]: e.target.value });
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const filteredData = activeTab === 'clients'
        ? clients.filter(client =>
            client.name.includes(searchFilters.name) &&
            client.city.includes(searchFilters.city)
          )
        : professionals.filter(professional =>
            professional.name.includes(searchFilters.name) &&
            professional.city.includes(searchFilters.city)
          );

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
                        <button className="bg-blue-600 text-white p-2 rounded-md">
                            חיפוש
                        </button>
                        <button className="bg-purple-600 text-white p-2 rounded-md">
                            הוסף איש קשר
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex justify-around mb-4">
                    {['אנשי מקצוע', 'משפצים', 'שוכרים', 'מוכרים'].map((tab, index) => (
                        <button
                            key={index}
                            className={`p-2 rounded-md ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                            onClick={() => handleTabChange(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            {['הערות', 'סכום מבוקש', 'סטטוס', 'עיר', 'טלפון', 'שם', 'ת.ז'].map((header, index) => (
                                <th key={index}
                                    className="p-2 border-b-2 border-gray-300 text-right text-gray-600">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((data, index) => (
                            <tr key={index}>
                                <td className="p-2 border-b text-right">{data.notes}</td>
                                <td className="p-2 border-b text-right">{data.requestedAmount}</td>
                                <td className="p-2 border-b text-right">{data.status}</td>
                                <td className="p-2 border-b text-right">{data.city}</td>
                                <td className="p-2 border-b text-right">{data.phone}</td>
                                <td className="p-2 border-b text-right">{data.name}</td>
                                <td className="p-2 border-b text-right">{data.id}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ClientProfessionalPage;

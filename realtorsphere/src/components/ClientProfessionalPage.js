import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ClientProfessionalPage = () => {
    const [activeTab, setActiveTab] = useState('owners');
    const [searchFilters, setSearchFilters] = useState({
        name: '',
        city: '',
        id: '',
    });

    const [owners, setOwners] = useState([]);
    const [clients, setClients] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/clientProfessionalPage', { withCredentials: true });
                const data = response.data;

                const ownersData = data.filter(person => person.Type && person.Type.Owner);
                const clientsData = data.filter(person => person.Type && person.Type.Client);

                setOwners(ownersData);
                setClients(clientsData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const handleSearchChange = (e) => {
        setSearchFilters({ ...searchFilters, [e.target.name]: e.target.value });
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const filteredData = activeTab === 'clients'
        ? clients.filter(client =>
            (client.FirstName && client.FirstName.includes(searchFilters.name)) &&
            (client.LastName && client.LastName.includes(searchFilters.name)) &&
            (client.city && client.city.includes(searchFilters.city))
          )
        : owners.filter(owner =>
            (owner.FirstName && owner.FirstName.includes(searchFilters.name)) &&
            (owner.LastName && owner.LastName.includes(searchFilters.name)) &&
            (owner.city && owner.city.includes(searchFilters.city))
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
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="p-2 border-b-2 border-gray-300 text-right text-gray-600">ת.ז</th>
                            <th className="p-2 border-b-2 border-gray-300 text-right text-gray-600">שם</th>
                            <th className="p-2 border-b-2 border-gray-300 text-right text-gray-600">טלפון</th>
                            <th className="p-2 border-b-2 border-gray-300 text-right text-gray-600">עיר</th>
                            <th className="p-2 border-b-2 border-gray-300 text-right text-gray-600">סטטוס</th>
                            {activeTab === 'clients' && (
                                <th className="p-2 border-b-2 border-gray-300 text-right text-gray-600">תקציב</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((data, index) => (
                            <tr key={index}>
                                <td className="p-2 border-b text-right">{data.id}</td>
                                <td className="p-2 border-b text-right">{data.FirstName} {data.LastName}</td>
                                <td className="p-2 border-b text-right">{data.Phone}</td>
                                <td className="p-2 border-b text-right">{data.city || 'N/A'}</td>
                                <td className="p-2 border-b text-right">
                                    {activeTab === 'clients' ? data.Type.Client.buyORrent : data.Type.Owner.sellORrent}
                                </td>
                                {activeTab === 'clients' && (
                                    <td className="p-2 border-b text-right">{data.Type.Client.budget || 'N/A'}</td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ClientProfessionalPage;

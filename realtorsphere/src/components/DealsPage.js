import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DealsPage = () => {
    const [deals, setDeals] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const realtorName = sessionStorage.getItem('user_name') || 'Realtor'; // Replace with actual name retrieval logic

    useEffect(() => {
        // Fetch deals from your backend API
        const fetchDeals = async () => {
            try {
                const response = await axios.get('http://localhost:5000/deals', { withCredentials: true });
                setDeals(response.data);
            } catch (error) {
                console.error('Error fetching deals:', error);
            }
        };

        fetchDeals();
    }, []);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredDeals = deals.filter(deal =>
        deal.id.includes(searchTerm) ||
        deal.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.client.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-cover bg-center min-h-screen text-white font-sans" style={{ backgroundImage: `url('/RealtorSphereMain.jpg')` }}>
            <header className="flex justify-between items-center p-4 bg-blue-900 bg-opacity-75">
                <h1 className="text-3xl font-bold">RealtorSphere</h1>
                <div className="flex items-center">
                    <span className="mr-4">Hello, {realtorName}!</span>
                    <img src="/path-to-image/alarm-bell-icon.png" alt="Alarm Bell" className="w-6 h-6" />
                </div>
            </header>

            <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                    <input
                        type="text"
                        placeholder="Search by Deal ID, Owner, or Client"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full sm:w-2/3 p-2 rounded-md border border-gray-300 text-gray-900"
                    />
                    <button className="w-full sm:w-auto mt-4 sm:mt-0 bg-pink-700 hover:bg-pink-600 text-white p-2 rounded-md">
                        Add New Deal
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white text-gray-800 rounded-md overflow-hidden">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-3 text-left">Deal ID</th>
                                <th className="p-3 text-left">Owner</th>
                                <th className="p-3 text-left">Property</th>
                                <th className="p-3 text-left">Client</th>
                                <th className="p-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDeals.map(deal => (
                                <tr key={deal.id} className="border-t border-gray-200">
                                    <td className="p-3">{deal.id}</td>
                                    <td className="p-3">{deal.owner}</td>
                                    <td className="p-3">{deal.property}</td>
                                    <td className="p-3">{deal.client}</td>
                                    <td className="p-3 flex space-x-2">
                                        <button className="bg-green-500 hover:bg-green-400 text-white p-2 rounded-md">
                                            Open
                                        </button>
                                        <button className="bg-red-500 hover:bg-red-400 text-white p-2 rounded-md">
                                            Close
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DealsPage;
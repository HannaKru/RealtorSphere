import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DealsPage = () => {
    const [deals, setDeals] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [realtorName, setRealtorName] = useState('Realtor');  // Placeholder for realtor's name

    useEffect(() => {
        // Fetch deals and realtor name from the backend
        const fetchDeals = async () => {
            try {
                const response = await axios.get('http://localhost:5000/deals', { withCredentials: true });
                setDeals(response.data.deals);  // Set the deals
                setRealtorName(response.data.first_name);  // Set the realtor's first name
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
            <header className="flex flex-col sm:flex-row justify-between items-center p-4 bg-blue-900 bg-opacity-75">
                <div>
                    <h1 className="text-3xl font-bold">RealtorSphere</h1>
                    <p className="text-lg">Makes Real Estate Easy</p>
                </div>
                <div className="flex items-center">
                    <span className="mr-4">,שלום {realtorName}!</span>  {/* Display the realtor's first name */}
                    <img src="/path-to-image/alarm-bell-icon.png" alt="Alarm Bell" className="w-6 h-6"/>
                </div>
            </header>

            <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                    <input
                        type="text"
                        placeholder="חפש לפי מזהה עסקה, בעלים או לקוח"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full sm:w-2/3 p-2 rounded-md border border-gray-300 text-gray-900"
                    />
                    <button className="w-full sm:w-auto mt-4 sm:mt-0 bg-pink-700 hover:bg-pink-600 text-white p-2 rounded-md">
                        הוסף עסקה חדשה
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white text-gray-800 rounded-md overflow-hidden text-right" dir="rtl">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-3 text-right">מזהה עסקה</th>
                                <th className="p-3 text-right">בעלים</th>
                                <th className="p-3 text-right">נכס</th>
                                <th className="p-3 text-right">לקוח</th>
                                <th className="p-3 text-right">פעולות</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDeals.map(deal => (
                                <tr key={deal.id} className="border-t border-gray-200">
                                    <td className="p-3">{deal.id}</td>
                                    <td className="p-3">{deal.owner}</td>
                                    <td className="p-3">{deal.property}</td>
                                    <td className="p-3">{deal.client}</td>
                                    <td className="p-3 flex space-x-2 justify-end">
                                        <button className="bg-green-500 hover:bg-green-400 text-white p-2 rounded-md">
                                            פתח
                                        </button>
                                        <button className="bg-red-500 hover:bg-red-400 text-white p-2 rounded-md">
                                            סגור
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

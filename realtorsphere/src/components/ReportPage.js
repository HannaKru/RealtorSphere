import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReportPage = () => {
  const [activeVsArchivedReport, setActiveVsArchivedReport] = useState({});
  const [performanceReportData, setPerformanceReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [averageDays, setAverageDays] = useState(0);
  const [averageDealTime, setAverageDealTime] = useState(0);
  const [showPopup, setShowPopup] = useState(false); // To control the popup display

  // Fetch Active vs Archived report when the page loads
  const fetchActiveVsArchivedReport = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await axios.get('http://localhost:5000/generateActiveVsArchivedReport', {
        withCredentials: true,
      });

      if (response.status === 200) {
        setActiveVsArchivedReport(response.data);
      } else {
        setErrorMessage('לא נמצאו נתונים.');
      }
    } catch (error) {
      setErrorMessage('שגיאה בטעינת הדוח.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Performance report data when the button is clicked
  const fetchPerformanceReport = async () => {
  setLoading(true);
  setErrorMessage('');

  try {
    const response = await axios.get('http://localhost:5000/propertyPerformanceReport', {
      withCredentials: true, // Ensure credentials are sent to access the session
    });

    if (response.status === 200) {
      setPerformanceReportData(response.data.property_report);
      setAverageDays(response.data.average_days_on_market);
      setAverageDealTime(response.data.average_deal_time);
      setShowPopup(true); // Open the popup
    } else if (response.status === 401) {
      setErrorMessage('User not logged in.');
    } else if (response.status === 404) {
      setErrorMessage('No data found for the logged-in realtor.');
    }
  } catch (error) {
    console.error('Error fetching performance report:', error);
    setErrorMessage('Failed to load report.');
  } finally {
    setLoading(false);
  }
};

  // Close the popup
  const handleClosePopup = () => {
    setShowPopup(false);
  };

  useEffect(() => {
    fetchActiveVsArchivedReport();
  }, []);

  const [showPerformanceReport, setShowPerformanceReport] = useState(false);

  return (
    <div className="bg-gray-50 min-h-screen rtl">
      <header className="bg-blue-900 p-4 text-white text-center">
        <h1 className="text-4xl">RealtorSphere</h1>
        <p className="text-lg">Makes real estate easy</p>
      </header>

      <div className="p-6">
        <div className="p-4">
          {/* Active vs Archived report displayed immediately */}
          <h2 className="text-2xl mb-4">דוח נכסים פעילים מול נכסים בארכיון</h2>

          {loading && <p>טוען דוח...</p>}
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}

          {Object.keys(activeVsArchivedReport).length > 0 && (
            <>
              <h3 className="text-xl font-bold mb-4">סיכום נכסים</h3>
              <p><strong>נכסים פעילים:</strong> {activeVsArchivedReport.active_properties}</p>
              <p><strong>נכסים בארכיון:</strong> {activeVsArchivedReport.archived_properties}</p>

              <h3 className="text-xl font-bold mt-6 mb-4">פירוט נכסים בארכיון - עסקה בוצעה</h3>
              <p><strong>בחודש האחרון:</strong> {activeVsArchivedReport.archived_with_deal_completed?.month}</p>
              <p><strong>בחצי שנה האחרונה:</strong> {activeVsArchivedReport.archived_with_deal_completed?.half_year}</p>
              <p><strong>בשנה האחרונה:</strong> {activeVsArchivedReport.archived_with_deal_completed?.year}</p>

              <h3 className="text-xl font-bold mt-6 mb-4">פירוט נכסים בארכיון - סיבות אחרות</h3>
              <p><strong>בחודש האחרון:</strong> {activeVsArchivedReport.archived_with_other_reason?.month}</p>
              <p><strong>בחצי שנה האחרונה:</strong> {activeVsArchivedReport.archived_with_other_reason?.half_year}</p>
              <p><strong>בשנה האחרונה:</strong> {activeVsArchivedReport.archived_with_other_reason?.year}</p>
            </>
          )}
        </div>

        {/* Button to display Performance Report in a popup */}
        <button
          onClick={fetchPerformanceReport}
          className="bg-blue-500 text-white p-2 rounded-md mb-4"
        >
          הצג דוח ביצועי נכסים
        </button>

        {/* Popup for Performance Report */}
        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white w-full max-w-4xl p-6 rounded-lg shadow-lg overflow-y-auto max-h-[80vh]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">דוח ביצועי נכסים</h2>
                <button onClick={handleClosePopup} className="text-red-500 text-lg font-bold">
                  ✖
                </button>
              </div>

              {/* Property Performance Report Data */}
              {loading && <p>טוען נתוני דוח ביצועים...</p>}
              {errorMessage && <p className="text-red-500">{errorMessage}</p>}

              {!loading && performanceReportData.length > 0 && (
                <>
                 <p>זמן ממוצע בשוק: {averageDays} ימים</p>
                  <p>זמן ממוצע לעסקה: {averageDealTime} ימים</p>

                  <table className="min-w-full table-auto">
                    <thead>
                      <tr>
                        <th className="border px-4 py-2">מזהה נכס</th>
                        <th className="border px-4 py-2">מחיר</th>
                        <th className="border px-4 py-2">עיר</th>
                        <th className="border px-4 py-2">מספר חדרים</th>
                        <th className="border px-4 py-2">ימים בשוק</th>
                        <th className="border px-4 py-2">מספר לקוחות מתעניינים</th>
                        <th className="border px-4 py-2">סיבת ארכוב</th>
                        <th className="border px-4 py-2">תאריך סיום</th>
                      </tr>
                    </thead>
                    <tbody>
                      {performanceReportData.map((property, index) => (
      <tr key={index}>
        <td className="border px-4 py-2">{property.property_id}</td>
        <td className="border px-4 py-2">{property.price}</td>
        <td className="border px-4 py-2">{property.city}</td>
        <td className="border px-4 py-2">{property.roomsNum}</td>
        <td className="border px-4 py-2">{property.days_on_market}</td>
        <td className="border px-4 py-2">{property.num_interested_clients}</td>
        <td className="border px-4 py-2">{property.archiveReason}</td>
        <td className="border px-4 py-2">{property.endDate}</td>
      </tr>
    ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportPage;
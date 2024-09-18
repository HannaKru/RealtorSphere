import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReportPage = () => {
  const [reportData, setReportData] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch report data from the backend
  const fetchReport = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await axios.get('http://localhost:5000/generateActiveVsArchivedReport', {
        withCredentials: true
      });

      if (response.status === 200) {
        setReportData(response.data);
      } else {
        setErrorMessage('לא נמצאו נתונים.');
      }
    } catch (error) {
      setErrorMessage('שגיאה בטעינת הדוח.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Automatically fetch the report when the page loads
    fetchReport();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen rtl">
      <header className="bg-blue-900 p-4 text-white text-center">
        <h1 className="text-4xl">RealtorSphere</h1>
        <p className="text-lg">Makes real estate easy</p>
      </header>

      <div className="p-6">
        <div className="p-4">
          <h2 className="text-2xl mb-4">דוח נכסים פעילים מול נכסים בארכיון</h2>

          {loading && <p>טוען דוח...</p>}
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}

          {Object.keys(reportData).length > 0 && (
            <>
              <h3 className="text-xl font-bold mb-4">סיכום נכסים</h3>
              <p><strong>נכסים פעילים:</strong> {reportData.active_properties}</p>
              <p><strong>נכסים בארכיון:</strong> {reportData.archived_properties}</p>

              <h3 className="text-xl font-bold mt-6 mb-4">פירוט נכסים בארכיון - עסקה בוצעה</h3>
              <p><strong>בחודש האחרון:</strong> {reportData.archived_with_deal_completed?.month}</p>
              <p><strong>בחצי שנה האחרונה:</strong> {reportData.archived_with_deal_completed?.half_year}</p>
              <p><strong>בשנה האחרונה:</strong> {reportData.archived_with_deal_completed?.year}</p>

              <h3 className="text-xl font-bold mt-6 mb-4">פירוט נכסים בארכיון - סיבות אחרות</h3>
              <p><strong>בחודש האחרון:</strong> {reportData.archived_with_other_reason?.month}</p>
              <p><strong>בחצי שנה האחרונה:</strong> {reportData.archived_with_other_reason?.half_year}</p>
              <p><strong>בשנה האחרונה:</strong> {reportData.archived_with_other_reason?.year}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
import React, { useEffect, useState } from 'react';

const ResponsiveCalendar = () => {
  const [orientation, setOrientation] = useState('portrait');

  useEffect(() => {
    const updateOrientation = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      setOrientation(isPortrait ? 'portrait' : 'landscape');
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  return (
    <div className={`calendar-container ${orientation}`}>
      <header className="px-4 py-2.5 text-lg">ינואר</header>
      {/* ... rest of the calendar content ... */}
    </div>
  );
};

export default ResponsiveCalendar;

import React, { useCallback, useEffect, useState } from 'react';
import Select from 'react-select';
import axios from "axios";

axios.defaults.withCredentials = true;

const PropertyPage = () => {
    const [activeTab, setActiveTab] = useState('כל הנכסים');
    const [searchFilters, setSearchFilters] = useState({
        ownerName: '',
        roomNumberFrom: '',
        roomNumberTo: '',
        priceFrom: '',
        priceTo: '',
        city: '',
        propertyType: '',
        address: '',
    });
    const [externalProperties, setExternalProperties] = useState([]);
    const [allProperties, setAllProperties] = useState([]); // Store all properties
    const [filteredProperties, setFilteredProperties] = useState([]); // Store filtered properties
    const [properties, setProperties] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false); // For controlling the popup window
    const [selectedProperty, setSelectedProperty] = useState({
    pictures: '',
    price: 'N/A',
    street: '',
    house: '',
    city: 'N/A',
    address: '',
    neighborhood: 'N/A',
    size: 'N/A',
    ac: 'N/A',
    accessibility: 'לא',
    age: 'N/A',
    bars: 'לא',
    numberOfFloors: 'N/A',
    realtor: 'N/A',
    security: 'לא',
    status: 'N/A',
    notes: 'אין',
    type: 'N/A',
    floor: 'N/A',
    apNum: 'N/A',
    elevator: 'לא',
    parkingNumber: 'N/A',
    bathroomsNum: 'N/A',
    roomsNum: 'N/A',
    rooms: [],

    });
    const [isDetailsPopupOpen, setIsDetailsPopupOpen] = useState(false); // For controlling the property details popup


    const [newProperty, setNewProperty] = useState({
        street: '',
        city: '',
        house: '',
        neighborhood: '',
        propertyType: 'apartment', // Default to apartment
        roomsNum: '',
        price: '',
        ownerName: '',
        ownerID: '',
        startDate: '',
        file: null,
        size: '',
        ac: '',
        accessibility: false,
        age: '',
        bars: false,
        numberOfFloors: '',
        security: false,
        status: 'active', // default value
        floor: '',
        apNum: '',
        bathroomsNum: '',
        notes: '',
        rooms: [],
        parkingNumber: '',
        elevator: false,  // New elevator field
    });


     // Fetches all properties for the logged-in realtor when the component loads
    const fetchAllProperties = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:5000/propertyPage', {
                params: {
                    email: sessionStorage.getItem('user_email'),
                },
                withCredentials: true,
            });

            if (response.status === 200) {
                setProperties(response.data);
            } else {
                console.error('Failed to fetch data, status:', response.status);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }, []);

    // Fetches properties based on search filters
    const fetchFilteredProperties = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:5000/propertyPage', {
                params: {
                    ...searchFilters,
                    transactionType: activeTab,
                    email: sessionStorage.getItem('user_email'),
                },
                withCredentials: true
            });

            if (response.status === 200) {
                const fetchedProperties = response.data;

                if (Array.isArray(fetchedProperties) && fetchedProperties.length === 0) {
                    alert('אין רשומה מתאימה');  // Use alert for no results message
                } else {
                    setProperties(fetchedProperties); // Set properties if found
                }
            } else {
                console.error('Failed to fetch data, status:', response.status);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            alert('אין רשומה מתאימה');
        }
    }, [searchFilters, activeTab]);

        const [cityList, setCityList] = useState([]);
        const [cities, setCities] = useState([]);  // To store cities from the backend
        const [streets, setStreets] = useState([]);  // To store streets of the selected city
        const [selectedCity, setSelectedCity] = useState(null);  // Selected city
        const [selectedStreet, setSelectedStreet] = useState(null);
        const [streetList, setStreetList] = useState([]);  // State to hold the list of streets


    // Fetch the list of cities when the component loads
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/cities');
        setCityList(response.data);  // Set city list from the backend
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    };

    fetchCities();
  }, []);

    // Fetch the list of streets when a city is selected
  const handleCityChange = async (e) => {

    const selectedCity = e.target.value;

    setNewProperty({
      ...newProperty,
      city: selectedCity,
      street: '', // Reset street when a new city is selected
    });

    // Fetch streets based on the selected city
    if (selectedCity) {
      try {
        const response = await axios.get('http://localhost:5000/api/streets', {
          params: { city: selectedCity },
        });
        console.log("Streets for city:", response.data);

        if (response.status === 200) {
          setStreetList(response.data);  // Populate streetList with the response data
        } else {
          setStreetList([]);  // Clear streetList if no streets are returned
        }
      } catch (error) {
        console.error('Error fetching streets:', error);
        setStreetList([]);  // Clear streetList on error
      }
    } else {
      setStreetList([]);  // Clear streetList if no city is selected
    }
};

  const handleStreetChange = (e) => {
    setNewProperty({
      ...newProperty,
      street: e.target.value,
    });
  };

    // Filter properties based on the active tab
    const filterPropertiesByTab = (tab) => {
    if (tab === 'למכירה') {
    return properties.filter(property => property.transactionType === 'sell' && property.status === 'active');
    } else if (tab === 'להשכרה') {
    return properties.filter(property => property.transactionType === 'rent' && property.status === 'active');
    } else if (tab === 'ארכיון') {
    return properties.filter(property => property.status === 'inactive');
    }
    return properties; // Show all properties for כל הנכסים
    };

    // Load all properties when the page loads
    useEffect(() => {
        fetchAllProperties();
    }, [fetchAllProperties]);

    useEffect(() => {
        const filtered = filterPropertiesByTab(activeTab);
        setFilteredProperties(filtered);
    }, [properties, activeTab]);

    useEffect(() => {
  console.log("External properties updated:", externalProperties);
}, [externalProperties]);




    const handleSearchChange = (e) => {
        setSearchFilters({ ...searchFilters, [e.target.name]: e.target.value });
    };

    const handleTabChange = async (tab) => {
  setActiveTab(tab);
  if (tab === 'מקורות חיצוניים') {
    try {
      console.log("Fetching external listings...");
      const response = await axios.get('http://localhost:5000/api/scrapedListings', { withCredentials: true });
      console.log("Fetched data:", response.data);
      setExternalProperties(response.data);
    } catch (error) {
      console.error('Error fetching external listings:', error);
    }
  } else {
    const filteredProps = filterPropertiesByTab(tab);
    setFilteredProperties(filteredProps);
  }
};

    const handleSearchClick = () => {
        fetchFilteredProperties(); // Apply search when the search button is clicked
    };

    const handleNewPropertyChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewProperty(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };



    const handleRoomChange = (index, e) => {
  const { name, value } = e.target;
  if (isEditMode) {
    setEditData(prevState => {
      const updatedRooms = [...prevState.rooms];
      updatedRooms[index] = { ...updatedRooms[index], [name]: value };
      return { ...prevState, rooms: updatedRooms };
    });
  } else {
    setNewProperty(prevState => {
      const updatedRooms = [...prevState.rooms];
      updatedRooms[index] = { ...updatedRooms[index], [name]: value };
      return { ...prevState, rooms: updatedRooms };
    });
  }
};

    const addRoom = () => {
  if (isEditMode) {
    setEditData((prevState) => ({
      ...prevState,
      rooms: [
        ...(prevState.rooms || []),
        { length: '', width: '', roomType: '' }
      ],
    }));
  } else {
    setNewProperty((prevState) => ({
      ...prevState,
      rooms: [
        ...(prevState.rooms || []),
        { length: '', width: '', roomType: '' }
      ],
    }));
  }
};

    // Function to delete a room
const deleteRoom = (index) => {
    setEditData((prevState) => {
        const updatedRooms = [...prevState.rooms];
        updatedRooms.splice(index, 1); // Remove the room at the specified index
        return {
            ...prevState,
            rooms: updatedRooms,
        };
    });
};

    const [imageInputs, setImageInputs] = useState([{ id: 1, file: null }]); // Store image inputs
   // Handle file input change
const handleFileChange = (index, e) => {
  if (e && e.target && e.target.files && e.target.files.length > 0) {
    const file = e.target.files[0];
    setImageInputs(prevInputs => {
      const updatedInputs = [...prevInputs];
      updatedInputs[index].file = file;
      return updatedInputs;
    });
  } else {
    console.error('Invalid event object or no file selected in handleFileChange');
  }
};



// Function to remove image input
const removeImageInput = (index) => {
    setImageInputs(prevInputs => prevInputs.filter((_, i) => i !== index)); // Remove the selected image input
};

    // Add more image input fields when "הוספת תמונה נוספת" is clicked
const addImageInput = () => {
    setImageInputs(prevInputs => [...prevInputs, { id: prevInputs.length + 1, file: null }]);
};


    const handleAddProperty = async () => {
        const houseNumberPattern = /^[0-9]+(\s?[א-ת]?)$/;
        // Check if the required fields (city, street, house) are filled
    if (!newProperty.city || newProperty.city.trim() === "") {
        alert('נא לבחור עיר');
        return;
    }

    if (!newProperty.street || newProperty.street.trim() === "") {
        alert('נא לבחור רחוב');
        return;
    }

    if (!newProperty.house || newProperty.house.trim() === "") {
        alert('נא להזין מספר בית');
        return;
    }
    // Validate the house number using the regular expression
    if (!houseNumberPattern.test(newProperty.house)) {
        alert('נא להזין מספר בית חוקי (לדוגמה: 42ב, 42 ב, או רק 42)');
        return;
    }

    // Check if the room number is more than 0
    if (newProperty.roomsNum === null || newProperty.roomsNum <= 0) {
        alert('מספר החדרים חייב להיות יותר מ-0');
        return;
    }

    // Check if the price is more than 0
    if (newProperty.price === null || newProperty.price <= 0) {
        alert('המחיר חייב להיות יותר מ-0');
        return;
    }

     // Check if the size is more than 0
    if (newProperty.size === null || newProperty.size <= 0) {
        alert('הגודל חייב להיות יותר מ-0');
        return;
    }

    // Check if the parking number is not less than 0 and not null
    if (newProperty.parkingNumber === null || newProperty.parkingNumber < 0) {
        alert('מספר החניות חייב להיות 0 או יותר');
        return;
    }

    // Check if the AC number is not less than 0 and not null
    if (newProperty.ac === null || newProperty.ac < 0) {
        alert('מספר המזגנים חייב להיות 0 או יותר');
        return;
    }

     // Check if the age is not less than 0 and not null
    if (newProperty.age === null || newProperty.age < 0) {
        alert('גיל המבנה חייב להיות 0 או יותר');
        return;
    }

    // Check if the number of floors is more than 0 and not null
    if (newProperty.numberOfFloors === null || newProperty.numberOfFloors <= 0) {
        alert('מספר הקומות בנכס חייב להיות יותר מ-0');
        return;
    }

    // Check if the floor is at least 0 and not null
    if (newProperty.floor === null || newProperty.floor < 0) {
        alert('קומת הנכס חייבת להיות 0 או יותר');
        return;
    }

     // Validate apartment number (can be null only for 'private house' or 'two-family house')
    if (
        (newProperty.propertyType !== 'private house' && newProperty.propertyType !== 'two-family house') &&
        (newProperty.apNum === null || newProperty.apNum < 0)
    ) {
        alert('מספר הדירה חייב להיות 0 או יותר');
        return;
    }

    if (newProperty.bathroomsNum === null || newProperty.bathroomsNum < 1) {
        alert('מספר חדרי השירותים חייב להיות לפחות 1');
        return;
    }
    if (!newProperty.ownerName || newProperty.ownerName.trim() === "") {
        alert('שם הבעלים לא יכול להיות ריק');
        return;
    }

    // Check if the owner's ID is not null or empty
    if (!newProperty.ownerID || newProperty.ownerID.trim() === "") {
        alert('תעודת זהות של הבעלים לא יכולה להיות ריקה');
        return;
    }

    // Check if the start date is not null
    if (!newProperty.startDate || newProperty.startDate.trim() === "") {
        alert('תאריך תחילת העסקה לא יכול להיות ריק');
        return;
    }


        try {
            const formData = new FormData();

            // Add the necessary fields to formData
            for (const key in newProperty) {
            if (key !== 'files' && key !== 'rooms') {
                formData.append(key, newProperty[key]);
            }
        }

            // Add room data
            formData.append('rooms', JSON.stringify(newProperty.rooms));

            // Add the images to formData
        imageInputs.forEach((input, index) => {
            if (input.file) {
                formData.append(`file${index + 1}`, input.file);
            }
        });




            const response = await axios.post('http://localhost:5000/addProperty', formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response.status === 200) {
                setIsPopupOpen(false); // Close the popup after saving
                fetchAllProperties(); // Refresh the data
            } else {
                console.error('Failed to save new property:', response.status);
            }
        } catch (error) {
            console.error('Error adding new property:', error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent the default form submission
        handleSearchClick(); // Call the existing search function
    };





    // Handle row click to show details in a popup
    const handleRowClick = (property) => {
        console.log('Property data:', property);  // Log to see what you get in the property object

    if (!property) {
        console.error('No property data available');
        return;
    }
    console.log('Room Specifications:', property.roomSpecifications);  // Check if room specifications are present



  setSelectedProperty({
    id: property.id,
    price: property.price || 'N/A',
    street: property.street || '',
    house: property.house || '',
    city: property.city || 'N/A',
    address: property.address || `${property.street || ''} ${property.house || ''}`.trim(),

    neighborhood: property.neighborhood || 'N/A',
    size: property.size || 'N/A',
    ac: property.ac !==undefined ? property.ac: 'N/A',
    accessibility: (property.accessibility === 'true' || property.accessibility === true) ? 'כן' : 'לא',
    age: property.age !== undefined ? property.age : 'N/A',
    bars: (property.bars === 'true' || property.bars === true) ? 'כן' : 'לא',
    number_of_floors: property.number_of_floors !== undefined ? property.number_of_floors : 'N/A',
    realtor: property.realtor || 'N/A',
    security: (property.security === 'true' || property.security === true) ? 'כן' : 'לא',
    status: property.status || 'N/A',
    notes: property.notes || 'אין',
    pictures: property.pictures || {},
    type: property.type?.apartment?.type || 'N/A',
    floor: property.floor!==undefined ? property.floor : 'N/A',
    apNum: property.apNum || 'N/A',
    elevator: property.elevator === "true" ? 'כן' : 'לא',
    parkingNumber: property.parkingNumber !== undefined ? property.parkingNumber : 'N/A',
    bathroomsNum: property.bathroomsNum !== undefined ? property.bathroomsNum : 'N/A',
    roomsNum: property.type?.apartment?.item?.roomsNum || property.rooms || 'N/A',
    roomSpecifications: property.roomSpecifications || [],
    transactionType: property.transactionType || 'N/A',
    propertyType: property.propertyType || 'N/A'

  });
  setIsDetailsPopupOpen(true);
};

    const roomTypeDictionary = {
  bedroom: "חדר שינה",
  livingroom: "סלון",
  bathroom: "שירותים",
  balcony: "מרפסת",
  garden: "גינה",
  saferoom: "ממ\"ד",
  storage: "מחסן"
};

    const [isEditMode, setIsEditMode] = useState(false);
    const [editData, setEditData] = useState({
    ...selectedProperty, // Spread selectedProperty into the state
    rooms: selectedProperty.rooms || [], // Ensure rooms is an array, default to an empty array if undefined
});
    // Handle changes in the form inputs when editing
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };



    // Function to save the changes made in the edit mode
   const handleSaveEdit = async () => {
  const formData = new FormData();

  // Append all form fields to formData
  Object.keys(editData).forEach(key => {
    if (key === 'rooms') {
      formData.append(key, JSON.stringify(editData[key]));
    } else {
      formData.append(key, editData[key]);
    }
  });

  // Send pictures to delete
    formData.append('picturesToDelete', JSON.stringify(picturesToDelete));

  // Append new images if any
  imageInputs.forEach((input, index) => {
    if (input.file) {
      formData.append(`file${index}`, input.file);
    }
  });

  // Make sure selectedProperty.id is available
  if (!selectedProperty.id) {
    console.error("Selected property ID is missing");
    return;
  }

  try {
    const response = await axios.post(`http://localhost:5000/updateProperty/${selectedProperty.id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true
    });

    if (response.status === 200) {
      setIsEditMode(false);
      setIsDetailsPopupOpen(false);
      alert('Property updated successfully');
      fetchAllProperties(); // Refresh the property list
    }
  } catch (error) {
    console.error("Failed to save property changes:", error);
    alert('Failed to update property');
  }
};
    const removePictureFromDB = async (propertyId, pictureKey) => {
    try {
        // Send a DELETE request to the backend API to remove the picture
        const response = await axios.delete(`/api/remove-picture`, {
            params: {
                propertyId: propertyId,
                pictureKey: pictureKey,
            }
        });

        if (response.status === 200) {
            alert('Picture removed successfully');
            // Optionally, you can refresh the property details or update the state to remove the deleted picture from the UI
        } else {
            console.error('Failed to remove picture');
        }
    } catch (error) {
        console.error('Error removing picture:', error);
    }
};


    // Fetch cities and streets when edit mode is activated
    useEffect(() => {
        if (isEditMode) {
            // Fetch the list of cities
            const fetchCities = async () => {
                try {
                    const response = await axios.get('http://localhost:5000/api/cities');
                    setCityList(response.data);
                } catch (error) {
                    console.error('Error fetching cities:', error);
                }
            };
            fetchCities();

            // If a city is already selected, fetch the streets
            if (editData.city) {
                const fetchStreets = async () => {
                    try {
                        const response = await axios.get('http://localhost:5000/api/streets', {
                            params: { city: editData.city },
                        });
                        setStreetList(response.data);
                    } catch (error) {
                        console.error('Error fetching streets:', error);
                    }
                };
                fetchStreets();
            }
        }
    }, [isEditMode, editData.city]);

const handleEditCityChange = async (e) => {
    const selectedCity = e.target.value;

    setSelectedProperty((prevState) => ({
        ...prevState,
        city: selectedCity,
        street: '', // Reset street when a new city is selected in edit mode
    }));

    // Fetch streets based on the selected city
    if (selectedCity) {
        try {
            const response = await axios.get('http://localhost:5000/api/streets', {
                params: { city: selectedCity },
            });
            console.log("Streets for city in edit mode:", response.data);

            if (response.status === 200) {
                setStreetList(response.data);  // Update street list in edit mode
            } else {
                setStreetList([]);  // Clear street list if no streets are returned
            }
        } catch (error) {
            console.error('Error fetching streets:', error);
            setStreetList([]);  // Clear street list on error
        }
    } else {
        setStreetList([]);  // Clear street list if no city is selected
    }
};

const [picturesToDelete, setPicturesToDelete] = useState([]);

const handleRemovePicture = (key) => {
    setPicturesToDelete([...picturesToDelete, key]);
    // Also, remove the picture from the local state to update the UI immediately
    setEditData(prevData => ({
        ...prevData,
        pictures: Object.keys(prevData.pictures)
            .filter(pictureKey => pictureKey !== key)
            .reduce((acc, pictureKey) => {
                acc[pictureKey] = prevData.pictures[pictureKey];
                return acc;
            }, {})
    }));
};

const handleClosePopup = () => {
  setIsDetailsPopupOpen(false);
  setIsEditMode(false);
  setEditData({}); // Clear any unsaved changes
  setImageInputs([{ id: 1, file: null }]); // Reset image inputs
};




    return (



        <div className="bg-gray-50 min-h-screen rtl">
            <header className="bg-blue-900 p-4 text-white text-center">
                <h1 className="text-4xl">RealtorSphere</h1>
                <p className="text-lg">Makes Real Estate Easy</p>
            </header>

            <div className="p-6">



                {/* Search Filters */}
                <form onSubmit={handleSubmit} className="search-form">
                    <div className="form-row">
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
                            name="propertyType"
                            placeholder="סוג נכס"
                            value={searchFilters.propertyType}
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
                        <div className="input-group">
                            <input
                                type="number"
                                name="priceTo"
                                placeholder="מחיר (עד)"
                                value={searchFilters.priceTo}
                                onChange={handleSearchChange}
                                className="p-2 border rounded-md text-right"
                            />
                            <input
                                type="number"
                                name="priceFrom"
                                placeholder="מחיר (מ)"
                                value={searchFilters.priceFrom}
                                onChange={handleSearchChange}
                                className="p-2 border rounded-md text-right"
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="number"
                                name="roomNumberTo"
                                placeholder="חדרים (עד)"
                                value={searchFilters.roomNumberTo}
                                onChange={handleSearchChange}
                                className="p-2 border rounded-md text-right"
                            />
                            <input
                                type="number"
                                name="roomNumberFrom"
                                placeholder="חדרים (מ)"
                                value={searchFilters.roomNumberFrom}
                                onChange={handleSearchChange}
                                className="p-2 border rounded-md text-right"
                            />
                        </div>
                        <input
                            type="text"
                            name="ownerName"
                            placeholder="שם בעלים"
                            value={searchFilters.ownerName}
                            onChange={handleSearchChange}
                            className="p-2 border rounded-md text-right"
                        />
                    </div>

                    <div className="form-row">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white p-2 rounded-md"
                        >
                            חיפוש
                        </button>
                        <button
                            type="button"
                            className="bg-pink-700 text-white p-2 rounded-md"
                            onClick={() => setIsPopupOpen(true)}
                        >
                            הוסף נכס חדש
                        </button>
                    </div>
                </form>

                {/* Tabs Section */}
                <div className="tabs flex justify-around p-4 ">
                {['כל הנכסים', 'למכירה', 'להשכרה', 'ארכיון','מקורות חיצוניים'].map(tab => (
                    <button
                        key={tab}
                        className={`tab-button px-4 py-2 rounded-md ${
                            activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'
                        }`}
                        onClick={() => handleTabChange(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>


                {/* Property Table */}
    {activeTab !== 'מקורות חיצוניים' && (
    <table className="min-w-full bg-white text-right">
        <thead>
            <tr>
                {['סטטוס', 'בעלים', 'מס׳ חדרים', 'מחיר', 'גודל במ"ר', 'כתובת', 'עיר', 'סוג נכס'].map(header => (
                    <th key={header} className="p-2 border-b-2 border-gray-300 text-gray-600">{header}</th>
                ))}
            </tr>
        </thead>
        <tbody>
            {filteredProperties.map((property, index) => (
                <tr key={property.id} onClick={() => handleRowClick(property)}>
                    <td>{property.status || 'N/A'}</td>
                    <td>{property.owner || 'N/A'}</td>
                    <td>{property.type?.apartment?.item?.roomsNum || property.rooms || 'N/A'}</td>
                    <td>{property.price  || 'N/A'}</td>
                    <td>{property.size || 'N/A'}</td>
                    <td>{property.address || 'N/A'}</td>
                    <td>{property.city || 'N/A'}</td>
                    <td>{property.propertyType || 'N/A'}</td>
                </tr>
            ))}
        </tbody>
    </table>
)}

                {/*External Sources Table*/}
{activeTab === 'מקורות חיצוניים' && (
    <table className="min-w-full bg-white text-right">
        <thead>
            <tr>
                {['קישור', 'חדרים', 'עיר', 'מחיר', 'סוג נכס'].map(header => (
                    <th key={header} className="p-2 border-b-2 border-gray-300 text-gray-600">{header}</th>
                ))}
            </tr>
        </thead>
        <tbody>
            {externalProperties.map((property, index) => (
                <tr key={index} className="cursor-pointer hover:bg-gray-100">
                    <td><a href={property.link} target="_blank" rel="noopener noreferrer" className="text-blue-600">קישור</a></td>
                    <td>{property.rooms}</td>
                    <td>{property.city}</td>
                    <td>{property.price}</td>
                    <td>{property.type}</td>
                </tr>
            ))}
        </tbody>
    </table>
)}


            </div>


            {/* Popup Window for Adding New Property */}
            {isPopupOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center overflow-auto">
                    <div className="bg-white p-6 rounded-lg relative w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                        <button
                            onClick={() => setIsPopupOpen(false)}
                            className="absolute top-2 left-2 text-gray-600 hover:text-gray-800"
                        >
                            ✕
                        </button>
                        <h2 className="text-2xl mb-4">הוספת נכס חדש</h2>
                        {/* City Dropdown */}
      <div className="mb-4">
        <label className="block text-right">עיר</label>
        <select
          name="city"
          value={newProperty.city}
          onChange={handleCityChange}
          className="w-full p-2 border rounded-md"
          dir="rtl"
        >
          <option value="">בחר עיר</option>
          {cityList.map((city, index) => (
            <option key={index} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {/* Street Dropdown (only show when a city is selected) */}
      {newProperty.city && (
        <div className="mb-4">
            <label className="block text-right">רחוב</label>
            <select
                name="street"
                value={newProperty.street}
                onChange={handleStreetChange}
                className="w-full p-2 border rounded-md"
                dir="rtl"
            >
            <option value="">בחר רחוב</option>
            {streetList.map((street, index) => (
                <option key={index} value={street}>
                {street}
                </option>
            ))}
          </select>
        </div>
          )
      };


                        <div className="mb-4">
                            <label className="block text-right">מס' בית</label>
                            <input
                                type="text"
                                name="house"
                                value={newProperty.house}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                                dir="rtl"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">שכונה</label>
                            <input
                                type="text"
                                name="neighborhood"
                                value={newProperty.neighborhood}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                                dir="rtl"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">סוג הנכס</label>
                            <select
                                name="propertyType"
                                value={newProperty.propertyType}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                                dir="rtl"
                            >
                                <option value="apartment">דירה</option>
                                <option value="duplex apartment">דירת דופלקס</option>
                                <option value="private home">בית פרטי</option>
                                <option value="two-family house">בית דו-משפחתי</option>
                                <option value="penthouse">פנטהאוס</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">מס' חדרים</label>
                            <input
                                type="number"
                                name="roomsNum"
                                value={newProperty.roomsNum}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                                dir="rtl"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">מחיר</label>
                            <input
                                type="number"
                                name="price"
                                value={newProperty.price}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                                dir="rtl"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">גודל (במטרים מרובעים)</label>
                            <input
                                type="number"
                                name="size"
                                value={newProperty.size}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                                dir="rtl"
                            />
                        </div>

                        {/* Transaction Type Dropdown */}
                        <div className="mb-4">
                            <label className="block text-right">למכירה או להשכרה?</label>
                            <select
                                name="transactionType"
                                value={newProperty.transactionType}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                                dir="rtl"
                            >
                                <option value="rent">השכרה</option>
                                <option value="sell">מכירה</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-right">מס' חניות</label>
                            <input
                                type="number"
                                name="parkingNumber"
                                value={newProperty.parkingNumber}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                                dir="rtl"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">מס' מזגנים</label>
                            <input
                                type="number"
                                name="ac"
                                value={newProperty.ac}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                                dir="rtl"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">גישה לנכים</label>
                            <input
                                type="checkbox"
                                name="accessibility"
                                checked={newProperty.accessibility}
                                onChange={handleNewPropertyChange}
                                className="mr-2"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">גיל המבנה</label>
                            <input
                                type="number"
                                name="age"
                                value={newProperty.age}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                                dir="rtl"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">סורגים על חלונות</label>
                            <input
                                type="checkbox"
                                name="bars"
                                checked={newProperty.bars}
                                onChange={handleNewPropertyChange}
                                className="mr-2"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">מעלית</label>
                            <input
                                type="checkbox"
                                name="elevator"
                                checked={newProperty.elevator}
                                onChange={handleNewPropertyChange}
                                className="mr-2"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">מס' קומות בנכס</label>
                            <input
                                type="number"
                                name="numberOfFloors"
                                value={newProperty.numberOfFloors}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                                dir="rtl"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">אבטחה</label>
                            <input
                                type="checkbox"
                                name="security"
                                checked={newProperty.security}
                                onChange={handleNewPropertyChange}
                                className="mr-2"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">קומת הנכס</label>
                            <input
                                type="number"
                                name="floor"
                                value={newProperty.floor}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                                dir="rtl"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">מס' דירה</label>
                            <input
                                type="number"
                                name="apNum"
                                value={newProperty.apNum}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                                dir="rtl"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">מס' חדרי שירותים</label>
                            <input
                                type="number"
                                name="bathroomsNum"
                                value={newProperty.bathroomsNum}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                                dir="rtl"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">הערות נוספות</label>
                            <textarea
                                name="notes"
                                value={newProperty.notes}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                                dir="rtl"
                            />
                        </div>

                        {/* Dynamic Room Input Section */}
                        {newProperty.rooms.map((room, index) => (
                            <div key={index} className="mb-4 border p-2 rounded-md">
                                <h3 className="text-lg mb-2">Room {index + 1}</h3>
                                <div className="mb-4">
                                    <label className="block text-right">אורך (מ')</label>
                                    <input
                                        type="number"
                                        name="length"
                                        value={room.length}
                                        onChange={(e) => handleRoomChange(index, e)}
                                        className="w-full p-2 border rounded-md"
                                        dir="rtl"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-right">רוחב (מ')</label>
                                    <input
                                        type="number"
                                        name="width"
                                        value={room.width}
                                        onChange={(e) => handleRoomChange(index, e)}
                                        className="w-full p-2 border rounded-md"
                                        dir="rtl"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-right">סוג החדר:</label>
                                    <select
                                        name="roomType"
                                        value={room.roomType}
                                        onChange={(e) => handleRoomChange(index, e)}
                                        className="w-full p-2 border rounded-md"
                                    >
                                        <option value="">בחר את סוג החדר:</option>
                                        <option value="bedroom">חדר שינה</option>
                                        <option value="livingroom">סלון</option>
                                        <option value="bathroom">שירותים</option>
                                        <option value="balcony">מרפסת</option>
                                        <option value="garden">גינה</option>
                                        <option value="saferoom">ממ"ד</option>
                                        <option value="storage">מחסן</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                        <button onClick={addRoom} className="bg-green-500 text-white p-2 rounded-md mb-4">
                            הוספת חדר נוסף
                        </button>

                        <div className="mb-4">
                            <label className="block text-right">שם הבעלים</label>
                            <input
                                type="text"
                                name="ownerName"
                                value={newProperty.ownerName}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                                dir="rtl"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">ת"ז הבעלים</label>
                            <input
                                type="text"
                                name="ownerID"
                                value={newProperty.ownerID}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                                dir="rtl"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-right">תאריך תחילת העסקה</label>
                            <input
                                type="date"
                                name="startDate"
                                value={newProperty.startDate}
                                onChange={handleNewPropertyChange}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        {/* Dynamic image inputs */}
                        {imageInputs.map((input, index) => (
    <div key={input.id} className="mb-4 flex items-center">
        <label className="block text-right mr-2">תמונה {index + 1}</label>
        <input
            type="file"
            onChange={(e) => handleFileChange(index, e)}
            className="w-full p-2 border rounded-md"
            dir="rtl"
        />
        {/* X button to remove the image */}
        <button
            type="button"
            onClick={() => removeImageInput(index)}
            className="text-red-600 font-bold ml-2"
        >
            ✕
        </button>
    </div>
))}

                        <button onClick={addImageInput} className="bg-green-500 text-white p-2 rounded-md mb-4">
                            הוספת תמונה נוספת
                        </button>
                        <div className="flex justify-end">
                            <button onClick={() => setIsPopupOpen(false)}
                                    className="bg-gray-300 p-2 rounded-md mr-2">
                                בטל
                            </button>
                            <button onClick={handleAddProperty} className="bg-blue-600 text-white p-2 rounded-md">
                                שמור
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isDetailsPopupOpen && selectedProperty && (

                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center overflow-auto">
                    <div className="bg-white p-6 rounded-lg relative w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                        <button onClick={handleClosePopup}
                                className="absolute top-2 left-2 text-gray-600 hover:text-gray-800">✕
                        </button>
            <h2 className="text-2xl mb-4">פרטי נכס</h2>

                         {/* Toggle between Edit and Save */}
            {!isEditMode ? (
                <button
                    className="bg-yellow-500 text-white p-2 rounded-md"
                    onClick={async () => {
                        setIsEditMode(true);
                        setEditData(selectedProperty); // Pre-fill the form with selected property data

                        // Ensure cities are fetched if not already
                        if (cityList.length === 0) {
                            try {
                                const cityResponse = await axios.get('http://localhost:5000/api/cities');
                                setCityList(cityResponse.data);
                            } catch (error) {
                                console.error('Error fetching cities:', error);
                            }
                        }

                        // Fetch streets for the selected city in the edit mode
                        if (selectedProperty.city) {
                            try {
                                const response = await axios.get('http://localhost:5000/api/streets', {
                                    params: { city: selectedProperty.city },
                                });
                                setStreetList(response.data); // Set the streets for the selected city
                            } catch (error) {
                                console.error('Error fetching streets:', error);
                            }
                        }
                    }}
                >
                    עריכה
                </button>
            ) : (
                <button
                    className="bg-green-500 text-white p-2 rounded-md"
                    onClick={handleSaveEdit}
                >
                    שמירה
                </button>
            )}

                         {/* Edit Mode Form */}
            {isEditMode ? (
                <div>
                    {/* City Dropdown */}
                    <div className="mb-4">
                        <label className="block text-right">עיר</label>
                        <select
                            name="city"
                            value={editData.city || ''}
                            onChange={async (e) => {
                                handleEditChange(e); // Update city in the editData
                                const selectedCity = e.target.value;

                                // Fetch streets when a new city is selected
                                if (selectedCity) {
                                    try {
                                        const response = await axios.get('http://localhost:5000/api/streets', {
                                            params: {city: selectedCity},
                                        });
                                        setStreetList(response.data); // Update street list based on the new city
                                        setEditData((prevState) => ({
                                            ...prevState,
                                            street: '', // Reset street when a new city is selected
                                        }));
                                    } catch (error) {
                                        console.error('Error fetching streets:', error);
                                    }
                                }
                            }}
                            className="w-full p-2 border rounded-md"
                            dir="rtl"
                        >
                            <option value="">בחר עיר</option>
                            {cityList.map((city, index) => (
                                <option key={index} value={city}>
                                    {city}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Street Dropdown */}
                    {editData.city && (
                        <div className="mb-4">
                            <label className="block text-right">רחוב</label>
                            <select
                                name="street"
                                value={editData.street || ''}
                                onChange={handleEditChange}
                                className="w-full p-2 border rounded-md"
                                dir="rtl"
                            >
                                <option value="">בחר רחוב</option>
                                {streetList.map((street, index) => (
                                    <option key={index} value={street}>
                                        {street}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* House, neighborhood, propertyType, roomsNum, etc. */}
                    <div className="mb-4">
                        <label className="block text-right">מס' בית</label>
                        <input
                            type="text"
                            name="house"
                            value={editData.house || ''}
                            onChange={handleEditChange}
                            className="w-full p-2 border rounded-md"
                            dir="rtl"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-right">שכונה</label>
                        <input
                            type="text"
                            name="neighborhood"
                            value={editData.neighborhood || ''}  // Pre-fill with existing neighborhood data
                            onChange={handleEditChange}  // Update editData when changed
                            className="w-full p-2 border rounded-md"
                            dir="rtl"
                        />
                    </div>

                    {/* Property Size */}
                    <div className="mb-4">
                        <label className="block text-right">גודל (במטרים מרובעים)</label>
                        <input
                            type="number"
                            name="size"
                            value={editData.size || ''}  // Pre-fill with existing size data
                            onChange={handleEditChange}
                            className="w-full p-2 border rounded-md"
                            dir="rtl"
                        />
                    </div>
                    {/* Room Numbers */}
                    <div className="mb-4">
                        <label className="block text-right">מספר חדרים</label>
                        <input
                            type="number"
                            name="roomsNum"
                            value={editData.roomsNum || ''}  // Pre-fill with existing room numbers
                            onChange={handleEditChange}
                            className="w-full p-2 border rounded-md"
                            dir="rtl"
                        />
                    </div>
                    {/* Price */}
                    <div className="mb-4">
                        <label className="block text-right">מחיר</label>
                        <input
                            type="number"
                            name="price"
                            value={editData.price || ''}  // Pre-fill with existing price data
                            onChange={handleEditChange}
                            className="w-full p-2 border rounded-md"
                            dir="rtl"
                        />
                    </div>
                    {/* Parking Number */}
                    <div className="mb-4">
                        <label className="block text-right">מס' חניות</label>
                        <input
                            type="number"
                            name="parkingNumber"
                            value={editData.parkingNumber !== undefined && editData.parkingNumber !== null ? editData.parkingNumber : 0}  // Ensure it shows 0 when it's 0 or undefined
                            onChange={handleEditChange}
                            className="w-full p-2 border rounded-md"
                            dir="rtl"
                        />
                    </div>
                    {/* Bathrooms Number */}
                    <div className="mb-4">
                        <label className="block text-right">מס' חדרי שירותים</label>
                        <input
                            type="number"
                            name="bathroomsNum"
                            value={editData.bathroomsNum !== undefined && editData.bathroomsNum !== null ? editData.bathroomsNum : 0}  // Pre-fill with existing bathrooms number data, show 0 if undefined
                            onChange={handleEditChange}
                            className="w-full p-2 border rounded-md"
                            dir="rtl"
                        />
                    </div>
                    {/* AC Number */}
                    <div className="mb-4">
                        <label className="block text-right">מס' מזגנים</label>
                        <input
                            type="number"
                            name="ac"
                            value={editData.ac !== undefined && editData.ac !== null ? editData.ac : 0}  // Pre-fill with existing AC number data, show 0 if undefined
                            onChange={handleEditChange}
                            className="w-full p-2 border rounded-md"
                            dir="rtl"
                        />
                    </div>
                    {/* age */}
                    <div className="mb-4">
                        <label className="block text-right">גיל המבנה</label>
                        <input
                            type="number"
                            name="age"
                            value={editData.age !== undefined && editData.ac !== null ? editData.age : 0}  // Pre-fill with existing AC number data, show 0 if undefined
                            onChange={handleEditChange}
                            className="w-full p-2 border rounded-md"
                            dir="rtl"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-right">גישה לנכים</label>
                        <div className="flex items-center justify-end">
                            <input
                                type="checkbox"
                                name="accessibility"
                                checked={editData.accessibility === 'כן'}  // Checked if 'כן'
                                onChange={(e) => {
                                    setEditData((prevData) => ({
                                        ...prevData,
                                        accessibility: e.target.checked ? "true" : "false",  // Set as 'כן' or 'לא' based on checkbox state
                                    }));
                                }}
                                className="ml-2"
                            />
                            <span>{editData.accessibility}</span> {/* Show 'כן' or 'לא' */}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-right">סורגים על חלונות</label>
                        <div className="flex items-center justify-end">
                            <input
                                type="checkbox"
                                name="bars"
                                checked={editData.bars === 'כן'}  // Checked if 'כן'
                                onChange={(e) => {
                                    setEditData((prevData) => ({
                                        ...prevData,
                                        bars: e.target.checked ? "true" : "false",  // Set as 'כן' or 'לא' based on checkbox state
                                    }));
                                }}
                                className="ml-2"
                            />
                            <span>{editData.bars}</span> {/* Show 'כן' or 'לא' */}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-right">אבטחה</label>
                        <div className="flex items-center justify-end">
                            <input
                                type="checkbox"
                                name="security"
                                checked={editData.security === 'כן'}  // Checked if 'כן'
                                onChange={(e) => {
                                    setEditData((prevData) => ({
                                        ...prevData,
                                        security: e.target.checked ? "true" : "false",  // Set as 'כן' or 'לא' based on checkbox state
                                    }));
                                }}
                                className="ml-2"
                            />
                            <span>{editData.security}</span> {/* Show 'כן' or 'לא' */}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-right">מס' קומות בנכס</label>
                        <input
                            type="number"
                            name="number_of_floors"
                            value={editData.number_of_floors || ''}  // Pre-fill with existing data
                            onChange={handleEditChange}  // Update editData when changed
                            className="w-full p-2 border rounded-md"
                            dir="rtl"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-right">קומת הנכס</label>
                        <input
                            type="number"
                            name="floor"
                            value={editData.floor !== undefined && editData.floor !== null ? editData.floor : ''}  // Pre-fill with 0 or other values
                            onChange={handleEditChange}  // Update editData when changed
                            className="w-full p-2 border rounded-md"
                            dir="rtl"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-right">סוג עסקה</label>
                        <select
                            name="transactionType"
                            value={editData.transactionType || ''}  // Pre-fill with existing data
                            onChange={handleEditChange}  // Update editData when changed
                            className="w-full p-2 border rounded-md"
                            dir="rtl"
                        >
                            <option value="sell">מכירה</option>
                            <option value="rent">השכרה</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-right">הערות נוספות</label>
                        <textarea
                            name="notes"
                            value={editData.notes || ''}  // Pre-fill with existing data
                            onChange={handleEditChange}  // Update editData when changed
                            className="w-full p-2 border rounded-md"
                            dir="rtl"
                        />
                    </div>

                    <div className="mb-4">
                        <h3 className="text-right">תמונות</h3>
                        <div className="flex flex-wrap">
                            {editData.pictures && Object.entries(editData.pictures).map(([key, url]) => (
                                <div key={key} className="relative m-2">
                                    <img
                                        src={url}
                                        alt={`Property ${key}`}
                                        className="w-24 h-24 object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemovePicture(key)}
                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                    >
                                        X
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4">
                            <label className="block text-right mb-2">הוספת תמונות נוספות</label>
                            {imageInputs.map((input, index) => (
                                <div key={input.id} className="flex items-center mb-2">
                                    <input
                                        type="file"
                                        onChange={(e) => handleFileChange(index, e)}
                                        accept="image/*"
                                        className="mb-2 ml-2"
                                    />
                                    {input.file && (
                                        <>
                                            <img
                                                src={URL.createObjectURL(input.file)}
                                                alt={`Preview ${index + 1}`}
                                                className="w-24 h-24 object-cover ml-2"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImageInput(index)}
                                                className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                                            >
                                                X
                                            </button>
                                        </>
                                    )}

                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addImageInput}
                                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
                            >
                                הוספת תמונה נוספת
                            </button>
                        </div>
                    </div>

                    {/* Display existing rooms */}

                    {editData.rooms && editData.rooms.length > 0 ? (
                        editData.rooms.map((room, index) => (
                            <div key={index} className="mb-4 border p-2 rounded-md">
                                <h4 className="text-lg">חדר {index + 1}</h4>

                                <div className="mb-4">
                                    <label className="block text-right">אורך (מ')</label>
                                    <input
                                        type="number"
                                        name="length"
                                        value={room.length}
                                        onChange={(e) => handleRoomChange(index, e)}
                                        className="w-full p-2 border rounded-md"
                                        dir="rtl"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-right">רוחב (מ')</label>
                                    <input
                                        type="number"
                                        name="width"
                                        value={room.width}
                                        onChange={(e) => handleRoomChange(index, e)}
                                        className="w-full p-2 border rounded-md"
                                        dir="rtl"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-right">סוג החדר</label>
                                    <select
                                        name="roomType"
                                        value={room.roomType}
                                        onChange={(e) => handleRoomChange(index, e)}
                                        className="w-full p-2 border rounded-md"
                                        dir="rtl"
                                    >
                                        <option value="">בחר סוג החדר</option>
                                        <option value="bedroom">חדר שינה</option>
                                        <option value="livingroom">סלון</option>
                                        <option value="bathroom">שירותים</option>
                                        <option value="balcony">מרפסת</option>
                                        <option value="garden">גינה</option>
                                        <option value="saferoom">ממ"ד</option>
                                        <option value="storage">מחסן</option>
                                    </select>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>אין חדרים</p>
                    )}

                    {/* Button to add a new room */}
                    <button
                        type="button"
                        className="bg-green-500 text-white p-2 rounded-md"
                        onClick={addRoom}
                    >
                        הוסף חדר נוסף
                    </button>


                </div>

            ) : (<div>
                <div className="mb-4">
                    <p>
                        <strong>כתובת:</strong> {selectedProperty.street} {selectedProperty.house}, {selectedProperty.city}
                    </p>
                    <p><strong>שכונה:</strong> {selectedProperty.neighborhood || 'N/A'}</p>
                    {selectedProperty.propertyType !== 'private house' && (
                        <p><strong>מספר דירה:</strong> {selectedProperty.apNum || 'N/A'}</p>
                )}
                <p><strong>גודל:</strong> {selectedProperty.size} מ"ר</p>
                <p><strong>מספר חדרים:</strong> {selectedProperty.roomsNum}</p>
                <p><strong>מחיר:</strong> ₪ {selectedProperty.price}</p>
                <p><strong>מספר חניות:</strong> {selectedProperty.parkingNumber}</p>
                <p><strong>מספר חדרי שירותים:</strong> {selectedProperty.bathroomsNum}</p>
                <p><strong>מספר מזגנים:</strong> {selectedProperty.ac}</p>
                <p><strong>גיל המבנה:</strong> {selectedProperty.age}</p>
                <p><strong>גישה לנכים:</strong> {selectedProperty.accessibility}</p>
                <p><strong>סורגים:</strong> {selectedProperty.bars}</p>
                <p><strong>אבטחה:</strong> {selectedProperty.security}</p>
                <p><strong>מספר קומות בנכס:</strong> {selectedProperty.number_of_floors || 'N/A'}</p>
                <p><strong>קומת
                    הנכס:</strong> {selectedProperty.floor !== null && selectedProperty.floor !== undefined ? selectedProperty.floor : 'N/A'}
                </p>
                <p><strong>סוג
                    עסקה:</strong> {selectedProperty.transactionType === 'sell' ? 'למכירה' : 'להשכרה'}</p>
                <div className="mb-4" dir="rtl">
                    <p><strong>סטטוס:</strong> {selectedProperty.status || 'N/A'}</p>
                </div>

            </div>
                {/* Display pictures vertically */}
                        <div className="mb-4" dir="rtl">
                        <h3 className="text-xl underline"><strong>תמונות:</strong></h3>
                {Object.keys(selectedProperty.pictures).length > 0 ? (
                    <div className="flex flex-col gap-4">  {/* flex-col for vertical stacking */}
                        {Object.entries(selectedProperty.pictures).map(([key, url]) => (
                            <img
                                key={key}
                                src={url}
                                alt={`Property Image ${key}`}
                                className="w-full h-auto object-cover rounded-md"
                            />
                        ))}
                    </div>
                ) : (
                    <p>אין תמונות לנכס זה</p>
                )}
            </div>
                {/*room specifications*/}
            <div className="mb-4" dir="rtl">
                <h3 className="text-xl mt-4 underline"><strong>חדרים :</strong></h3> {/* Colon placed on the left */}

                {selectedProperty.roomSpecifications && selectedProperty.roomSpecifications.length > 0 ? (
                    selectedProperty.roomSpecifications.map((room, index) => (
                        <div key={index} className="mb-4">
                            <p>
                                <strong>חדר {index + 1} :</strong> {/* Colon placed on the left */}
                            </p>
                            <p><strong>סוג: {roomTypeDictionary[room.roomType] || room.roomType}</strong></p>
                            <p><strong>מידות :</strong> {room.length}x{room.width} מטר
                            </p> {/* Colon placed on the left */}
                        </div>
                    ))
                ) : (
                    <p>אין חדרים</p>
                )}
            </div>



            </div>)}




        </div>
        )
    </div>)
            }


        </div>
    );
};

export default PropertyPage;
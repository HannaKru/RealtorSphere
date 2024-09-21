from unittest import TestCase
from unittest.mock import patch, MagicMock
from ClientProfessionalPage import get_filtered_persons, add_person, update_person_details, get_person_details
import unittest


class TestGetFilteredPersons(unittest.TestCase):

    @patch('ClientProfessionalPage.db.child')
    def test_no_persons_found(self, mock_db):
        # Mock Firebase response to return None (no persons in the database)
        mock_persons_ref = MagicMock()
        mock_persons_ref.get.return_value = None
        mock_db.return_value = mock_persons_ref

        filtered_list, error = get_filtered_persons()

        self.assertIsNone(filtered_list)
        self.assertEqual(error, 'No persons found in the database.')

    @patch('ClientProfessionalPage.db.child')
    def test_filter_by_name(self, mock_db):
        # Mock data from Firebase
        mock_persons_data = {
            'person1': {
                'FirstName': 'John',
                'LastName': 'Doe',
                'Phone': '1234567890',
                'email': 'john.doe@example.com',
                'city': 'New York',
                'Type': {
                    'Owner': {'realtor': 'email'}
                }
            },
            'person2': {
                'FirstName': 'Jane',
                'LastName': 'Smith',
                'Phone': '0987654321',
                'email': 'jane.smith@example.com',
                'city': 'Boston',
                'Type': {
                    'Client': {'realtor': 'email'}
                }
            }
        }
        mock_persons_ref = MagicMock()
        mock_persons_ref.get.return_value = mock_persons_data
        mock_db.return_value = mock_persons_ref

        filtered_list, error = get_filtered_persons(name='John', tab='owners', email='email')

        self.assertIsNone(error)
        self.assertEqual(len(filtered_list), 1)
        self.assertEqual(filtered_list[0]['FirstName'], 'John')
        self.assertEqual(filtered_list[0]['LastName'], 'Doe')

    @patch('ClientProfessionalPage.db.child')
    def test_filter_by_city(self, mock_db):
        # Mock data from Firebase
        mock_persons_data = {
            'person1': {
                'FirstName': 'John',
                'LastName': 'Doe',
                'Phone': '1234567890',
                'email': 'john.doe@example.com',
                'city': 'New York',
                'Type': {
                    'Owner': {'realtor': 'email'}
                }
            },
            'person2': {
                'FirstName': 'Jane',
                'LastName': 'Smith',
                'Phone': '0987654321',
                'email': 'jane.smith@example.com',
                'city': 'Boston',
                'Type': {
                    'Client': {'realtor': 'email'}
                }
            }
        }
        mock_persons_ref = MagicMock()
        mock_persons_ref.get.return_value = mock_persons_data
        mock_db.return_value = mock_persons_ref

        filtered_list, error = get_filtered_persons(city='Boston', tab='clients', email='email')

        self.assertIsNone(error)
        self.assertEqual(len(filtered_list), 1)
        self.assertEqual(filtered_list[0]['FirstName'], 'Jane')
        self.assertEqual(filtered_list[0]['LastName'], 'Smith')
        self.assertEqual(filtered_list[0]['city'], 'Boston')

    @patch('ClientProfessionalPage.db.child')
    def test_filter_by_id(self, mock_db):
        # Mock data from Firebase
        mock_persons_data = {
            'person1': {
                'FirstName': 'John',
                'LastName': 'Doe',
                'Phone': '1234567890',
                'email': 'john.doe@example.com',
                'city': 'New York',
                'Type': {
                    'Owner': {'realtor': 'email'}
                }
            },
            'person2': {
                'FirstName': 'Jane',
                'LastName': 'Smith',
                'Phone': '0987654321',
                'email': 'jane.smith@example.com',
                'city': 'Boston',
                'Type': {
                    'Client': {'realtor': 'email'}
                }
            }
        }
        mock_persons_ref = MagicMock()
        mock_persons_ref.get.return_value = mock_persons_data
        mock_db.return_value = mock_persons_ref

        filtered_list, error = get_filtered_persons(person_id='person1', tab='owners', email='email')

        self.assertIsNone(error)
        self.assertEqual(len(filtered_list), 1)
        self.assertEqual(filtered_list[0]['FirstName'], 'John')
        self.assertEqual(filtered_list[0]['LastName'], 'Doe')

    @patch('ClientProfessionalPage.db.child')
    def test_error_fetching_persons(self, mock_db):
        # Simulate an error from Firebase
        mock_db.side_effect = Exception('Firebase error')

        filtered_list, error = get_filtered_persons()

        self.assertIsNone(filtered_list)
        self.assertEqual(error, 'An error occurred while fetching persons.')


class TestAddPerson(unittest.TestCase):

    @patch('ClientProfessionalPage.db.child')
    def test_add_person_owner_success(self, mock_db):
        # Mock Firebase response for checking existing person
        mock_person_ref = MagicMock()
        mock_person_ref.child().get.return_value = None  # No person exists with this ID
        mock_db.return_value = mock_person_ref

        data = {
            "id": "123",
            "firstName": "John",
            "lastName": "Doe",
            "phone": "1234567890",
            "email": "john.doe@example.com",
            "type": "Owner"
        }

        response, status = add_person(data, "realtor@example.com")

        # Verify the result
        self.assertEqual(status, 200)
        self.assertEqual(response["message"], "Person added successfully")

        # Verify that the correct data is sent to Firebase
        expected_data = {
            "FirstName": "John",
            "LastName": "Doe",
            "Phone": "1234567890",
            "email": "john.doe@example.com",
            "Type": {
                "Owner": {
                    "realtor": "realtor@example.com"
                }
            }
        }
        mock_person_ref.child().set.assert_called_once_with(expected_data)

    @patch('ClientProfessionalPage.db.child')
    def test_add_person_client_success(self, mock_db):
        # Mock Firebase response for checking existing person
        mock_person_ref = MagicMock()
        mock_person_ref.child().get.return_value = None  # No person exists with this ID
        mock_db.return_value = mock_person_ref

        data = {
            "id": "456",
            "firstName": "Jane",
            "lastName": "Smith",
            "phone": "0987654321",
            "email": "jane.smith@example.com",
            "type": "Client",
            "buyORrent": "buy",
            "budget": "1000000",
            "propertiesList": ["property1", "property2"],
            "maxRooms": "5",
            "minRooms": "2",
            "maxSize": "150",
            "minSize": "80",
            "propertyType": "Apartment",
            "cities": ["New York", "Boston"]
        }

        response, status = add_person(data, "realtor@example.com")

        # Verify the result
        self.assertEqual(status, 200)
        self.assertEqual(response["message"], "Person added successfully")

        # Verify that the correct data is sent to Firebase
        expected_data = {
            "FirstName": "Jane",
            "LastName": "Smith",
            "Phone": "0987654321",
            "email": "jane.smith@example.com",
            "Type": {
                "Client": {
                    "realtor": "realtor@example.com",
                    "buyORrent": "buy",
                    "budget": "1000000",
                    "PropertiesList": ["property1", "property2"],
                    "maxRooms": "5",
                    "minRooms": "2",
                    "maxSize": "150",
                    "minSize": "80",
                    "propertyType": "Apartment",
                    "searchCity": ["New York", "Boston"]
                }
            }
        }
        mock_person_ref.child().set.assert_called_once_with(expected_data)

    @patch('ClientProfessionalPage.db.child')
    def test_add_person_already_exists(self, mock_db):
        # Mock Firebase response for checking existing person
        mock_person_ref = MagicMock()
        mock_person_ref.child().get.return_value = {"FirstName": "Existing"}  # Person already exists
        mock_db.return_value = mock_person_ref

        data = {
            "id": "123",
            "firstName": "John",
            "lastName": "Doe",
            "phone": "1234567890",
            "email": "john.doe@example.com",
            "type": "Owner"
        }

        response, status = add_person(data, "realtor@example.com")

        # Verify the result
        self.assertEqual(status, 400)
        self.assertEqual(response["error"], "Person with this ID already exists")

        # Ensure the 'set' method was not called since the person already exists
        mock_person_ref.child().set.assert_not_called()

    @patch('ClientProfessionalPage.db.child')
    def test_add_person_error_handling(self, mock_db):
        # Simulate no existing person found, but raise an exception when setting
        mock_person_ref = MagicMock()
        mock_person_ref.child().get.return_value = None  # No existing person
        mock_person_ref.child().set.side_effect = Exception('Firebase error')  # Raise an error when setting the person
        mock_db.return_value = mock_person_ref

        data = {
            "id": "789",
            "firstName": "Alice",
            "lastName": "Brown",
            "phone": "1122334455",
            "email": "alice.brown@example.com",
            "type": "Owner"
        }

        # Call the add_person function
        response, status = add_person(data, "realtor@example.com")

        # Verify the result
        self.assertEqual(status, 500)  # Ensure it's returning 500 on error
        self.assertIn("An error occurred while adding the person", response["error"])


class TestUpdatePersonDetails(unittest.TestCase):

    @patch('ClientProfessionalPage.db')
    def test_update_person_details_success(self, mock_db):
        # Mock data
        person_id = "1"
        realtor_email = "AsafLotz@gmail.com"
        mock_person_data = {
            "FirstName": "Avi",
            "LastName": "Ron",
            "Phone": "545381647",
            "email": "AviRon@gmail.com",
            "Type": {
                "Owner": {
                    "realtor": "AsafLotz@gmail.com",
                    "sellORrent": "rent"
                }
            }
        }

        # Setup mock
        mock_person_ref = MagicMock()
        mock_person_ref.get.return_value = mock_person_data
        mock_db.child.return_value.child.return_value = mock_person_ref

        # Test data
        update_data = {
            "id": person_id,
            "FirstName": "Avi Updated",
            "Type": {
                "Client": {
                    "PropertiesList": ["1", "-O5hTCrJ0QJD-EddZQoo"],
                    "budget": 5000,
                    "buyORrent": "rent",
                    "maxRooms": 4,
                    "minRooms": 2,
                    "maxSize": 100,
                    "minSize": 50,
                    "propertyType": "apartment",
                    "searchCity": ["Acre"]
                },
                "Owner": {
                    "sellORrent": "sell"
                }
            }
        }

        # Call function
        result, status_code = update_person_details(update_data, realtor_email)

        # Assertions
        self.assertEqual(status_code, 200)
        self.assertEqual(result["message"], "Person updated successfully")
        self.assertEqual(result["updated_data"]["FirstName"], "Avi Updated")
        self.assertEqual(result["updated_data"]["Type"]["Client"]["realtor"], realtor_email)
        self.assertEqual(result["updated_data"]["Type"]["Client"]["PropertiesList"], ["1", "-O5hTCrJ0QJD-EddZQoo"])
        self.assertEqual(result["updated_data"]["Type"]["Owner"]["sellORrent"], "sell")

    @patch('ClientProfessionalPage.db')
    def test_update_person_details_not_found(self, mock_db):
        # Mock data
        person_id = "nonexistent_id"
        realtor_email = "AsafLotz@gmail.com"

        # Setup mock
        mock_person_ref = MagicMock()
        mock_person_ref.get.return_value = None
        mock_db.child.return_value.child.return_value = mock_person_ref

        # Test data
        update_data = {
            "id": person_id,
            "FirstName": "Test"
        }

        # Call function
        result, status_code = update_person_details(update_data, realtor_email)

        # Assertions
        self.assertEqual(status_code, 404)
        self.assertEqual(result["message"], "Person not found")

    def test_update_person_details_missing_id(self):
        # Test data
        update_data = {
            "FirstName": "Test"
        }
        realtor_email = "AsafLotz@gmail.com"

        # Call function
        result, status_code = update_person_details(update_data, realtor_email)

        # Assertions
        self.assertEqual(status_code, 400)
        self.assertEqual(result["message"], "Person ID is required")

    @patch('ClientProfessionalPage.db')
    def test_update_person_details_exception(self, mock_db):
        # Mock data
        person_id = "1"
        realtor_email = "AsafLotz@gmail.com"

        # Setup mock to raise an exception
        mock_db.child.side_effect = Exception("Database error")

        # Test data
        update_data = {
            "id": person_id,
            "FirstName": "Test"
        }

        # Call function
        result, status_code = update_person_details(update_data, realtor_email)

        # Assertions
        self.assertEqual(status_code, 500)
        self.assertTrue(result["message"].startswith("An error occurred while updating the person"))


class TestGetPersonDetails(unittest.TestCase):

    @patch('ClientProfessionalPage.db')
    def test_get_person_details_success_client(self, mock_db):
        person_id = "333377666"  # Assuming this is Eli Kopter's ID
        mock_person_data = {
            "FirstName": "Eli",
            "LastName": "Kopter",
            "Phone": "123456789",  # Assuming a phone number
            "email": "EliKopter@gmail.com",  # Assuming an email
            "Type": {
                "Client": {
                    "PropertiesList": ["1", "-O5hTCrJ0QJD-EddZQoo"]
                }
            }
        }
        mock_property_data_1 = {
            "Street": "מול הים",
            "house": "18",
            "city": "חיפה"
        }
        mock_property_data_2 = {
            "Street": "הרצל",
            "house": "10",
            "city": "תל אביב"
        }

        # Setup mocks
        mock_db.child.return_value.child.return_value.get.side_effect = [
            mock_person_data,
            mock_property_data_1,
            mock_property_data_2
        ]

        result, error = get_person_details(person_id)

        self.assertIsNone(error)
        self.assertEqual(result['id'], person_id)
        self.assertEqual(result['FirstName'], "Eli")
        self.assertEqual(result['LastName'], "Kopter")
        self.assertEqual(len(result['PropertiesOwned']), 0)  # Eli is not an owner
        self.assertEqual(len(result['PropertiesLiked']), 2)
        self.assertEqual(result['PropertiesLiked'][0]['address'], "מול הים 18, חיפה")
        self.assertEqual(result['PropertiesLiked'][1]['address'], "הרצל 10, תל אביב")

    @patch('ClientProfessionalPage.db')
    def test_get_person_details_not_found(self, mock_db):
        # Mock data
        person_id = "nonexistent_id"

        # Setup mock
        mock_db.child.return_value.child.return_value.get.return_value = None

        result, error = get_person_details(person_id)

        self.assertIsNone(result)
        self.assertEqual(error, "Person not found")

    @patch('ClientProfessionalPage.db')
    def test_get_person_details_exception(self, mock_db):
        def test_get_person_details_exception(self, mock_db):
            person_id = "333377666"

            # Setup mock to raise an exception
            mock_db.child.side_effect = Exception("Database error")

            result, error = get_person_details(person_id)

            self.assertIsNone(result)
            self.assertTrue(error.startswith("An error occurred while fetching person details"))

if __name__ == '__main__':
    unittest.main()

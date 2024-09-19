from unittest import TestCase
import unittest
from unittest.mock import patch, MagicMock
from Property import get_properties, get_property_by_id,allowed_file, add_property, remove_picture, add_pictures_to_property
from flask import Flask, request



class TestGetProperties(unittest.TestCase):

    @patch('Property.db_ref')  # Mock the Firebase reference
    def test_get_properties_no_filters(self, mock_db_ref):
        # Mocking Firebase data
        mock_db_ref.child.return_value.get.side_effect = [
            {
                "1": {
                    "Price": "2500",
                    "type": {
                        "apartment": {
                            "item:": {
                                "roomsNum": 3,
                                "bathroomsNum": 1
                            },
                            "type": "Apartment"
                        }
                    },
                    "city": "Tel Aviv",
                    "realtor": "test@example.com",
                    "street": "Main St",
                    "house": "1",
                    "size": 100
                }
            },
            {
                "1": {
                    "PersonID": "1",
                    "propertyID": "1",
                    "rentORsell": "rent",
                    "startDate": "2022-01-01"
                }
            },
            {
                "1": {
                    "FirstName": "John",
                    "LastName": "Doe"
                }
            }
        ]

        properties = get_properties(email="test@example.com")

        # Expected result
        expected_properties = [
            {
                'id': '1',
                'owner': 'John Doe',
                'rooms': 3,
                'price': "2500",
                'size': 100,
                'city': 'Tel Aviv',
                'neighborhood': '',
                'propertyType': 'Apartment',
                'transactionType': 'rent',
                'status': '',
                'street': 'Main St',
                'house': '1',
                'address': 'Main St 1',
                'parkingNumber': 'N/A',
                'bathroomsNum': 1,
                'ac': 'N/A',
                'age': 'N/A',
                'accessibility': False,
                'elevator': 'false',
                'bars': 'false',
                'security': 'false',
                'notes': 'אין',
                'pictures': {},
                'roomSpecifications': [],
                'number_of_floors': 'N/A',
                'floor': 'N/A',
                'apNum': 'N/A',
                'archiveReason': '',
                'endDate': '',
                'startDate': '2022-01-01'
            }
        ]

        self.assertEqual(properties, expected_properties)

    @patch('Property.db_ref')
    def test_get_properties_with_filters(self, mock_db_ref):
        # Mock Firebase data
        mock_db_ref.child.return_value.get.side_effect = [
            {
                "1": {
                    "Price": "2500",
                    "type": {
                        "apartment": {
                            "item:": {
                                "roomsNum": 3,
                                "bathroomsNum": 1
                            },
                            "type": "Apartment"
                        }
                    },
                    "city": "Tel Aviv",
                    "realtor": "test@example.com",
                    "street": "Main St",
                    "house": "1",
                    "size": 100
                }
            },
            {
                "1": {
                    "PersonID": "1",
                    "propertyID": "1",
                    "rentORsell": "rent",
                    "startDate": "2022-01-01"
                }
            },
            {
                "1": {
                    "FirstName": "John",
                    "LastName": "Doe"
                }
            }
        ]

        # Test with city and room number filter
        properties = get_properties(email="test@example.com", city="Tel Aviv", roomNumberFrom=2, roomNumberTo=4)

        expected_properties = [
            {
                'id': '1',
                'owner': 'John Doe',
                'rooms': 3,
                'price': "2500",
                'size': 100,
                'city': 'Tel Aviv',
                'neighborhood': '',
                'propertyType': 'Apartment',
                'transactionType': 'rent',
                'status': '',
                'street': 'Main St',
                'house': '1',
                'address': 'Main St 1',
                'parkingNumber': 'N/A',
                'bathroomsNum': 1,
                'ac': 'N/A',
                'age': 'N/A',
                'accessibility': False,
                'elevator': 'false',
                'bars': 'false',
                'security': 'false',
                'notes': 'אין',
                'pictures': {},
                'roomSpecifications': [],
                'number_of_floors': 'N/A',
                'floor': 'N/A',
                'apNum': 'N/A',
                'archiveReason': '',
                'endDate': '',
                'startDate': '2022-01-01'
            }
        ]

        self.assertEqual(properties, expected_properties)

    @patch('Property.db_ref')
    def test_get_properties_no_results(self, mock_db_ref):
        # Mock Firebase data with no properties
        mock_db_ref.child.return_value.get.side_effect = [{}, {}, {}]

        # Test with no matching data
        properties = get_properties(email="test@example.com")
        self.assertEqual(properties, [])  # Expect no results

class TestGetPropertyById(unittest.TestCase):

    @patch('Property.db_ref')
    def test_get_property_by_id_success(self, mock_db_ref):
        mock_property_ref = MagicMock()
        mock_property_ref.get.return_value = {
            'id': '123',
            'name': 'Test Property',
            'city': 'Test City',
            'rooms': 3
        }
        mock_db_ref.child.return_value = mock_property_ref

        property_data = get_property_by_id('123')
        mock_db_ref.child.assert_called_once_with('property/123')

        self.assertEqual(property_data, {
            'id': '123',
            'name': 'Test Property',
            'city': 'Test City',
            'rooms': 3
        })

    @patch('Property.db_ref')
    def test_get_property_by_id_not_found(self, mock_db_ref):
        mock_property_ref = MagicMock()
        mock_property_ref.get.return_value = None
        mock_db_ref.child.return_value = mock_property_ref

        property_data = get_property_by_id('non_existent_id')
        mock_db_ref.child.assert_called_once_with('property/non_existent_id')

        self.assertIsNone(property_data)
class TestAllowedFile(unittest.TestCase):

    def test_valid_png_extension(self):
        filename = 'image.png'
        self.assertTrue(allowed_file(filename))

    def test_valid_jpg_extension(self):
        filename = 'photo.jpg'
        self.assertTrue(allowed_file(filename))

    def test_valid_jpeg_extension(self):
        filename = 'picture.jpeg'
        self.assertTrue(allowed_file(filename))

    def test_valid_gif_extension(self):
        filename = 'animation.gif'
        self.assertTrue(allowed_file(filename))

    def test_invalid_txt_extension(self):
        filename = 'document.txt'
        self.assertFalse(allowed_file(filename))

    def test_invalid_extension_no_period(self):
        filename = 'file_without_extension'
        self.assertFalse(allowed_file(filename))

    def test_invalid_extension_random_chars(self):
        filename = 'file.invalid'
        self.assertFalse(allowed_file(filename))

    def test_valid_uppercase_extension(self):
        filename = 'image.PNG'
        self.assertTrue(allowed_file(filename))

    def test_invalid_no_extension(self):
        filename = 'image.'
        self.assertFalse(allowed_file(filename))

    def test_no_filename(self):
        filename = ''
        self.assertFalse(allowed_file(filename))


class TestAddProperty(unittest.TestCase):

    def setUp(self):
        # Create a Flask app for testing
        self.app = Flask(__name__)
        self.app_context = self.app.app_context()
        self.app_context.push()  # Push the app context for testing

    def tearDown(self):
        self.app_context.pop()  # Pop the app context after the test is done

    @patch('Property.get_storage_bucket')  # Mock Firebase storage
    @patch('Property.db_ref')  # Mock Firebase database reference
    def test_add_property_success(self, mock_db_ref, mock_get_storage_bucket):
        # Mock form data
        data = {
            'price': '2500',
            'street': 'Main St',
            'city': 'Tel Aviv',
            'house': '1',
            'neighborhood': 'Central',
            'size': '100',
            'ac': '2',
            'accessibility': 'True',
            'age': '5',
            'bars': 'False',
            'numberOfFloors': '3',
            'ownerID': '123',
            'transactionType': 'rent',
            'startDate': '2022-01-01',
            'propertyType': 'Apartment',
            'floor': '2',
            'apNum': '5',
            'elevator': 'True',
            'parkingNumber': '1',
            'bathroomsNum': '1',
            'roomsNum': '3',
            'rooms': '[{"width": 3, "length": 4, "type": "bedroom"}]'
        }

        # Mock file upload
        mock_file = MagicMock()
        mock_file.filename = 'image.png'

        # Mock Firebase database actions
        mock_db_ref.child().push.return_value.key = 'new_property_key'

        # Mock Firebase storage blob
        mock_blob = MagicMock()
        mock_get_storage_bucket.return_value.blob.return_value = mock_blob

        # Simulate the request context with Flask
        with self.app.test_request_context(data=data, method='POST'):
            request.files = {'file1': mock_file}  # Simulating file input

            # Call the function
            result = add_property(data, mock_file, 'realtor@example.com')

            # Check if the property was added successfully
            self.assertEqual(result, ({"message": "Property added successfully"}, 200))

            # Verify that property and ownership data were saved
            mock_db_ref.child('property').push.assert_called_once()
            mock_db_ref.child('Ownership').child('new_property_key').set.assert_called_once()

            # Verify that the file was uploaded
            mock_blob.upload_from_file.assert_called_once_with(mock_file)
            mock_blob.make_public.assert_called_once()

    @patch('Property.get_storage_bucket')
    @patch('Property.db_ref')
    def test_add_property_exception(self, mock_db_ref, mock_get_storage_bucket):
        # Mock an exception being raised in the process
        mock_db_ref.child.side_effect = Exception("Firebase error")

        data = {
            'price': '2500',
            'street': 'Main St',
            'city': 'Tel Aviv'
        }

        mock_file = MagicMock()

        with self.app.test_request_context(data=data, method='POST'):
            result = add_property(data, mock_file, 'realtor@example.com')

            self.assertEqual(result, ({"error": "An error occurred while adding the property"}, 500))

    @patch('Property.get_storage_bucket')
    @patch('Property.db_ref')
    def test_add_property_no_files(self, mock_db_ref, mock_get_storage_bucket):
        # Mock the data with no files
        data = {
            'price': '2500',
            'street': 'Main St',
            'city': 'Tel Aviv',
            'house': '1',
            'size': '100'
        }

        with self.app.test_request_context(data=data, method='POST'):
            result = add_property(data, None, 'realtor@example.com')

            self.assertEqual(result, ({"message": "Property added successfully"}, 200))
            mock_get_storage_bucket.assert_not_called()  # No files to upload
            mock_db_ref.child('property').push.assert_called_once()

class TestRemovePicture(unittest.TestCase):

    @patch('Property.get_storage_bucket')  # Mock Firebase storage
    @patch('Property.db_ref')  # Mock Firebase database reference
    def test_remove_picture_success(self, mock_db_ref, mock_get_storage_bucket):
        # Mock Firebase storage and blob
        mock_bucket = MagicMock()
        mock_blob = MagicMock()
        mock_get_storage_bucket.return_value = mock_bucket
        mock_bucket.blob.return_value = mock_blob

        # Call the function with mocked parameters
        result = remove_picture('property123', 'image1')

        # Verify that the file was deleted from Firebase Storage
        mock_bucket.blob.assert_called_once_with('property_images/property123_image1')
        mock_blob.delete.assert_called_once()

        # Verify that the picture entry was deleted from Firebase Database
        mock_db_ref.child.assert_called_once_with('property/property123/pictures/image1')
        mock_db_ref.child().delete.assert_called_once()

        # Check if the result is as expected
        self.assertEqual(result, ({"message": "Picture deleted successfully"}, 200))

    @patch('Property.get_storage_bucket')
    @patch('Property.db_ref')
    def test_remove_picture_exception(self, mock_db_ref, mock_get_storage_bucket):
        # Mock an exception being raised when deleting the file
        mock_bucket = MagicMock()
        mock_blob = MagicMock()
        mock_get_storage_bucket.return_value = mock_bucket
        mock_bucket.blob.return_value = mock_blob
        mock_blob.delete.side_effect = Exception("Firebase error")

        # Call the function and capture the result
        result = remove_picture('property123', 'image1')

        # Verify that the file deletion was attempted but failed
        mock_bucket.blob.assert_called_once_with('property_images/property123_image1')
        mock_blob.delete.assert_called_once()

        # Check if the result is as expected when an exception occurs
        self.assertEqual(result, ({"error": "An error occurred while deleting the picture"}, 500))

    @patch('Property.get_storage_bucket')
    @patch('Property.db_ref')
    def test_remove_picture_db_exception(self, mock_db_ref, mock_get_storage_bucket):
        # Mock successful file deletion but raise exception in database delete
        mock_bucket = MagicMock()
        mock_blob = MagicMock()
        mock_get_storage_bucket.return_value = mock_bucket
        mock_bucket.blob.return_value = mock_blob

        # Mock exception during database delete
        mock_db_ref.child.return_value.delete.side_effect = Exception("Database error")

        # Call the function and capture the result
        result = remove_picture('property123', 'image1')

        # Verify that the file was deleted successfully from Firebase Storage
        mock_blob.delete.assert_called_once()

        # Verify that the database deletion was attempted but failed
        mock_db_ref.child.assert_called_once_with('property/property123/pictures/image1')
        mock_db_ref.child().delete.assert_called_once()

        # Check if the result is as expected when the database delete fails
        self.assertEqual(result, ({"error": "An error occurred while deleting the picture"}, 500))

class TestAddPicturesToProperty(unittest.TestCase):

    @patch('Property.get_storage_bucket')  # Mock Firebase Storage
    @patch('Property.db_ref')  # Mock Firebase Database
    def test_add_pictures_to_property_success(self, mock_db_ref, mock_get_storage_bucket):
        # Mock Firebase storage and blob
        mock_bucket = MagicMock()
        mock_blob = MagicMock()
        mock_get_storage_bucket.return_value = mock_bucket
        mock_bucket.blob.return_value = mock_blob

        # Mock files to simulate file uploads
        mock_file1 = MagicMock()
        mock_file1.filename = 'image1.png'
        mock_file2 = MagicMock()
        mock_file2.filename = 'image2.jpg'

        files = {
            'file1': mock_file1,
            'file2': mock_file2
        }

        # Call the function with mocked files
        result = add_pictures_to_property('property123', files)

        # Verify that each file was uploaded to Firebase Storage
        mock_bucket.blob.assert_any_call('property_images/property123_image1.png')
        mock_bucket.blob.assert_any_call('property_images/property123_image2.jpg')

        # Verify that both blobs were made public
        self.assertEqual(mock_blob.upload_from_file.call_count, 2)
        self.assertEqual(mock_blob.make_public.call_count, 2)

        # Verify that picture URLs were saved in Firebase Database
        mock_db_ref.child(f'property/property123/pictures').update.assert_any_call({
            'file1': mock_blob.public_url
        })
        mock_db_ref.child(f'property/property123/pictures').update.assert_any_call({
            'file2': mock_blob.public_url
        })

        # Check if the result is as expected
        self.assertEqual(result, ({"message": "Pictures uploaded successfully"}, 200))

    @patch('Property.get_storage_bucket')
    @patch('Property.db_ref')
    def test_add_pictures_to_property_exception(self, mock_db_ref, mock_get_storage_bucket):
        # Mock Firebase storage and blob
        mock_bucket = MagicMock()
        mock_blob = MagicMock()
        mock_get_storage_bucket.return_value = mock_bucket
        mock_bucket.blob.return_value = mock_blob

        # Simulate an exception when uploading a file
        mock_blob.upload_from_file.side_effect = Exception("Firebase error")

        mock_file1 = MagicMock()
        mock_file1.filename = 'image1.png'
        files = {
            'file1': mock_file1
        }

        # Call the function and capture the result
        result = add_pictures_to_property('property123', files)

        # Check that the function handled the exception and returned the correct response
        self.assertEqual(result, ({"error": "An error occurred while uploading the pictures"}, 500))

        # Verify that the exception was raised and caught
        mock_blob.upload_from_file.assert_called_once()



if __name__ == '__main__':
    unittest.main()
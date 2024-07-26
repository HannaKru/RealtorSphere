import unittest
from unittest.mock import MagicMock, patch
from Registration import register_user  # Ensure the import matches the file name

class TestRegisterUser(unittest.TestCase):

    @patch('Registration.db_ref')  # Mocking db_ref in Registration module
    def test_register_user_success(self, mock_db_ref):
        # Setup mock
        mock_users_ref = MagicMock()
        mock_db_ref.return_value.child.return_value = mock_users_ref
        mock_users_ref.child.return_value.get.return_value = None  # Simulate no existing user

        # Mock the set method to return None
        mock_users_ref.child.return_value.set.return_value = None

        # Call the function
        status, message = register_user('John', 'Doe', '997654321', '052', '1234567', 'johndoe@example.com', 'password123', 'password123', '67890')

        # Assertions
        self.assertEqual(status, 'success')
        self.assertEqual(message, 'הרשמה הצליחה!')

    @patch('Registration.db_ref')  # Mocking db_ref in Registration module
    def test_register_user_password_mismatch(self, mock_db_ref):
        # Call the function with mismatched passwords
        status, message = register_user('John', 'Doe', '987654321', '052', '1234567', 'johndoe@example.com', 'password123', 'wrongpassword', '67890')

        # Assertions
        self.assertEqual(status, 'error')
        self.assertEqual(message, 'סיסמאות לא תואמות')

    @patch('Registration.db_ref')  # Mocking db_ref in Registration module
    def test_register_user_existing_id(self, mock_db_ref):
        # Setup mock
        mock_users_ref = MagicMock()
        mock_db_ref.return_value.child.return_value = mock_users_ref
        mock_users_ref.child.return_value.get.return_value = {
            'FirstName': 'Asaf',
            'LastName': 'Lotz',
            'Phone': 509994447,
            'Type': {
                'Realtor': {
                    'license': 3334445,
                    'password': '1234'
                }
            },
            'email': 'AsafLotz@gmail.com'
        }  # Simulate existing user

        # Call the function
        status, message = register_user('John', 'Doe', '323344888', '052', '1234567', 'johndoe@example.com', 'password123', 'password123', '67890')

        # Assertions
        self.assertEqual(status, 'error')
        self.assertEqual(message, 'המספר כבר קיים במערכת')

    @patch('Registration.db_ref')  # Mocking db_ref in Registration module
    def test_register_user_firebase_exception(self, mock_db_ref):
        # Setup mock
        mock_users_ref = MagicMock()
        mock_db_ref.return_value.child.return_value = mock_users_ref
        mock_users_ref.child.return_value.get.return_value = None  # Simulate no existing user

        # Simulate an exception during set
        mock_users_ref.child.return_value.set.side_effect = Exception('Firebase error')

        # Call the function
        status, message = register_user('John', 'Doe', '967654321', '052', '1334567', 'johndoe@example.com', 'password123', 'password123', '67890')

        # Assertions
        self.assertEqual(status, 'error')
        self.assertEqual(message, 'שגיאה בהרשמה: Firebase error')

if __name__ == '__main__':
    unittest.main()

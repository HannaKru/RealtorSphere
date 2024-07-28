import unittest
from unittest.mock import MagicMock, patch
from Registration import register_user

class TestRegisterUser(unittest.TestCase):

    @patch('Registration.db_ref')
    def test_register_user_success(self, mock_db_ref):
        mock_users_ref = MagicMock()
        mock_db_ref.child.return_value = mock_users_ref
        mock_users_ref.child.return_value.get.return_value = None  # No user with the given ID
        mock_users_ref.order_by_child.return_value.equal_to.return_value.get.return_value = {}  # No user with the given email

        status, message = register_user('John', 'Doe', '967654321', '052', '1334567', 'johndoe@example.com',
                                        'password123', 'password123', '67890')

        self.assertEqual(status, 'success')
        self.assertEqual(message, 'הרשמה הצליחה!')

    @patch('Registration.db_ref')
    def test_register_user_password_mismatch(self, mock_db_ref):
        status, message = register_user('John', 'Doe', '987654321', '052', '1234567', 'johndoe@example.com', 'password123', 'wrongpassword', '67890')

        self.assertEqual(status, 'error')
        self.assertEqual(message, 'סיסמאות לא תואמות')

    @patch('Registration.db_ref')
    def test_register_user_existing_id(self, mock_db_ref):
        mock_users_ref = MagicMock()
        mock_db_ref.child.return_value = mock_users_ref
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
        }

        status, message = register_user('John', 'Doe', '323344888', '052', '1234567', 'johndoe@example.com', 'password123', 'password123', '67890')

        self.assertEqual(status, 'error')
        self.assertEqual(message, 'המספר כבר קיים במערכת')

    @patch('Registration.db_ref')
    def test_register_user_existing_email(self, mock_db_ref):
        mock_users_ref = MagicMock()
        mock_db_ref.child.return_value = mock_users_ref

        # Simulate existing user with the given email
        mock_users_ref.order_by_child.return_value.equal_to.return_value.get.return_value = {
            'some_id': {
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
            }
        }

        status, message = register_user('John', 'Doe', '333333333', '052', '1234567', 'AsafLotz@gmail.com',
                                        'password123', 'password123', '67890')

        self.assertEqual(status, 'error')
        self.assertEqual(message, 'האימייל כבר קיים במערכת')

    @patch('Registration.db_ref')
    def test_register_user_firebase_exception(self, mock_db_ref):
        mock_users_ref = MagicMock()
        mock_db_ref.child.return_value = mock_users_ref
        mock_users_ref.child.return_value.get.return_value = None  # No user with the given ID
        mock_users_ref.order_by_child.return_value.equal_to.return_value.get.return_value = {}  # No user with the given email

        # Simulate Firebase exception
        mock_users_ref.child.return_value.set.side_effect = Exception('Firebase error')

        status, message = register_user('John', 'Doe', '967654321', '052', '1334567', 'johndoe@example.com',
                                        'password123', 'password123', '67890')

        self.assertEqual(status, 'error')
        self.assertEqual(message, 'שגיאה בהרשמה: Firebase error')


if __name__ == '__main__':
    unittest.main()

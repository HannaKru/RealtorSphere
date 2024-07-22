import unittest
from unittest import TestCase
from unittest.mock import patch, MagicMock
from login import login_user

# Mock Firebase database
mock_db = MagicMock()
mock_person_ref = MagicMock()

# Setup mock data
mock_db.child.return_value = mock_person_ref
mock_person_ref.get.return_value = {
    'user1': {
        'email': 'AsafLotz@gmail.com',
        'Type': {
            'Realtor': {
                'password': '1234'
            }
        }
    }
}

class TestLoginUser(TestCase):

    @patch('login.db', new_callable=lambda: mock_db)
    def test_login_success(self, mock_db):
        """Verifies that a user with correct credentials can log in."""
        email = 'AsafLotz@gmail.com'
        password = '1234'
        status_code, message = login_user(email, password)
        self.assertEqual(status_code, 200)
        self.assertEqual(message, 'Login successful!')

    @patch('login.db', new_callable=lambda: mock_db)
    def test_login_failure_incorrect_password(self, mock_db):
        """Verifies that login fails with incorrect credentials."""
        email = 'AsafLotz@gmail.com'
        password = 'wrongpassword'
        status_code, message = login_user(email, password)
        self.assertEqual(status_code, 401)
        self.assertEqual(message, 'סיסמה שגויה, נא נסה שוב או אפס סיסמה דרך \'שכחתי סיסמה\'')

    @patch('login.db', new_callable=lambda: mock_db)
    def test_login_user_not_found(self, mock_db):
        """Verifies that login fails if the user is not found."""
        email = 'nonexistent@example.com'
        password = 'any_password'
        status_code, message = login_user(email, password)
        self.assertEqual(status_code, 404)
        self.assertEqual(message, 'משתמש לא קיים')

    @patch('login.db', new_callable=lambda: mock_db)
    def test_login_missing_email_or_password(self, mock_db):
        """Verifies that missing email or password returns the appropriate message."""
        # Test missing email
        status_code, message = login_user('', '1234')
        self.assertEqual(status_code, 400)
        self.assertEqual(message, 'נא למלא את כל השדות')

        # Test missing password
        status_code, message = login_user('AsafLotz@gmail.com', '')
        self.assertEqual(status_code, 400)
        self.assertEqual(message, 'נא למלא את כל השדות')

if __name__ == '__main__':
    unittest.main()

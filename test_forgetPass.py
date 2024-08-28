import unittest
from unittest.mock import patch, MagicMock
from forgetPass import check_user_and_send_email, send_password_reset_email


# Mock Firebase database
mock_db = MagicMock()

class TestForgotPass(unittest.TestCase):

    @patch('forgetPass.db_ref', new_callable=lambda: mock_db)
    def test_correct_user_data(self, mock_db_ref):
        # Mock data setup
        mock_db_ref.child.return_value.get.return_value = {
            '323344888': {
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
        with patch('forgetPass.send_password_reset_email', return_value=True):
            response, status_code = check_user_and_send_email('AsafLotz@gmail.com', '323344888')
            self.assertEqual(status_code, 200)
            self.assertEqual(response['message'], 'הסיסמה נשלחה למייל')

    @patch('forgetPass.db_ref', new_callable=lambda: mock_db)
    def test_incorrect_user_data(self, mock_db_ref):
        # Mock data setup
        mock_db_ref.child.return_value.get.return_value = {
            '323344888': {
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

        response, status_code = check_user_and_send_email('WrongEmail@gmail.com', '323344888')
        self.assertEqual(status_code, 400)
        self.assertEqual(response['message'], 'השדות אינם תואמים - טעות באימייל או בתעודת הזהות')

    @patch('forgetPass.smtplib.SMTP')
    def test_send_email_success(self, mock_smtp):
        # Mock SMTP session
        mock_smtp_instance = MagicMock()
        mock_smtp.return_value = mock_smtp_instance

        result = send_password_reset_email('AsafLotz@gmail.com', '1234')
        self.assertTrue(result)
        mock_smtp_instance.sendmail.assert_called_once()

    @patch('forgetPass.smtplib.SMTP')
    def test_send_email_failure(self, mock_smtp):
        # Simulate email sending failure
        mock_smtp.side_effect = Exception("SMTP error")

        result = send_password_reset_email('AsafLotz@gmail.com', '1234')
        self.assertFalse(result)

    # Additional tests for empty fields
    @patch('forgetPass.db_ref', new_callable=lambda: mock_db)
    def test_empty_email_field(self, mock_db_ref):
        response, status_code = check_user_and_send_email('', '323344888')
        self.assertEqual(status_code, 400)
        self.assertEqual(response['message'], 'נא למלא את כל השדות')

    @patch('forgetPass.db_ref', new_callable=lambda: mock_db)
    def test_empty_id_field(self, mock_db_ref):
        response, status_code = check_user_and_send_email('AsafLotz@gmail.com', '')
        self.assertEqual(status_code, 400)
        self.assertEqual(response['message'], 'נא למלא את כל השדות')

    @patch('forgetPass.db_ref', new_callable=lambda: mock_db)
    def test_both_fields_empty(self, mock_db_ref):
        response, status_code = check_user_and_send_email('', '')
        self.assertEqual(status_code, 400)
        self.assertEqual(response['message'], 'נא למלא את כל השדות')

if __name__ == '__main__':
    unittest.main()

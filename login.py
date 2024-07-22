# login.py
from firebase_config import initialize_firebase

db = initialize_firebase()


def login_user(email, password):
    if not email or not password:
        return 400, 'נא למלא את כל השדות'  # Fields cannot be empty

    try:
        users_ref = db.child('Person')
        users = users_ref.get()
        if not users:
            return 500, 'No users found in database.'

        for user_id, user_data in users.items():
            if user_data.get('email') == email:
                if 'Realtor' in user_data.get('Type', {}):
                    if user_data['Type']['Realtor']['password'] == password:
                        return 200, 'Login successful!'  # Success
                    else:
                        return 401, 'סיסמה שגויה, נא נסה שוב או אפס סיסמה דרך \'שכחתי סיסמה\''  # Incorrect password
                else:
                    return 403, 'User is not a Realtor.'  # Not authorized
        return 404, 'משתמש לא קיים'  # User not found
    except Exception as e:
        print(f"Error logging in: {e}")
        return 500, 'An error occurred. Please try again later.'  # Internal server error

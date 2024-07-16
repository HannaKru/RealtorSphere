from firebase_config import initialize_firebase

db = initialize_firebase()

def login_user(email, password):
    try:
        users_ref = db.child('Person')
        users = users_ref.get()
        for user_id, user_data in users.items():
            if user_data.get('email') == email:
                # Check if the user is a Realtor and if the password matches
                if 'Realtor' in user_data.get('Type', {}) and user_data['Type']['Realtor']['password'] == password:
                    return user_data
        return None
    except Exception as e:
        print(f"Error logging in: {e}")
        return None

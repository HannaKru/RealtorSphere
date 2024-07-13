from firebase_config import db  # Import db directly

def login_user(email, password):
    try:
        query = db.query(kind='Person')
        query.add_filter('email', '=', email)
        results = list(query.fetch())

        for user in results:
            user_data = user
            # Check if the user is a Realtor and if the password matches
            if 'Realtor' in user_data.get('Type', {}) and user_data['Type']['Realtor']['password'] == password:
                return user_data
        return None
    except Exception as e:
        print(f"Error logging in: {e}")
        return None

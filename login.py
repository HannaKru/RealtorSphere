from firebase_config import db
#hi
def login_user(email, password):
    try:
        users = db.child("Person").get().val()

        for user_id, user_info in users.items():
            if user_info.get('email') == email:
                if 'Realtor' in user_info.get('Type', {}) and user_info['Type']['Realtor'].get('password') == password:
                    return user_info
        return None
    except Exception as e:
        print(f"Error logging in: {e}")
        return None

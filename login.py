from firebase_config import initialize_firebase

db = initialize_firebase()

def login_user(email, password):
    try:
        from firebase_admin import auth
        user = auth.get_user_by_email(email)
        # Additional verification if needed
        return user
    except Exception as e:
        print(f"Error logging in: {e}")
        return None

# Example usage
user = login_user("test@example.com", "password123")
if user:
    print(f"User logged in: {user.uid}")
else:
    print("Login failed")

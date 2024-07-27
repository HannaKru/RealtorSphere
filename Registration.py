# registration.py
from flask import request, redirect, url_for, render_template, flash
from firebase_config import initialize_firebase

db_ref = initialize_firebase()

def register_user(first_name, last_name, id_number, phonePrefix,phone, email, password, password_repeat, license_number):
    # Check if passwords match
    if password != password_repeat:
        return 'error', 'סיסמאות לא תואמות'

    fullPhone = phonePrefix + phone
    # Prepare data for Firebase
    user_data = {
        'FirstName': first_name,
        'LastName': last_name,
        'Phone': int(fullPhone),  # Ensure phone is stored as an integer
        'Type': {
            'Realtor': {
                'license': int(license_number),
                'password': password  # In a real app, hash the password!
            }
        },
        'email': email
    }

    users_ref = db_ref.child('Person')

    # Check if the ID already exists
    existing_user = users_ref.child(id_number).get()
    if existing_user:
        return 'error', 'המספר כבר קיים במערכת'

    # Check if the email already exists
    existing_email = users_ref.order_by_child('email').equal_to(email).get()
    if existing_email:
        return 'error', 'האימייל כבר קיים במערכת'
    # Add new user with the provided ID
    try:
        users_ref.child(id_number).set(user_data)
        return 'success', 'הרשמה הצליחה!'
    except Exception as e:
        return 'error', f'שגיאה בהרשמה: {str(e)}'

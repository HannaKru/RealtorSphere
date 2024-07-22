from flask import Flask, request, redirect, url_for, render_template_string, flash
import firebase_admin
from firebase_admin import credentials, db

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'

# Initialize Firebase
cred = credentials.Certificate("static/realtorspheredb-firebase-adminsdk-k43ko-0110db9863.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://realtorspheredb-default-rtdb.firebaseio.com/'  # Replace with your database URL
})

def get_firebase_db():
    return db.reference()

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        full_name = request.form['userName'].strip()
        id_number = request.form['id'].strip()
        phone = request.form['phone'].strip()
        email = request.form['email'].strip()
        password = request.form['password'].strip()
        password_repeat = request.form['passwordRepeat'].strip()
        license_number = request.form['license'].strip()

        # Check if passwords match
        if password != password_repeat:
            flash('סיסמאות לא תואמות', 'error')
            return redirect(url_for('register'))

        # Split full name into first and last name
        if ' ' in full_name:
            first_name, last_name = full_name.split(' ', 1)
        else:
            flash('שם מלא צריך לכלול שם פרטי ושם משפחה', 'error')
            return redirect(url_for('register'))

        # Prepare data for Firebase
        user_data = {
            'FirstName': first_name,
            'LastName': last_name,
            'Phone': phone,
            'Type': 'Realtor',
            'email': email,
            'license': license_number,
            'password': password  # In a real app, hash the password!
        }

        # Save to Firebase
        db_ref = get_firebase_db()
        users_ref = db_ref.child('Person')

        # Check if the ID already exists
        existing_user = users_ref.child(id_number).get()
        if existing_user:
            flash('המספר כבר קיים במערכת', 'error')
            return redirect(url_for('register'))

        # Add new user with the provided ID
        try:
            users_ref.child(id_number).set(user_data)
            flash('הרשמה הצליחה!', 'success')
            return redirect(url_for('register'))
        except Exception as e:
            flash(f'שגיאה בהרשמה: {str(e)}', 'error')

    return render_template_string(open('registration.html').read())

if __name__ == '__main__':
    app.run(debug=True)

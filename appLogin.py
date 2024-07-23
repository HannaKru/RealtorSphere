from flask import Flask, request, jsonify, render_template, redirect, url_for, flash
from login import login_user
from firebase_config import initialize_firebase

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
db_ref = initialize_firebase()

@app.route('/')
def index():
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    status_code, message = login_user(email, password)

    return jsonify({"message": message}), status_code

@app.route('/homescreen')
def homescreen():
    return render_template('homescreen.html')

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

        if password != password_repeat:
            flash('סיסמאות לא תואמות', 'error')
            return redirect(url_for('register'))

        if ' ' in full_name:
            first_name, last_name = full_name.split(' ', 1)
        else:
            flash('שם מלא צריך לכלול שם פרטי ושם משפחה', 'error')
            return redirect(url_for('register'))

        user_data = {
            'FirstName': first_name,
            'LastName': last_name,
            'Phone': phone,
            'Type': 'Realtor',
            'email': email,
            'license': license_number,
            'password': password  # In a real app, hash the password!
        }

        users_ref = db_ref.child('Person')

        existing_user = users_ref.child(id_number).get()
        if existing_user:
            flash('המספר כבר קיים במערכת', 'error')
            return redirect(url_for('register'))

        try:
            users_ref.child(id_number).set(user_data)
            flash('הרשמה הצליחה!', 'success')
            return redirect(url_for('register'))
        except Exception as e:
            flash(f'שגיאה בהרשמה: {str(e)}', 'error')

    return render_template('registration.html')

if __name__ == '__main__':
    app.run(debug=True)

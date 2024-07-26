from flask import Flask, request, jsonify, render_template, redirect, url_for, flash, session
import secrets

from Registration import register_user
from firebase_config import initialize_firebase
from login import login_user

# Generate or load a secret key
# For production, you should load this from an environment variable or a secure location
# Example: app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'default_secret_key')
app = Flask(__name__)
app.config['SECRET_KEY'] = secrets.token_hex(32)  # Generates a new secret key each time

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

    if status_code == 200:
        # Store user email in session
        session['user_email'] = email
        return jsonify({"message": message}), status_code
    else:
        return jsonify({"message": message}), status_code

@app.route('/homescreen')
def homescreen():
    if 'user_email' not in session:
        return redirect(url_for('index'))
    return render_template('homescreen.html')

@app.route('/logout')
def logout():
    session.pop('user_email', None)  # Remove user email from session
    return redirect(url_for('index'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        first_name = request.form['firstName'].strip()
        last_name = request.form['lastName'].strip()
        id_number = request.form['id'].strip()
        phonePrefix = request.form['phonePrefix'].strip()
        phone = request.form['phone'].strip()
        email = request.form['email'].strip()
        password = request.form['password'].strip()
        password_repeat = request.form['passwordRepeat'].strip()
        license_number = request.form['license'].strip()

        status, message = register_user(first_name, last_name, id_number, phonePrefix, phone, email, password, password_repeat, license_number)
        flash(message, status)
        return redirect(url_for('register'))

    return render_template('registration.html')

if __name__ == '__main__':
    app.run(debug=True)

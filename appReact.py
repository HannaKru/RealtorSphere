from flask import Flask, request, jsonify, session, redirect, url_for, flash
import secrets
from flask_cors import CORS

from Registration import register_user
from firebase_config import initialize_firebase
from login import login_user

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = secrets.token_hex(32)  # Generates a new secret key each time

db_ref = initialize_firebase()

@app.route('/')
def index():
    return jsonify({"message": "Welcome to the API"})

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    status_code, message = login_user(email, password)

    if status_code == 200:
        session['user_email'] = email
        return jsonify({"message": message}), status_code
    else:
        return jsonify({"message": message}), status_code

@app.route('/homescreen')
def homescreen():
    if 'user_email' not in session:
        return redirect(url_for('index'))
    return jsonify({"message": "Welcome to the home screen"})

@app.route('/logout')
def logout():
    session.pop('user_email', None)
    return redirect(url_for('index'))

@app.route('/registration', methods=['POST'])
def register():
    data = request.get_json()
    first_name = data.get('firstName').strip()
    last_name = data.get('lastName').strip()
    id_number = data.get('id').strip()
    phone_prefix = data.get('phonePrefix').strip()
    phone = data.get('phone').strip()
    email = data.get('email').strip()
    password = data.get('password').strip()
    password_repeat = data.get('passwordRepeat').strip()
    license_number = data.get('license').strip()

    status, message = register_user(first_name, last_name, id_number, phone_prefix, phone, email, password,
                                    password_repeat, license_number)
    if status == 'success':
        return jsonify({"message": message}), 200
    else:
        return jsonify({"message": message}), 400

if __name__ == '__main__':
    app.run(debug=True)

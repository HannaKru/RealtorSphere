import requests
from flask import Flask, request, jsonify, session, redirect, url_for
import secrets
from flask_cors import CORS
from Registration import register_user
from firebase_config import initialize_firebase
from login import login_user
from HomeScreen import get_user_by_email, get_tasks_by_email, add_task, update_task_status

app = Flask(__name__)
#CORS(app)
CORS(app, supports_credentials=True)
#cors = CORS(app, resources={r"/*": {"origins": "http://localhost:3006"}}, supports_credentials=True)
app.config['SECRET_KEY'] = secrets.token_hex(32)
#s = requests.Session()

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

@app.route('/homescreen', methods=['GET'])
def homescreen():
    print("Current session state:", session)  # Debug line

    if 'user_email' not in session:
        return jsonify({"message": "User not logged in"}), 401

    email = session['user_email']
    print("Current session state:", session)  # Debug line
    first_name = get_user_by_email(email)
    tasks = get_tasks_by_email(email)

    if first_name:
        return jsonify({"firstName": first_name, "tasks": tasks}), 200
    else:
        return jsonify({"message": "User not found"}), 404

@app.route('/tasks', methods=['POST'])
def add_new_task():
    if 'user_email' not in session:
        return jsonify({"message": "User not logged in"}), 401

    data = request.get_json()
    task_text = data.get('text')
    email = session['user_email']

    new_task = add_task(email, task_text)
    return jsonify({"task": new_task}), 200

@app.route('/tasks_update', methods=['POST'])
def update_task():
    if 'user_email' not in session:
        return jsonify({"message": "User not logged in"}), 401

    data = request.get_json()
    task_id = data.get('id')
    new_status = data.get('status')

    if update_task_status(task_id, new_status):
        return jsonify({"message": "Task updated"}), 200
    else:
        return jsonify({"message": "Task not found"}), 404

@app.route('/logout')
def logout():
    session.pop('user_email', None)
    return redirect(url_for('index'))


@app.route('/forgot_password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    id_number = data.get('id')

    if not email or not id_number:
        return jsonify({"message": "נא למלא את כל השדות"}), 400

    users_ref = db_ref.child('Person')
    users = users_ref.get()

    for user_id, user_data in users.items():
        if user_data.get('email') == email:
            if user_id == id_number:
                # Logic to send the password reset email goes here
                return jsonify({"message": "הסיסמה נשלחה למייל"}), 200
            else:
                return jsonify({"message": "השדות אינם תואמים- טעות באימייל או בתעודת הזהות"}), 400

    return jsonify({"message": "אין משתמש עם המייל הנ\'ל"}), 404

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
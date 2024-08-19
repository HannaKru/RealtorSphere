import jwt
import datetime
import requests
from flask import Flask, request, jsonify, session, redirect, url_for
import secrets
from flask_cors import CORS
from Registration import register_user
from firebase_config import initialize_firebase
from login import login_user
from HomeScreen import get_user_by_email, get_tasks_by_email, add_task, update_task_status, get_events_by_email, add_event, edit_event_by_id, delete_event_by_id
from forgetPass import check_user_and_send_email
from Property import get_properties, get_property_by_id

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.config['SECRET_KEY'] = secrets.token_hex(32)

# Secret key to encode and decode JWT
JWT_SECRET_KEY = secrets.token_hex(32)
JWT_ALGORITHM = "HS256"

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
        # Generate JWT
        token = jwt.encode({
            'user_email': email,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=2)  # Token expiration time
        }, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

        response = jsonify({"message": message})
        # Set the token in an HTTP-only cookie
        response.set_cookie('jwt_token', token, httponly=True, samesite='Strict', secure=True)
        return response, status_code
    else:
        return jsonify({"message": message}), status_code

def token_required(f):
    def decorator(*args, **kwargs):
        token = request.cookies.get('jwt_token')
        if not token:
            return jsonify({"message": "Token is missing!"}), 401
        try:
            data = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            session['user_email'] = data['user_email']
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired!"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token!"}), 401
        return f(*args, **kwargs)
    return decorator

@app.route('/homescreen', methods=['GET'])
@token_required
def homescreen():
    email = session['user_email']
    first_name = get_user_by_email(email)
    tasks = get_tasks_by_email(email)
    events = get_events_by_email(email)

    if first_name:
        return jsonify({"firstName": first_name, "tasks": tasks, "events": events}), 200
    else:
        return jsonify({"message": "User not found"}), 404

@app.route('/tasks', methods=['POST'])
@token_required
def add_new_task():
    data = request.get_json()
    task_text = data.get('text')
    email = session['user_email']

    new_task = add_task(email, task_text)
    return jsonify({"task": new_task}), 200

@app.route('/tasks_update', methods=['POST'])
@token_required
def update_task():
    data = request.get_json()
    task_id = data.get('id')
    new_status = data.get('status')

    if update_task_status(task_id, new_status):
        return jsonify({"message": "Task updated"}), 200
    else:
        return jsonify({"message": "Task not found"}), 404

@app.route('/logout')
@token_required
def logout():
    response = redirect(url_for('index'))
    response.delete_cookie('jwt_token')
    session.pop('user_email', None)
    return response

@app.route('/forgotPass', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    id_number = data.get('id')

    if not email or not id_number:
        return jsonify({"message": "נא למלא את כל השדות"}), 400

    response, status_code = check_user_and_send_email(email, id_number)
    return jsonify(response), status_code

@app.route('/registration', methods=['POST'])
def register():
    data = request.get_json()
    first_name = data.get('firstName').strip()
    last_name = data.get('LastName').strip()
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

@app.route('/events', methods=['POST'])
@token_required
def add_new_event():
    data = request.get_json()
    email = session['user_email']
    date = data.get('date')
    name = data.get('name')
    hour = data.get('hour')
    details = data.get('details')
    new_event = add_event(email, date, name, hour, details)
    return jsonify({"event": new_event}), 200

@app.route('/events/<event_id>', methods=['PUT'])
@token_required
def edit_event(event_id):
    data = request.get_json()
    updated_event = edit_event_by_id(event_id, data)
    return jsonify({"event": updated_event}), 200

@app.route('/events/<event_id>', methods=['DELETE'])
@token_required
def delete_event(event_id):
    delete_event_by_id(event_id)
    return jsonify({"message": "Event deleted"}), 200

@app.route('/propertyPage', methods=['GET'])
@token_required
def fetch_properties():
    properties = get_properties()
    if properties:
        properties_list = list(properties.values()) if isinstance(properties, dict) else properties
        return jsonify(properties_list), 200
    else:
        return jsonify({"message": "No properties found"}), 404

@app.route('/propertyPage/<property_id>', methods=['GET'])
@token_required
def fetch_property_by_id(property_id):
    property_data = get_property_by_id(property_id)
    if property_data:
        return jsonify(property_data), 200
    else:
        return jsonify({"message": "Property not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)

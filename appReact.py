import requests
from flask import Flask, request, jsonify, session, redirect, url_for
import secrets
from flask_cors import CORS
from Registration import register_user
from firebase_config import initialize_firebase
from login import login_user
from HomeScreen import get_user_by_email, get_tasks_by_email, add_task, update_task_status, get_events_by_email,add_event, edit_event_by_id, delete_event_by_id
from forgetPass import check_user_and_send_email
from Property import get_properties, get_property_by_id
from sendMessage import send_email_with_attachment
from ClientProfessionalPage import get_filtered_persons
from werkzeug.utils import secure_filename
import os


app = Flask(__name__)
CORS(app, supports_credentials=True)
app.config['SECRET_KEY'] = secrets.token_hex(32)
db_ref = initialize_firebase()
app.config['UPLOAD_FOLDER'] = 'uploads/'  # Define where to save uploaded files


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
    events = get_events_by_email(email)

    if first_name:
        return jsonify({"firstName": first_name, "tasks": tasks, "events": events}), 200
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



@app.route('/events', methods=['POST'])
def add_new_event():
    if 'user_email' not in session:
        return jsonify({"message": "User not logged in"}), 401

    data = request.get_json()
    email = session['user_email']
    date = data.get('date')
    name = data.get('name')
    hour = data.get('hour')
    details = data.get('details')
    new_event = add_event(email, date, name, hour, details)
    return jsonify({"event": new_event}), 200

@app.route('/events/<event_id>', methods=['PUT'])
def edit_event(event_id):
    if 'user_email' not in session:
        return jsonify({"message": "User not logged in"}), 401

    data = request.get_json()
    updated_event = edit_event_by_id(event_id, data)
    return jsonify({"event": updated_event}), 200

@app.route('/events/<event_id>', methods=['DELETE'])
def delete_event(event_id):
    if 'user_email' not in session:
        return jsonify({"message": "User not logged in"}), 401

    delete_event_by_id(event_id)
    return jsonify({"message": "Event deleted"}), 200


@app.route('/propertyPage', methods=['GET'])
def fetch_properties():
    print("Current session state:", session)
    if 'user_email' not in session:
        return jsonify({"message": "User not logged in"}), 401

    ownerName = request.args.get('ownerName', '')
    roomNumber = request.args.get('roomNumber', '')
    price = request.args.get('price', '')
    city = request.args.get('city', '')
    propertyType = request.args.get('propertyType', '')
    transactionType = request.args.get('transactionType', '')

    # Get the user's email from the session
    email = session.get('user_email', '')

    # Call the function to fetch properties based on the filters and user's email
    properties = get_properties(ownerName=ownerName, roomNumber=roomNumber, price=price, city=city,
                                propertyType=propertyType, transactionType=transactionType, email=email)

    print("Filtered Properties:", properties)  # Debugging line
    if properties:
        return jsonify(properties), 200
    else:
        return jsonify({"message": "No properties found"}), 404


@app.route('/propertyPage/<property_id>', methods=['GET'])
def fetch_property_by_id(property_id):
    if 'user_email' not in session:
        return jsonify({"message": "User not logged in"}), 401

    property_data = get_property_by_id(property_id)
    if property_data:
        return jsonify(property_data), 200
    else:
        return jsonify({"message": "Property not found"}), 404



@app.route('/sendMessage', methods=['POST'])
def send_email():
    emails = request.form.get('emails')
    subject = request.form.get('subject')
    message = request.form.get('message')
    attachment = request.files.get('attachment')
    db_file_url = request.form.get('dbFile')

    attachment_path = None
    if attachment:
        filename = secure_filename(attachment.filename)
        attachment_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        attachment.save(attachment_path)

    success = send_email_with_attachment(emails, subject, message, attachment_path, db_file_url)

    if success:
        return jsonify({"message": "Email sent successfully"}), 200
    else:
        return jsonify({"message": "Failed to send email"}), 500

@app.route('/getFiles', methods=['GET'])
def get_files():
    files_ref = db_ref.child('files')
    files = files_ref.get()

    if not files:
        return jsonify({"files": []}), 200

    files_list = [{"name": file['name'], "url": file['url']} for file in files.values()]
    return jsonify({"files": files_list}), 200


@app.route('/clientProfessionalPage', methods=['GET'])
def fetch_filtered_persons():
    name = request.args.get('name', '')
    city = request.args.get('city', '')
    person_id = request.args.get('id', '')
    tab = request.args.get('tab', 'owners')  # Get the current tab (owners or clients)

    persons, error = get_filtered_persons(name=name, city=city, person_id=person_id, tab=tab)
    if error:
        return jsonify({"error": error}), 500
    return jsonify(persons), 200



if __name__ == '__main__':
    app.run(debug=True)
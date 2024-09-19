import requests
from flask import Flask, request, jsonify, session, redirect, url_for
import secrets
from flask_cors import CORS
from Registration import register_user
from firebase_config import initialize_firebase
from login import login_user
from HomeScreen import get_user_by_email, get_tasks_by_email, add_task, update_task_status, get_events_by_email,add_event, edit_event_by_id, delete_event_by_id
from forgetPass import check_user_and_send_email
from Property import get_properties, get_property_by_id, add_property,scrape_yad2_listings,remove_picture,update_property,remove_picture,archive_property
from sendMessage import send_email_with_attachment
from ClientProfessionalPage import get_filtered_persons, add_person, get_person_details, update_person_details, remove_person
from Deals import get_deals, get_deal_details, new_price
from matchingAlgo import get_clients_for_realtor, match_Algo, send_property_email
from werkzeug.utils import secure_filename
import os
import requests
from bs4 import BeautifulSoup
import pandas as pd
from Reports import generate_report,generate_active_vs_archived_report,get_property_performance_report

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
    if 'user_email' not in session:
        return jsonify({"message": "User not logged in"}), 401

    ownerName = request.args.get('ownerName', '')
    roomNumberFrom = request.args.get('roomNumberFrom', '')
    roomNumberTo = request.args.get('roomNumberTo', '')
    priceFrom = request.args.get('priceFrom', '')
    priceTo = request.args.get('priceTo', '')
    city = request.args.get('city', '')
    propertyType = request.args.get('propertyType', '')
    transactionType = request.args.get('transactionType', '')
    address = request.args.get('address', '')

    email = session['user_email']  # Get the realtor's email from the session

    properties = get_properties(ownerName=ownerName, roomNumberFrom=roomNumberFrom, roomNumberTo=roomNumberTo,
                                priceFrom=priceFrom, priceTo=priceTo, city=city, propertyType=propertyType,
                                transactionType=transactionType, email=email, address=address)

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


# Route to add property
@app.route('/addProperty', methods=['POST'])
def add_property_route():
    data = request.form.to_dict()
    file = request.files.get('file')
    realtor_email = session.get('user_email', '')
    response, status_code = add_property(data, file, realtor_email)
    return jsonify(response), status_code

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
    tab = request.args.get('tab', 'owners') # Get the current tab (owners or clients)
    email = session.get('user_email', '')

    persons, error = get_filtered_persons(name=name, city=city, person_id=person_id, tab=tab, email=email )
    if error:
        return jsonify({"error": error}), 500
    return jsonify(persons), 200


@app.route('/addPerson', methods=['POST'])
def add_person_route():
    data = request.json
    email = session.get('user_email', '')  # Get the realtor's email from the session
    response, status_code = add_person(data, email)
    return jsonify(response), status_code


@app.route('/personDetails/<person_id>', methods=['GET'])
def fetch_person_details(person_id):
    print("Fetching details for person ID:", person_id)
    person_details, error = get_person_details(person_id)

    if person_details:
        return jsonify(person_details), 200
    else:
        return jsonify({"message": error}), 404



@app.route('/editPerson', methods=['POST'])
def edit_person_route():
    data = request.json
    email = session.get('user_email', '')  # Get the realtor's email from the session

    print(f"Received data: {data}")  # Log received data
    response, status_code = update_person_details(data, email)
    print(f"Update response: {response}")  # Log response
    return jsonify(response), status_code


@app.route('/removePerson/<person_id>', methods=['DELETE'])
def remove_person_route(person_id):
    response, status_code = remove_person(person_id)
    return jsonify(response), status_code

@app.route('/deals', methods=['GET'])
def deals():
    print("Current session state:", session)
    # Check if the user is logged in
    if 'user_email' not in session:
        return jsonify({"message": "User not logged in"}), 401

    email = session['user_email']  # Get the realtor's email

    # Fetch the first name of the logged-in realtor
    first_name = get_user_by_email(email)
    if not first_name:
        return jsonify({"message": "Failed to get user details"}), 500

    # Fetch deals from the database filtered by the realtor's email
    deals, error = get_deals(email=email)
    if error:
        return jsonify({"message": "Error fetching deals", "error": error}), 500

    # Return both the first name of the realtor and the list of deals
    return jsonify({
        "first_name": first_name,
        "deals": deals
    }), 200


@app.route('/dealDetails/<deal_id>', methods=['GET'])
def get_detail_deal(deal_id):
    print("Fetching details for person ID:", deal_id)
    deal_details, error = get_deal_details(deal_id)

    if deal_details:
        return jsonify(deal_details), 200
    else:
        return jsonify({"message": error}), 404


@app.route('/dealPrice/<deal_id>', methods=['POST'])
def update_deal_price(deal_id):
    try:
        data = request.json
        email = session.get('user_email', '')

        # Call the function that will handle adding the new price suggestion
        response, status_code = new_price(data, deal_id, email)
        return jsonify(response), status_code
    except Exception as e:
        print(f"Error updating deal price: {e}")
        return jsonify({"error": "Failed to update price"}), 500


@app.route('/api/scrapedListings', methods=['GET'])
def get_scraped_listings():
    try:
        scraped_data = scrape_yad2_listings()
        print("Scraped data:", scraped_data)  # Add this line for debugging
        return jsonify(scraped_data), 200
    except Exception as e:
        print(f"Error scraping listings: {e}")
        return jsonify({"error": "Failed to scrape listings"}), 500

@app.route('/api/cities', methods=['GET'])
def get_cities():
    try:
        # Load the CSV file
        file_path = 'IsraelCitiesAndStreets.csv'
        data = pd.read_csv(file_path, encoding='ISO-8859-8')

        # Extract unique city names
        unique_cities = data['שם_ישוב'].unique().tolist()

        # Return the list of unique cities as JSON
        return jsonify(unique_cities), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/streets', methods=['GET'])
def get_streets():
    try:
        city = request.args.get('city')  # Get the selected city from the request

        if not city:
            return jsonify({"error": "City parameter is missing"}), 400

        # Load the CSV file
        file_path = 'IsraelCitiesAndStreets.csv'
        data = pd.read_csv(file_path, encoding='ISO-8859-8')

        # Filter streets by the selected city
        filtered_data = data[data['שם_ישוב'] == city]

        # Extract unique street names
        unique_streets = filtered_data['שם_רחוב'].unique().tolist()

        return jsonify(unique_streets), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/remove-picture', methods=['DELETE'])
def remove_picture_route():
    property_id = request.args.get('propertyId')
    picture_key = request.args.get('pictureKey')

    if not property_id or not picture_key:
        return jsonify({"error": "Missing propertyId or pictureKey"}), 400

    return remove_picture(property_id, picture_key)

@app.route('/updateProperty/<property_id>', methods=['POST'])
def update_property_route(property_id):
    if 'user_email' not in session:
        return jsonify({"message": "User not logged in"}), 401

    data = request.form.to_dict()
    files = request.files
    pictures_to_delete = request.form.get('picturesToDelete')

    if not property_id:
        return jsonify({"error": "Property ID is missing"}), 400

    response, status_code = update_property(property_id, data, files,pictures_to_delete )
    return jsonify(response), status_code

@app.route('/archiveProperty/<property_id>', methods=['POST'])
def archive_property_route(property_id):
    data = request.get_json()
    archive_reason = data.get('archiveReason', '')

    return archive_property(property_id, archive_reason)

from flask import jsonify, request
from firebase_config import initialize_firebase
import datetime

db_ref = initialize_firebase()

def generate_report(realtor_email='', report_type='property'):
    try:
        properties_ref = db_ref.child('property')
        ownerships_ref = db_ref.child('Ownership')
        users_ref = db_ref.child("Person")

        # Fetch data from Firebase
        properties = properties_ref.get()
        ownerships = ownerships_ref.get()
        all_users = users_ref.get()

        if not properties or not ownerships or not all_users:
            return []

        report_data = []

        for prop_id, prop_data in properties.items():
            if not prop_data:
                continue

            # Example: Filter by realtor's email and property status for the report
            if realtor_email and prop_data.get('realtor') != realtor_email:
                continue

            owner_name = ''
            for ownership_id, ownership in ownerships.items():
                if ownership.get('propertyID') == prop_id:
                    owner_id = ownership.get('PersonID')
                    owner_name = f"{all_users.get(str(owner_id), {}).get('FirstName', '')} {all_users.get(str(owner_id), {}).get('LastName', '')}".strip()
                    break

            # Prepare report entry (adjust fields as necessary)
            report_entry = {
                'property_id': prop_id,
                'owner': owner_name,
                'price': prop_data.get('Price', 'N/A'),
                'city': prop_data.get('city', 'N/A'),
                'street': prop_data.get('street', 'N/A'),
                'rooms': prop_data.get('type', {}).get('apartment', {}).get('item:', {}).get('roomsNum', 'N/A'),
                'status': prop_data.get('status', 'N/A'),
                'transactionType': ownership.get('rentORsell', ''),
                'archiveReason': prop_data.get('archiveReason', ''),
                'endDate': ownership.get('endDate', '')
            }

            report_data.append(report_entry)

        return report_data

    except Exception as e:
        print(f"Error generating report: {e}")
        return []

@app.route('/generateReport', methods=['GET'])
def generate_report_route():
    # Fetch the email of the currently logged-in user from the session
    realtor_email = session.get('user_email', '')  # Assuming the email is stored in the session

    if not realtor_email:
        return jsonify({"error": "User not logged in"}), 401

    report_type = request.args.get('reportType', 'property')

    report_data = generate_report(realtor_email, report_type)

    if report_data:
        return jsonify(report_data), 200
    else:
        return jsonify({"message": "No report data found"}), 404

@app.route('/generateActiveVsArchivedReport', methods=['GET'])
def generate_active_vs_archived_report_route():
    # Fetch the email of the currently logged-in user from the session
    realtor_email = session.get('user_email', '')  # Assuming email is stored in the session

    if not realtor_email:
        return jsonify({"error": "User not logged in"}), 401

    report_data = generate_active_vs_archived_report(realtor_email)

    if report_data:
        return jsonify(report_data), 200
    else:
        return jsonify({"message": "No report data found"}), 404

@app.route('/propertyPerformanceReport', methods=['GET'])
def property_performance_report_route():
    report_data = get_property_performance_report()
    if report_data:
        return report_data
    else:
        return jsonify({"message": "No report data found"}), 404


@app.route('/getClients', methods=['GET'])
def get_clients():
    print("Current session state:", session)
    # Check if the user is logged in by checking session
    user_email = session.get('user_email')
    if not user_email:
        return jsonify({'error': 'Unauthorized'}), 401
    first_name = get_user_by_email(user_email)
    clients = get_clients_for_realtor(user_email)

    return jsonify({
        "first_name": first_name,
        "clients": clients
    }), 200


@app.route('/matchProperties', methods=['POST'])
def match_properties():

    data = request.json
    clientData = data.get('clientData')
    print(clientData)
    realtorEmail = session.get('user_email')

    # Check if person_id is in clientData
    if 'id' not in clientData:
        return jsonify({'error': 'person_id is missing from client data'}), 400

    # Process matching logic here
    try:
        matched_properties = match_Algo(clientData, realtorEmail)
        return jsonify(matched_properties)
    except ValueError as e:
        return jsonify({'error': str(e)}), 400  # Return the error with a status code 400


@app.route('/sendMatches', methods=['POST'])
def send_matches():
    data = request.get_json()
    client_email = data.get('email')
    property_id = data.get('propertyId')

    success, message = send_property_email(client_email, property_id)

    if success:
        return jsonify({'message': message}), 200
    else:
        return jsonify({'error':message}),500
if __name__ == '__main__':
    app.run(debug=True)
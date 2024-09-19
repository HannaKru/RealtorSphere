from firebase_config import initialize_firebase, get_storage_bucket
import os
from werkzeug.utils import secure_filename
import datetime
import json
from flask import request
from bs4 import BeautifulSoup
import requests
from flask import jsonify
import time

##

db_ref = initialize_firebase()

UPLOAD_FOLDER = 'uploads/'  # Folder to store uploaded images
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Ensure the upload folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def get_properties(ownerName='', roomNumberFrom='', roomNumberTo='', priceFrom='', priceTo='', city='', propertyType='', transactionType='', email='', address=''):
    try:
        # Initialize references to Firebase data
        properties_ref = db_ref.child('property')
        ownerships_ref = db_ref.child('Ownership')


        users_ref = db_ref.child("Person")

        # Retrieve data from Firebase
        properties = properties_ref.get()
        ownerships = ownerships_ref.get()

        all_users = users_ref.get()

        if not properties or not ownerships or not all_users:
            return []

        filtered_properties = []

        for prop_id, prop_data in properties.items():
            if not prop_data:
                continue



            prop_rooms = prop_data.get('type', {}).get('apartment', {}).get('item:', {}).get('roomsNum', 0)

            prop_price = prop_data.get('Price', 0)
            prop_city = prop_data.get('city', '')
            prop_type = prop_data.get('type', {}).get('apartment', {}).get('type', '')
            prop_size = prop_data.get('size', 0)
            prop_status = prop_data.get('status', '')
            prop_price = prop_data.get('Price', 0)
            prop_realtor = prop_data.get('realtor', '')
            prop_neighborhood = prop_data.get('neighborhood', '')
            prop_street = prop_data.get('street', '')
            prop_house = prop_data.get('house', '')
            prop_address = f"{prop_street} {prop_house}".strip()
            prop_parking = prop_data.get('type', {}).get('apartment', {}).get('item:', {}).get('Pparking', {}).get('number', 'N/A')
            prop_bathrooms = prop_data.get('type', {}).get('apartment', {}).get('item:', {}).get('bathroomsNum', 'N/A')
            prop_ac = prop_data.get('ac', 'N/A')
            prop_age = prop_data.get('age', 'N/A')
            prop_accessibility = prop_data.get('accessibility', False)
            elevator_value = prop_data.get('type', {}).get('apartment', {}).get('elevator', 'false')
            prop_elevator = 'true' if elevator_value == True or elevator_value == 'true' else 'false'
            prop_bars = 'true' if prop_data.get('bars') == True or prop_data.get('bars') == 'true' else 'false'
            prop_security = 'true' if prop_data.get('security') == True or prop_data.get('security') == 'true' else 'false'
            prop_notes = prop_data.get('notes', 'אין')
            prop_room_specifications = prop_data.get('type', {}).get('apartment', {}).get('item:', {}).get('rooms', [])
            pictures = prop_data.get('pictures', {})
            prop_floor = prop_data.get('type', {}).get('apartment', {}).get('floor', 'N/A')
            prop_number_of_floors = prop_data.get('number_of_floors', 'N/A')
            prop_ap_num = prop_data.get('type', {}).get('apartment', {}).get('apNum', 'N/A')




            owner_name = ''
            for ownership_id, ownership in ownerships.items():
                if ownership.get('propertyID') == prop_id:
                    owner_id = ownership.get('PersonID')
                    owner_name = f"{all_users.get(str(owner_id), {}).get('FirstName', '')} {all_users.get(str(owner_id), {}).get('LastName', '')}".strip()
                    start_date = ownership.get('startDate', '')
                    break





            if prop_realtor != email:
                continue  # Skip this property if the realtor doesn't match
            if city and city.lower() not in prop_data.get('city', '').lower():
                continue
            if ownerName and ownerName.lower() not in owner_name.lower():
                continue
            if roomNumberFrom and int(roomNumberFrom) > prop_rooms:
                continue
            if roomNumberTo and int(roomNumberTo) < prop_rooms:
                continue
            if priceFrom and int(priceFrom) > int(prop_price):
                continue
            if priceTo and int(priceTo) < int(prop_price):
                continue
            if city and city.lower() not in prop_city.lower():
                continue
            if propertyType and propertyType.lower() not in prop_type.lower():
                continue
            if address and address.lower() not in prop_address.lower():
                continue

            # Add property to the filtered list if it passes all filters
            filtered_properties.append({
                'id': prop_id,
                'owner': owner_name,
                'rooms': prop_rooms,
                'price': prop_price,
                'size': prop_size,
                'city': prop_city,
                'neighborhood': prop_neighborhood,
                'propertyType': prop_type,
                'transactionType': ownership.get('rentORsell', ''),
                'status': prop_status,
                'street': prop_street,
                'house': prop_house,
                'address': prop_address,
                'parkingNumber': prop_parking,
                'bathroomsNum': prop_bathrooms,
                'ac': prop_ac,
                'age': prop_age,
                'accessibility': prop_accessibility,
                'elevator': prop_elevator,
                'bars': prop_bars,
                'security': prop_security,
                'notes' :prop_notes,
                'pictures': pictures,
                'roomSpecifications': prop_data.get('type', {}).get('apartment', {}).get('item:', {}).get('rooms', []),
                'number_of_floors': prop_number_of_floors,
                'floor': prop_floor,
                'apNum': prop_ap_num,
                'archiveReason': prop_data.get('archiveReason', ''),
                'endDate': ownership.get('endDate', ''),
                'startDate': start_date


            })

        print("Filtered Properties:", filtered_properties)

        return filtered_properties

    except Exception as e:
        print(f"Error fetching properties from Firebase: {e}")
    return []




def get_property_by_id(property_id):
    property_ref = db_ref.child(f'property/{property_id}')
    property_data = property_ref.get()
    return property_data


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def add_property(data, file, realtor_email):
    try:
        # Extract the necessary information from the form data
        property_data = {
            'Price': data['price'],
            'street': data.get('street'),
            'city': data.get('city'),
            'house': data.get('house'),
            'neighborhood': data.get('neighborhood'),
            'size': int(data.get('size', 0)),
            'ac': int(data.get('ac', 0)),
            'accessibility': data.get('accessibility', False),
            'age': int(data.get('age', 0)),
            'bars': data.get('bars', False),
            'number_of_floors': int(data.get('numberOfFloors', 1)),
            'realtor': realtor_email,
            'security': data.get('security', False),
            'status': data.get('status', 'active'),
            'notes': data.get('notes', ''),
            'type': {
                'apartment': {
                    'type': data.get('propertyType'),
                    'floor': int(data.get('floor', 0)),
                    'apNum': int(data.get('apNum', 0)),
                    'elevator': data.get('elevator', False),  # Handle the elevator field
                    'item:': {
                        'Pparking': {
                            'number': int(data.get('parkingNumber', 0))
                        },
                        'bathroomsNum': int(data.get('bathroomsNum', 0)),
                        'roomsNum': int(data.get('roomsNum', 0)),

                        'rooms': json.loads(data.get('rooms', '[]'))
                    }
                }
            },
            'pictures': {}

        }

        # Save the property data to the Firebase database
        new_property_ref = db_ref.child('property').push(property_data)
        new_property_key = new_property_ref.key  # Retrieve the key of the new property


        # Store the ownership data
        ownership_data = {
            'PersonID': data.get('ownerID'),
            'propertyID': new_property_key,
            'rentORsell': data.get('transactionType', 'rent'),
            'startDate': data.get('startDate', datetime.datetime.now().strftime('%Y-%m-%d')),
            'endDate': '',
        }
        db_ref.child('Ownership').child(new_property_key).set(ownership_data)
        files = request.files  # Get files from the request
        # Handle multiple file uploads
        if files:
            for key in files:
                file = files[key]  # Get each file
                file_path = f"property_images/{new_property_key}_{file.filename}"
                bucket = get_storage_bucket()
                blob = bucket.blob(file_path)
                blob.upload_from_file(file)
                blob.make_public()  # Make the file publicly accessible

                # Save the picture URLs in the 'pictures' field
                db_ref.child('property').child(new_property_key).child('pictures').update({
                    key: blob.public_url  # Use the key to store multiple pictures
                })

        return {"message": "Property added successfully"}, 200

    except Exception as e:
        print(f"Error adding property to Firebase: {e}")
        return {"error": "An error occurred while adding the property"}, 500

def remove_picture(property_id, picture_key):
    try:
        # Construct the file path in Firebase Storage based on property_id and picture_key
        file_path = f"property_images/{property_id}_{picture_key}"

        # Access the Firebase Storage bucket
        bucket = get_storage_bucket()

        # Get the blob object (file) from Firebase Storage
        blob = bucket.blob(file_path)

        # Delete the file from Firebase Storage
        blob.delete()

        # Now, remove the picture entry from the Firebase Database
        db_ref.child(f'property/{property_id}/pictures/{picture_key}').delete()

        return {"message": "Picture deleted successfully"}, 200

    except Exception as e:
        print(f"Error deleting picture: {e}")
        return {"error": "An error occurred while deleting the picture"}, 500
def add_pictures_to_property(property_id, files):
    try:
        bucket = get_storage_bucket()
        for key, file in files.items():
            file_path = f"property_images/{property_id}_{file.filename}"
            blob = bucket.blob(file_path)

            try:
                blob.upload_from_file(file)
                blob.make_public()

                # Save picture URL to Firebase
                db_ref.child(f'property/{property_id}/pictures').update({
                    key: blob.public_url
                })
            except Exception as e:
                print(f"Error uploading file {file.filename}: {e}")
                return {"error": "An error occurred while uploading the pictures"}, 500

        return {"message": "Pictures uploaded successfully"}, 200

    except Exception as e:
        print(f"Error uploading pictures: {e}")
        return {"error": "An error occurred while uploading the pictures"}, 500



def update_property(property_id, data, files,pictures_to_delete=None):
    try:
        property_ref = db_ref.child(f'property/{property_id}')


        # Fetch the existing property data
        existing_property = property_ref.get()

        # Function to safely parse integer values, with fallback to 0 or a default value
        def safe_int(value, default=0):
            if isinstance(value, str) and (value.lower() == 'n/a' or value.strip() == ''):
                return default
            try:
                return int(value)
            except (ValueError, TypeError):
                return default

        # Prepare the update data
        update_data = {
            'Price': data.get('price'),
            'street': data.get('street'),
            'city': data.get('city'),
            'house': data.get('house'),
            'neighborhood': data.get('neighborhood'),
            'size': int(data.get('size', 0)),
            'ac': int(data.get('ac', 0)),
            'accessibility': data.get('accessibility') == 'true',
            'age': int(data.get('age', 0)),
            'bars': data.get('bars') == 'true',
            'number_of_floors': int(data.get('numberOfFloors', 1)),
            'security': data.get('security') == 'true',
            'status': data.get('status', 'active'),
            'notes': data.get('notes', ''),
            'type': {
                'apartment': {
                    'type': data.get('propertyType'),
                    'floor': int(data.get('floor', 0)),
                    'apNum':  safe_int(data.get('apNum', 0)),
                    'elevator': data.get('elevator') == 'true',
                    'item:': {
                        'Pparking': {
                            'number': int(data.get('parkingNumber', 0))
                        },
                        'bathroomsNum': int(data.get('bathroomsNum', 0)),
                        'roomsNum': int(data.get('roomsNum', 0)),

                    }
                }
            }
        }
        # Handle room specifications
        rooms_data = data.get('rooms') or data.get('roomSpecifications')
        if rooms_data:
            try:
                rooms = json.loads(rooms_data) if isinstance(rooms_data, str) else rooms_data
                update_data['type']['apartment']['item:']['rooms'] = rooms
            except json.JSONDecodeError:
                print("Error decoding rooms data")
        elif 'type' in existing_property and 'apartment' in existing_property['type'] and 'item:' in \
                existing_property['type']['apartment'] and 'rooms' in existing_property['type']['apartment']['item:']:
            # Preserve existing rooms if no new data is provided
            update_data['type']['apartment']['item:']['rooms'] = existing_property['type']['apartment']['item:'][
                'rooms']

            # Check if the property is being archived and save the archive reason
            if data.get('status') == 'archived':
                update_data['archiveReason'] = data.get('archiveReason', '')

        # Handle file uploads if any
        if files:
            add_pictures_to_property(property_id, files)

        if pictures_to_delete:
            pictures_to_delete = json.loads(pictures_to_delete)
            for picture_key in pictures_to_delete:
                # Remove the picture file from storage
                remove_picture(property_id, picture_key)

                #  update the database to remove the picture reference
                db_ref.child(f'property/{property_id}/pictures/{picture_key}').delete()
                # Check if there are any remaining pictures in the property after deletions
        existing_pictures = db_ref.child(f'property/{property_id}/pictures').get()
        if not existing_pictures:
            # If no pictures are left, ensure the pictures field is set to an empty dictionary
            update_data['pictures'] = {}
        # Update the existing property
        property_ref.update(update_data)

        transaction_type = data.get('transactionType')
        ownership_ref = db_ref.child('Ownership').order_by_child('propertyID').equal_to(property_id).get()

        if ownership_ref:
            for ownership_id, ownership_data in ownership_ref.items():
                # Update the rentORsell field in the Ownership document
                db_ref.child(f'Ownership/{ownership_id}').update({
                    'rentORsell': transaction_type,
                    'startDate': data.get('startDate', ownership_data.get('startDate'))
                })

        return {"message": "Property updated successfully"}, 200
    except Exception as e:
        print(f"Error updating property in Firebase: {e}")
        return {"error": "An error occurred while updating the property"}, 500



def archive_property(property_id, archive_reason):
    try:
        # Fetch the existing property data
        property_ref = db_ref.child(f'property/{property_id}')
        existing_property = property_ref.get()

        if not existing_property:
            return {"error": "Property not found"}, 404

        # Update only the status and archive reason
        update_data = {
            'status': 'archived',
            'archiveReason': archive_reason
        }

        # Update the property in the database
        property_ref.update(update_data)

        ownership_ref = db_ref.child('Ownership').order_by_child('propertyID').equal_to(property_id).get()
        if ownership_ref:
            # Get today's date in the desired format (e.g., YYYY-MM-DD)
            today = datetime.datetime.now().strftime('%Y-%m-%d')
            for ownership_id, ownership_data in ownership_ref.items():
                # Update the endDate to today's date
                db_ref.child(f'Ownership/{ownership_id}').update({
                    'endDate': today
                })

        return {"message": "Property archived successfully"}, 200

    except Exception as e:
        print(f"Error archiving property in Firebase: {e}")
        return {"error": "An error occurred while archiving the property"}, 500

def scrape_yad2_listings(max_listings=50):
    print("Starting scraping process")
    base_url = "https://www.yad2.co.il/realestate/forsale"
    listings = []
    page_num = 1

    while len(listings) < max_listings:
        url = f"{base_url}?page={page_num}"
        print(f"Scraping URL: {url}")
        try:
            response = requests.get(url)
            response.raise_for_status()  # Raise an exception for bad status codes
            print(f"Response status code: {response.status_code}")

            soup = BeautifulSoup(response.content, 'html.parser')
            print(f"HTML content length: {len(response.content)}")

            property_cards = soup.find_all('div', class_='feeditem table')
            print(f"Found {len(property_cards)} property cards")

            if not property_cards:
                print("No property cards found. HTML structure might have changed.")
                print(f"Page content: {soup.prettify()[:1000]}...")  # Print first 1000 characters of the page
                break

            for card in property_cards:
                if len(listings) >= max_listings:
                    break

                # Extract details
                property_type = card.find('span', class_='title').text.strip() if card.find('span',
                                                                                            class_='title') else 'N/A'
                price = card.find('div', class_='price').text.strip() if card.find('div', class_='price') else 'N/A'
                city = card.find('span', class_='city').text.strip() if card.find('span', class_='city') else 'N/A'
                rooms = card.find('span', class_='rooms').text.strip() if card.find('span', class_='rooms') else 'N/A'
                link = f"https://www.yad2.co.il{card.find('a')['href']}" if card.find('a') else 'N/A'

                listings.append({
                    'propertyType': property_type,
                    'price': price,
                    'city': city,
                    'rooms': rooms,
                    'link': link
                })
                print(f"Added listing: {listings[-1]}")

            page_num += 1
            time.sleep(2)  # Add a 2-second delay between requests to avoid overwhelming the server

        except requests.RequestException as e:
            print(f"Request failed: {e}")
            break


    print(f"Finished scraping. Total listings: {len(listings)}")
    return listings

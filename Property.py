from firebase_config import initialize_firebase, get_storage_bucket
import os
from werkzeug.utils import secure_filename
import datetime
import json


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
            prop_city = prop_data.get('city', '')
            prop_type = prop_data.get('type', {}).get('apartment', {}).get('type', '')
            prop_size = prop_data.get('size', 0)
            prop_status = prop_data.get('status', '')
            prop_address = f"{prop_data.get('street', '')} {str(prop_data.get('house', ''))}"
            prop_price = prop_data.get('Price', 0)
            prop_realtor = prop_data.get('realtor', '')
            prop_neighborhood = prop_data.get('neighborhood', '')

            owner_name = ''
            for ownership_id, ownership in ownerships.items():
                if ownership.get('propertyID') == prop_id:
                    owner_id = ownership.get('PersonID')
                    owner_name = f"{all_users.get(str(owner_id), {}).get('FirstName', '')} {all_users.get(str(owner_id), {}).get('LastName', '')}".strip()
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
                'address': prop_address,
                'city': prop_city,
                'neighborhood': prop_neighborhood,
                'propertyType': prop_type,
                'transactionType': ownership.get('rentORsell', ''),
                'status': prop_status
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
            'pictures': {
                'first': ''
            }
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



        # Handle file upload if provided
        if file:
            file_path = f"property_images/{new_property_key}_{file.filename}"
            bucket = get_storage_bucket()
            blob = bucket.blob(file_path)
            blob.upload_from_file(file)
            blob.make_public()  # Make the file publicly accessible
            db_ref.child('property').child(new_property_key).child('pictures').update({
                'first': blob.public_url
            })

        return {"message": "Property added successfully"}, 200

    except Exception as e:
        print(f"Error adding property to Firebase: {e}")
        return {"error": "An error occurred while adding the property"}, 500
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

def get_properties(ownerName='', roomNumber='', price='', city='', propertyType='', transactionType='', email=''):
    try:
        # Initialize references to Firebase data
        properties_ref = db_ref.child('property')
        ownerships_ref = db_ref.child('Ownership')
        deals_ref = db_ref.child('Deal')
        users_ref = db_ref.child("Person")

        # Retrieve data from Firebase
        properties = properties_ref.get()
        ownerships = ownerships_ref.get()
        deals = deals_ref.get()
        all_users = users_ref.get()

        print("Properties:", properties)
        print("Ownerships:", ownerships)
        print("Deals:", deals)
        print("All users:", all_users)

        if not properties or not ownerships or not deals or not all_users:
            return []

        filtered_properties = []

        # Determine if properties are stored as a list or dictionary
        if isinstance(properties, list):
            properties_iter = enumerate(properties)
        else:
            properties_iter = properties.items()
        # Determine if ownership  are stored as a list or dictionary
        if isinstance(ownerships, list):
            ownerships_iter = enumerate(ownerships)
        else:
            ownerships_iter = ownerships.items()

        # Determine if deals are stored as a list or dictionary
        if isinstance(deals, list):
            deals_iter = enumerate(deals)
        else:
            deals_iter = deals.items()

        # Determine if users/clients are stored as a list or dictionary
        if isinstance(all_users, list):
            users_iter = enumerate(all_users)
        else:
            users_iter = all_users.items()

        # looking for property with the same id
        for prop_id, prop_data in properties_iter:
            if not prop_data:
                continue
            print(f"Processing property ID {prop_id}:", prop_data)

            try:
                prop_rooms = prop_data['type']['apartment']['item:'].get('roomsNum')
            except KeyError:
                prop_rooms = 0

            prop_city = prop_data.get('city', '')
            prop_type = prop_data['type']['apartment'].get('type', '')
            prop_size = prop_data.get('size', 0)
            prop_status = prop_data.get('status', '')

            print("room number:", prop_rooms)
            print("city:", prop_city)
            print("type:", prop_type)
            print("size:", prop_size)
            print("status:", prop_status)


            for prop_id, ownership in ownerships_iter:
                if not ownership:
                    continue
            print(f"Processing property in ownership ID {prop_id}:", ownership)
            owner_id = ownership.get('PersonID')
            owner_name = ''
            rent_or_sell = ownership.get('rentORsell', '')
            print("owner ID:", owner_id)
            print("rent_or_sell", rent_or_sell)

            for user_key, user_data in users_iter:
                if user_key == str(owner_id):
                    owner_name = f"{user_data.get('FirstName', '')} {user_data.get('LastName', '')}".strip()
                    print("owner name:", owner_name)  # Move the print statement here, after the owner name is assigned
                    break  # Exit the loop once the owner is found
            print("transaction type:", transactionType)

            # Normalize transactionType
            if transactionType == 'כל הנכסים' or transactionType == 'all':
                transactionType = 'all'
            elif transactionType == 'להשכרה' or transactionType == 'rent':
                transactionType = 'rent'
            elif transactionType == 'למכירה' or transactionType == 'sell':
                transactionType = 'sell'
            elif transactionType == 'ארכיון' or transactionType == 'archive':
                transactionType = 'archive'
            else:
                print(f"Unrecognized transactionType: {transactionType}")
                return []

            # Apply transaction type filter
            if transactionType == 'archive' and prop_status != 'archive':
                continue

            if transactionType in ['rent', 'sell', 'all'] and prop_status == 'archive':
                continue

            if transactionType == 'external':
                continue  # Skip if property is from internal DB

            if transactionType and transactionType != 'all' and transactionType != rent_or_sell:
                continue

            if ownerName and ownerName.lower() not in owner_name.lower():
                continue


            for prop_id, deal_data in deals_iter:
                if not deal_data:
                    continue
                print(f"Processing deal for property ID {prop_id}:", deal_data)


                #Extract price and realtor information from the deal
                deal_price = deal_data['price'][1]['amount'] if 'price' in deal_data and len(
                    deal_data['price']) > 1 else 'N/A'
                deal_realtor = deal_data.get('realtor', 'Unknown')

                print(f"Deal price: {deal_price}, Realtor: {deal_realtor}")

            if email != deal_data['realtor']:
                continue

            # Apply filters
            if roomNumber and int(roomNumber) != prop_rooms:
                continue
            if city and city.lower() not in prop_city.lower():
                continue
            if propertyType and propertyType.lower() not in prop_type.lower():
                continue
            if price and int(price) != int(deal_price):
                continue

            filtered_properties.append({
                'id': prop_id,
                'owner': owner_name,
                'rooms': prop_rooms,
                'price': deal_price,
                'size': prop_size,
                'address': f"{prop_data.get('Steet', '')} {str(prop_data.get('house', ''))}",
                'city': prop_city,
                'propertyType': prop_type,
                'transactionType': rent_or_sell,
                'status': prop_status
            })

            print("filtered_properties:", filtered_properties)

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

        # Store the deal data
        deal_data = {
            'price': {
                1: {
                    'amount': int(data.get('price', 0)),
                    'suggester': data.get('ownerName', 'Unknown')
                }
            },
            'realtor': realtor_email,
            'startDate': datetime.datetime.now().strftime('%Y-%m-%d'),
            'endDate': ''
        }
        db_ref.child('Deal').child(new_property_key).set(deal_data)

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
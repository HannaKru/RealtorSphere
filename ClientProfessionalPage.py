from firebase_config import initialize_firebase

db = initialize_firebase()

def get_filtered_persons(name='', city='', person_id='', tab='owners', email = 'email'):
    try:
        persons_ref = db.child('Person')
        persons = persons_ref.get()

        if not persons:
            print("No persons found in the database.")
            return None, 'No persons found in the database.'

        filtered_list = []
        for person_id_key, person_data in persons.items():
            # Filter based on type (owners or clients)
            if tab == 'owners':
                owner_data = person_data.get('Type', {}).get('Owner', {})
                if not owner_data or owner_data.get('realtor') != email:
                    continue
            elif tab == 'clients':
                client_data = person_data.get('Type', {}).get('Client', {})
                if not client_data or client_data.get('realtor') != email:
                    continue
            else:
                continue

            # Apply search filters
            if name and (name.lower() not in person_data.get('FirstName', '').lower() and
                         name.lower() not in person_data.get('LastName', '').lower()):
                continue
            if city and city.lower() not in person_data.get('city', '').lower():
                continue
            if person_id and person_id != person_id_key:
                continue


            filtered_list.append({
                'id': person_id_key,
                'FirstName': person_data.get('FirstName'),
                'LastName': person_data.get('LastName'),
                'Phone': person_data.get('Phone'),
                'email': person_data.get('email'),
                'Type': person_data.get('Type'),
                'city': person_data.get('city', 'N/A'),
            })

        return filtered_list, None
    except Exception as e:
        print(f"Error fetching persons from Firebase: {e}")
        return None, 'An error occurred while fetching persons.'



def add_person(data, email):
    try:
        person_id = data.get('id', '').strip()
        person_type = data.get('type', '').strip()

        existing_person_snapshot = db.child("Person").child(person_id).get()
        if existing_person_snapshot:
            return {"error": "Person with this ID already exists"}, 400

        person_data = {
            "FirstName": data.get('firstName', '').strip(),
            "LastName": data.get('lastName', '').strip(),
            "Phone": data.get('phone', '').strip(),
            "email": data.get('email', '').strip(),
            "Type": {}
        }

        if person_type == "Owner":
            person_data["Type"]["Owner"] = {
                "realtor": email
            }
        elif person_type == "Client":
            person_data["Type"]["Client"] = {
                "realtor": email,
                "buyORrent": data.get('buyORrent', '').strip(),
                "budget": data.get('budget', '').strip(),
                "PropertiesList": data.get('propertiesList', []),
                "maxRooms": data.get('maxRooms', '').strip(),
                "minRooms": data.get('minRooms', '').strip(),
                "maxSize": data.get('maxSize', '').strip(),
                "minSize": data.get('minSize', '').strip(),
                "propertyType": data.get('propertyType', '').strip(),
                "searchCity": data.get('cities', [])
            }

        db.child("Person").child(person_id).set(person_data)
        return {"message": "Person added successfully"}, 200

    except Exception as e:
        return {"error": f"An error occurred while adding the person: {str(e)}"}, 500


#יןן


def get_person_details(person_id):
    try:
        person_ref = db.child('Person').child(person_id)
        person_data = person_ref.get()

        if not person_data:
            return None, "Person not found"

        properties_owned = []
        if 'Owner' in person_data.get('Type', {}):
            ownerships_ref = db.child('Ownership')
            ownerships = ownerships_ref.order_by_child('PersonID').equal_to(person_id).get()
            for ownership_key, ownership in ownerships.items():
                property_id = ownership.get('propertyID')
                property_ref = db.child('property').child(property_id)
                property_data = property_ref.get()
                if property_data:
                    properties_owned.append({
                        'id': property_id,
                        'address': f"{property_data.get('Street', '')} {property_data.get('house', '')}, {property_data.get('city', '')}"
                    })

        properties_liked = []
        if 'Client' in person_data.get('Type', {}):
            properties_list = person_data['Type']['Client'].get('PropertiesList', [])
            for property_id in properties_list:
                property_ref = db.child('property').child(property_id)
                property_data = property_ref.get()
                if property_data:
                    properties_liked.append({
                        'id': property_id,
                        'address': f"{property_data.get('Street', '')} {property_data.get('house', '')}, {property_data.get('city', '')}"
                    })

        person_details = {
            'id': person_id,
            'FirstName': person_data.get('FirstName'),
            'LastName': person_data.get('LastName'),
            'Phone': person_data.get('Phone'),
            'email': person_data.get('email'),
            'Type': person_data.get('Type'),
            'PropertiesOwned': properties_owned,
            'PropertiesLiked': properties_liked
        }

        return person_details, None
    except Exception as e:
        return None, f"An error occurred while fetching person details: {str(e)}"




def update_person_details(data, realtor_email):
    person_id = data.get('id')
    if not person_id:
        return {"message": "Person ID is required"}, 400

    try:
        person_ref = db.child('Person').child(person_id)
        person_data = person_ref.get()
        if not person_data:
            return {"message": "Person not found"}, 404

        # Update or initialize Type and Client dictionary
        updated_data = {
            "FirstName": data.get('FirstName', person_data.get('FirstName')),
            "LastName": data.get('LastName', person_data.get('LastName')),
            "Phone": data.get('Phone', person_data.get('Phone')),
            "email": data.get('email', person_data.get('email')),
            "Type": person_data.get('Type', {})
        }

        if 'Client' in data['Type']:
            client_data = data['Type']['Client']
            updated_data['Type']['Client'] = {
                "realtor": realtor_email,
                "PropertiesList": client_data.get('PropertiesList', []),
                "budget": client_data.get('budget'),
                "buyORrent": client_data.get('buyORrent'),
                "maxRooms": client_data.get('maxRooms'),
                "minRooms": client_data.get('minRooms'),
                "maxSize": client_data.get('maxSize'),
                "minSize": client_data.get('minSize'),
                "propertyType": client_data.get('propertyType'),
                "searchCity": client_data.get('searchCity', [])
            }

        if 'Owner' in data['Type']:
            owner_data = data['Type']['Owner']
            updated_data['Type']['Owner'] = {
                "realtor": realtor_email,
                "sellORrent": owner_data.get('sellORrent', updated_data['Type'].get('Owner', {}).get('sellORrent', 'rent'))
            }

        person_ref.update(updated_data)
        return {"message": "Person updated successfully", "updated_data": updated_data}, 200
    except Exception as e:
        return {"message": f"An error occurred while updating the person: {str(e)}"}, 500



def remove_person(person_id):
    try:
        person_ref = db.child('Person').child(person_id)
        person_ref.delete()  # Remove the person from the database

        return {"message": "Person removed successfully"}, 200

    except Exception as e:
        print(f"Error removing person from Firebase: {e}")
        return {"error": "An error occurred while removing the person"}, 500
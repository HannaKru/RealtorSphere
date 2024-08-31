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
        # Extract and sanitize input data
        person_id = data.get('id', '').strip()
        person_type = data.get('type', '').strip()  # Use the type from the data directly

        # Check if the ID already exists
        existing_person_snapshot = db.child("Person").child(person_id).get()
        if existing_person_snapshot and existing_person_snapshot.val():
            return {"error": "Person with this ID already exists"}, 400

        # Prepare person data
        person_data = {
            "FirstName": data.get('firstName', '').strip(),
            "LastName": data.get('lastName', '').strip(),
            "Phone": data.get('phone', '').strip(),
            "email": data.get('email', '').strip(),
            "Type": {}
        }

        if person_type == "Owner":
            person_data["Type"]["Owner"] = {
                "realtor": email,
                "sellORrent": data.get('sellORrent', '').strip(),
            }
        elif person_type == "Client":
            person_data["Type"]["Client"] = {
                "realtor": email,
                "buyORrent": data.get('buyORrent', '').strip(),
                "budget": data.get('budget', '').strip(),
                "PropertiesList": data.get('propertiesList', ''),
                "maxRooms": data.get('maxRooms', '').strip(),
                "minRooms": data.get('minRooms', '').strip(),
                "maxSize": data.get('maxSize', '').strip(),
                "minSize": data.get('minSize', '').strip(),
            }

        # Push the new person to Firebase with the given ID
        db.child("Person").child(person_id).set(person_data)

        return {"message": "Person added successfully"}, 200

    except Exception as e:
        print(f"Error adding person to Firebase: {e}")
        return {"error": "An error occurred while adding the person"}, 500
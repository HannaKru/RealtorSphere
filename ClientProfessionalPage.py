from firebase_config import initialize_firebase

db = initialize_firebase()

def get_filtered_persons(name='', city='', person_id='', tab='owners'):
    try:
        persons_ref = db.child('Person')
        persons = persons_ref.get()

        if not persons:
            print("No persons found in the database.")
            return None, 'No persons found in the database.'

        filtered_list = []
        for person_id_key, person_data in persons.items():
            # Filter based on type (owners or clients)
            if tab == 'owners' and 'Owner' not in person_data.get('Type', {}):
                continue
            if tab == 'clients' and 'Client' not in person_data.get('Type', {}):
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

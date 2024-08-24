from firebase_config import initialize_firebase

db = initialize_firebase()

def get_persons():
    try:
        persons_ref = db.child('Person')
        persons = persons_ref.get()

        if not persons:
            print("No persons found in the database.")
            return None, 'No persons found in the database.'

        person_list = []
        for person_id, person_data in persons.items():
            print(f"Person found: {person_data}")  # Debug line
            person = {
                'id': person_id,
                'FirstName': person_data.get('FirstName'),
                'LastName': person_data.get('LastName'),
                'Phone': person_data.get('Phone'),
                'email': person_data.get('email'),
                'Type': person_data.get('Type'),
            }
            person_list.append(person)

        return person_list, None
    except Exception as e:
        print(f"Error fetching persons from Firebase: {e}")
        return None, 'An error occurred while fetching persons.'

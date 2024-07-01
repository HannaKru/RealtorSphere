# login.py
from firebase_config import db

def login_user(email, password):
    try:
        # Fetch all persons
        persons_ref = db.collection('Person')
        docs = persons_ref.stream()

        for doc in docs:
            person = doc.to_dict()
            if person.get('email') == email and 'Realtor' in person.get('Type', {}):
                realtor_info = person['Type']['Realtor']
                if realtor_info['password'] == password:
                    return person
        return None
    except Exception as e:
        print(f"Error logging in: {e}")
        return None



import firebase_admin
from firebase_admin import credentials, firestore

def initialize_firebase():
    if not firebase_admin._apps:
        # Path to your Firebase service account key JSON file
        cred = credentials.Certificate("realtorsphere-34d53-firebase-adminsdk-psu5p-9c683ded43.json")
        firebase_admin.initialize_app(cred)

    db = firestore.client()
    return db

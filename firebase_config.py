import firebase_admin
from firebase_admin import credentials, firestore
import os


def initialize_firebase():
    if not firebase_admin._apps:
        service_account_key_path = os.getenv('FIREBASE_KEY_PATH')

        # Path to your Firebase service account key JSON file
        cred = credentials.Certificate("realtorsphere-34d53-firebase-adminsdk-psu5p-9c683ded43.json")
        firebase_admin.initialize_app(cred)

    db = firestore.client()
    return db

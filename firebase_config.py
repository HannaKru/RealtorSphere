import firebase_admin
from firebase_admin import credentials, auth, firestore


def initialize_firebase():
    # Path to your Firebase service account key JSON file
    cred = credentials.Certificate("path/to/your/serviceAccountKey.json")
    firebase_admin.initialize_app(cred)

    db = firestore.client()
    return db


db = initialize_firebase()

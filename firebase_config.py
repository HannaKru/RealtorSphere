# firebase_config.py
import firebase_admin
from firebase_admin import credentials, firestore


def initialize_firebase():
    # Path to your Firebase service account key JSON file
    cred = credentials.Certificate("static/realtorsphere-34d53-firebase-adminsdk-psu5p-c71cbe2996.json")
    firebase_admin.initialize_app(cred)

    db = firestore.client()
    return db

#db = initialize_firebase()


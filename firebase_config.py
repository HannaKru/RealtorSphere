# firebase_config.py
import firebase_admin
from firebase_admin import credentials, firestore

def initialize_firebase():
    # Initialize Firebase app
    cred = credentials.Certificate("realtorsphere-34d53-firebase-adminsdk-psu5p-9c683ded43.json")
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://realtorsphere-34d53-default-rtdb.firebaseio.com/'
    })
    return db

db = initialize_firebase()

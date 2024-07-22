# firebase_config.py
import firebase_admin
from firebase_admin import credentials, db

cred = credentials.Certificate("static/realtorspheredb-firebase-adminsdk-k43ko-0110db9863.json")
default_app = firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://realtorspheredb-default-rtdb.firebaseio.com/'  # Replace with your database URL
})

def initialize_firebase():
    return db.reference()

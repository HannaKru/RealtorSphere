# firebase_config.py
import firebase_admin
from firebase_admin import credentials, db

cred = credentials.Certificate("static/realtorspheredb-firebase-adminsdk-k43ko-1383b36823.json")
default_app = firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://realtorspheredb-default-rtdb.firebaseio.com/'
})

def initialize_firebase():
    return db.reference()

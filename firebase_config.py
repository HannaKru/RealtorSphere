# firebase_config.py
import firebase_admin
from firebase_admin import credentials, db

cred = credentials.Certificate("static/realtorspheredb-firebase-adminsdk-k43ko-1383b36823.json")
default_app = firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://realtorspheredb-default-rtdb.firebaseio.com/',
    'storageBucket': 'gs://realtorspheredb.appspot.com'
})

def initialize_firebase():
    return db.reference()

def get_storage_bucket():
    bucket = storage.bucket()
    return bucket
# firebase_config.py
import firebase_admin
from firebase_admin import credentials, db, storage

cred = credentials.Certificate("static/realtorspheredb-firebase-adminsdk-k43ko-73fb027f7c.json")
default_app = firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://realtorspheredb-default-rtdb.firebaseio.com/',
    'storageBucket': '/realtorspheredb.appspot.com/'
})

def initialize_firebase():
    return db.reference()

def get_storage_bucket():
    bucket = storage.bucket('realtorspheredb.appspot.com')
    return bucket
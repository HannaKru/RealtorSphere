import firebase_admin
from firebase_admin import credentials, firestore
import pyrebase

def initialize_firebase():
    config = {
        "apiKey": "AIzaSyCKz1AKMCqQjKyXTs98kWDNLj0Udr0EvjM",
        "authDomain": "realtorsphere-34d53.firebaseapp.com",
        "databaseURL": "https://realtorsphere-34d53-default-rtdb.firebaseio.com/",
        "storageBucket": "gs://realtorsphere-34d53.appspot.com"
    }
    firebase = pyrebase.initialize_app(config)

    db = firebase.database()
    return db
db = initialize_firebase()

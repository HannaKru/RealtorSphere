import firebase_admin
from firebase_admin import credentials, firestore
import pyrebase

def initialize_firebase():
    cred = credentials.Certificate("static/realtorsphere-34d53-firebase-adminsdk-psu5p-c71cbe2996.json")
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    return db


db = initialize_firebase()

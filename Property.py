# Property.py
from firebase_config import initialize_firebase

db_ref = initialize_firebase()

def get_properties():
    properties_ref = db_ref.child('property')
    properties = properties_ref.get()
    return properties

def get_property_by_id(property_id):
    property_ref = db_ref.child(f'property/{property_id}')
    property_data = property_ref.get()
    return property_data



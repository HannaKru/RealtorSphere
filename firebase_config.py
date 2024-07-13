from google.cloud import datastore

def initialize_datastore():
    client = datastore.Client()
    return client

db = initialize_datastore()
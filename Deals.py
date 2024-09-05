from firebase_config import initialize_firebase

db_ref = initialize_firebase()

def get_deals(email):
    try:
        Deals_ref = db_ref.child('Deal')
        users_ref = db_ref.child("Person")

        # Fetch all deals and users from Firebase
        deals_snapshot = Deals_ref.get()
        users_snapshot = users_ref.get()

        # Check if deals or users are empty
        if not deals_snapshot or not users_snapshot:
            return [], None

        deals = []
        all_users = users_snapshot  # No need to use .val(), it's already a dictionary

        # Iterate through all the deals
        for deal_id, deal_data in deals_snapshot.items():
            # Filter by realtor email
            if deal_data.get('realtor') != email:
                continue

            # Fetch owner and client details
            owner_id = deal_data.get('OwnerId', '')
            client_id = deal_data.get('ClientId', '')

            owner_name = f"{all_users[owner_id]['FirstName']} {all_users[owner_id]['LastName']}" if owner_id in all_users else 'N/A'
            client_name = f"{all_users[client_id]['FirstName']} {all_users[client_id]['LastName']}" if client_id in all_users else 'N/A'

            # Append deal data
            deals.append({
                'id': deal_id,
                'owner': owner_name,
                'client': client_name,
                'property': deal_data.get('propertyID', 'N/A'),  # Assuming a propertyId field exists
            })

        return deals, None

    except Exception as e:
        print(f"Error fetching deals: {e}")
        return None, str(e)

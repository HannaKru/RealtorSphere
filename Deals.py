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


def get_deal_details(deal_id):
    try:
        # Fetch the deal details from Firebase
        deal_ref = db_ref.child('Deal').child(deal_id)
        deal_data = deal_ref.get()

        if not deal_data:
            return None, "Deal not found"

        # Get client and owner details
        client_id = deal_data.get('ClientId', '')
        owner_id = deal_data.get('OwnerId', '')

        client_data = db_ref.child('Person').child(client_id).get()
        owner_data = db_ref.child('Person').child(owner_id).get()

        if not client_data or not owner_data:
            return None, "Client or Owner not found"

        client_name = f"{client_data.get('FirstName', '')} {client_data.get('LastName', '')}"
        owner_name = f"{owner_data.get('FirstName', '')} {owner_data.get('LastName', '')}"

        # Structure the deal details
        deal_info = {
            'id': deal_id,
            'owner': owner_name,
            'client': client_name,
            'property': deal_data.get('propertyId', 'N/A'),
            'price': deal_data.get('price', []),  # Ensure price is always an array
        }

        return deal_info, None

    except Exception as e:
        print(f"Error fetching deal details: {e}")
        return None, str(e)


def new_price(data, deal_id, email):
    try:
        amount = data.get('amount')
        suggester = data.get('suggester')

        if not amount or not suggester:
            return {"error": "Missing price data"}, 400

        # Fetch the deal
        deal_ref = db_ref.child('Deal').child(deal_id)
        deal_data = deal_ref.get()

        if not deal_data:
            return {"error": "Deal not found"}, 404

        # Append the new price to the existing price list
        price_list = deal_data.get('price', [])
        new_price_data = {
            "amount": amount,
            "suggester": suggester
        }
        price_list.append(new_price_data)

        # Update the deal with the new price list
        deal_ref.update({"price": price_list})

        return {"message": "Price suggestion added successfully"}, 200

    except Exception as e:
        print(f"Error adding new price: {e}")
        return {"error": "Failed to add price"}, 500
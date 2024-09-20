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
            status = deal_data.get('status', '')

            owner_name = f"{all_users[owner_id]['FirstName']} {all_users[owner_id]['LastName']}" if owner_id in all_users else 'N/A'
            client_name = f"{all_users[client_id]['FirstName']} {all_users[client_id]['LastName']}" if client_id in all_users else 'N/A'

            # Append deal data
            deals.append({
                'id': deal_id,
                'owner': owner_name,
                'client': client_name,
                'property': deal_data.get('propertyID', 'N/A'),  # Assuming a propertyId field exists
                'status': status,
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
        note = data.get('note', '')  # Get the note (default is an empty string)

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
            "suggester": suggester,
            "note": note  # Include the note in the price suggestion
        }
        price_list.append(new_price_data)

        # Update the deal with the new price list
        deal_ref.update({"price": price_list})

        return {"message": "Price suggestion added successfully"}, 200

    except Exception as e:
        print(f"Error adding new price: {e}")
        return {"error": "Failed to add price"}, 500


def create_new_deal(data):
    try:
        # Extract data from the request
        client_id = data.get('clientId')
        owner_id = data.get('ownerId')
        property_id = data.get('propertyId')
        start_date = data.get('startDate')
        first_price = data.get('firstPrice')
        suggester = data.get('suggester')
        note = data.get('note', '')

        if not all([client_id, owner_id, property_id, start_date, first_price, suggester]):
            return {"error": "Missing required fields"}, 400

        # Create the new deal structure
        new_deal = {
            "ClientId": client_id,
            "OwnerId": owner_id,
            "propertyID": property_id,
            "startDate": start_date,
            "price": [{
                "amount": first_price,
                "suggester": suggester,
                "note": note
            }],
            "endDate": "",  # Initially empty
            "status": "open",
            "realtor": data.get('realtor')  # Realtor's email from session
        }

        # Add the new deal to Firebase
        new_deal_ref = db_ref.child('Deal').push(new_deal)

        return {"message": "Deal created successfully", "deal_id": new_deal_ref.key}, 200

    except Exception as e:
        print(f"Error creating new deal: {e}")
        return {"error": "Failed to create deal"}, 500



def get_persons_by_type(person_type, realtor_email):
    ref = db_ref.child('Person')
    persons = ref.get()
    filtered_persons = []
    if persons:  # Ensure there are persons in the DB
        for person_id, person_data in persons.items():
            # Access the nested structure
            type_info = person_data.get('Type', {})
            person_type_info = type_info.get(person_type, {})
            person_realtor_email = person_type_info.get('realtor', '')

            # Check if the person is of the required type and belongs to the logged-in realtor
            if person_realtor_email == realtor_email:
                filtered_persons.append({
                    'id': person_id,
                    'name': f"{person_data.get('FirstName', '')} {person_data.get('LastName', '')}",
                    'email': person_data.get('Email', '')  # Adjust if necessary; be mindful of case sensitivity
                })
    print("filtered persons: ", filtered_persons)
    return filtered_persons, 200  # Always return the filtered list and status code


def Dealproperties(realtor_email):
    ref = db_ref.child('property')
    properties = ref.get()
    property_list = []
    if properties:  # Ensure there are properties in the DB
        for property_id, property_data in properties.items():
            # Only include properties associated with the logged-in realtor
            if property_data.get('realtor', '') == realtor_email:
                property_list.append({
                    'id': property_id,
                    'address': f"{property_data.get('city', '')}, {property_data.get('street', '')} {property_data.get('house', '')}"
                })
    print("Properties: ", property_list)  # Log to console
    return property_list, 200  # Return the property list and status code


def close_deal(dealId, end_date):
    try:
        # Assuming db_ref is already defined and points to the correct Firebase reference
        db_ref.child('Deal').child(dealId).update({
            'endDate': end_date,
            'status': 'closed'
        })
        return {'message': 'Deal closed successfully'}, 200
    except Exception as e:
        return {'error': str(e)}, 500
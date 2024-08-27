from firebase_config import initialize_firebase

db_ref = initialize_firebase()


def get_properties(ownerName='', roomNumber='', price='', city='', propertyType='', transactionType='', email=''):
    try:
        # Initialize references to Firebase data
        properties_ref = db_ref.child('property')
        ownerships_ref = db_ref.child('Ownership')
        deals_ref = db_ref.child('Deal')
        users_ref = db_ref.child("Person")

        # Retrieve data from Firebase
        properties = properties_ref.get()
        ownerships = ownerships_ref.get()
        deals = deals_ref.get()
        all_users = users_ref.get()

        print("Properties:", properties)
        print("Ownerships:", ownerships)
        print("Deals:", deals)
        print("All users:", all_users)

        if not properties or not ownerships or not deals or not all_users:
            return []

        filtered_properties = []

        # Determine if properties are stored as a list or dictionary
        if isinstance(properties, list):
            properties_iter = enumerate(properties)
        else:
            properties_iter = properties.items()
        # Determine if ownership  are stored as a list or dictionary
        if isinstance(ownerships, list):
            ownerships_iter = enumerate(ownerships)
        else:
            ownerships_iter = ownerships.items()

        # Determine if deals are stored as a list or dictionary
        if isinstance(deals, list):
            deals_iter = enumerate(deals)
        else:
            deals_iter = deals.items()

        # Determine if users/clients are stored as a list or dictionary
        if isinstance(all_users, list):
            users_iter = enumerate(all_users)
        else:
            users_iter = all_users.items()

        # looking for property with the same id
        for prop_id, prop_data in properties_iter:
            if not prop_data:
                continue
            print(f"Processing property ID {prop_id}:", prop_data)

            try:
                prop_rooms = prop_data['type']['apartment']['item:'].get('roomsNum')
            except KeyError:
                prop_rooms = 0

            prop_city = prop_data.get('city', '')
            prop_type = prop_data['type']['apartment'].get('type', '')
            prop_size = prop_data.get('size', 0)
            prop_status = prop_data.get('status', '')

            print("room number:", prop_rooms)
            print("city:", prop_city)
            print("type:", prop_type)
            print("size:", prop_size)
            print("status:", prop_status)

            # Match with ownership and deal data
            #ownership = ownerships.get(prop_id)
            #if not ownership:
                #continue

            #print("Ownership:", ownership)

            for prop_id, ownership in ownerships_iter:
                if not ownership:
                    continue
            print(f"Processing property in ownership ID {prop_id}:", ownership)
            owner_id = ownership.get('PersonID')
            owner_name = ''
            rent_or_sell = ownership.get('rentORsell', '')
            print("owner ID:", owner_id)
            print("rent_or_sell", rent_or_sell)

            for user_key, user_data in users_iter:
                if user_key == str(owner_id):
                    owner_name = f"{user_data.get('FirstName', '')} {user_data.get('LastName', '')}".strip()
                    print("owner name:", owner_name)  # Move the print statement here, after the owner name is assigned
                    break  # Exit the loop once the owner is found
            print("transaction type:", transactionType)

            if transactionType == 'כל הנכסים':
                transactionType = 'all'
            elif transactionType == 'להשכרה':
                transactionType = 'rent'
            elif transactionType == 'למכירה':
                transactionType = 'sell'
            else:
                transactionType = 'archive'

            # Apply transaction type filter
            if transactionType == 'archive' and prop_status != 'archive':
                continue

            if transactionType in ['rent', 'sell', 'all'] and prop_status == 'archive':
                continue

            if transactionType == 'external':
                continue  # Skip if property is from internal DB

            if transactionType and transactionType != 'all' and transactionType != rent_or_sell:
                continue

            if ownerName and ownerName.lower() not in owner_name.lower():
                continue

            #deal = deals.get(str(prop_id))
            #if not deal:
                #continue

            for prop_id, deal_data in deals_iter:
                if not deal_data:
                    continue
                print(f"Processing deal for property ID {prop_id}:", deal_data)

                #Extract price and realtor information from the deal
                deal_price = deal_data['price'][1]['amount'] if 'price' in deal_data and len(
                    deal_data['price']) > 1 else 'N/A'
                deal_realtor = deal_data.get('realtor', 'Unknown')

                print(f"Deal price: {deal_price}, Realtor: {deal_realtor}")

            # Apply filters
            if roomNumber and int(roomNumber) != prop_rooms:
                continue
            if city and city.lower() not in prop_city.lower():
                continue
            if propertyType and propertyType.lower() not in prop_type.lower():
                continue
            if price and int(price) != int(deal_price):
                continue

            filtered_properties.append({
                'id': prop_id,
                'owner': owner_name,
                'rooms': prop_rooms,
                'price': deal_price,
                'size': prop_size,
                'address': f"{prop_data.get('Steet', '')} {str(prop_data.get('house', ''))}",
                'city': prop_city,
                'propertyType': prop_type,
                'transactionType': rent_or_sell,
                'status': prop_status
            })

            print("filtered_properties:", filtered_properties)

        return filtered_properties

    except Exception as e:
        print(f"Error fetching properties from Firebase: {e}")
        return []

def get_property_by_id(property_id):
    property_ref = db_ref.child(f'property/{property_id}')
    property_data = property_ref.get()
    return property_data

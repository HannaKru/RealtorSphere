from firebase_config import initialize_firebase

db_ref = initialize_firebase()

def get_properties(ownerName='', roomNumber='', price='', city='', propertyType='', transactionType=''):
    try:
        properties_ref = db_ref.child('property')
        ownerships_ref = db_ref.child('Ownership')
        deals_ref = db_ref.child('Deal')

        properties = properties_ref.get()
        ownerships = ownerships_ref.get()
        deals = deals_ref.get()

        if not properties:
            return []

        filtered_properties = []

        # If properties is a list, iterate over the list directly
        if isinstance(properties, list):
            properties_iter = enumerate(properties)
        else:
            properties_iter = properties.items()

        for prop_id, prop_data in properties_iter:
            if not prop_data:  # Check if prop_data is None
                continue

            # Safely navigate to roomsNum
            try:
                prop_rooms = prop_data['type']['apartment']['item:']['roomsNum']
            except KeyError:
                prop_rooms = 0  # Default if not found

            prop_city = prop_data.get('city', '')
            prop_type = prop_data['type']['apartment'].get('type', '')
            prop_size = prop_data.get('size', 0)

            # Apply filters
            if roomNumber and int(roomNumber) != prop_rooms:
                continue
            if city and city.lower() not in prop_city.lower():
                continue
            if propertyType and propertyType.lower() not in prop_type.lower():
                continue
            if price and int(price) != deal_price:
                continue

            # Handling the case where ownerships or deals might be lists
            if isinstance(ownerships, list):
                ownership = ownerships[prop_id] if prop_id < len(ownerships) else None
            else:
                ownership = ownerships.get(str(prop_id))

            if not ownership:
                continue

            owner_name = ownership.get('PersonID')
            rent_or_sell = ownership.get('rentORsell', '')

            # Apply transaction type filter
            if transactionType and transactionType != rent_or_sell:
                continue

            if ownerName and ownerName.lower() not in owner_name.lower():
                continue

            # Handling the case where deals might be a list
            if isinstance(deals, list):
                deal = deals[prop_id] if prop_id < len(deals) else None
            else:
                deal = deals.get(str(prop_id))

            deal_price = deal['price'][1]['amount'] if deal else 'N/A'

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
                'status': prop_data.get('status', 'N/A')
            })

        return filtered_properties

    except Exception as e:
        print(f"Error fetching properties from Firebase: {e}")
        return []

def get_property_by_id(property_id):
    property_ref = db_ref.child(f'property/{property_id}')
    property_data = property_ref.get()
    return property_data

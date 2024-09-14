from firebase_config import initialize_firebase
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.neighbors import NearestNeighbors

db = initialize_firebase()

#Similarity Score = w1 * (Price Match) + w2 * (Room Match) + w3 * (Size Match) + w4 * (City Match)
#Content-Based Filtering
# recommended algorthm:
#"Linear regression": LinearRegression(), "Lasso": Lasso(alpha=1.0, max_iter=10000),
                 #"KNN_7": KNeighborsRegressor(n_neighbors=7),
                 #"RFR": RandomForestRegressor(n_estimators=1000, n_jobs=3, max_features="auto", random_state=0),
                 #"SVR": SVR(C=1.0)}
                 #cosine similarity

# k-Nearest Neighbors or matrix factorization Singular Value Decomposition (SVD)
#Collaborative Filtering

#Weighted Hybrid: Assign a weight to both approaches and combine the scores from content-based and collaborative filtering.
#Final Score = w_content * content_score + w_collab * collab_score
#Switching Hybrid: Use content-based filtering when there is limited user data, then switch to collaborative filtering as you gather more user interaction data.
#Mixed Hybrid: Present both content-based and collaborative filtering results separately, allowing the user to choose.
#Hybrid

def normalize_scores(scores):
    min_score = np.min(scores)
    max_score = np.max(scores)
    return (scores - min_score) / (max_score - min_score) if max_score > min_score else scores

def match_Algo(data, email):
    person_ref = db.child('Person').child(data.get('person_id'))
    person_data = person_ref.get()

    people_ref  = db.child('Person')
    people = people_ref.get()
    clients_list = []

    for person_id, person_info in people.items():
        client_data = person_info.get('Type', {}).get('Client', {})
        if client_data and client_data.get('realtor') == email:
            client_data['person_id'] = person_id  # Optionally add person ID to the data for reference
            clients_list.append(client_data)


    properties_ref = db.child('property').order_by_child('realtor').equal_to(email)
    properties = properties_ref.get()

    ownerships_ref = db.child('Ownership')
    ownerships = ownerships_ref.get()
    personID = data.get('person_id')

    # List of all possible property types
    property_types = ["Apartment", "Duplex Apartment", "Private Home", "Two-Family", "House Penthouse"]
    # List of transaction types
    transaction_types_forClients = ['rent', 'buy']

    transaction_types_forProperties = ['rent', 'sell']

    properties_list = person_data['Type']['Client'].get('PropertiesList', [])
    for property_id in properties_list:
        property_ref = db.child('property').child(property_id)
        property_data = property_ref.get()

    # Extract relevant fields
    properties_list = person_data.get('Type', {}).get('Client', {}).get('PropertiesList', "")
    budget = float(person_data.get('Type', {}).get('Client', {}).get('budget', ""))
    min_rooms = int(person_data.get('Type', {}).get('Client', {}).get('minRooms', 0))
    max_rooms = int(person_data.get('Type', {}).get('Client', {}).get('maxRooms', 0))
    min_size = float(person_data.get('Type', {}).get('Client', {}).get('minSize', 0))
    max_size = float(person_data.get('Type', {}).get('Client', {}).get('maxSize', 0))
    property_type = person_data.get('Type', {}).get('Client', {}).get('propertyType', "")
    rentOrbuy = person_data.get('Type', {}).get('Client', {}).get('rentOrbuy', "")

    avgRooms = (min_rooms + max_rooms)/2
    arg_size = (min_size + max_size)/2

    property_type_vector_forClient = [1 if property_type == p_type else 0 for p_type in property_types]
    transactionTypeVector = [1 if rentOrbuy == p_type else 0 for p_type in transaction_types_forClients]

    client_array = np.array([budget, avgRooms, arg_size]  + property_type_vector_forClient + transactionTypeVector)


    similarities = []

    for property_id, property_data in properties.items():

        # Get the property ID
        propertyKey = property_id

        # Check if the property belongs to the logged-in realtor
        if 'realtor' in property_data and property_data['realtor'] == email:
            # Extracting required data
            rooms_num = int(property_data.get('type', {}).get('apartment', {}).get('item:', {}).get('roomsNum', 0))  # Defaults to 0 if 'roomsNum' is not found
            print('room num: ', rooms_num)
            property_type = property_data.get('type', {}).get('apartment', {}).get('type', 'Unknown')
            size = float(property_data.get('size', 0))
            print('size: ', size)
            price = float(property_data.get('Price', 0))
            print('price: ', price)

            # Fetch the corresponding ownership data for this property
            ownership_data = ownerships.get(propertyKey)

            # If ownership data is found, extract rentORsell information

            if ownership_data:
                rent_or_sell = ownership_data.get('rentORsell', 'Unknown')
                if rent_or_sell == 'sell':
                    rent_or_sell = 'buy'

            rent_sell_vector = [1 if rent_or_sell == p_type else 0 for p_type in transaction_types_forProperties]


            # One-hot encoding for the property's type
            property_type_vectorforProperty = [1 if property_type == p_type else 0 for p_type in property_types]

            # Property vector
            property_vector = np.array([price, rooms_num, size] + property_type_vectorforProperty + rent_sell_vector)

            # Check dimensions of both arrays before cosine similarity
            print(f"Client array length: {len(client_array)}")
            print(f"Property vector length: {len(property_vector)}")

            # Ensure that both vectors have the same length
            assert len(client_array) == len(property_vector), "Client array and property vector have different lengths!"

            # Calculate cosine similarity between client and property
            similarity = cosine_similarity([client_array], [property_vector])[0][0]
            # Store the similarity and the property data
            similarities.append({
                'similarity': similarity,
                'property_data': property_data,
            })

    # Sort properties by similarity in descending order
    similarities = sorted(similarities, key=lambda x: x['similarity'], reverse=True)

    # Select the top 3 matches
    top_matches = similarities[:3]

    # Output the top 3 properties
    for match in top_matches:
        property_data = match['property_data']
        similarity_score = match['similarity']
        rooms_num = property_data.get('type', {}).get('apartment', {}).get('item:', {}).get('roomsNum', 'N/A')  # Default to 'N/A' if not found
        print(f"Property: {property_data.get('city', 'Unknown City')} - Rooms: {rooms_num}, Similarity: {similarity_score}")

    print("People data:", clients_list)
    print("Number of clients for realtor:", len(clients_list))
    # Creating an interaction matrix
    property_ids = list(properties.keys())
    interaction_matrix = np.zeros((len(clients_list), len(property_ids)))

    for i, client_id in enumerate(clients_list):
        for j, propertyID in enumerate(property_ids):
            property = properties.get(propertyID, {})
            ownership_data = ownerships.get(propertyID,{})
            # If ownership data is found, extract rentORsell information
            if ownership_data:
                rent_or_sell = ownership_data.get('rentORsell', 'Unknown')
                if rent_or_sell == 'sell':
                    rent_or_sell == 'buy'

            # Check if the property is in the client's PropertiesList and the transaction type matches
            if propertyID in client_data.get('PropertiesList', []) and client_data.get('buyORrent') == rent_or_sell:
                interaction_matrix[i, j] = 1

    print(interaction_matrix)

    # Create k-NN model
    knn = NearestNeighbors(metric='cosine', algorithm='brute')
    knn.fit(interaction_matrix)

    # Find similar clients for the selected client first
    distances, indices = knn.kneighbors([interaction_matrix[0]], n_neighbors=2)
    print("Distances:", distances)
    print("Indices:", indices)

    similar_clients_indices = indices[0]
    recommended_properties = set()
    # Find the index of the target client in clients_list
    target_client_index = next(i for i, client in enumerate(clients_list) if client['person_id'] == personID)

    # Set of properties that the target client has interacted with
    target_client_properties = set(np.where(interaction_matrix[target_client_index] == 1)[0])
    # Loop through similar clients and find new property recommendations
    for idx in similar_clients_indices:
        similar_client_properties = set(np.where(interaction_matrix[idx] == 1)[0])
        new_recommendations = similar_client_properties - target_client_properties
        recommended_properties.update(new_recommendations)

        #[property_ids[i] for i in recommended_properties]

        # Loop through the recommended property indices
    for i in recommended_properties:
        print(f"Recommended Property ID: {property_ids[i]}")
        property_info = properties.get(property_ids[i], {})
        print(f"Recommended Property Info: {property_info}")

    # Continue with outputting the final recommendations
    # Extract similarity scores from the list of dictionaries
    similarity_scores = [entry['similarity'] for entry in similarities]

    # Normalize only the similarity scores
    similarity_normalized = normalize_scores(np.array(similarity_scores))

    # Collaborative filtering scores initialization (all zeros for now)
    collaborative_scores = np.zeros_like(similarity_scores)

    # Step 3: Combine both
    hybrid_scores = 0.6 * similarity_normalized + 0.4 * collaborative_scores  # Weighted sum

    # Recommend properties based on hybrid scores
    recommended_indices = np.argsort(-hybrid_scores)  # Sorting indices by descending scores
    recommended_property_ids = [property_ids[i] for i in recommended_indices[:3]]  # Top 3 properties

    return recommended_property_ids


def main():
    # Test data to mimic incoming API request data
    test_data = {
        'person_id': '888777959',  # Eli Kopter's person ID
    }

    # Email of the Realtor (Asaf Lotz)
    realtor_email = "AsafLotz@gmail.com"

    # Call the match_Algo function with the test data and the realtor's email
    recommended_properties = match_Algo(test_data, realtor_email)

    # Output the recommendations
    print("Top 3 Recommended Properties for Client:", recommended_properties)


if __name__ == "__main__":
    main()

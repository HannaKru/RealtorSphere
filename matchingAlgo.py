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

def match_Algo(data, email):
    person_ref = db.child('Person').child(data.get('person_id'))
    person_data = person_ref.get()

    properties_ref = db.child('properties').order_by_child('realtor').equal_to(email)
    properties = properties_ref.get()

    personID = data.get('person_id')
    counter = 0

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
    cities = person_data.get('Type', {}).get('Client', {}).get('searchCity', [])
    property_type = person_data.get('Type', {}).get('Client', {}).get('propertyType', "")

    avgRooms = (min_rooms + max_rooms)/2
    arg_size = (min_rooms + max_rooms)/2

    filtered_properties = []
    # Loop through each property
    for property in properties.each():
        property_data = property.val()

        # Check if the property belongs to the logged-in realtor
        if 'realtor' in property_data and property_data['realtor'] == email:

            # Extracting required data
            city = property_data.get('city', 'Unknown')
            rooms_num = int(property_data.get('type', {}).get('apartment', {}).get('roomsNum', 'Unknown'))
            property_type = property_data.get('type', {}).get('apartment', {}).get('type', 'Unknown')
            size = float(property_data.get('size', 'Unknown'))
            price = float(property_data.get('price', 'Unknown'))

            # Append the extracted details to the list
            filtered_properties.append({
                'city': city,
                'roomsNum': rooms_num,
                'type': property_type,
                'size': size,
                'price': price
            })

    return filtered_properties


    #prepering the data


    #using the algorithms
    similarity = cosine_similarity()

    recommendations = np.argsort(similarity[0])[::-1]  # Rank properties by similarity to the client

    knn = NearestNeighbors(metric='cosine', algorithm='brute')
    knn.fit()

    # Find similar clients
    distances, indices = knn.kneighbors(, n_neighbors=2)

    # Step 3: Combine both
    hybrid_scores = (similarity * 0.6) + (knn_scores * 0.4)  # weighted combination



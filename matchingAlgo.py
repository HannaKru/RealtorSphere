from firebase_config import initialize_firebase

db = initialize_firebase()

#Similarity Score = w1 * (Price Match) + w2 * (Room Match) + w3 * (Size Match) + w4 * (City Match)
#Content-Based Filtering

# k-Nearest Neighbors or matrix factorization
#Collaborative Filtering

#Weighted Hybrid: Assign a weight to both approaches and combine the scores from content-based and collaborative filtering.
#Final Score = w_content * content_score + w_collab * collab_score
#Switching Hybrid: Use content-based filtering when there is limited user data, then switch to collaborative filtering as you gather more user interaction data.
#Mixed Hybrid: Present both content-based and collaborative filtering results separately, allowing the user to choose.

#Hybrid

def match_Algo():
    persons_ref = db.child('Person')
    persons = persons_ref.get()

    properties_ref = db.child('properties')
    properties = properties_ref.get()


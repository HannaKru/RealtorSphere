from flask import Flask, request, jsonify, render_template, redirect, url_for
from login import login_user  # Ensure this is the correct import based on your file structure
from firebase_config import initialize_firebase
from firebase_config import db  # Import db directly

app = Flask(__name__)
#db = initialize_firebase()


@app.route('/')
def index():
    return render_template('login.html')


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user = login_user(email, password)

    if user:
        return jsonify({"message": "Login successful!"}), 200
    else:
        return jsonify({"message": "Login failed!"}), 401


@app.route('/homescreen')
def homescreen():
    return render_template('homescreen.html')


if __name__ == '__main__':
    app.run(debug=True)

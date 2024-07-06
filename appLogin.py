from flask import Flask, request, jsonify
from login import login_user

app = Flask(__name__)


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


if __name__ == '__main__':
    app.run(debug=True)

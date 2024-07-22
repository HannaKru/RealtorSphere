# appLogin.py
from flask import Flask, request, jsonify, render_template
from login import login_user

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    status_code, message = login_user(email, password)

    return jsonify({"message": message}), status_code

@app.route('/homescreen')
def homescreen():
    return render_template('homescreen.html')

if __name__ == '__main__':
    app.run(debug=True)

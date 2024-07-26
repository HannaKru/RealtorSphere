from flask import Flask, request, jsonify, render_template, redirect, url_for, flash

from Registration import register_user
from login import login_user
from firebase_config import initialize_firebase

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
db_ref = initialize_firebase()

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

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        first_name = request.form['firstName'].strip()
        last_name = request.form['lastName'].strip()
        id_number = request.form['id'].strip()
        phone = request.form['phone'].strip()
        email = request.form['email'].strip()
        password = request.form['password'].strip()
        password_repeat = request.form['passwordRepeat'].strip()
        license_number = request.form['license'].strip()

        status, message = register_user(first_name, last_name, id_number, phone, email, password, password_repeat, license_number)
        flash(message, status)
        return redirect(url_for('register'))

    return render_template('registration.html')

if __name__ == '__main__':
    app.run(debug=True)

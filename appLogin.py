from flask import Flask, request, jsonify, render_template, redirect, url_for, flash, session
import secrets
from flask_cors import CORS
from Registration import register_user
from firebase_config import initialize_firebase
from login import login_user
from HomeScreen import get_user_by_email, get_tasks_by_email, add_task, update_task_status

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = secrets.token_hex(32)

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

    if status_code == 200:
        session['user_email'] = email
        return jsonify({"message": message}), status_code
    else:
        return jsonify({"message": message}), status_code


@app.route('/homescreen')
def homescreen():
    if 'user_email' not in session:
        return redirect(url_for('index'))
    user_email = session['user_email']
    first_name = get_user_by_email(user_email)
    tasks = get_tasks_by_email(user_email)
    return render_template('homescreen.html', first_name=first_name, tasks=tasks)


@app.route('/logout')
def logout():
    session.pop('user_email', None)
    return redirect(url_for('index'))


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        first_name = request.form['firstName'].strip()
        last_name = request.form['lastName'].strip()
        id_number = request.form['id'].strip()
        phone_prefix = request.form['phonePrefix'].strip()
        phone = request.form['phone'].strip()
        email = request.form['email'].strip()
        password = request.form['password'].strip()
        password_repeat = request.form['passwordRepeat'].strip()
        license_number = request.form['license'].strip()

        status, message = register_user(first_name, last_name, id_number, phone_prefix, phone, email, password,
                                        password_repeat, license_number)
        flash(message, status)

        if status == 'success':
            return render_template('registration.html', message=message, status='success')

    return render_template('registration.html')


@app.route('/add_task', methods=['POST'])
def add_task_route():
    if 'user_email' not in session:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json()
    task_text = data.get('text')
    user_email = session['user_email']

    new_task = add_task(user_email, task_text)
    return jsonify(new_task), 201


@app.route('/update_task', methods=['POST'])
def update_task_route():
    if 'user_email' not in session:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json()
    task_id = data.get('id')
    new_status = data.get('status')

    success = update_task_status(task_id, new_status)
    if success:
        return jsonify({"message": "Task updated successfully"}), 200
    else:
        return jsonify({"message": "Task not found"}), 404


if __name__ == '__main__':
    app.run(debug=True)

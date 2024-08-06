# # HomeScreen.py
# from firebase_config import initialize_firebase
#
# db_ref = initialize_firebase()
#
# def get_user_by_email(email):
#    # """Fetches user data from Firebase based on the provided email and returns the user's first name."""
#     users_ref = db_ref.child("Person")
#     all_users = users_ref.get()
#     for user_id, user_data in all_users.items():
#         if user_data.get('email') == email:
#             return user_data.get('FirstName')
#     return None
#
#
# def get_tasks_by_email(email):
#     #"""Fetches tasks from Firebase for the specified email."""
#     tasks_ref = db_ref.child("Tasks").order_by_child("realtor").equal_to(email)
#     tasks_data = tasks_ref.get()
#
#     tasks = [{"id": task_id, "text": task_data['text'], "status": task_data['status']} for task_id, task_data in tasks_data.items()]
#     return tasks
#
# def add_task(email, task_text):
#     #"""Adds a new task to Firebase for the specified email."""
#     new_task_ref = db_ref.child("Tasks").push({
#         "realtor": email,
#         "status": False,
#         "text": task_text
#     })
#     new_task = {"id": new_task_ref.key, "text": task_text, "status": False}
#     return new_task
#
# def update_task_status(task_id, new_status):
#    # """Updates the status of a task in Firebase."""
#     task_ref = db_ref.child("Tasks").child(task_id)
#     task_data = task_ref.get()
#     if task_data:
#         task_ref.update({"status": new_status})
#         return True
#     return False
from flask import Flask, request, jsonify
from firebase_config import initialize_firebase

app = Flask(__name__)
db_ref = initialize_firebase()

def get_user_by_email(email):
   # """Fetches user data from Firebase based on the provided email and returns the user's first name."""
    users_ref = db_ref.child("Person")
    all_users = users_ref.get()
    for user_id, user_data in all_users.items():
        if user_data.get('email') == email:
            return user_data.get('FirstName')
    return None


def get_tasks_by_email(email):
    #"""Fetches tasks from Firebase for the specified email."""
    tasks_ref = db_ref.child("Tasks").order_by_child("realtor").equal_to(email)
    tasks_data = tasks_ref.get()


@app.route('/api/add-task', methods=['POST'])
def add_task(user_email, task_text):
    if not user_email or not task_text:
        return 'error', 'Invalid data'

    # Prepare data for Firebase
    task_data = {
        "realtor": user_email,
        "status": False,
        "text": task_text
    }

    tasks_ref = db_ref.child("Tasks")

    try:
        new_task = tasks_ref.push(task_data)
        return 'success', {
            'id': new_task.key,
            'text': task_text,
            'status': False
        }
    except Exception as e:
        return 'error', f'Error adding task: {str(e)}'

# Then, create a route that uses this function
@app.route('/api/add-task', methods=['POST'])
def add_task_route():
    data = request.json
    user_email = data.get('userEmail')
    task_text = data.get('text')

    status, result = add_task(user_email, task_text)

    if status == 'success':
        return jsonify({
            'status': 'success',
            'message': 'Task added successfully',
            'task': result
        }), 200
    else:
        return jsonify({
            'status': 'error',
            'message': result
        }), 400


@app.route('/api/get-tasks/<email>', methods=['GET'])
def get_tasks(email):
    tasks_ref = db_ref.child("Tasks")

    try:
        tasks_data = tasks_ref.order_by_child("realtor").equal_to(email).get()

        if tasks_data:
            tasks = [{"id": task_id, "text": task_data['text'], "status": task_data['status']}
                     for task_id, task_data in tasks_data.items()]
            return jsonify({'status': 'success', 'tasks': tasks}), 200
        else:
            return jsonify({'status': 'success', 'tasks': []}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Error fetching tasks: {str(e)}'}), 500


if __name__ == '__main__':
    app.run(debug=True)

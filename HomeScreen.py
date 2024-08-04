# HomeScreen.py
from firebase_config import initialize_firebase

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

    tasks = [{"id": task_id, "text": task_data['text'], "status": task_data['status']} for task_id, task_data in tasks_data.items()]
    return tasks

def add_task(email, task_text):
    #"""Adds a new task to Firebase for the specified email."""
    new_task_ref = db_ref.child("Tasks").push({
        "realtor": email,
        "status": False,
        "text": task_text
    })
    new_task = {"id": new_task_ref.key, "text": task_text, "status": False}
    return new_task

def update_task_status(task_id, new_status):
   # """Updates the status of a task in Firebase."""
    task_ref = db_ref.child("Tasks").child(task_id)
    task_data = task_ref.get()
    if task_data:
        task_ref.update({"status": new_status})
        return True
    return False
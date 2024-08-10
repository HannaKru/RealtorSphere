import smtplib
from firebase_config import initialize_firebase

db_ref = initialize_firebase()


def send_password_reset_email(email, password):
    try:
        # SMTP session for email sending
        s = smtplib.SMTP('smtp.gmail.com', 587)
        s.starttls()
        s.login("RealtorSphereHelp@gmail.com", "Aa12345!")

        # Craft the email content
        subject = "Your Password Reset Request"
        body = f"Your password is: {password}"
        message = f"Subject: {subject}\n\n{body}"

        # Send the email
        s.sendmail("your_sender_email_id", email, message)
        s.quit()
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False


def check_user_and_send_email(email, id_number):
    users_ref = db_ref.child('Person')
    users = users_ref.get()

    for user_id, user_data in users.items():
        if user_id == id_number and user_data.get('email') == email:
            realtor_data = user_data.get('Type', {}).get('Realtor', {})
            password = realtor_data.get('password')
            if password:
                if send_password_reset_email(email, password):
                    return {"message": "הסיסמה נשלחה למייל"}, 200
                else:
                    return {"message": "שליחת האימייל נכשלה"}, 500
            else:
                return {"message": "לא נמצא סוג משתמש מתאים"}, 400

    return {"message": "השדות אינם תואמים - טעות באימייל או בתעודת הזהות"}, 400

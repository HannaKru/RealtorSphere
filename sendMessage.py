import smtplib
from firebase_config import initialize_firebase
from werkzeug.utils import secure_filename
import os

db_ref = initialize_firebase()


def send_email_with_attachment(emails, subject, body, attachment_path=None, db_file_url=None):
    try:
        # Setup the SMTP server
        s = smtplib.SMTP('smtp.gmail.com', 587)
        s.starttls()
        s.login("RealtorSphereHelp@gmail.com", "cniz qghc nimu chcv")

        # Prepare the email
        from email.mime.multipart import MIMEMultipart
        from email.mime.text import MIMEText
        from email.mime.base import MIMEBase
        from email import encoders

        for email in emails.split(','):
            msg = MIMEMultipart()
            msg['From'] = "RealtorSphereHelp@gmail.com"
            msg['To'] = email.strip()
            msg['Subject'] = subject

            msg.attach(MIMEText(body, 'plain'))

            # Attach file if exists
            if attachment_path:
                filename = os.path.basename(attachment_path)
                attachment = open(attachment_path, "rb")
                part = MIMEBase('application', 'octet-stream')
                part.set_payload(attachment.read())
                encoders.encode_base64(part)
                part.add_header('Content-Disposition', f"attachment; filename= {filename}")
                msg.attach(part)
                attachment.close()

            # Attach file from URL if exists (this would require you to download it first)
            if db_file_url:
                import requests
                response = requests.get(db_file_url)
                part = MIMEBase('application', 'octet-stream')
                part.set_payload(response.content)
                encoders.encode_base64(part)
                filename = os.path.basename(db_file_url)
                part.add_header('Content-Disposition', f"attachment; filename= {filename}")
                msg.attach(part)

            # Send the email
            s.sendmail("RealtorSphereHelp@gmail.com", email, msg.as_string())

        s.quit()
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False


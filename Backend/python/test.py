import smtplib
from email.mime.text import MIMEText

def test_email():
    try:
        msg = MIMEText("This is a test email from OTDR analyzer")
        msg['Subject'] = 'OTDR Test Email'
        msg['From'] = 'ghazouabedoui05@gmail.com'
        msg['To'] = 'ghazoua.bedoui@supcom.tn'

        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login('ghazouabedoui05@gmail.com', 'ebofjpmfmsfgvomp')
            server.send_message(msg)
        print("Email sent successfully!")
    except Exception as e:
        print(f"Failed to send email: {str(e)}")

test_email()
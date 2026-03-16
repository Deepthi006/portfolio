import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)

# ==========================================
# EMAIL CONFIGURATION
# ==========================================
# IMPORTANT: To make emails actually send, you must use a Google App Password here.
# 1. Go to Google Account -> Security -> 2-Step Verification -> App Passwords
# 2. Generate a password and paste it below.
EMAIL_ADDRESS = "deepthidesetty22@gmail.com" 
EMAIL_APP_PASSWORD = "PUT_YOUR_APP_PASSWORD_HERE"  # <-- Change this!
# ==========================================

def connect():
    return sqlite3.connect("database.db")

def init_db():
    conn = connect()
    c = conn.cursor()
    c.execute("""
    CREATE TABLE IF NOT EXISTS contacts(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    message TEXT
    )
    """)
    conn.commit()
    conn.close()

init_db()

@app.route("/")
def home():
    return render_template("index.html")

def send_email_notification(name, user_email, message):
    if EMAIL_APP_PASSWORD == "PUT_YOUR_APP_PASSWORD_HERE":
        print("Skipping real email: App Password not configured.")
        return False
        
    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_ADDRESS
        msg['To'] = EMAIL_ADDRESS
        msg['Subject'] = f"🚀 New Contact Form Submission from {name}"
        
        body = f"Name: {name}\nEmail: {user_email}\n\nMessage:\n{message}"
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(EMAIL_ADDRESS, EMAIL_APP_PASSWORD)
        server.sendmail(EMAIL_ADDRESS, EMAIL_ADDRESS, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

@app.route("/contact", methods=["POST"])
def contact():
    name = request.form["name"]
    email = request.form["email"]
    message = request.form["message"]

    # 1. Save to Database
    conn = connect()
    c = conn.cursor()
    c.execute(
        "INSERT INTO contacts(name,email,message) VALUES (?,?,?)",
        (name,email,message)
    )
    conn.commit()
    conn.close()
    
    # 2. Send Real Email
    send_email_notification(name, email, message)

    return "Message Sent Successfully"

if __name__ == "__main__":
    app.run(debug=True)
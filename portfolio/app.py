import smtplib
import os
import time
import json
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Flask, render_template, request, jsonify, send_file, abort, make_response
import sqlite3

app = Flask(__name__)

# ==========================================
# EMAIL CONFIGURATION
# ==========================================
EMAIL_ADDRESS      = "deepthidesetty22@gmail.com"
EMAIL_APP_PASSWORD = "PUT_YOUR_APP_PASSWORD_HERE"   # <-- Change this!
# ==========================================

# ==========================================
# SIMPLE IN-MEMORY RATE LIMITER
# ==========================================
_rate_store = {}   # { ip: [timestamps] }
RATE_LIMIT  = 3    # max submissions per window
RATE_WINDOW = 60   # seconds

def is_rate_limited(ip):
    now = time.time()
    hits = [t for t in _rate_store.get(ip, []) if now - t < RATE_WINDOW]
    if len(hits) >= RATE_LIMIT:
        return True
    hits.append(now)
    _rate_store[ip] = hits
    return False
# ==========================================


def connect():
    return sqlite3.connect("database.db")


def init_db():
    conn = connect()
    c = conn.cursor()
    # contacts table
    c.execute("""
    CREATE TABLE IF NOT EXISTS contacts(
        id      INTEGER PRIMARY KEY AUTOINCREMENT,
        name    TEXT,
        email   TEXT,
        message TEXT,
        ip      TEXT,
        created TEXT DEFAULT (datetime('now'))
    )
    """)
    # Attempt to gracefully alter table if missing IP
    try:
        c.execute("ALTER TABLE contacts ADD COLUMN ip TEXT")
    except sqlite3.OperationalError:
        pass
    
    # cv_downloads table
    c.execute("""
    CREATE TABLE IF NOT EXISTS cv_downloads(
        id      INTEGER PRIMARY KEY AUTOINCREMENT,
        ip      TEXT,
        ua      TEXT,
        created TEXT DEFAULT (datetime('now'))
    )
    """)
    conn.commit()
    conn.close()

init_db()


# ------------------------------------------------------------------
# HOME
# ------------------------------------------------------------------
@app.route("/")
def home():
    return render_template("index.html")


# ------------------------------------------------------------------
# CONTACT FORM  (POST → saves to DB + sends email)
# ------------------------------------------------------------------
def send_email_notification(name, user_email, message):
    """Send notification email to Deepthi AND a confirmation to the sender."""
    if EMAIL_APP_PASSWORD == "PUT_YOUR_APP_PASSWORD_HERE":
        print("⚠️  Skipping real email: App Password not configured.")
        return False

    try:
        def _make_msg(to_addr, subject, body):
            msg = MIMEMultipart()
            msg['From']    = EMAIL_ADDRESS
            msg['To']      = to_addr
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'plain'))
            return msg

        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(EMAIL_ADDRESS, EMAIL_APP_PASSWORD)

        # 1. Notification to Deepthi
        notify_body = (
            f"New contact via portfolio!\n\n"
            f"Name:    {name}\n"
            f"Email:   {user_email}\n\n"
            f"Message:\n{message}"
        )
        server.sendmail(
            EMAIL_ADDRESS, EMAIL_ADDRESS,
            _make_msg(EMAIL_ADDRESS, f"🚀 New Contact from {name}", notify_body).as_string()
        )

        # 2. Confirmation to sender
        confirm_body = (
            f"Hi {name},\n\n"
            f"Thanks for reaching out! I've received your message and will get back to you soon. 🙂\n\n"
            f"— Deepthi Desetty\n"
            f"   deepthidesetty22@gmail.com | linkedin.com/in/deepthi99"
        )
        server.sendmail(
            EMAIL_ADDRESS, user_email,
            _make_msg(user_email, "I got your message! – Deepthi Desetty", confirm_body).as_string()
        )

        server.quit()
        return True
    except Exception as e:
        print(f"❌ Failed to send email: {e}")
        return False


@app.route("/contact", methods=["POST"])
def contact():
    ip = request.remote_addr

    # Rate limiting
    if is_rate_limited(ip):
        return jsonify({"ok": False, "error": "Too many requests. Please wait a minute."}), 429

    # Support both JSON and form-encoded
    if request.is_json:
        data    = request.get_json(force=True)
        name    = (data.get("name")    or "").strip()
        email   = (data.get("email")   or "").strip()
        message = (data.get("message") or "").strip()
    else:
        name    = (request.form.get("name")    or "").strip()
        email   = (request.form.get("email")   or "").strip()
        message = (request.form.get("message") or "").strip()

    if not name or not email or not message:
        return jsonify({"ok": False, "error": "All fields are required."}), 400

    # Save to DB
    conn = connect()
    c = conn.cursor()
    c.execute(
        "INSERT INTO contacts(name,email,message,ip) VALUES (?,?,?,?)",
        (name, email, message, ip)
    )
    conn.commit()
    conn.close()

    # Send emails
    email_sent = send_email_notification(name, email, message)

    return jsonify({
        "ok":         True,
        "message":    "Message sent successfully!",
        "email_sent": email_sent
    }), 200


# ------------------------------------------------------------------
# CV / RESUME DOWNLOAD  (tracks downloads)
# ------------------------------------------------------------------
RESUME_PATH = os.path.join(os.path.dirname(__file__), "static", "resume.pdf")

@app.route("/download-cv")
def download_cv():
    if not os.path.exists(RESUME_PATH):
        abort(404)

    ip = request.remote_addr
    ua = request.headers.get("User-Agent", "")

    conn = connect()
    conn.execute("INSERT INTO cv_downloads(ip,ua) VALUES (?,?)", (ip, ua))
    conn.commit()
    conn.close()

    response = make_response(send_file(RESUME_PATH, mimetype="application/pdf"))
    response.headers["Content-Disposition"] = (
        'attachment; filename="Deepthi_Desetty_Resume.pdf"'
    )
    return response


# ------------------------------------------------------------------
# ADMIN – view messages  (basic, no auth; add auth before deploying)
# ------------------------------------------------------------------
@app.route("/admin/messages")
def admin_messages():
    conn = connect()
    rows = conn.execute(
        "SELECT id,name,email,message,ip,created FROM contacts ORDER BY id DESC"
    ).fetchall()
    conn.close()

    return jsonify([
        {"id": r[0], "name": r[1], "email": r[2],
         "message": r[3], "ip": r[4], "created": r[5]}
        for r in rows
    ])


# ------------------------------------------------------------------
# STATS API  (download count + message count)
# ------------------------------------------------------------------
@app.route("/api/stats")
def api_stats():
    conn = connect()
    downloads = conn.execute("SELECT COUNT(*) FROM cv_downloads").fetchone()[0]
    messages  = conn.execute("SELECT COUNT(*) FROM contacts").fetchone()[0]
    conn.close()

    return jsonify({
        "cv_downloads":   downloads,
        "messages_total": messages
    })


# ------------------------------------------------------------------
# RUN
# ------------------------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True)
from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import mysql.connector
import os
import re
import secrets
import functools
import json
import time
import threading
import smtplib
from email.message import EmailMessage

app = Flask(__name__)

# Only allow configured frontend origins. Comma-separated CORS_ORIGINS may be
# supplied in production; local development keeps the common Capacitor/browser
# origins available.
_default_origins = "http://localhost:3000,http://localhost:5173,http://localhost:8100,http://10.0.2.2:5000,http://10.222.42.8:5000,capacitor://localhost,http://localhost"
CORS_ORIGINS = [o.strip() for o in os.environ.get("CORS_ORIGINS", _default_origins).split(",") if o.strip()]
CORS(app, origins=CORS_ORIGINS, supports_credentials=False)

# In-memory sessions are still process-local, but now have an actual expiry.
# For multi-worker production deployments, replace these stores with Redis or
# another shared session/token store.
TOKEN_TTL_SECONDS = int(os.environ.get("TOKEN_TTL_SECONDS", str(8 * 60 * 60)))
ADMIN_TOKENS = {}  # token -> {user_id, expires_at}
USER_TOKENS = {}   # token -> {user_id, expires_at}
RESET_TOKENS = {}  # reset token -> {user_id, expires_at}

# Simple process-local abuse protection. A shared store such as Redis should be
# used when the API runs behind multiple workers/instances.
_RATE_LIMITS = {}
_RATE_LOCK = threading.Lock()


def get_db_connection():
    return mysql.connector.connect(
        host=os.environ.get("DB_HOST", "localhost"),
        port=int(os.environ.get("DB_PORT", "3306")),
        user=os.environ.get("DB_USER", "root"),
        password=os.environ.get("DB_PASSWORD"),
        database=os.environ.get("DB_NAME", "CGC_campus_ride"),
        use_pure=True
    )


def error_response(message, status_code):
    return jsonify({"error": message}), status_code


def json_body():
    """Parse the JSON request body as a dict.

    get_json(silent=True) returns the raw parsed value (list, number, string,
    bool) for valid non-object JSON, which crashes callers that use .get().
    Normalize anything that is not an object to {} so validation errors (400)
    are produced instead of 500.
    """
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else {}


def _client_ip():
    # Do not blindly trust X-Forwarded-For unless the reverse proxy is trusted.
    return request.remote_addr or "unknown"


def _rate_limit(scope, key, max_attempts=5, window_seconds=300):
    now = time.time()
    bucket_key = (scope, key)
    with _RATE_LOCK:
        attempts = [ts for ts in _RATE_LIMITS.get(bucket_key, []) if now - ts < window_seconds]
        if len(attempts) >= max_attempts:
            retry_after = max(1, int(window_seconds - (now - attempts[0])))
            _RATE_LIMITS[bucket_key] = attempts
            response = error_response("Too many attempts. Please try again later.", 429)
            response[0].headers["Retry-After"] = str(retry_after)
            return response
        attempts.append(now)
        _RATE_LIMITS[bucket_key] = attempts
    return None


def _clear_rate_limit(scope, key):
    with _RATE_LOCK:
        _RATE_LIMITS.pop((scope, key), None)


def _send_reset_otp(email, otp):
    host = os.environ.get("SMTP_HOST")
    port = int(os.environ.get("SMTP_PORT", "587"))
    username = os.environ.get("SMTP_USERNAME")
    password = os.environ.get("SMTP_PASSWORD")
    sender = os.environ.get("SMTP_FROM", username or "")
    if not host or not sender:
        return False

    msg = EmailMessage()
    msg["Subject"] = "Campus Ride faculty password reset OTP"
    msg["From"] = sender
    msg["To"] = email
    msg.set_content(f"Your Campus Ride password reset OTP is {otp}. It expires in 5 minutes.")
    with smtplib.SMTP(host, port, timeout=15) as smtp:
        smtp.starttls()
        if username and password:
            smtp.login(username, password)
        smtp.send_message(msg)
    return True


def _admin_identity():
    """Resolve the authenticated admin from the X-Admin-Token header.

    Returns (admin_user_row, None) on success or (None, error_response) so
    every Admin endpoint re-verifies authorization on the backend and never
    trusts the client. The account_status check keeps deactivated admins out.
    """
    token = (request.headers.get("X-Admin-Token") or "").strip()
    if not token or token not in ADMIN_TOKENS:
        return None, error_response("Admin authentication required", 401)

    session = ADMIN_TOKENS[token]
    if isinstance(session, dict):
        if time.time() >= session.get("expires_at", 0):
            ADMIN_TOKENS.pop(token, None)
            return None, error_response("Admin session expired", 401)
        admin_id = session.get("user_id")
    else:  # compatibility with any token issued before this update
        admin_id = session
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id, name, email, roll_no, role, account_status "
            "FROM users WHERE id = %s AND role = 'admin'",
            (admin_id,),
        )
        admin = cursor.fetchone()
    except mysql.connector.Error as err:
        return None, error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()

    if not admin:
        return None, error_response("Admin account not found", 401)
    if admin.get("account_status") != "active":
        return None, error_response("This admin account is inactive", 403)
    return admin, None


def require_admin(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        admin, err = _admin_identity()
        if err:
            return err
        return fn(admin, *args, **kwargs)

    return wrapper


def _user_identity(roles=None):
    """Resolve the authenticated student/faculty/driver from X-User-Token.

    Returns (user_row, None) on success or (None, error_response) so every
    notification endpoint re-verifies authorization on the backend. The
    account_status check keeps deactivated users out.
    """
    token = (request.headers.get("X-User-Token") or "").strip()
    if not token or token not in USER_TOKENS:
        return None, error_response("Authentication required", 401)

    session = USER_TOKENS[token]
    if isinstance(session, dict):
        if time.time() >= session.get("expires_at", 0):
            USER_TOKENS.pop(token, None)
            return None, error_response("Session expired", 401)
        user_id = session.get("user_id")
    else:  # compatibility with any token issued before this update
        user_id = session
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id, name, email, role, account_status, route_id, contact_no, avatar "
            "FROM users WHERE id = %s",
            (user_id,),
        )
        user = cursor.fetchone()
    except mysql.connector.Error as err:
        return None, error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()

    if not user:
        return None, error_response("User account not found", 401)
    if user.get("account_status") != "active":
        return None, error_response("This account has been deactivated", 403)
    if roles and user["role"] not in roles:
        return None, error_response("You do not have permission for this action", 403)
    return user, None


def require_user(roles=None):
    """Decorator factory: requires a valid X-User-Token.

    roles (optional): iterable of allowed user roles, e.g. ["driver"].
    """
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            user, err = _user_identity(roles)
            if err:
                return err
            return fn(user, *args, **kwargs)

        return wrapper

    return decorator


@app.errorhandler(404)
def not_found(_e):
    return error_response("Not found", 404)


@app.errorhandler(500)
def internal_error(_e):
    return error_response("Internal server error", 500)


# ---------------------------------------------------------------------------
# Existing endpoints (kept working)
# ---------------------------------------------------------------------------

@app.route("/")
def home():
    return jsonify({
        "message": "Campus Ride API is working!"
    })


@app.route("/api/config")
def get_config():
    # Maps use the free Leaflet + OpenStreetMap + OSRM stack, so no external
    # API key is required. Kept as a minimal endpoint for compatibility.
    return jsonify({})


@app.route("/users")
@require_admin
def get_users(_admin):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id, name, email, roll_no, role FROM users ORDER BY id")
        users = cursor.fetchall()
    except mysql.connector.Error as err:
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    return jsonify(users)


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = json_body()
    identifier = (data.get("identifier") or data.get("email") or data.get("roll_no") or "").strip()
    email = identifier.lower()
    password = data.get("password") or ""
    role = (data.get("role") or "").strip().lower()

    if not identifier or not password:
        return error_response("identifier and password are required", 400)

    rate_error = _rate_limit("login", f"{_client_ip()}:{email}")
    if rate_error:
        return rate_error

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id, name, email, password, roll_no, role, account_status, contact_no, branch, "
            "college, department, pickup_point, pass_issue_date, pass_valid_upto, "
            "fee_receipt_no, fee_date, fee_place, relation_type, relation_value, "
            "route_id, avatar, designation, dob, gender, address, blood_group, emergency_contact, "
            "created_at FROM users WHERE email = %s OR roll_no = %s LIMIT 1",
            (email, identifier),
        )
        user = cursor.fetchone()
    except mysql.connector.Error as err:
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()

    if not user or not check_password_hash(user["password"], password):
        return error_response("Invalid email or password", 401)

    _clear_rate_limit("login", f"{_client_ip()}:{email}")

    if user.get("account_status", "active") != "active":
        return error_response("This account has been deactivated. Contact the administrator.", 403)

    if role and user["role"] != role:
        return error_response(f"This account is registered as {user['role']}, not {role}", 403)

    user.pop("password", None)
    # User sessions: issue a bearer token used by the notification endpoints.
    # Tokens never include credentials and are scoped to this process.
    token = secrets.token_urlsafe(32)
    USER_TOKENS[token] = {"user_id": user["id"], "expires_at": time.time() + TOKEN_TTL_SECONDS}
    user["session_token"] = token
    user["session_expires_at"] = int(time.time() + TOKEN_TTL_SECONDS)
    return jsonify(user), 200


# ---------------------------------------------------------------------------
# Faculty forgot-password reset (faculty accounts only)
# ---------------------------------------------------------------------------

def _is_strong_password(pw):
    return (
        len(pw) >= 8
        and re.search(r"[A-Z]", pw)
        and re.search(r"[a-z]", pw)
        and re.search(r"\d", pw)
        and re.search(r"[^A-Za-z0-9]", pw)
    )


@app.route("/api/auth/faculty/request-reset", methods=["POST"])
def faculty_request_reset():
    data = json_body()
    identifier = (data.get("identifier") or "").strip()
    if not identifier:
        return error_response("identifier is required", 400)

    rate_error = _rate_limit("faculty_reset_request", f"{_client_ip()}:{identifier.lower()}", 3, 900)
    if rate_error:
        return rate_error

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id, email, role FROM users WHERE (LOWER(email) = LOWER(%s) OR UPPER(roll_no) = UPPER(%s)) LIMIT 1",
            (identifier, identifier),
        )
        user = cursor.fetchone()
    except mysql.connector.Error as err:
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()

    # Always return the same generic response and a challenge token so the
    # presence/absence of an account cannot be inferred from the response.
    reset_token = secrets.token_urlsafe(32)
    response = {"success": True, "message": "If the faculty account exists, an OTP has been sent.", "reset_token": reset_token}
    if not user or user.get("role") != "faculty":
        return jsonify(response), 200

    otp = f"{secrets.randbelow(1000000):06d}"
    RESET_TOKENS[reset_token] = {
        "user_id": user["id"],
        "otp_hash": generate_password_hash(otp),
        "expires_at": time.time() + 5 * 60,
        "attempts": 0,
    }

    try:
        delivered = _send_reset_otp(user["email"], otp)
    except Exception:
        delivered = False

    # Development convenience only. Never expose OTPs when FLASK_ENV=production.
    if not delivered and os.environ.get("FLASK_ENV", "development").lower() != "production":
        response["demo_otp"] = otp
    elif delivered:
        pass
    else:
        # Do not leave a usable reset token behind if delivery is unavailable.
        RESET_TOKENS.pop(reset_token, None)
    return jsonify(response), 200


@app.route("/api/auth/faculty/verify-reset", methods=["POST"])
def faculty_verify_reset():
    data = json_body()
    reset_token = (data.get("reset_token") or "").strip()
    otp = (data.get("otp") or "").strip()
    if not reset_token or not otp:
        return error_response("reset_token and otp are required", 400)

    record = RESET_TOKENS.get(reset_token)
    if not record or time.time() >= record["expires_at"]:
        RESET_TOKENS.pop(reset_token, None)
        return error_response("Invalid or expired OTP", 400)
    if record["attempts"] >= 5:
        RESET_TOKENS.pop(reset_token, None)
        return error_response("Too many OTP attempts", 429)
    record["attempts"] += 1
    if not check_password_hash(record["otp_hash"], otp):
        return error_response("Invalid OTP", 400)

    verified_token = secrets.token_urlsafe(32)
    RESET_TOKENS[verified_token] = {
        "user_id": record["user_id"],
        "expires_at": min(record["expires_at"], time.time() + 10 * 60),
        "verified": True,
    }
    RESET_TOKENS.pop(reset_token, None)
    return jsonify({"success": True, "reset_token": verified_token}), 200


@app.route("/api/auth/faculty/reset-password", methods=["POST"])
def faculty_reset_password():
    data = json_body()
    reset_token = (data.get("reset_token") or "").strip()
    new_password = data.get("new_password") or ""
    if not reset_token or not new_password:
        return error_response("reset_token and new_password are required", 400)

    if not _is_strong_password(new_password):
        return error_response(
            "Password must be at least 8 characters and include an uppercase letter, "
            "a lowercase letter, a number and a special character",
            400,
        )

    record = RESET_TOKENS.get(reset_token)
    if not record or not record.get("verified") or time.time() >= record["expires_at"]:
        RESET_TOKENS.pop(reset_token, None)
        return error_response("Invalid or expired password reset token", 400)

    db = get_db_connection()
    cursor = db.cursor()
    try:
        cursor.execute(
            "UPDATE users SET password = %s WHERE id = %s AND role = 'faculty'",
            (generate_password_hash(new_password), record["user_id"]),
        )
        if cursor.rowcount != 1:
            db.rollback()
            return error_response("Faculty account not found", 404)
        db.commit()
    except mysql.connector.Error as err:
        db.rollback()
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()

    RESET_TOKENS.pop(reset_token, None)
    return jsonify({"success": True, "message": "Faculty password updated successfully"}), 200


# ---------------------------------------------------------------------------
# Student profile update (authenticated; only the student's own record)
# ---------------------------------------------------------------------------

_EDITABLE_STUDENT_COLUMNS = ("name", "email", "contact_no", "branch", "department", "college", "pickup_point", "relation_value")


@app.route("/api/auth/student/update-profile", methods=["POST"])
def student_update_profile():
    data = json_body()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return error_response("email and password are required for authentication", 400)

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id, role, email FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
    except mysql.connector.Error as err:
        cursor.close()
        db.close()
        return error_response("Database error: " + str(err), 500)

    if not user:
        cursor.close()
        db.close()
        return error_response("Account not found", 404)

    if user["role"] != "student":
        cursor.close()
        db.close()
        return error_response("Only student accounts can update their profile here", 403)

    # Re-verify the password to confirm this is the authenticated student.
    cursor.execute("SELECT password FROM users WHERE id = %s", (user["id"],))
    stored = cursor.fetchone()
    if not stored or not check_password_hash(stored["password"], password):
        cursor.close()
        db.close()
        return error_response("Incorrect password", 401)

    name = (data.get("name") or "").strip()
    new_email = (data.get("new_email") or email).strip().lower()
    contact_no = (data.get("contact_no") or "").strip()
    branch = (data.get("branch") or "").strip()
    department = (data.get("department") or "").strip()
    college = (data.get("college") or "").strip()
    pickup_point = (data.get("pickup_point") or "").strip()
    relation_value = (data.get("relation_value") or "").strip()
    avatar = (data.get("avatar") or "").strip()
    remove_avatar = bool(data.get("remove_avatar"))

    if not name:
        cursor.close()
        db.close()
        return error_response("name is required", 400)

    if new_email and new_email != user["email"]:
        cursor.execute(
            "SELECT id FROM users WHERE email = %s AND id != %s",
            (new_email, user["id"]),
        )
        if cursor.fetchone():
            cursor.close()
            db.close()
            return error_response("Email already registered", 409)

    if contact_no and not re.match(r"^[0-9+\-\s]{7,15}$", contact_no):
        cursor.close()
        db.close()
        return error_response("contact_no must be a valid phone number", 400)

    if avatar and not remove_avatar:
        if len(avatar) > 4 * 1024 * 1024:
            cursor.close()
            db.close()
            return error_response("avatar image is too large", 400)
        if not re.match(r"^data:image/(jpeg|jpg|png);base64,", avatar):
            cursor.close()
            db.close()
            return error_response("avatar must be a JPG, JPEG or PNG image", 400)

    try:
        set_sql = (
            "SET name = %s, email = %s, contact_no = %s, branch = %s, "
            "department = %s, college = %s, pickup_point = %s, relation_value = %s"
        )
        params = [name, new_email, contact_no, branch, department, college, pickup_point, relation_value]
        if remove_avatar:
            set_sql += ", avatar = NULL"
        elif avatar:
            set_sql += ", avatar = %s"
            params.append(avatar)
        params.append(user["id"])
        cursor.execute("UPDATE users " + set_sql + " WHERE id = %s", params)
        db.commit()
    except mysql.connector.Error as err:
        db.rollback()
        cursor.close()
        db.close()
        return error_response("Database error: " + str(err), 500)

    cursor.execute(
        "SELECT id, name, email, roll_no, role, contact_no, branch, college, department, "
        "pickup_point, pass_issue_date, pass_valid_upto, fee_receipt_no, route_id, avatar, "
        "created_at FROM users WHERE id = %s",
        (user["id"],),
    )
    profile = cursor.fetchone()
    cursor.close()
    db.close()

    return jsonify(
        {"success": True, "message": "Profile updated successfully.", "profile": profile}
    ), 200


@app.route("/api/auth/driver/update-profile", methods=["POST"])
def driver_update_profile():
    """Authenticated driver profile update.

    The driver authenticates with the same Driver ID + PIN used to sign in.
    Only the logged-in driver's own row can be updated: the PIN check ties the
    request to a specific account, so changing the ID in the payload can never
    modify another driver's profile. Bus / route assignment, role, account
    status and password are Admin-controlled and are never accepted here.
    """
    data = json_body()
    user_id = (data.get("id") or "").strip()
    pin = data.get("pin") or ""

    if not user_id or not pin:
        return error_response("Driver ID and PIN are required for authentication", 400)

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id, name, email, roll_no, role, contact_no, department, route_id "
            "FROM users WHERE role = 'driver'",
        )
        users = cursor.fetchall()
    except mysql.connector.Error as err:
        cursor.close()
        db.close()
        return error_response("Database error: " + str(err), 500)

    user = None
    for candidate in users:
        if _user_matches_typed_id(candidate, user_id):
            user = candidate
            break

    if not user:
        cursor.close()
        db.close()
        return error_response("Driver ID not found", 404)

    # Re-verify the PIN to confirm this is the authenticated driver.
    cursor.execute("SELECT password FROM users WHERE id = %s", (user["id"],))
    stored = cursor.fetchone()
    if not stored or not check_password_hash(stored["password"], pin):
        cursor.close()
        db.close()
        return error_response("Incorrect PIN", 401)

    name = (data.get("name") or "").strip()
    new_email = (data.get("new_email") or user["email"] or "").strip().lower()
    contact_no = (data.get("contact_no") or "").strip()
    department = (data.get("department") or "").strip()
    avatar = (data.get("avatar") or "").strip()
    remove_avatar = bool(data.get("remove_avatar"))

    if not name:
        cursor.close()
        db.close()
        return error_response("name is required", 400)

    if new_email and new_email != user["email"]:
        cursor.execute(
            "SELECT id FROM users WHERE email = %s AND id != %s",
            (new_email, user["id"]),
        )
        if cursor.fetchone():
            cursor.close()
            db.close()
            return error_response("Email already registered", 409)

    if contact_no and not re.match(r"^[0-9+\-\s]{7,15}$", contact_no):
        cursor.close()
        db.close()
        return error_response("contact_no must be a valid phone number", 400)

    if avatar and not remove_avatar:
        if len(avatar) > 4 * 1024 * 1024:
            cursor.close()
            db.close()
            return error_response("avatar image is too large", 400)
        if not re.match(r"^data:image/(jpeg|jpg|png);base64,", avatar):
            cursor.close()
            db.close()
            return error_response("avatar must be a JPG, JPEG or PNG image", 400)

    try:
        set_sql = "SET name = %s, email = %s, contact_no = %s, department = %s"
        params = [name, new_email, contact_no, department]
        if remove_avatar:
            set_sql += ", avatar = NULL"
        elif avatar:
            set_sql += ", avatar = %s"
            params.append(avatar)
        params.append(user["id"])
        cursor.execute("UPDATE users " + set_sql + " WHERE id = %s", params)
        db.commit()
    except mysql.connector.Error as err:
        db.rollback()
        cursor.close()
        db.close()
        return error_response("Database error: " + str(err), 500)

    cursor.execute(
        "SELECT id, name, email, roll_no, role, contact_no, department, avatar, route_id "
        "FROM users WHERE id = %s",
        (user["id"],),
    )
    profile = cursor.fetchone()
    cursor.close()
    db.close()

    return jsonify(
        {"success": True, "message": "Profile updated successfully.", "profile": profile}
    ), 200


# ---------------------------------------------------------------------------
# Faculty profile update (authenticated; only the teacher's own record)
# ---------------------------------------------------------------------------

_FACULTY_PROFILE_COLUMNS = (
    "id", "name", "email", "roll_no", "role", "contact_no", "department",
    "designation", "college", "pickup_point", "dob", "gender", "address",
    "blood_group", "emergency_contact", "route_id", "avatar", "created_at",
)


def _faculty_profile_select():
    return (
        "SELECT " + ", ".join(_FACULTY_PROFILE_COLUMNS) + " FROM users WHERE id = %s"
    )


@app.route("/api/auth/faculty/update-profile", methods=["POST"])
def faculty_update_profile():
    """Authenticated faculty profile update.

    The teacher authenticates with the email address on file plus their
    password (re-verified against the stored hash), exactly like the student
    update endpoint. Only the authenticated teacher's own row can change:
    no account id, roll_no (Faculty ID), role, route assignment, pass dates,
    account status or password is ever accepted here.
    """
    data = json_body()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return error_response("email and password are required for authentication", 400)

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id, role, email FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
    except mysql.connector.Error as err:
        cursor.close()
        db.close()
        return error_response("Database error: " + str(err), 500)

    if not user:
        cursor.close()
        db.close()
        return error_response("Account not found", 404)

    if user["role"] != "faculty":
        cursor.close()
        db.close()
        return error_response("Only faculty accounts can update their profile here", 403)

    # Re-verify the password to confirm this is the authenticated teacher.
    cursor.execute("SELECT password FROM users WHERE id = %s", (user["id"],))
    stored = cursor.fetchone()
    if not stored or not check_password_hash(stored["password"], password):
        cursor.close()
        db.close()
        return error_response("Incorrect password", 401)

    name = (data.get("name") or "").strip()
    new_email = (data.get("new_email") or email).strip().lower()
    contact_no = (data.get("contact_no") or "").strip()
    department = (data.get("department") or "").strip()
    designation = (data.get("designation") or "").strip()
    college = (data.get("college") or "").strip()
    pickup_point = (data.get("pickup_point") or "").strip()
    dob = (data.get("dob") or "").strip()
    gender = (data.get("gender") or "").strip()
    address = (data.get("address") or "").strip()
    blood_group = (data.get("blood_group") or "").strip()
    emergency_contact = (data.get("emergency_contact") or "").strip()
    avatar = (data.get("avatar") or "").strip()
    remove_avatar = bool(data.get("remove_avatar"))

    if not name:
        cursor.close()
        db.close()
        return error_response("name is required", 400)

    if new_email and new_email != user["email"]:
        cursor.execute(
            "SELECT id FROM users WHERE email = %s AND id != %s",
            (new_email, user["id"]),
        )
        if cursor.fetchone():
            cursor.close()
            db.close()
            return error_response("Email already registered", 409)

    phone_pattern = r"^[0-9+\-\s]{7,15}$"
    if contact_no and not re.match(phone_pattern, contact_no):
        cursor.close()
        db.close()
        return error_response("contact_no must be a valid phone number", 400)
    if emergency_contact and not re.match(phone_pattern, emergency_contact):
        cursor.close()
        db.close()
        return error_response("emergency_contact must be a valid phone number", 400)

    if dob:
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", dob):
            cursor.close()
            db.close()
            return error_response("dob must be a valid date (YYYY-MM-DD)", 400)

    if len(designation) > 100:
        cursor.close()
        db.close()
        return error_response("designation is too long", 400)
    if len(address) > 255:
        cursor.close()
        db.close()
        return error_response("address is too long", 400)
    if len(blood_group) > 10:
        cursor.close()
        db.close()
        return error_response("blood_group is too long", 400)
    if len(gender) > 20:
        cursor.close()
        db.close()
        return error_response("gender is too long", 400)

    if avatar and not remove_avatar:
        if len(avatar) > 4 * 1024 * 1024:
            cursor.close()
            db.close()
            return error_response("avatar image is too large", 400)
        if not re.match(r"^data:image/(jpeg|jpg|png);base64,", avatar):
            cursor.close()
            db.close()
            return error_response("avatar must be a JPG, JPEG or PNG image", 400)

    try:
        set_sql = (
            "SET name = %s, email = %s, contact_no = %s, department = %s, "
            "designation = %s, college = %s, pickup_point = %s, dob = %s, "
            "gender = %s, address = %s, blood_group = %s, emergency_contact = %s"
        )
        params = [
            name, new_email, contact_no, department, designation, college,
            pickup_point, dob or None, gender, address, blood_group,
            emergency_contact,
        ]
        if remove_avatar:
            set_sql += ", avatar = NULL"
        elif avatar:
            set_sql += ", avatar = %s"
            params.append(avatar)
        params.append(user["id"])
        cursor.execute("UPDATE users " + set_sql + " WHERE id = %s", params)
        db.commit()
    except mysql.connector.Error as err:
        db.rollback()
        cursor.close()
        db.close()
        return error_response("Database error: " + str(err), 500)

    cursor.execute(_faculty_profile_select(), (user["id"],))
    profile = cursor.fetchone()
    cursor.close()
    db.close()

    return jsonify(
        {"success": True, "message": "Profile updated successfully.", "profile": profile}
    ), 200


# ---------------------------------------------------------------------------
# Driver / Admin login (uses the same users table with hashed passwords)
# ---------------------------------------------------------------------------

def _normalize_id(value):
    """Collapse an ID to letters+digits only (DRV/001, DRV-001, DRV-1 all normalize)."""
    return re.sub(r"[^A-Za-z0-9]", "", (value or "")).upper()


def _user_matches_typed_id(user, typed_id):
    """Match a typed driver/admin ID against a user row.

    Accepts the stored roll_no (DRV/001, ADMIN-01) and also the driver ID
    form the frontend derives from trips (DRV-<user_id>).
    """
    typed_norm = _normalize_id(typed_id)
    if not typed_norm:
        return False
    if typed_norm == _normalize_id(user.get("roll_no")):
        return True
    typed_digits = re.sub(r"\D", "", typed_id or "")
    return bool(typed_digits) and typed_digits == str(user["id"])


def _resolve_driver_assignment(cursor, driver_id, direct_route_id):
    """Resolve a driver's assigned bus + route.

    A route assigned directly to the driver (users.route_id, set through the
    Admin portal's driver Route control) takes precedence. Otherwise the route
    is derived from the driver's bus (buses.driver_id -> routes.bus_id), with
    trips as a fallback for legacy data.

    Returns a dict with bus_id, bus_number, route_id, route_name (each may be
    None) or None on database error.
    """
    try:
        # The driver's bus (if any)
        cursor.execute(
            "SELECT b.bus_id, b.bus_number, r.route_id AS bus_route_id, r.route_name AS bus_route_name "
            "FROM buses b "
            "LEFT JOIN routes r ON r.bus_id = b.bus_id "
            "WHERE b.driver_id = %s LIMIT 1",
            (driver_id,),
        )
        bus = cursor.fetchone()
    except mysql.connector.Error:
        return None

    result = {
        "bus_id": None,
        "bus_number": None,
        "route_id": None,
        "route_name": None,
    }

    if bus:
        result["bus_id"] = bus["bus_id"]
        result["bus_number"] = bus["bus_number"]

    # Direct route assignment takes precedence over the bus-derived route.
    if direct_route_id:
        try:
            cursor.execute(
                "SELECT route_id, route_name FROM routes WHERE route_id = %s",
                (direct_route_id,),
            )
            direct = cursor.fetchone()
        except mysql.connector.Error:
            direct = None
        if direct:
            result["route_id"] = direct["route_id"]
            result["route_name"] = direct["route_name"]
        return result

    if bus and bus["bus_route_id"] is not None:
        result["route_id"] = bus["bus_route_id"]
        result["route_name"] = bus["bus_route_name"]
        return result

    # Legacy fallback: trips
    try:
        cursor.execute(
            "SELECT t.route_id, r.route_name "
            "FROM trips t "
            "JOIN routes r ON r.route_id = t.route_id "
            "WHERE t.driver_id = %s ORDER BY t.trip_id LIMIT 1",
            (driver_id,),
        )
        trip = cursor.fetchone()
    except mysql.connector.Error:
        trip = None
    if trip:
        result["route_id"] = trip["route_id"]
        result["route_name"] = trip["route_name"]
    return result


def _role_login(role):
    data = json_body()
    user_id = (data.get("id") or "").strip()
    pin = data.get("pin") or ""
    if not user_id or not pin:
        return error_response(f"{role} ID and PIN are required", 400)

    rate_error = _rate_limit(f"{role}_login", f"{_client_ip()}:{user_id.upper()}")
    if rate_error:
        return rate_error

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id, name, email, password, roll_no, role, account_status, "
            "contact_no, department, route_id, avatar "
            "FROM users WHERE role = %s",
            (role,),
        )
        users = cursor.fetchall()
    except mysql.connector.Error as err:
        cursor.close()
        db.close()
        return error_response("Database error: " + str(err), 500)

    user = None
    for candidate in users:
        if _user_matches_typed_id(candidate, user_id):
            user = candidate
            break

    if not user:
        cursor.close()
        db.close()
        return error_response(f"{role.capitalize()} ID not found", 404)

    if not check_password_hash(user["password"], pin):
        cursor.close()
        db.close()
        return error_response("Incorrect PIN", 401)

    _clear_rate_limit(f"{role}_login", f"{_client_ip()}:{user_id.upper()}")

    if user.get("account_status", "active") != "active":
        cursor.close()
        db.close()
        return error_response(
            "This account has been deactivated. Contact the administrator.", 403
        )

    # For drivers, include the assigned bus + route so the frontend can open
    # the correct dashboard without another request. A route assigned directly
    # to the driver (users.route_id, set from the Admin portal) takes
    # precedence; otherwise the route is derived from buses.driver_id ->
    # routes.bus_id, with trips as a fallback for legacy data.
    assigned = None
    if role == "driver":
        assigned = _resolve_driver_assignment(
            cursor, user["id"], user.get("route_id")
        )
    cursor.close()
    db.close()

    user.pop("password", None)
    if assigned:
        user["bus_id"] = assigned["bus_id"]
        user["bus_number"] = assigned["bus_number"]
        user["route_id"] = assigned["route_id"]
        user["route_name"] = assigned["route_name"]

    # Admin sessions: issue a short-lived bearer token used by the admin
    # portal CRUD endpoints. Tokens never include credentials.
    if role == "admin":
        token = secrets.token_urlsafe(32)
        ADMIN_TOKENS[token] = {"user_id": user["id"], "expires_at": time.time() + TOKEN_TTL_SECONDS}
        user["admin_token"] = token
        user["admin_session_expires_at"] = int(time.time() + TOKEN_TTL_SECONDS)
    # Student/faculty/driver sessions use the same token mechanism for the
    # notification endpoints (drivers send, recipients read/reply).
    token = secrets.token_urlsafe(32)
    USER_TOKENS[token] = {"user_id": user["id"], "expires_at": time.time() + TOKEN_TTL_SECONDS}
    user["session_token"] = token
    user["session_expires_at"] = int(time.time() + TOKEN_TTL_SECONDS)
    return jsonify(user), 200


@app.route("/api/auth/logout", methods=["POST"])
def logout():
    token = (request.headers.get("X-User-Token") or "").strip()
    if token:
        USER_TOKENS.pop(token, None)
    admin_token = (request.headers.get("X-Admin-Token") or "").strip()
    if admin_token:
        ADMIN_TOKENS.pop(admin_token, None)
    return jsonify({"success": True}), 200


@app.route("/api/auth/driver-login", methods=["POST"])
def driver_login():
    return _role_login("driver")


@app.route("/api/auth/admin-login", methods=["POST"])
def admin_login():
    return _role_login("admin")


@app.route("/api/auth/admin/status")
def admin_status():
    """Tell the frontend whether an admin account already exists so the
    admin portal can hide/disable the Sign Up option once registration is
    closed (single-admin rule)."""
    db = get_db_connection()
    cursor = db.cursor()
    try:
        cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'admin'")
        row = cursor.fetchone()
        admin_exists = bool(row and row[0] > 0)
    except mysql.connector.Error as err:
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    return jsonify({"admin_exists": admin_exists})


# ---------------------------------------------------------------------------
# Notifications / driver broadcasts + student / faculty replies
# ---------------------------------------------------------------------------
# One notifications row = one message delivered to one recipient. A driver
# broadcast to N recipients creates N rows sharing the same thread_id. A
# recipient's reply creates a new row addressed back to the original sender,
# linked via reply_to and the same thread_id, so the driver can reconstruct
# the whole conversation with role-labelled senders.
#
# All endpoints authenticate with X-User-Token (require_user) and re-check
# the user's role + account_status on the backend.

NOTIFICATION_AUDIENCES = ("students", "faculty", "everyone")


def _notif_snapshot(assigned):
    """Build the bus/route snapshot stored with each notification."""
    return {
        "bus_id": assigned.get("bus_id"),
        "bus_number": assigned.get("bus_number"),
        "route_id": assigned.get("route_id"),
        "route_name": assigned.get("route_name"),
    }


@app.route("/api/notifications/send", methods=["POST"])
@require_user(roles=["driver"])
def send_notification(user):
    """Driver broadcasts a message to the students and/or faculty on their
    assigned route. Recipients are resolved from the database by route_id so
    unrelated routes never receive the message."""
    data = json_body()
    message = (data.get("message") or "").strip()
    audience = (data.get("audience") or "students").strip().lower()
    if not message:
        return error_response("message is required", 400)
    if audience not in NOTIFICATION_AUDIENCES:
        return error_response("audience must be one of students, faculty, everyone", 400)

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        assigned = _resolve_driver_assignment(cursor, user["id"], user.get("route_id"))
        if not assigned or not assigned.get("route_id"):
            return error_response(
                "You must be assigned to a route before sending notifications", 400
            )

        snap = _notif_snapshot(assigned)
        route_id = snap["route_id"]
        route_name = snap["route_name"] or ("Route %s" % route_id)

        role_filter = ("student",)
        if audience == "faculty":
            role_filter = ("faculty",)
        elif audience == "everyone":
            role_filter = ("student", "faculty")

        placeholders = ",".join(["%s"] * len(role_filter))
        cursor.execute(
            "SELECT id, name, role FROM users "
            "WHERE role IN (%s) AND route_id = %%s AND account_status = 'active'"
            % placeholders,
            role_filter + (route_id,),
        )
        recipients = cursor.fetchall()

        cursor.execute("SELECT COALESCE(MAX(thread_id), 0) + 1 FROM notifications")
        thread_id = cursor.fetchone()["COALESCE(MAX(thread_id), 0) + 1"]

        for rec in recipients:
            cursor.execute(
                "INSERT INTO notifications "
                "(thread_id, sender_id, sender_role, recipient_id, recipient_role, "
                " message, bus_id, bus_number, route_id, route_name) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                (thread_id, user["id"], user["role"], rec["id"], rec["role"], message,
                 snap["bus_id"], snap["bus_number"], route_id, route_name),
            )
        db.commit()
        return jsonify({
            "thread_id": thread_id,
            "sent": len(recipients),
            "route_id": route_id,
            "route_name": route_name,
            "bus_id": snap["bus_id"],
            "bus_number": snap["bus_number"],
        }), 200
    except mysql.connector.Error as err:
        db.rollback()
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()


@app.route("/api/notifications", methods=["GET"])
@require_user()
def list_notifications(user):
    """Inbox for the authenticated user: every row addressed to them (driver
    broadcasts for students/faculty, replies for drivers)."""
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT n.notification_id, n.thread_id, n.sender_id, n.sender_role, "
            "n.recipient_id, n.recipient_role, n.message, n.bus_id, n.bus_number, "
            "n.route_id, n.route_name, n.is_read, n.reply_to, n.created_at, "
            "u.name AS sender_name "
            "FROM notifications n "
            "LEFT JOIN users u ON u.id = n.sender_id "
            "WHERE n.recipient_id = %s "
            "ORDER BY n.created_at DESC, n.notification_id DESC",
            (user["id"],),
        )
        rows = cursor.fetchall()
        cursor.execute(
            "SELECT COUNT(*) AS c FROM notifications "
            "WHERE recipient_id = %s AND is_read = 0",
            (user["id"],),
        )
        unread = cursor.fetchone()["c"]
    except mysql.connector.Error as err:
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    return jsonify({"notifications": rows, "unread_count": unread}), 200


@app.route("/api/notifications/read-all", methods=["POST"])
@require_user()
def mark_all_notifications_read(user):
    db = get_db_connection()
    cursor = db.cursor()
    try:
        cursor.execute(
            "UPDATE notifications SET is_read = 1 WHERE recipient_id = %s",
            (user["id"],),
        )
        db.commit()
    except mysql.connector.Error as err:
        db.rollback()
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    return jsonify({"ok": True}), 200


@app.route("/api/notifications/<int:notification_id>/read", methods=["POST"])
@require_user()
def mark_notification_read(user, notification_id):
    """Mark one of the caller's received rows as read. Only the recipient can
    mark a row read."""
    db = get_db_connection()
    cursor = db.cursor()
    try:
        cursor.execute(
            "UPDATE notifications SET is_read = 1 "
            "WHERE notification_id = %s AND recipient_id = %s",
            (notification_id, user["id"]),
        )
        db.commit()
    except mysql.connector.Error as err:
        db.rollback()
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    return jsonify({"ok": True}), 200


@app.route("/api/notifications/<int:notification_id>/reply", methods=["POST"])
@require_user()
def reply_notification(user, notification_id):
    """Reply to a message. The reply is delivered to the original sender and
    stays in the same thread, so the driver can read the whole conversation
    with role-labelled respondents."""
    data = json_body()
    message = (data.get("message") or "").strip()
    if not message:
        return error_response("message is required", 400)

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT notification_id, thread_id, sender_id, sender_role, "
            "bus_id, bus_number, route_id, route_name "
            "FROM notifications WHERE notification_id = %s",
            (notification_id,),
        )
        original = cursor.fetchone()
        if not original:
            return error_response("Notification not found", 404)

        # Only a participant of the thread may reply.
        cursor.execute(
            "SELECT COUNT(*) AS c FROM notifications "
            "WHERE thread_id = %s AND (sender_id = %s OR recipient_id = %s)",
            (original["thread_id"], user["id"], user["id"]),
        )
        if cursor.fetchone()["c"] == 0:
            return error_response("You are not part of this conversation", 403)

        cursor.execute(
            "INSERT INTO notifications "
            "(thread_id, sender_id, sender_role, recipient_id, recipient_role, "
            " message, bus_id, bus_number, route_id, route_name, reply_to) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (original["thread_id"], user["id"], user["role"],
             original["sender_id"], original["sender_role"], message,
             original["bus_id"], original["bus_number"],
             original["route_id"], original["route_name"],
             original["notification_id"]),
        )
        db.commit()
        return jsonify({"ok": True, "thread_id": original["thread_id"]}), 200
    except mysql.connector.Error as err:
        db.rollback()
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()


@app.route("/api/notifications/thread/<int:thread_id>", methods=["GET"])
@require_user()
def get_notification_thread(user, thread_id):
    """Full conversation for a thread. Only participants (sender or recipient
    of any row) may read it."""
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT n.notification_id, n.thread_id, n.sender_id, n.sender_role, "
            "n.recipient_id, n.recipient_role, n.message, n.bus_id, n.bus_number, "
            "n.route_id, n.route_name, n.is_read, n.reply_to, n.created_at, "
            "u.name AS sender_name "
            "FROM notifications n "
            "LEFT JOIN users u ON u.id = n.sender_id "
            "WHERE n.thread_id = %s "
            "ORDER BY n.created_at ASC, n.notification_id ASC",
            (thread_id,),
        )
        rows = cursor.fetchall()
    except mysql.connector.Error as err:
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    if not rows:
        return error_response("Thread not found", 404)
    allowed = any(
        row["sender_id"] == user["id"] or row["recipient_id"] == user["id"]
        for row in rows
    )
    if not allowed:
        return error_response("You are not part of this conversation", 403)
    return jsonify({"thread_id": thread_id, "messages": rows}), 200


@app.route("/api/notifications", methods=["DELETE"])
@require_user()
def clear_notifications(user):
    """Clear the caller's inbox (removes only rows addressed to them)."""
    db = get_db_connection()
    cursor = db.cursor()
    try:
        cursor.execute("DELETE FROM notifications WHERE recipient_id = %s", (user["id"],))
        db.commit()
    except mysql.connector.Error as err:
        db.rollback()
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    return jsonify({"ok": True}), 200


# ---------------------------------------------------------------------------
# Users / profile
# ---------------------------------------------------------------------------

@app.route("/api/profile/me")
@require_user()
def get_my_profile(user):
    return _get_profile_by_id(user["id"])


def _get_profile_by_id(user_id):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id, name, email, roll_no, role, contact_no, branch, college, "
            "department, pickup_point, pass_issue_date, pass_valid_upto, "
            "fee_receipt_no, fee_date, fee_place, relation_type, relation_value, "
            "route_id, avatar, created_at, designation, dob, gender, address, "
            "blood_group, emergency_contact FROM users WHERE id = %s",
            (user_id,),
        )
        user = cursor.fetchone()
    except mysql.connector.Error as err:
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()

    if not user:
        return error_response("User not found", 404)

    return jsonify(user), 200


@app.route("/api/profile/<int:user_id>")
def get_profile(user_id):
    user, err = _user_identity()
    if not err and user["id"] == user_id:
        return _get_profile_by_id(user_id)
    admin, admin_err = _admin_identity()
    if not admin_err:
        return _get_profile_by_id(user_id)
    return error_response("Authentication required", 401)


# ---------------------------------------------------------------------------
# Buses
# ---------------------------------------------------------------------------

def bus_to_dict(row):
    return {
        "bus_id": row["bus_id"],
        "bus_number": row["bus_number"],
        "driver_name": row["driver_name"],
        "driver_id": row["driver_id"],
        "capacity": row["capacity"],
        "status": row["status"],
        "created_at": row["created_at"],
    }


@app.route("/api/buses")
def list_buses():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT bus_id, bus_number, driver_name, driver_id, capacity, status, created_at "
            "FROM buses ORDER BY bus_id"
        )
        buses = [bus_to_dict(r) for r in cursor.fetchall()]
    except mysql.connector.Error as err:
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()

    return jsonify(buses), 200


@app.route("/api/buses/<int:bus_id>")
def get_bus_details(bus_id):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT bus_id, bus_number, driver_name, driver_id, capacity, status, created_at "
            "FROM buses WHERE bus_id = %s",
            (bus_id,),
        )
        row = cursor.fetchone()
    except mysql.connector.Error as err:
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()

    if not row:
        return error_response("Bus not found", 404)

    return jsonify(bus_to_dict(row)), 200


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

def _buses_for_route(route_id):
    """Assigned buses for a route, each with its ordered bus_stations.

    Prefers the route_buses junction table (BUS Routes → Assigned Bus →
    Ordered Stations model). Falls back to routes.bus_id for legacy routes.
    Returns [] if the new tables are missing or an error occurs.
    """
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT b.bus_id, b.bus_number, b.driver_id, b.status, "
            "COALESCE(u.name, b.driver_name) AS driver_name "
            "FROM route_buses rb "
            "JOIN buses b ON b.bus_id = rb.bus_id "
            "LEFT JOIN users u ON u.id = b.driver_id "
            "WHERE rb.route_id = %s ORDER BY b.bus_id",
            (route_id,),
        )
        buses = cursor.fetchall()
        if not buses:
            cursor.execute(
                "SELECT b.bus_id, b.bus_number, b.driver_id, b.status, "
                "COALESCE(u.name, b.driver_name) AS driver_name "
                "FROM routes r JOIN buses b ON b.bus_id = r.bus_id "
                "LEFT JOIN users u ON u.id = b.driver_id "
                "WHERE r.route_id = %s ORDER BY b.bus_id",
                (route_id,),
            )
            buses = cursor.fetchall()
        for bus in buses:
            cursor.execute(
                "SELECT station_id, station_name, latitude, longitude, stop_order, estimated_time "
                "FROM bus_stations WHERE bus_id = %s ORDER BY stop_order",
                (bus["bus_id"],),
            )
            stations = cursor.fetchall()
            for station in stations:
                station["latitude"] = float(station["latitude"])
                station["longitude"] = float(station["longitude"])
                if station["estimated_time"]:
                    station["estimated_time"] = str(station["estimated_time"])
            bus["stations"] = stations
    except mysql.connector.Error:
        buses = []
    finally:
        cursor.close()
        db.close()
    return buses


@app.route("/api/routes")
def list_routes():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT r.route_id, r.route_name, r.route_code, r.bus_id, r.status, "
            "r.start_location, r.end_location, r.geometry, r.updated_at, r.created_at, "
            "COUNT(s.stop_id) AS stop_count "
            "FROM routes r LEFT JOIN stops s ON s.route_id = r.route_id "
            "GROUP BY r.route_id, r.route_name, r.route_code, r.bus_id, r.status, "
            "r.start_location, r.end_location, r.geometry, r.updated_at, r.created_at "
            "ORDER BY r.route_id"
        )
        routes = []
        for r in cursor.fetchall():
            route = {
                "route_id": r["route_id"],
                "route_name": r["route_name"],
                "route_code": r["route_code"],
                "bus_id": r["bus_id"],
                "status": r["status"],
                "start_location": r["start_location"],
                "end_location": r["end_location"],
                "updated_at": r["updated_at"],
                "created_at": r["created_at"],
                "stop_count": r["stop_count"],
            }
            if r["geometry"]:
                try:
                    route["geometry"] = json.loads(r["geometry"])
                except (ValueError, TypeError):
                    route["geometry"] = None
            else:
                route["geometry"] = None
            routes.append(route)
    except mysql.connector.Error as err:
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()

    for route in routes:
        route["buses"] = _buses_for_route(route["route_id"])

    return jsonify(routes), 200


@app.route("/api/routes/<int:route_id>/stops")
def get_route_stops(route_id):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT route_id, route_name, geometry FROM routes WHERE route_id = %s",
            (route_id,),
        )
        route = cursor.fetchone()
        if not route:
            return error_response("Route not found", 404)

        cursor.execute(
            "SELECT stop_id, stop_name, latitude, longitude, stop_order, "
            "estimated_time, description "
            "FROM stops WHERE route_id = %s ORDER BY stop_order",
            (route_id,),
        )
        stops = cursor.fetchall()
        for stop in stops:
            stop["latitude"] = float(stop["latitude"])
            stop["longitude"] = float(stop["longitude"])
            if stop["estimated_time"]:
                stop["estimated_time"] = str(stop["estimated_time"])
    except mysql.connector.Error as err:
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()

    geometry = None
    if route.get("geometry"):
        try:
            geometry = json.loads(route["geometry"])
        except (ValueError, TypeError):
            geometry = None

    return jsonify(
        {
            "route_id": route["route_id"],
            "route_name": route["route_name"],
            "geometry": geometry,
            "stops": stops,
        }
    ), 200


# ---------------------------------------------------------------------------
# BUS Routes hierarchy (BUS Routes → Assigned Bus → Ordered Stations)
# ---------------------------------------------------------------------------

@app.route("/api/buses/<int:bus_id>/stations")
def get_bus_stations(bus_id):
    """Ordered stations served by a single assigned bus."""
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT bus_id, bus_number FROM buses WHERE bus_id = %s", (bus_id,)
        )
        bus = cursor.fetchone()
        if not bus:
            return error_response("Bus not found", 404)
        cursor.execute(
            "SELECT station_id, station_name, latitude, longitude, stop_order, estimated_time "
            "FROM bus_stations WHERE bus_id = %s ORDER BY stop_order",
            (bus_id,),
        )
        stations = cursor.fetchall()
        for station in stations:
            station["latitude"] = float(station["latitude"])
            station["longitude"] = float(station["longitude"])
            if station["estimated_time"]:
                station["estimated_time"] = str(station["estimated_time"])
    except mysql.connector.Error as err:
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()

    return jsonify(
        {
            "bus_id": bus["bus_id"],
            "bus_number": bus["bus_number"],
            "stations": stations,
        }
    ), 200


@app.route("/api/stations/<int:station_id>")
def get_station(station_id):
    """A single bus station (used by the station detail/map view)."""
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT station_id, route_id, bus_id, station_name, latitude, longitude, "
            "stop_order, estimated_time FROM bus_stations WHERE station_id = %s",
            (station_id,),
        )
        station = cursor.fetchone()
    except mysql.connector.Error as err:
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()

    if not station:
        return error_response("Station not found", 404)

    station["latitude"] = float(station["latitude"])
    station["longitude"] = float(station["longitude"])
    if station["estimated_time"]:
        station["estimated_time"] = str(station["estimated_time"])
    return jsonify(station), 200


# ---------------------------------------------------------------------------
# Trips
# ---------------------------------------------------------------------------

@app.route("/api/trips")
def list_trips():
    route_id = request.args.get("route_id", type=int)
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        query = (
            "SELECT t.trip_id, t.route_id, t.bus_id, t.driver_id, "
            "t.departure_time, t.arrival_time, t.status, "
            "b.bus_number, u.name AS driver_name "
            "FROM trips t "
            "LEFT JOIN buses b ON b.bus_id = t.bus_id "
            "LEFT JOIN users u ON u.id = t.driver_id"
        )
        params = ()
        if route_id is not None:
            query += " WHERE t.route_id = %s"
            params = (route_id,)
        query += " ORDER BY t.departure_time, t.trip_id"
        cursor.execute(query, params)
        trips = []
        for row in cursor.fetchall():
            row["departure_time"] = str(row["departure_time"])
            row["arrival_time"] = str(row["arrival_time"])
            trips.append(row)
    except mysql.connector.Error as err:
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()

    return jsonify(trips), 200


# ---------------------------------------------------------------------------
# Latest bus location
# ---------------------------------------------------------------------------

@app.route("/api/buses/<int:bus_id>/location", methods=["POST"])
@require_user(["driver"])
def update_bus_location(user, bus_id):
    data = json_body()
    try:
        latitude = float(data.get("latitude"))
        longitude = float(data.get("longitude"))
        speed = data.get("speed")
        heading = data.get("heading")
        accuracy = data.get("accuracy")
        speed = None if speed in (None, "") else float(speed)
        heading = None if heading in (None, "") else float(heading)
        accuracy = None if accuracy in (None, "") else float(accuracy)
    except (TypeError, ValueError):
        return error_response("latitude and longitude must be valid numbers", 400)

    if not (-90 <= latitude <= 90 and -180 <= longitude <= 180):
        return error_response("Invalid latitude or longitude", 400)
    if speed is not None and not (0 <= speed <= 250):
        return error_response("Invalid speed", 400)
    if heading is not None and not (0 <= heading <= 360):
        return error_response("Invalid heading", 400)

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT bus_id, driver_id, status FROM buses WHERE bus_id = %s", (bus_id,))
        bus = cursor.fetchone()
        if not bus:
            return error_response("Bus not found", 404)
        if bus.get("driver_id") != user["id"]:
            return error_response("This driver is not assigned to this bus", 403)

        cursor.execute(
            "INSERT INTO bus_locations (bus_id, latitude, longitude, speed, heading) VALUES (%s, %s, %s, %s, %s)",
            (bus_id, latitude, longitude, speed, heading),
        )
        db.commit()
        location_id = cursor.lastrowid
    except mysql.connector.Error as err:
        db.rollback()
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()

    return jsonify({
        "success": True,
        "location_id": location_id,
        "bus_id": bus_id,
        "latitude": latitude,
        "longitude": longitude,
        "speed": speed,
        "heading": heading,
        "accuracy": accuracy,
    }), 201


@app.route("/api/buses/<int:bus_id>/location")
def get_latest_bus_location(bus_id):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT bus_id FROM buses WHERE bus_id = %s", (bus_id,))
        if not cursor.fetchone():
            return error_response("Bus not found", 404)

        cursor.execute(
            "SELECT location_id, bus_id, latitude, longitude, speed, heading, updated_at "
            "FROM bus_locations WHERE bus_id = %s ORDER BY updated_at DESC, location_id DESC LIMIT 1",
            (bus_id,),
        )
        location = cursor.fetchone()
    except mysql.connector.Error as err:
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()

    if not location:
        return error_response("No location data for this bus", 404)

    return jsonify(location), 200


# ════════════════════════════════════════════════════════════════════
# ADMIN PORTAL — centralized management API
# Every route below requires a valid admin bearer token (require_admin).
# Passwords are never returned; only a hashed password is ever written.
# ════════════════════════════════════════════════════════════════════

USER_BASE_COLS = (
    "u.id, u.name, u.email, u.roll_no, u.role, u.account_status, u.contact_no, "
    "u.branch, u.college, u.department, u.pickup_point, u.pass_issue_date, "
    "u.pass_valid_upto, u.fee_receipt_no, u.fee_date, u.fee_place, "
    "u.relation_type, u.relation_value, u.route_id, u.designation, "
    "u.dob, u.gender, u.address, u.blood_group, u.emergency_contact, u.avatar, u.created_at"
)

# Whitelist of profile columns an admin may update via the portal.
ADMIN_EDITABLE = {
    "name", "email", "contact_no", "branch", "college", "department",
    "pickup_point", "pass_issue_date", "pass_valid_upto", "fee_receipt_no",
    "fee_date", "fee_place", "route_id", "designation", "dob", "gender",
    "address", "blood_group", "emergency_contact", "relation_type",
    "relation_value",
}


def _public_user(row):
    """Strip the password hash from a users row before sending it out."""
    if not row:
        return None
    row.pop("password", None)
    return row


def _parse_date_or_none(value):
    if value in (None, ""):
        return None
    return value


def _update_user_fields(db, cursor, user_id, payload, role):
    """Shared field-update logic for students/faculty/drivers.

    Validates email/roll_no uniqueness, route_id existence and role.
    Returns (user_row, None) or (None, error_response).
    """
    updates = []
    params = []

    for field in ADMIN_EDITABLE:
        if field not in payload:
            continue
        value = payload[field]
        if field == "route_id":
            # route_id is nullable: an explicit null/empty string unassigns
            # the route; a number must reference an existing route.
            try:
                value = int(value) if value not in ("", None) else None
            except (TypeError, ValueError):
                return None, error_response("route_id must be a number", 400)
            if value is not None:
                cursor.execute(
                    "SELECT route_id FROM routes WHERE route_id = %s", (value,)
                )
                if not cursor.fetchone():
                    return None, error_response("Assigned route does not exist", 400)
            updates.append("route_id")
            params.append(value)
            continue
        if value is None:
            continue
        if field == "email":
            value = str(value).strip()
            if not value or "@" not in value:
                return None, error_response("A valid email is required", 400)
        elif field in ("pass_issue_date", "pass_valid_upto", "dob", "fee_date"):
            value = _parse_date_or_none(value)
        else:
            value = str(value).strip()
        updates.append(field)
        params.append(value)

    if "password" in payload and payload["password"]:
        password = str(payload["password"])
        if len(password) < 4:
            return None, error_response("Password must be at least 4 characters", 400)
        updates.append("password")
        params.append(generate_password_hash(password))

    if "roll_no" in payload and payload["roll_no"] is not None:
        roll_no = str(payload["roll_no"]).strip()
        if roll_no:
            cursor.execute(
                "SELECT id FROM users WHERE roll_no = %s AND id <> %s",
                (roll_no, user_id),
            )
            if cursor.fetchone():
                return None, error_response("That ID is already in use", 409)
            updates.append("roll_no")
            params.append(roll_no)

    if not updates:
        return None, error_response("No valid fields to update", 400)

    set_clause = ", ".join("`%s` = %%s" % col for col in updates)
    query = "UPDATE users SET " + set_clause + " WHERE id = %s"
    params.append(user_id)
    cursor.execute(query, params)

    cursor.execute(
        "SELECT " + USER_BASE_COLS + " FROM users u WHERE u.id = %s AND u.role = %s",
        (user_id, role),
    )
    return _public_user(cursor.fetchone()), None


def _status_payload():
    data = json_body()
    status = (data.get("status") or "").strip().lower()
    if status not in ("active", "inactive"):
        return None, error_response("Status must be 'active' or 'inactive'", 400)
    return status, None


def _user_filter_args():
    """Build a WHERE clause for the admin member lists.

    Returns (where_list, params) where 'u.role = %s' is NOT included; the
    caller adds the role condition first so placeholder order stays correct.
    """
    search = (request.args.get("search") or "").strip()
    status = (request.args.get("status") or "").strip().lower()
    route_id = request.args.get("route_id", type=int)
    department = (request.args.get("department") or "").strip()
    where = []
    params = []
    if status in ("active", "inactive"):
        where.append("u.account_status = %s")
        params.append(status)
    if route_id is not None:
        where.append("u.route_id = %s")
        params.append(route_id)
    if department:
        where.append("(u.branch = %s OR u.department = %s)")
        params.extend([department, department])
    if search:
        like = "%" + search + "%"
        where.append(
            "(u.name LIKE %s OR u.email LIKE %s OR u.roll_no LIKE %s "
            "OR u.contact_no LIKE %s)"
        )
        params.extend([like, like, like, like])
    return where, params


# ---------------------------------------------------------------------------
# Admin overview stats
# ---------------------------------------------------------------------------

@app.route("/api/admin/stats")
@require_admin
def admin_stats(_admin):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT role, account_status, COUNT(*) AS n FROM users GROUP BY role, account_status"
        )
        counts = {}
        for row in cursor.fetchall():
            key = row["role"]
            counts.setdefault(key, {"total": 0, "active": 0, "inactive": 0})
            counts[key]["total"] += row["n"]
            counts[key][row["account_status"]] += row["n"]
        cursor.execute("SELECT COUNT(*) AS n FROM routes")
        route_total = cursor.fetchone()["n"]
        cursor.execute("SELECT COUNT(*) AS n FROM buses")
        bus_total = cursor.fetchone()["n"]
        cursor.execute("SELECT COUNT(*) AS n FROM routes WHERE status = 'active'")
        route_active = cursor.fetchone()["n"]
        cursor.execute("SELECT COUNT(*) AS n FROM buses WHERE status = 'active'")
        bus_active = cursor.fetchone()["n"]
    except mysql.connector.Error as err:
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    return jsonify(
        {
            "students": counts.get("student", {"total": 0, "active": 0, "inactive": 0}),
            "faculty": counts.get("faculty", {"total": 0, "active": 0, "inactive": 0}),
            "drivers": counts.get("driver", {"total": 0, "active": 0, "inactive": 0}),
            "routes": {"total": route_total, "active": route_active},
            "buses": {"total": bus_total, "active": bus_active},
        }
    ), 200


# ---------------------------------------------------------------------------
# Students
# ---------------------------------------------------------------------------

def _create_user_payload(role):
    """Validate and prepare a user INSERT for an admin-created account.

    Returns (sql, params, display_roll_no) or (None, None, error_response).
    Requires: name, roll_no (unique), email (unique), password.
    """
    payload = json_body()
    name = (payload.get("name") or "").strip()
    roll_no = (payload.get("roll_no") or "").strip()
    email = (payload.get("email") or "").strip()
    password = payload.get("password") or ""

    if not name:
        return None, None, error_response("Name is required", 400)
    if not roll_no:
        return None, None, error_response("ID / roll number is required", 400)
    if not email or "@" not in email:
        return None, None, error_response("A valid email is required", 400)
    if len(password) < 4:
        return None, None, error_response("Password must be at least 4 characters", 400)

    cols = ["name", "email", "password", "roll_no", "role", "account_status"]
    params = [
        name,
        email,
        generate_password_hash(password),
        roll_no,
        role,
        "active",
    ]

    optional = {
        "contact_no": "contact_no", "branch": "branch", "college": "college",
        "department": "department", "pickup_point": "pickup_point",
        "pass_issue_date": "pass_issue_date", "pass_valid_upto": "pass_valid_upto",
        "fee_receipt_no": "fee_receipt_no", "fee_date": "fee_date",
        "fee_place": "fee_place", "route_id": "route_id",
        "designation": "designation", "dob": "dob", "gender": "gender",
        "address": "address", "blood_group": "blood_group",
        "emergency_contact": "emergency_contact",
    }
    for field, col in optional.items():
        if field in payload and payload[field] not in (None, ""):
            cols.append(col)
            params.append(str(payload[field]).strip())

    placeholders = ", ".join(["%s"] * len(cols))
    sql = "INSERT INTO users (" + ", ".join("`" + c + "`" for c in cols) + \
        ") VALUES (" + placeholders + ")"
    return sql, params, roll_no


@app.route("/api/admin/students", methods=["POST"])
@require_admin
def admin_create_student(_admin):
    sql, params, roll_no = _create_user_payload("student")
    if not sql:
        return roll_no
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(sql, params)
        db.commit()
        user_id = cursor.lastrowid
        cursor.execute(
            "SELECT " + USER_BASE_COLS + " FROM users u WHERE u.id = %s",
            (user_id,),
        )
        user = _public_user(cursor.fetchone())
    except mysql.connector.Error as err:
        db.rollback()
        if err.errno == 1062:
            return error_response("Email or ID already in use", 409)
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    return jsonify(user), 201


@app.route("/api/admin/faculty", methods=["POST"])
@require_admin
def admin_create_faculty(_admin):
    sql, params, roll_no = _create_user_payload("faculty")
    if not sql:
        return roll_no
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(sql, params)
        db.commit()
        user_id = cursor.lastrowid
        cursor.execute(
            "SELECT " + USER_BASE_COLS + " FROM users u WHERE u.id = %s",
            (user_id,),
        )
        user = _public_user(cursor.fetchone())
    except mysql.connector.Error as err:
        db.rollback()
        if err.errno == 1062:
            return error_response("Email or ID already in use", 409)
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    return jsonify(user), 201


@app.route("/api/admin/drivers", methods=["POST"])
@require_admin
def admin_create_driver(_admin):
    sql, params, roll_no = _create_user_payload("driver")
    if not sql:
        return roll_no
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(sql, params)
        db.commit()
        user_id = cursor.lastrowid
        cursor.execute(
            "SELECT " + USER_BASE_COLS + " FROM users u WHERE u.id = %s",
            (user_id,),
        )
        user = _public_user(cursor.fetchone())
    except mysql.connector.Error as err:
        db.rollback()
        if err.errno == 1062:
            return error_response("Email or ID already in use", 409)
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    return jsonify(user), 201


@app.route("/api/admin/students")
@require_admin
def admin_list_students(_admin):
    where, params = _user_filter_args()
    where.insert(0, "u.role = %s")
    params.insert(0, "student")
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT " + USER_BASE_COLS + ", r.route_name, b.bus_number AS bus_number "
            "FROM users u "
            "LEFT JOIN routes r ON r.route_id = u.route_id "
            "LEFT JOIN buses b ON b.bus_id = r.bus_id "
            "WHERE " + " AND ".join(where) + " ORDER BY u.name LIMIT 500",
            params,
        )
        users = [_public_user(row) for row in cursor.fetchall()]
    except mysql.connector.Error as err:
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    return jsonify(users), 200


@app.route("/api/admin/students/<int:user_id>", methods=["GET"])
@require_admin
def admin_get_student(_admin, user_id):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT " + USER_BASE_COLS + ", r.route_name, b.bus_number AS bus_number "
            "FROM users u "
            "LEFT JOIN routes r ON r.route_id = u.route_id "
            "LEFT JOIN buses b ON b.bus_id = r.bus_id "
            "WHERE u.id = %s AND role = 'student'",
            (user_id,),
        )
        user = cursor.fetchone()
    except mysql.connector.Error as err:
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    if not user:
        return error_response("Student not found", 404)
    return jsonify(_public_user(user)), 200


@app.route("/api/admin/students/<int:user_id>", methods=["PUT"])
@require_admin
def admin_update_student(_admin, user_id):
    payload = json_body()
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id FROM users u WHERE u.id = %s AND u.role = 'student'", (user_id,)
        )
        if not cursor.fetchone():
            return error_response("Student not found", 404)
        user, err = _update_user_fields(db, cursor, user_id, payload, "student")
        if err:
            return err
        db.commit()
    except mysql.connector.Error as err:
        db.rollback()
        if err.errno == 1062:
            return error_response("Email or ID already in use", 409)
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    return jsonify(user), 200


@app.route("/api/admin/students/<int:user_id>/status", methods=["POST"])
@require_admin
def admin_student_status(_admin, user_id):
    status, err = _status_payload()
    if err:
        return err
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id FROM users WHERE id = %s AND role = 'student'", (user_id,)
        )
        if not cursor.fetchone():
            return error_response("Student not found", 404)
        cursor.execute(
            "UPDATE users SET account_status = %s WHERE id = %s AND role = 'student'",
            (status, user_id),
        )
        db.commit()
    except mysql.connector.Error as err:
        db.rollback()
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    return jsonify({"id": user_id, "account_status": status}), 200


@app.route("/api/admin/students/<int:user_id>", methods=["DELETE"])
@require_admin
def admin_delete_student(_admin, user_id):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "DELETE FROM users u WHERE u.id = %s AND u.role = 'student'", (user_id,)
        )
        if cursor.rowcount == 0:
            return error_response("Student not found", 404)
        db.commit()
    except mysql.connector.Error as err:
        db.rollback()
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    return jsonify({"message": "Student deleted", "id": user_id}), 200


# ---------------------------------------------------------------------------
# Faculty
# ---------------------------------------------------------------------------

@app.route("/api/admin/faculty")
@require_admin
def admin_list_faculty(_admin):
    where, params = _user_filter_args()
    where.insert(0, "u.role = %s")
    params.insert(0, "faculty")
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT " + USER_BASE_COLS + ", r.route_name, b.bus_number AS bus_number "
            "FROM users u "
            "LEFT JOIN routes r ON r.route_id = u.route_id "
            "LEFT JOIN buses b ON b.bus_id = r.bus_id "
            "WHERE " + " AND ".join(where) + " ORDER BY u.name LIMIT 500",
            params,
        )
        users = [_public_user(row) for row in cursor.fetchall()]
    except mysql.connector.Error as err:
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    return jsonify(users), 200


@app.route("/api/admin/faculty/<int:user_id>", methods=["GET"])
@require_admin
def admin_get_faculty(_admin, user_id):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT " + USER_BASE_COLS + ", r.route_name, b.bus_number AS bus_number "
            "FROM users u "
            "LEFT JOIN routes r ON r.route_id = u.route_id "
            "LEFT JOIN buses b ON b.bus_id = r.bus_id "
            "WHERE u.id = %s AND role = 'faculty'",
            (user_id,),
        )
        user = cursor.fetchone()
    except mysql.connector.Error as err:
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    if not user:
        return error_response("Faculty member not found", 404)
    return jsonify(_public_user(user)), 200


@app.route("/api/admin/faculty/<int:user_id>", methods=["PUT"])
@require_admin
def admin_update_faculty(_admin, user_id):
    payload = json_body()
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id FROM users u WHERE u.id = %s AND u.role = 'faculty'", (user_id,)
        )
        if not cursor.fetchone():
            return error_response("Faculty member not found", 404)
        user, err = _update_user_fields(db, cursor, user_id, payload, "faculty")
        if err:
            return err
        db.commit()
    except mysql.connector.Error as err:
        db.rollback()
        if err.errno == 1062:
            return error_response("Email or ID already in use", 409)
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    return jsonify(user), 200


@app.route("/api/admin/faculty/<int:user_id>/status", methods=["POST"])
@require_admin
def admin_faculty_status(_admin, user_id):
    status, err = _status_payload()
    if err:
        return err
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id FROM users WHERE id = %s AND role = 'faculty'", (user_id,)
        )
        if not cursor.fetchone():
            return error_response("Faculty member not found", 404)
        cursor.execute(
            "UPDATE users SET account_status = %s WHERE id = %s AND role = 'faculty'",
            (status, user_id),
        )
        db.commit()
    except mysql.connector.Error as err:
        db.rollback()
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    return jsonify({"id": user_id, "account_status": status}), 200


@app.route("/api/admin/faculty/<int:user_id>", methods=["DELETE"])
@require_admin
def admin_delete_faculty(_admin, user_id):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "DELETE FROM users u WHERE u.id = %s AND u.role = 'faculty'", (user_id,)
        )
        if cursor.rowcount == 0:
            return error_response("Faculty member not found", 404)
        db.commit()
    except mysql.connector.Error as err:
        db.rollback()
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    return jsonify({"message": "Faculty member deleted", "id": user_id}), 200


# ---------------------------------------------------------------------------
# Drivers
# ---------------------------------------------------------------------------

@app.route("/api/admin/drivers")
@require_admin
def admin_list_drivers(_admin):
    where, params = _user_filter_args()
    where.insert(0, "u.role = %s")
    params.insert(0, "driver")
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT " + USER_BASE_COLS + ", "
            "COALESCE(r2.route_name, r.route_name) AS route_name, "
            "b.bus_id AS assigned_bus_id, b.bus_number AS assigned_bus_number "
            "FROM users u "
            "LEFT JOIN routes r2 ON r2.route_id = u.route_id "
            "LEFT JOIN buses b ON b.driver_id = u.id "
            "LEFT JOIN routes r ON r.bus_id = b.bus_id "
            "WHERE " + " AND ".join(where) + " ORDER BY u.name LIMIT 500",
            params,
        )
        users = [_public_user(row) for row in cursor.fetchall()]
    except mysql.connector.Error as err:
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    return jsonify(users), 200


@app.route("/api/admin/drivers/<int:user_id>", methods=["GET"])
@require_admin
def admin_get_driver(_admin, user_id):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT " + USER_BASE_COLS + ", "
            "COALESCE(r2.route_name, r.route_name) AS route_name, "
            "b.bus_id AS assigned_bus_id, b.bus_number AS assigned_bus_number "
            "FROM users u "
            "LEFT JOIN routes r2 ON r2.route_id = u.route_id "
            "LEFT JOIN buses b ON b.driver_id = u.id "
            "LEFT JOIN routes r ON r.bus_id = b.bus_id "
            "WHERE u.id = %s AND role = 'driver'",
            (user_id,),
        )
        user = cursor.fetchone()
    except mysql.connector.Error as err:
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    if not user:
        return error_response("Driver not found", 404)
    return jsonify(_public_user(user)), 200


@app.route("/api/admin/drivers/<int:user_id>", methods=["PUT"])
@require_admin
def admin_update_driver(_admin, user_id):
    payload = json_body()
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id FROM users u WHERE u.id = %s AND u.role = 'driver'", (user_id,)
        )
        if not cursor.fetchone():
            return error_response("Driver not found", 404)
        user, err = _update_user_fields(db, cursor, user_id, payload, "driver")
        if err:
            return err
        db.commit()
    except mysql.connector.Error as err:
        db.rollback()
        if err.errno == 1062:
            return error_response("Email or ID already in use", 409)
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    return jsonify(user), 200


@app.route("/api/admin/drivers/<int:user_id>/bus", methods=["PUT"])
@require_admin
def admin_assign_driver_bus(_admin, user_id):
    """Assign a bus to a driver (or unassign with bus_id = null).

    A bus can have only one driver and a driver only one bus, so the
    assignment is made conflict-free: the target bus is first released from
    any other driver and the driver from any other bus.
    """
    payload = json_body()
    bus_id = payload.get("bus_id")
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id FROM users u WHERE u.id = %s AND u.role = 'driver'", (user_id,)
        )
        if not cursor.fetchone():
            return error_response("Driver not found", 404)

        if bus_id in (None, "", 0):
            cursor.execute("UPDATE buses SET driver_id = NULL WHERE driver_id = %s", (user_id,))
            db.commit()
            return jsonify({"message": "Driver unassigned", "bus_id": None}), 200

        bus_id = int(bus_id)
        cursor.execute("SELECT bus_id, status FROM buses WHERE bus_id = %s", (bus_id,))
        bus = cursor.fetchone()
        if not bus:
            return error_response("Bus not found", 404)

        cursor.execute("UPDATE buses SET driver_id = NULL WHERE driver_id = %s", (user_id,))
        cursor.execute("UPDATE buses SET driver_id = NULL WHERE bus_id = %s", (bus_id,))
        cursor.execute("UPDATE buses SET driver_id = %s WHERE bus_id = %s", (user_id, bus_id))
        db.commit()
    except mysql.connector.Error as err:
        db.rollback()
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    return jsonify({"message": "Bus assigned", "driver_id": user_id, "bus_id": bus_id}), 200


@app.route("/api/admin/drivers/<int:user_id>/status", methods=["POST"])
@require_admin
def admin_driver_status(_admin, user_id):
    status, err = _status_payload()
    if err:
        return err
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id FROM users WHERE id = %s AND role = 'driver'", (user_id,)
        )
        if not cursor.fetchone():
            return error_response("Driver not found", 404)
        cursor.execute(
            "UPDATE users SET account_status = %s WHERE id = %s AND role = 'driver'",
            (status, user_id),
        )
        db.commit()
    except mysql.connector.Error as err:
        db.rollback()
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    return jsonify({"id": user_id, "account_status": status}), 200


@app.route("/api/admin/drivers/<int:user_id>", methods=["DELETE"])
@require_admin
def admin_delete_driver(_admin, user_id):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id FROM users u WHERE u.id = %s AND u.role = 'driver'", (user_id,)
        )
        if not cursor.fetchone():
            return error_response("Driver not found", 404)
        # Release bus + trip references so the FK constraints stay intact.
        cursor.execute("UPDATE buses SET driver_id = NULL WHERE driver_id = %s", (user_id,))
        cursor.execute("UPDATE trips SET driver_id = NULL WHERE driver_id = %s", (user_id,))
        cursor.execute("DELETE FROM users u WHERE u.id = %s AND u.role = 'driver'", (user_id,))
        db.commit()
    except mysql.connector.Error as err:
        db.rollback()
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    return jsonify({"message": "Driver deleted", "id": user_id}), 200


# ---------------------------------------------------------------------------
# Routes & Stops
# ---------------------------------------------------------------------------

@app.route("/api/admin/routes")
@require_admin
def admin_list_routes(_admin):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT r.route_id, r.route_code, r.route_name, r.description, "
            "r.start_location, r.end_location, r.status, r.geometry, r.updated_at, "
            "r.bus_id, b.bus_number, COUNT(s.stop_id) AS stop_count "
            "FROM routes r "
            "LEFT JOIN buses b ON b.bus_id = r.bus_id "
            "LEFT JOIN stops s ON s.route_id = r.route_id "
            "GROUP BY r.route_id, r.route_code, r.route_name, r.description, "
            "r.start_location, r.end_location, r.status, r.geometry, r.updated_at, "
            "r.bus_id, b.bus_number ORDER BY r.route_id"
        )
        routes = []
        for row in cursor.fetchall():
            route = dict(row)
            if route.get("geometry"):
                try:
                    route["geometry"] = json.loads(route["geometry"])
                except (ValueError, TypeError):
                    route["geometry"] = None
            else:
                route["geometry"] = None
            routes.append(route)
    except mysql.connector.Error as err:
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    return jsonify(routes), 200


@app.route("/api/admin/routes/<int:route_id>", methods=["GET"])
@require_admin
def admin_get_route(_admin, route_id):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT r.route_id, r.route_code, r.route_name, r.description, "
            "r.start_location, r.end_location, r.status, r.geometry, r.updated_at, "
            "r.bus_id, b.bus_number "
            "FROM routes r LEFT JOIN buses b ON b.bus_id = r.bus_id "
            "WHERE r.route_id = %s",
            (route_id,),
        )
        route = cursor.fetchone()
        if not route:
            return error_response("Route not found", 404)
        if route.get("geometry"):
            try:
                route["geometry"] = json.loads(route["geometry"])
            except (ValueError, TypeError):
                route["geometry"] = None
        else:
            route["geometry"] = None
        cursor.execute(
            "SELECT stop_id, stop_name, latitude, longitude, stop_order, "
            "estimated_time, description "
            "FROM stops WHERE route_id = %s ORDER BY stop_order",
            (route_id,),
        )
        stops = cursor.fetchall()
        for stop in stops:
            stop["latitude"] = float(stop["latitude"])
            stop["longitude"] = float(stop["longitude"])
            if stop["estimated_time"]:
                stop["estimated_time"] = str(stop["estimated_time"])
    except mysql.connector.Error as err:
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    route["stops"] = stops
    route["buses"] = _buses_for_route(route_id)
    return jsonify(route), 200


@app.route("/api/admin/routes", methods=["POST"])
@require_admin
def admin_create_route(_admin):
    payload = json_body()
    route_name = (payload.get("route_name") or "").strip()
    route_code = (payload.get("route_code") or "").strip() or None
    if not route_name:
        return error_response("Route name is required", 400)
    status = (payload.get("status") or "active").strip().lower()
    if status not in ("active", "inactive"):
        return error_response("Status must be 'active' or 'inactive'", 400)

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        if route_code:
            cursor.execute(
                "SELECT route_id FROM routes WHERE route_code = %s", (route_code,)
            )
            if cursor.fetchone():
                return error_response("Route code already in use", 409)
        bus_id = payload.get("bus_id")
        if bus_id not in (None, "", 0):
            bus_id = int(bus_id)
            cursor.execute(
                "SELECT bus_id FROM routes WHERE bus_id = %s", (bus_id,)
            )
            if cursor.fetchone():
                return error_response("That bus is already assigned to another route", 409)
            cursor.execute("SELECT bus_id FROM buses WHERE bus_id = %s", (bus_id,))
            if not cursor.fetchone():
                return error_response("Bus not found", 400)
        else:
            bus_id = None

        geometry = payload.get("geometry")
        if geometry and not isinstance(geometry, str):
            try:
                geometry = json.dumps(geometry)
            except (TypeError, ValueError):
                geometry = None

        cursor.execute(
            "INSERT INTO routes (route_code, route_name, description, start_location, "
            "end_location, status, bus_id, geometry) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
            (
                route_code,
                route_name,
                (payload.get("description") or "").strip() or None,
                (payload.get("start_location") or "").strip() or None,
                (payload.get("end_location") or "").strip() or None,
                status,
                bus_id,
                geometry,
            ),
        )
        db.commit()
        route_id = cursor.lastrowid
    except mysql.connector.Error as err:
        db.rollback()
        if err.errno == 1062:
            return error_response("Route code or bus already assigned", 409)
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()

    route, _ = _fetch_route_admin(route_id)
    return jsonify(route), 201


def _fetch_route_admin(route_id):
    """Internal helper: return (route_dict, error_response_or_None)."""
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT r.route_id, r.route_code, r.route_name, r.description, "
            "r.start_location, r.end_location, r.status, r.geometry, r.updated_at, "
            "r.bus_id, b.bus_number, COUNT(s.stop_id) AS stop_count "
            "FROM routes r "
            "LEFT JOIN buses b ON b.bus_id = r.bus_id "
            "LEFT JOIN stops s ON s.route_id = r.route_id "
            "WHERE r.route_id = %s GROUP BY r.route_id",
            (route_id,),
        )
        route = cursor.fetchone()
        if not route:
            return None, error_response("Route not found", 404)
        if route.get("geometry"):
            try:
                route["geometry"] = json.loads(route["geometry"])
            except (ValueError, TypeError):
                route["geometry"] = None
        else:
            route["geometry"] = None
        cursor.execute(
            "SELECT stop_id, stop_name, latitude, longitude, stop_order, "
            "estimated_time, description "
            "FROM stops WHERE route_id = %s ORDER BY stop_order",
            (route_id,),
        )
        stops = cursor.fetchall()
        for stop in stops:
            stop["latitude"] = float(stop["latitude"])
            stop["longitude"] = float(stop["longitude"])
            if stop["estimated_time"]:
                stop["estimated_time"] = str(stop["estimated_time"])
        route["stops"] = stops
    except mysql.connector.Error as err:
        return None, error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    route["buses"] = _buses_for_route(route_id)
    return route, None


@app.route("/api/admin/routes/<int:route_id>", methods=["PUT"])
@require_admin
def admin_update_route(_admin, route_id):
    payload = json_body()
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT route_id FROM routes WHERE route_id = %s", (route_id,)
        )
        if not cursor.fetchone():
            return error_response("Route not found", 404)

        updates = []
        params = []

        if "route_name" in payload:
            route_name = (payload["route_name"] or "").strip()
            if not route_name:
                return error_response("Route name cannot be empty", 400)
            updates.append("route_name = %s")
            params.append(route_name)
        if "route_code" in payload:
            route_code = (payload["route_code"] or "").strip() or None
            if route_code:
                cursor.execute(
                    "SELECT route_id FROM routes WHERE route_code = %s AND route_id <> %s",
                    (route_code, route_id),
                )
                if cursor.fetchone():
                    return error_response("Route code already in use", 409)
            updates.append("route_code = %s")
            params.append(route_code)
        for field in ("description", "start_location", "end_location"):
            if field in payload:
                updates.append(field + " = %s")
                params.append((payload.get(field) or "").strip() or None)
        if "status" in payload:
            status = (payload["status"] or "").strip().lower()
            if status not in ("active", "inactive"):
                return error_response("Status must be 'active' or 'inactive'", 400)
            updates.append("status = %s")
            params.append(status)
        if "bus_id" in payload:
            bus_id = payload.get("bus_id")
            if bus_id in (None, "", 0):
                updates.append("bus_id = NULL")
            else:
                bus_id = int(bus_id)
                cursor.execute(
                    "SELECT route_id FROM routes WHERE bus_id = %s AND route_id <> %s",
                    (bus_id, route_id),
                )
                if cursor.fetchone():
                    return error_response("That bus is already assigned to another route", 409)
                cursor.execute("SELECT bus_id FROM buses WHERE bus_id = %s", (bus_id,))
                if not cursor.fetchone():
                    return error_response("Bus not found", 400)
                updates.append("bus_id = %s")
                params.append(bus_id)
        if "geometry" in payload:
            geometry = payload.get("geometry")
            if geometry and not isinstance(geometry, str):
                try:
                    geometry = json.dumps(geometry)
                except (TypeError, ValueError):
                    geometry = None
            updates.append("geometry = %s")
            params.append(geometry)

        if updates:
            cursor.execute(
                "UPDATE routes SET " + ", ".join(updates) + " WHERE route_id = %s",
                params + [route_id],
            )
            db.commit()
    except mysql.connector.Error as err:
        db.rollback()
        if err.errno == 1062:
            return error_response("Route code or bus already assigned", 409)
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()

    route, err = _fetch_route_admin(route_id)
    if err:
        return err
    return jsonify(route), 200


@app.route("/api/admin/routes/<int:route_id>", methods=["DELETE"])
@require_admin
def admin_delete_route(_admin, route_id):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT route_id FROM routes WHERE route_id = %s", (route_id,)
        )
        if not cursor.fetchone():
            return error_response("Route not found", 404)
        cursor.execute("DELETE FROM stops WHERE route_id = %s", (route_id,))
        cursor.execute(
            "UPDATE users SET route_id = NULL WHERE route_id = %s", (route_id,)
        )
        cursor.execute("DELETE FROM trips WHERE route_id = %s", (route_id,))
        cursor.execute("DELETE FROM routes WHERE route_id = %s", (route_id,))
        db.commit()
    except mysql.connector.Error as err:
        db.rollback()
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    return jsonify({"message": "Route deleted", "route_id": route_id}), 200


@app.route("/api/admin/routes/<int:route_id>/stops", methods=["POST"])
@require_admin
def admin_add_stop(_admin, route_id):
    payload = json_body()
    stop_name = (payload.get("stop_name") or "").strip()
    try:
        latitude = float(payload.get("latitude"))
        longitude = float(payload.get("longitude"))
    except (TypeError, ValueError):
        return error_response("Valid latitude and longitude are required", 400)
    if not stop_name:
        return error_response("Stop name is required", 400)

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT route_id FROM routes WHERE route_id = %s", (route_id,)
        )
        if not cursor.fetchone():
            return error_response("Route not found", 404)
        cursor.execute(
            "SELECT COUNT(*) AS n FROM stops WHERE route_id = %s", (route_id,)
        )
        next_order = cursor.fetchone()["n"]
        estimated_time = payload.get("estimated_time") or None
        cursor.execute(
            "INSERT INTO stops (route_id, stop_name, latitude, longitude, "
            "stop_order, estimated_time, description) VALUES (%s,%s,%s,%s,%s,%s,%s)",
            (
                route_id,
                stop_name,
                latitude,
                longitude,
                next_order,
                estimated_time,
                (payload.get("description") or "").strip() or None,
            ),
        )
        db.commit()
        stop_id = cursor.lastrowid
    except mysql.connector.Error as err:
        db.rollback()
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    return jsonify({"stop_id": stop_id, "route_id": route_id}), 201


@app.route("/api/admin/stops/<int:stop_id>", methods=["PUT"])
@require_admin
def admin_update_stop(_admin, stop_id):
    payload = json_body()
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT stop_id FROM stops WHERE stop_id = %s", (stop_id,))
        if not cursor.fetchone():
            return error_response("Stop not found", 404)
        updates = []
        params = []
        if "stop_name" in payload:
            stop_name = (payload["stop_name"] or "").strip()
            if not stop_name:
                return error_response("Stop name cannot be empty", 400)
            updates.append("stop_name = %s")
            params.append(stop_name)
        if "latitude" in payload:
            try:
                updates.append("latitude = %s")
                params.append(float(payload["latitude"]))
            except (TypeError, ValueError):
                return error_response("Invalid latitude", 400)
        if "longitude" in payload:
            try:
                updates.append("longitude = %s")
                params.append(float(payload["longitude"]))
            except (TypeError, ValueError):
                return error_response("Invalid longitude", 400)
        if "estimated_time" in payload:
            updates.append("estimated_time = %s")
            params.append((payload.get("estimated_time") or "").strip() or None)
        if "description" in payload:
            updates.append("description = %s")
            params.append((payload.get("description") or "").strip() or None)
        if not updates:
            return error_response("No valid fields to update", 400)
        cursor.execute(
            "UPDATE stops SET " + ", ".join(updates) + " WHERE stop_id = %s",
            params + [stop_id],
        )
        db.commit()
    except mysql.connector.Error as err:
        db.rollback()
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    return jsonify({"message": "Stop updated", "stop_id": stop_id}), 200


@app.route("/api/admin/stops/<int:stop_id>", methods=["DELETE"])
@require_admin
def admin_delete_stop(_admin, stop_id):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT route_id FROM stops WHERE stop_id = %s", (stop_id,))
        row = cursor.fetchone()
        if not row:
            return error_response("Stop not found", 404)
        route_id = row["route_id"]
        cursor.execute("DELETE FROM stops WHERE stop_id = %s", (stop_id,))
        # Compact the remaining stop_order sequence for this route.
        cursor.execute(
            "SELECT stop_id FROM stops WHERE route_id = %s ORDER BY stop_order",
            (route_id,),
        )
        for order, remaining in enumerate(cursor.fetchall()):
            cursor.execute(
                "UPDATE stops SET stop_order = %s WHERE stop_id = %s",
                (order, remaining["stop_id"]),
            )
        db.commit()
    except mysql.connector.Error as err:
        db.rollback()
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    return jsonify({"message": "Stop deleted", "stop_id": stop_id}), 200


@app.route("/api/admin/routes/<int:route_id>/stops/reorder", methods=["PUT"])
@require_admin
def admin_reorder_stops(_admin, route_id):
    payload = json_body()
    stop_ids = payload.get("stop_ids")
    if not isinstance(stop_ids, list):
        return error_response("stop_ids array is required", 400)
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT route_id FROM routes WHERE route_id = %s", (route_id,)
        )
        if not cursor.fetchone():
            return error_response("Route not found", 404)
        for order, stop_id in enumerate(stop_ids):
            cursor.execute(
                "UPDATE stops SET stop_order = %s WHERE stop_id = %s AND route_id = %s",
                (order, stop_id, route_id),
            )
        db.commit()
    except mysql.connector.Error as err:
        db.rollback()
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    return jsonify({"message": "Stops reordered", "route_id": route_id}), 200


# ---------------------------------------------------------------------------
# Admin — BUS Routes hierarchy management
# (BUS Routes → Assigned Bus → Ordered Stations)
# ---------------------------------------------------------------------------

@app.route("/api/admin/routes/<int:route_id>/buses", methods=["POST"])
@require_admin
def admin_assign_bus_to_route(_admin, route_id):
    """Assign an existing bus to a route (a bus can belong to only one route)."""
    payload = json_body()
    bus_id = payload.get("bus_id")
    try:
        bus_id = int(bus_id)
    except (TypeError, ValueError):
        return error_response("A valid bus_id is required", 400)

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT route_id FROM routes WHERE route_id = %s", (route_id,)
        )
        if not cursor.fetchone():
            return error_response("Route not found", 404)
        cursor.execute("SELECT bus_id FROM buses WHERE bus_id = %s", (bus_id,))
        if not cursor.fetchone():
            return error_response("Bus not found", 404)
        cursor.execute(
            "SELECT route_id FROM route_buses WHERE bus_id = %s AND route_id <> %s",
            (bus_id, route_id),
        )
        if cursor.fetchone():
            return error_response("That bus is already assigned to another route", 409)
        cursor.execute(
            "INSERT IGNORE INTO route_buses (route_id, bus_id) VALUES (%s, %s)",
            (route_id, bus_id),
        )
        db.commit()
    except mysql.connector.Error as err:
        db.rollback()
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    return jsonify({"message": "Bus assigned to route", "route_id": route_id, "bus_id": bus_id}), 201


@app.route("/api/admin/routes/<int:route_id>/buses/<int:bus_id>", methods=["DELETE"])
@require_admin
def admin_unassign_bus_from_route(_admin, route_id, bus_id):
    """Remove a bus from a route (keeps the bus record; only the assignment goes)."""
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT bus_id FROM route_buses WHERE route_id = %s AND bus_id = %s",
            (route_id, bus_id),
        )
        if not cursor.fetchone():
            return error_response("Bus is not assigned to this route", 404)
        cursor.execute(
            "DELETE FROM bus_stations WHERE route_id = %s AND bus_id = %s",
            (route_id, bus_id),
        )
        cursor.execute(
            "DELETE FROM route_buses WHERE route_id = %s AND bus_id = %s",
            (route_id, bus_id),
        )
        db.commit()
    except mysql.connector.Error as err:
        db.rollback()
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    return jsonify({"message": "Bus removed from route", "route_id": route_id, "bus_id": bus_id}), 200


@app.route("/api/admin/routes/<int:route_id>/buses/<int:bus_id>/stations", methods=["POST"])
@require_admin
def admin_add_bus_station(_admin, route_id, bus_id):
    """Add one station to a bus's ordered station list."""
    payload = json_body()
    station_name = (payload.get("station_name") or "").strip()
    try:
        latitude = float(payload.get("latitude"))
        longitude = float(payload.get("longitude"))
    except (TypeError, ValueError):
        return error_response("Valid latitude and longitude are required", 400)
    if not station_name:
        return error_response("Station name is required", 400)

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT bus_id FROM route_buses WHERE route_id = %s AND bus_id = %s",
            (route_id, bus_id),
        )
        if not cursor.fetchone():
            return error_response("Bus is not assigned to this route", 404)
        cursor.execute(
            "SELECT COUNT(*) AS n FROM bus_stations WHERE route_id = %s AND bus_id = %s",
            (route_id, bus_id),
        )
        next_order = cursor.fetchone()["n"]
        estimated_time = payload.get("estimated_time") or None
        cursor.execute(
            "INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order, estimated_time) "
            "VALUES (%s,%s,%s,%s,%s,%s,%s)",
            (route_id, bus_id, station_name, latitude, longitude, next_order, estimated_time),
        )
        db.commit()
        station_id = cursor.lastrowid
    except mysql.connector.Error as err:
        db.rollback()
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    return jsonify({"station_id": station_id, "route_id": route_id, "bus_id": bus_id}), 201


@app.route("/api/admin/stations/<int:station_id>", methods=["PUT"])
@require_admin
def admin_update_bus_station(_admin, station_id):
    """Update a bus station's name, coordinates or order."""
    payload = json_body()
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT station_id FROM bus_stations WHERE station_id = %s", (station_id,)
        )
        if not cursor.fetchone():
            return error_response("Station not found", 404)
        updates = []
        params = []
        if "station_name" in payload:
            station_name = (payload["station_name"] or "").strip()
            if not station_name:
                return error_response("Station name cannot be empty", 400)
            updates.append("station_name = %s")
            params.append(station_name)
        if "latitude" in payload:
            try:
                updates.append("latitude = %s")
                params.append(float(payload["latitude"]))
            except (TypeError, ValueError):
                return error_response("Invalid latitude", 400)
        if "longitude" in payload:
            try:
                updates.append("longitude = %s")
                params.append(float(payload["longitude"]))
            except (TypeError, ValueError):
                return error_response("Invalid longitude", 400)
        if "stop_order" in payload:
            try:
                updates.append("stop_order = %s")
                params.append(int(payload["stop_order"]))
            except (TypeError, ValueError):
                return error_response("Invalid stop_order", 400)
        if "estimated_time" in payload:
            updates.append("estimated_time = %s")
            params.append((payload.get("estimated_time") or "").strip() or None)
        if not updates:
            return error_response("No valid fields to update", 400)
        cursor.execute(
            "UPDATE bus_stations SET " + ", ".join(updates) + " WHERE station_id = %s",
            params + [station_id],
        )
        db.commit()
    except mysql.connector.Error as err:
        db.rollback()
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    return jsonify({"message": "Station updated", "station_id": station_id}), 200


@app.route("/api/admin/stations/<int:station_id>", methods=["DELETE"])
@require_admin
def admin_delete_bus_station(_admin, station_id):
    """Delete a bus station and compact the remaining stop_order sequence."""
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT route_id, bus_id FROM bus_stations WHERE station_id = %s",
            (station_id,),
        )
        row = cursor.fetchone()
        if not row:
            return error_response("Station not found", 404)
        route_id = row["route_id"]
        bus_id = row["bus_id"]
        cursor.execute("DELETE FROM bus_stations WHERE station_id = %s", (station_id,))
        cursor.execute(
            "SELECT station_id FROM bus_stations WHERE route_id = %s AND bus_id = %s ORDER BY stop_order",
            (route_id, bus_id),
        )
        for order, remaining in enumerate(cursor.fetchall()):
            cursor.execute(
                "UPDATE bus_stations SET stop_order = %s WHERE station_id = %s",
                (order, remaining["station_id"]),
            )
        db.commit()
    except mysql.connector.Error as err:
        db.rollback()
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    return jsonify({"message": "Station deleted", "station_id": station_id}), 200


@app.route("/api/admin/buses/<int:bus_id>/stations/reorder", methods=["PUT"])
@require_admin
def admin_reorder_bus_stations(_admin, bus_id):
    """Reorder a bus's stations by supplying station_ids in the new order."""
    payload = json_body()
    station_ids = payload.get("station_ids")
    if not isinstance(station_ids, list):
        return error_response("station_ids array is required", 400)
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT bus_id FROM buses WHERE bus_id = %s", (bus_id,)
        )
        if not cursor.fetchone():
            return error_response("Bus not found", 404)
        for order, station_id in enumerate(station_ids):
            cursor.execute(
                "UPDATE bus_stations SET stop_order = %s WHERE station_id = %s AND bus_id = %s",
                (order, station_id, bus_id),
            )
        db.commit()
    except mysql.connector.Error as err:
        db.rollback()
        return error_response("Database error: " + str(err), 500)
    finally:
        cursor.close()
        db.close()
    return jsonify({"message": "Stations reordered", "bus_id": bus_id}), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    debug = os.environ.get("FLASK_DEBUG", "").lower() in ("1", "true", "yes")
    app.run(host="0.0.0.0", port=port, debug=debug)
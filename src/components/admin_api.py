
# 2-FACTOR AUTHENTICATION SYSTEM - BACKEND API
# This Flask API handles user authentication, OTP generation/verification,
# and user management for the 2FA system with Snake Game integration.

from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
import random
import time
import string
import bcrypt
app = Flask(__name__)
CORS(app)


# FIREBASE INITIALIZATION
# Initialize Firebase Admin SDK for database operations
# Set environment variable GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path,
# or place serviceAccount.json in project root and it will be used as fallback.
cred_path = "C:\\Users\\anton\\OneDrive\\Desktop\\Crypto 2FA\\login\\2-Factor-Authentication-System\\service.json"
otp_cache = {}
if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

# Initialize Firestore database connection
db = firestore.client()
users_col = db.collection("users")



# USER MANAGEMENT API ENDPOINTS

@app.route("/api/users", methods=["GET"])
def list_users():
    """
    GET /api/users
    Retrieves all users from the database for admin panel display.
    Excludes admin user from the list for security.
    Returns: JSON array of user objects with id, email, and password hash
    """
    try:
        docs = users_col.stream()
        users = []
        for d in docs:
            data = d.to_dict() or {}
            data["id"] = d.id
            if data["id"] == "admin":
                continue
            else:
                users.append(data)
        print("Fetched users:", users)
        return jsonify(users), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/users", methods=["POST"])
def create_user():
    """
    POST /api/users
    Creates a new user account with hashed password.
    Securely hashes the password using bcrypt before storing in database.
    Returns: JSON object with new user id and email
    """
    data = request.json or {}
    email = data.get("email")
    password = data.get("password")
    hashedpassword = bcrypt.hashpw(password.encode('utf-8'),bcrypt.gensalt(10))
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
    try:
        doc_ref = users_col.add({"email": email, "password": hashedpassword.decode('utf-8')})
        # users_col.add returns a tuple (DocumentReference, write_result) in firebase-admin python
        # but sometimes directly returns DocumentReference; handle both
        doc_id = None
        if isinstance(doc_ref, tuple) and len(doc_ref) > 0:
            doc_id = getattr(doc_ref[0], "id", None)
        else:
            doc_id = getattr(doc_ref, "id", None)
        return jsonify({"id": doc_id, "email": email}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/users/<user_id>", methods=["DELETE"])
def delete_user(user_id):
    """
    DELETE /api/users/<user_id>
    Permanently deletes a user from the database.
    Used by admin panel for user management.
    Returns: Success message or error if user not found
    """
    try:
        doc_ref = users_col.document(user_id)
        if not doc_ref.get().exists:
            return jsonify({"error": "User not found"}), 404
        doc_ref.delete()
        return jsonify({"message": "User deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/users/<user_id>", methods=["PUT"])
def update_user(user_id):
    """
    PUT /api/users/<user_id>
    Updates user information (email and/or password).
    Automatically hashes new passwords before storing.
    Returns: Updated user object with all fields
    """
    data = request.json or {}
    try:
        doc_ref = users_col.document(user_id)
        snap = doc_ref.get()
        if not snap.exists:
            return jsonify({"error": "User not found"}), 404
        updates = {}
        if "email" in data:
            updates["email"] = data["email"]
        if "password" in data:
            password = data.get("password")
            hashedpassword = bcrypt.hashpw(password.encode('utf-8'),bcrypt.gensalt(10))
            updates["password"] = hashedpassword.decode('utf-8')
        if updates:
            doc_ref.update(updates)
        updated = doc_ref.get().to_dict() or {}
        updated["id"] = doc_ref.id
        return jsonify(updated), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# AUTHENTICATION SYSTEM

@app.route('/check_login', methods=['POST'])
def check_login():
    """
    POST /check_login
    Main authentication endpoint for user login.
    Validates user credentials against Firebase database.
    Supports both admin and regular user authentication.
    Returns: Success status, user role, and user_id for further processing
    """
    # Extract login credentials from request
    data = request.get_json()
    email = data.get('email')
    password = data.get('password').encode('utf-8')

    # Validate required fields
    if not email or not password:
        return jsonify({"success": False, "error": "Missing email or password"}), 400

    # Query Firestore database for user with matching email
    users_ref = db.collection('users')
    query_ref = users_ref.where('email', '==', email).stream()

    # Find the matching user document
    matched_user = None
    for doc in query_ref:
        matched_user = {"id": doc.id, **doc.to_dict()}  # merge id and data
    
    # Check if user exists and verify password
    if matched_user:
        # Check if this is an admin user
        if matched_user["id"] == "admin" and bcrypt.checkpw(password, matched_user['password'].encode('utf-8')):
            # Admin login successful - no 2FA required
            return jsonify({"success": True, "role": "admin"})
        
        # Check if this is a regular user with valid password
        if bcrypt.checkpw(password, matched_user['password'].encode('utf-8')):
            print("password verified")
            # Regular user login successful - requires 2FA
            return jsonify({
                "success": True,
                "role": "user",
                "user_id": matched_user["id"],
                "email": matched_user.get("email")
            })
    
    # Authentication failed - invalid credentials
    return jsonify({"success": False, "error": "Invalid credentials"}), 401

# OTP GENERATION

def generate_random_otp():
    """
    Generates a random 6-digit OTP code.
    Returns: String containing 6 random digits (100000-999999)
    """
    return str(random.randint(100000, 999999))

def generate_session_id():
    """
    Creates a unique session identifier for OTP tracking.
    Combines timestamp with random string for uniqueness.
    Returns: Unique session ID string
    """
    return f"session_{int(time.time())}_{''.join(random.choices(string.ascii_lowercase + string.digits, k=8))}"

def hash_otp(otp,emailadd):
    """
    Creates a deterministic hash of OTP for additional security.
    Uses high-precision timestamp and random salt.
    Returns: 6-digit hashed OTP string
    """
    # Use high-precision time and random components for better entropy
    timestamp = time.time() * 1000000  # Microsecond precision
    random_salt = random.randint(0, 999999)
    combined = f"{emailadd}:{otp}:{timestamp}:{random_salt}".encode("utf-8")
    hashed = bcrypt.hashpw(combined, bcrypt.gensalt())
    numeric = int.from_bytes(hashed[:4], "big")
    final_otp = str(numeric % 1000000).zfill(6)
    return final_otp

# OTP MANAGEMENT ENDPOINTS

@app.route('/generate_otp', methods=['POST'])
def generate_otp():
    """
    POST /generate_otp
    Generates a new OTP for user authentication.
    Creates random 6-digit OTP, hashes it for security, and stores in database.
    Sets 30-second expiration time for security.
    Returns: Plain OTP code for user display and session ID
    """
    try:
        data = request.get_json()
        user_id = data.get('user_id')  # Get user ID from frontend request
        user_email = data.get('email')
        if not user_id:
            return jsonify({'success': False, 'error': 'Missing user_id'}), 400
        session_id = generate_session_id()
        otp_code = generate_random_otp()
        hashed_otp = bcrypt.hashpw(otp_code.encode('utf-8'), bcrypt.gensalt())
        current_time = int(time.time() * 1000)
        expires_at = current_time + 30000  # 30 seconds validity
        user_ref = db.collection('users').document(user_id)
        if not user_ref.get().exists:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        user_ref.update({
            'otp_code': hashed_otp.decode('utf-8'),
            'otp_createdAt': current_time,
            'otp_expiresAt': expires_at,
        })
        return jsonify({
            'success': True,
            'sessionId': session_id,
            'otp': otp_code
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
@app.route('/verify_otp', methods=['POST'])
def verify_otp():
    """
    POST /verify_otp
    Verifies the OTP entered by the user.
    Compares user input with hashed OTP stored in database.
    Checks expiration time and clears OTP after successful verification.
    Returns: Success status and appropriate error messages
    """
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        otp_code = data.get('otp')

        if not user_id or  not otp_code:
            return jsonify({'success': False, 'error': 'Missing user_id, OTP, or session ID'}), 400

        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()

        if not user_doc.exists:
            return jsonify({'success': False, 'error': 'User not found'}), 404

        user_data = user_doc.to_dict()
        current_time = int(time.time() * 1000)

        #  Check if OTP exists in user document
        if 'otp_code' not in user_data or 'otp_expiresAt' not in user_data:
            return jsonify({'success': False, 'error': 'No OTP found for this user'}), 404

        #  Check if expired
        if current_time > user_data['otp_expiresAt']:
            
            user_ref.update({
                'otp_code': firestore.DELETE_FIELD,
                'otp_createdAt': firestore.DELETE_FIELD,
                'otp_expiresAt': firestore.DELETE_FIELD,
                'session_id': firestore.DELETE_FIELD
            })
            return jsonify({'success': False, 'error': 'OTP expired'}), 400
        # Match OTP using bcrypt comparison
        if bcrypt.checkpw(otp_code.encode('utf-8'), user_data["otp_code"].encode('utf-8')):
            # Clear OTP after successful verification
            user_ref.update({
                'otp_code': firestore.DELETE_FIELD,
                'otp_createdAt': firestore.DELETE_FIELD,
                'otp_expiresAt': firestore.DELETE_FIELD,
                'session_id': firestore.DELETE_FIELD
            })
            return jsonify({'success': True, 'message': 'OTP verified successfully'}), 200
        else:
            return jsonify({'success': False, 'error': 'Invalid OTP'}), 400

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# APPLICATION STARTUP
if __name__ == "__main__":
    """
    Main application entry point.
    Starts the Flask development server on localhost:5000.
    Enables debug mode for development purposes.
    """
    app.run(debug=True)
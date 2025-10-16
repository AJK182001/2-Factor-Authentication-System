from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
import random
import time
import string
import json
import bcrypt
app = Flask(__name__)
CORS(app)

# Initialize Firebase Admin SDK
# Set environment variable GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path,
# or place serviceAccount.json in project root and it will be used as fallback.
cred_path = "D:\MS\FIT5163\project\\2-Factor-Authentication-System\service.json"
otp_cache = {}
if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()
users_col = db.collection("users")


@app.route("/api/users", methods=["GET"])
def list_users():
    try:
        docs = users_col.stream()
        users = []
        for d in docs:
            data = d.to_dict() or {}
            data["id"] = d.id
            users.append(data)
        print("Fetched users:", users)
        return jsonify(users), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/users", methods=["POST"])
def create_user():
    data = request.json or {}
    email = data.get("email")
    password = data.get("password")
    hashedpassword = bcrypt.hashpw(password.encode('utf-8'),bcrypt.gensalt())
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
            updates["password"] = data["password"]
        if updates:
            doc_ref.update(updates)
        updated = doc_ref.get().to_dict() or {}
        updated["id"] = doc_ref.id
        return jsonify(updated), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#with open('config.json') as f:
#    admin_config = json.load(f)
    
#    ADMIN_EMAIL = admin_config['email']
#    ADMIN_PASSWORD_HASH =admin_config['passwordHash'].encode('utf-8')

@app.route('/check_login', methods=['POST'])
def check_login():
        data = request.get_json()
        email = data.get('email')
        password = data.get('password').encode('utf-8')

        if not email or not password:
            return jsonify({"success": False, "error": "Missing email or password"}), 400

        # Query Firestore
        users_ref = db.collection('users')
        query_ref = users_ref.where('email', '==', email).stream()

        matched_user = None
        for doc in query_ref:
            matched_user = {"id": doc.id, **doc.to_dict()}  # merge id and data
        if matched_user["id"] == "admin" and bcrypt.checkpw(password,matched_user['password'].encode('utf-8')):
            return jsonify({"success":True, "role":"admin"})
        if bcrypt.checkpw(password,matched_user['password'].encode('utf-8')):
            print("password verified")
            return jsonify({
                "success": True,
                "role": "user",
                "user_id": matched_user["id"],
                "email": matched_user.get("email")
            })
        else:
            return jsonify({"success": False, "error": "Invalid credentials"}), 401
def generate_random_otp():
    return str(random.randint(100000, 999999))

def generate_session_id():
    return f"session_{int(time.time())}_{''.join(random.choices(string.ascii_lowercase + string.digits, k=8))}"
@app.route('/generate_otp', methods=['POST'])
def generate_otp():
    try:
        data = request.get_json()
        user_id = data.get('user_id')  # Get user ID from frontend request

        if not user_id:
            return jsonify({'success': False, 'error': 'Missing user_id'}), 400
        session_id = generate_session_id()
        otp_code = generate_random_otp()
        current_time = int(time.time() * 1000)
        expires_at = current_time + 15000  # 15 seconds validity
        user_ref = db.collection('users').document(user_id)
        if not user_ref.get().exists:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        user_ref.update({
            'otp_code': otp_code,
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

        # ✅ Check if OTP exists in user document
        if 'otp_code' not in user_data or 'otp_expiresAt' not in user_data:
            return jsonify({'success': False, 'error': 'No OTP found for this user'}), 404

        # ✅ Check if expired
        if current_time > user_data['otp_expiresAt']:
            # Optional: remove expired OTP fields
            user_ref.update({
                'otp_code': firestore.DELETE_FIELD,
                'otp_createdAt': firestore.DELETE_FIELD,
                'otp_expiresAt': firestore.DELETE_FIELD,
                'session_id': firestore.DELETE_FIELD
            })
            return jsonify({'success': False, 'error': 'OTP expired'}), 400

        # Match OTP and session_id
        if otp_code == user_data['otp_code']:
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

if __name__ == "__main__":
    # Example run on Windows (PowerShell/CMD):
    # setx GOOGLE_APPLICATION_CREDENTIALS "C:\path\to\serviceAccount.json"  # set env permanently
    # $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccount.json" # PowerShell temporary
    # python admin_api.py
    app.run(debug=True)
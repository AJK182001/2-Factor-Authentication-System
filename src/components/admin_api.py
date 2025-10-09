from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import firebase_admin
from firebase_admin import credentials, firestore

app = Flask(__name__)
CORS(app)

# Initialize Firebase Admin SDK
# Set environment variable GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path,
# or place serviceAccount.json in project root and it will be used as fallback.
cred_path = "D:\MS\FIT5163\project\\2-Factor-Authentication-System\service.json"

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
        return jsonify(users), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/users", methods=["POST"])
def create_user():
    data = request.json or {}
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
    try:
        doc_ref = users_col.add({"email": email, "password": password})
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


if __name__ == "__main__":
    # Example run on Windows (PowerShell/CMD):
    # setx GOOGLE_APPLICATION_CREDENTIALS "C:\path\to\serviceAccount.json"  # set env permanently
    # $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccount.json" # PowerShell temporary
    # python admin_api.py
    app.run(debug=True)
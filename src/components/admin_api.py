from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid

app = Flask(__name__)
CORS(app)

# In-memory users store for demo
users = [
    {"id": str(uuid.uuid4()), "email": "user1@example.com", "password": "pass1"},
    {"id": str(uuid.uuid4()), "email": "user2@example.com", "password": "pass2"},
]

@app.route('/api/users', methods=['GET'])
def list_users():
    return jsonify(users), 200

@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.json
    if not data.get('email') or not data.get('password'):
        return jsonify({"error": "Email and password required"}), 400
    new_user = {
        "id": str(uuid.uuid4()),
        "email": data['email'],
        "password": data['password']
    }
    users.append(new_user)
    return jsonify(new_user), 201

@app.route('/api/users/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    global users
    users = [u for u in users if u['id'] != user_id]
    return jsonify({"message": "User deleted"}), 200

@app.route('/api/users/<user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.json
    for user in users:
        if user['id'] == user_id:
            user['email'] = data.get('email', user['email'])
            user['password'] = data.get('password', user['password'])
            return jsonify(user), 200
    return jsonify({"error": "User not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase'; // adjust path to your firebase.js

const AdminPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');

  const usersCollectionRef = collection(db, 'users');

  // Fetch users from Firestore
  const fetchUsers = async () => {
    try {
      const data = await getDocs(usersCollectionRef);
      const usersList = data.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Add new user
  const handleAddUser = async () => {
    if (!username.trim() || !password.trim()) {
      setMessage('Username and password are required.');
      return;
    }

    try {
      await addDoc(usersCollectionRef, {
        email: username,
        password: password,
      });

      setMessage(`User "${username}" added successfully!`);
      setUsername('');
      setPassword('');
      fetchUsers();
    } catch (err) {
      console.error('Error adding user:', err);
      setMessage('Failed to add user.');
    }
  };

  // Remove user
  const handleRemoveUser = async (id) => {
    try {
      await deleteDoc(doc(db, 'users', id));
      setMessage('User removed successfully!');
      fetchUsers();
    } catch (err) {
      console.error('Error removing user:', err);
      setMessage('Failed to remove user.');
    }
  };

  return (
    <div className="admin-card">
      <h1>Admin Panel</h1>

      <div className="form-group">
        <input
          type="text"
          placeholder="Username (email)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="form-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-input"
        />
        <button onClick={handleAddUser} className="btn btn-primary">Add User</button>
      </div>

      {message && <div className="message">{message}</div>}

      <h2>Users List</h2>
      <ul>
        {users.map(user => (
          <li key={user.id} style={{ marginBottom: '8px' }}>
            {user.email} 
            <button 
              onClick={() => handleRemoveUser(user.id)} 
              style={{ marginLeft: '10px', color: 'red' }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPage;
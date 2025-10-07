import React, { useState, useEffect } from 'react';

const API_URL = 'http://127.0.0.1:5000'; // Adjust if your Flask runs elsewhere

const AdminPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [activePanel, setActivePanel] = useState(null); // null, 'list', 'add', 'modify', 'delete'
  const [editUserId, setEditUserId] = useState(null);
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');

  // Fetch users from Flask API
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    if (activePanel === 'list' || activePanel === 'modify' || activePanel === 'delete') {
      fetchUsers();
    }
  }, [activePanel]);

  // Add new user
  const handleAddUser = async () => {
    if (!username.trim() || !password.trim()) {
      setMessage('Username and password are required.');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password }),
      });
      if (res.ok) {
        setMessage(`User "${username}" added successfully!`);
        setUsername('');
        setPassword('');
      } else {
        setMessage('Failed to add user.');
      }
    } catch (err) {
      console.error('Error adding user:', err);
      setMessage('Failed to add user.');
    }
  };

  // Remove user
  const handleRemoveUser = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage('User removed successfully!');
        fetchUsers();
      } else {
        setMessage('Failed to remove user.');
      }
    } catch (err) {
      console.error('Error removing user:', err);
      setMessage('Failed to remove user.');
    }
  };

  // Start modifying user
  const handleModifyUser = (user) => {
    setEditUserId(user.id);
    setEditEmail(user.email);
    setEditPassword(user.password);
  };

  // Save modified user
  const handleSaveEdit = async () => {
    if (!editEmail.trim() || !editPassword.trim()) {
      setMessage('Email and password are required.');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/users/${editUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: editEmail, password: editPassword }),
      });
      if (res.ok) {
        setMessage('User updated successfully!');
        setEditUserId(null);
        setEditEmail('');
        setEditPassword('');
        fetchUsers();
      } else {
        setMessage('Failed to update user.');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setMessage('Failed to update user.');
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditUserId(null);
    setEditEmail('');
    setEditPassword('');
  };

  // Big blue button style
  const bigBlueBtn = {
    background: '#007bff',
    color: '#fff',
    border: 'none',
    padding: '24px 0',
    width: '100%',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.3rem',
    marginBottom: '24px',
    fontWeight: 'bold',
    letterSpacing: '1px'
  };

  // Back button style
  const backBtn = {
    background: '#6c757d',
    color: '#fff',
    border: 'none',
    padding: '12px 0',
    width: '100%',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    marginBottom: '24px',
    fontWeight: 'bold',
    letterSpacing: '1px'
  };

  // Table style (bigger)
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '24px',
    fontSize: '1.15rem'
  };
  const thtdStyle = {
    border: '1.5px solid #ddd',
    padding: '16px',
    textAlign: 'left'
  };
  const thStyle = {
    ...thtdStyle,
    background: '#f2f2f2',
    fontWeight: 'bold'
  };

  // Bigger action button style for table
  const tableBtnStyle = {
    padding: '10px 24px',
    borderRadius: '6px',
    border: 'none',
    background: '#007bff',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold'
  };

  // Success message style
  const successMsgStyle = {
    color: '#155724',
    background: '#d4edda',
    border: '1px solid #c3e6cb',
    padding: '10px 16px',
    borderRadius: '4px',
    margin: '16px 0',
    fontWeight: 'bold'
  };

  // Main panel with big buttons
  if (!activePanel) {
    return (
      <div className="admin-card" style={{ maxWidth: 400, margin: '40px auto' }}>
        <h1>Admin Panel</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          <button style={bigBlueBtn} onClick={() => setActivePanel('list')}>List Users</button>
          <button style={bigBlueBtn} onClick={() => setActivePanel('add')}>Add Users</button>
          <button style={bigBlueBtn} onClick={() => setActivePanel('modify')}>Modify Users</button>
          <button style={bigBlueBtn} onClick={() => setActivePanel('delete')}>Delete Users</button>
        </div>
      </div>
    );
  }

  // List Users Page
  if (activePanel === 'list') {
    return (
      <div className="admin-card" style={{ maxWidth: 500, margin: '40px auto' }}>
        <h1>Users List</h1>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Email</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td style={thtdStyle}>{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          style={backBtn}
          onClick={() => {
            setActivePanel(null);
            setMessage('');
          }}
        >
          Back
        </button>
      </div>
    );
  }

  // Add Users Page
  if (activePanel === 'add') {
    return (
      <div className="admin-card" style={{ maxWidth: 400, margin: '40px auto' }}>
        <h1>Add User</h1>
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
          <button onClick={handleAddUser} className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>Add User</button>
        </div>
        {message && (
          <div style={message.includes('successfully') ? successMsgStyle : { color: 'red', margin: '16px 0' }}>
            {message}
          </div>
        )}
        <button
          style={backBtn}
          onClick={() => {
            setActivePanel(null);
            setMessage('');
          }}
        >
          Back
        </button>
      </div>
    );
  }

  // Modify Users Page
  if (activePanel === 'modify') {
    return (
      <div className="admin-card" style={{ maxWidth: 500, margin: '40px auto' }}>
        <h1>Modify Users</h1>
        {!editUserId ? (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td style={thtdStyle}>{user.email}</td>
                  <td style={thtdStyle}>
                    <button
                      onClick={() => handleModifyUser(user)}
                      style={tableBtnStyle}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="form-group">
            <input
              type="text"
              placeholder="Email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="form-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
              className="form-input"
            />
            <button onClick={handleSaveEdit} className="btn btn-primary" style={{ marginRight: '8px' }}>Save</button>
          </div>
        )}
        {message && (
          <div style={message.includes('successfully') ? successMsgStyle : { color: 'red', margin: '16px 0' }}>
            {message}
          </div>
        )}
        <button
          style={backBtn}
          onClick={() => {
            setActivePanel(null);
            setEditUserId(null);
            setMessage('');
          }}
        >
          Back
        </button>
      </div>
    );
  }

  // Delete Users Page
  if (activePanel === 'delete') {
    return (
      <div className="admin-card" style={{ maxWidth: 500, margin: '40px auto' }}>
        <h1>Delete Users</h1>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td style={thtdStyle}>{user.email}</td>
                <td style={thtdStyle}>
                  <button
                    onClick={() => handleRemoveUser(user.id)}
                    style={tableBtnStyle}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {message && (
          <div style={message.includes('successfully') ? successMsgStyle : { color: 'red', margin: '16px 0' }}>
            {message}
          </div>
        )}
        <button
          style={backBtn}
          onClick={() => {
            setActivePanel(null);
            setMessage('');
          }}
        >
          Back
        </button>
      </div>
    );
  }

  return null;
};

export default AdminPage;
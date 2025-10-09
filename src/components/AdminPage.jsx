import React, { useState, useEffect } from 'react';

const API_URL = 'http://127.0.0.1:5000';

// SVG Icons
const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const UserPlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <line x1="20" y1="8" x2="20" y2="14"></line>
    <line x1="23" y1="11" x2="17" y2="11"></line>
  </svg>
);

const EditIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const LogOutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const AdminPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [activePanel, setActivePanel] = useState('list');
  const [editUserId, setEditUserId] = useState(null);
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to add user.');
      }
    } catch (err) {
      console.error('Error adding user:', err);
      setMessage('Failed to add user.');
    }
  };

  const handleRemoveUser = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage('User removed successfully!');
        fetchUsers();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to remove user.');
      }
    } catch (err) {
      console.error('Error removing user:', err);
      setMessage('Failed to remove user.');
    }
  };

  const handleModifyUser = (user) => {
    setEditUserId(user.id);
    setEditEmail(user.email);
    setEditPassword(user.password);
  };

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
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to update user.');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setMessage('Failed to update user.');
    }
  };

  const handleCancelEdit = () => {
    setEditUserId(null);
    setEditEmail('');
    setEditPassword('');
  };

  const handleLogout = () => {
    // Add your logout logic here
    if (confirm('Are you sure you want to logout?')) {
      // Clear any auth tokens, redirect to login, etc.
      window.location.href = '/login'; // Adjust this to your login page
    }
  };

  const navItems = [
    { id: 'list', label: 'All Users', icon: UsersIcon },
    { id: 'add', label: 'Add User', icon: UserPlusIcon },
    { id: 'modify', label: 'Modify Users', icon: EditIcon },
    { id: 'delete', label: 'Delete Users', icon: TrashIcon },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '280px' : '0',
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.1)',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{ padding: '32px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '24px'
            }}>A</div>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1a202c' }}>Admin Panel</h2>
              <p style={{ margin: 0, fontSize: '13px', color: '#718096' }}>User Management</p>
            </div>
          </div>
          
          <nav>
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePanel(item.id);
                    setMessage('');
                    setEditUserId(null);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    marginBottom: '8px',
                    border: 'none',
                    borderRadius: '10px',
                    background: activePanel === item.id ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                    color: activePanel === item.id ? 'white' : '#4a5568',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: activePanel === item.id ? '600' : '500',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (activePanel !== item.id) {
                      e.currentTarget.style.background = '#f7fafc';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activePanel !== item.id) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <Icon />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div style={{ 
            position: 'absolute', 
            bottom: '24px', 
            left: '24px', 
            right: '24px' 
          }}>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                background: 'white',
                color: '#e53e3e',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fff5f5';
                e.currentTarget.style.borderColor = '#e53e3e';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <LogOutIcon />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'absolute',
            top: '24px',
            left: sidebarOpen ? '296px' : '24px',
            background: 'white',
            border: 'none',
            borderRadius: '10px',
            padding: '12px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'left 0.3s ease',
            zIndex: 10
          }}
        >
          {sidebarOpen ? <XIcon /> : <MenuIcon />}
        </button>

        {message && (
          <div style={{
            background: message.includes('successfully') ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '12px',
            marginBottom: '24px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            fontWeight: '500',
            animation: 'slideIn 0.3s ease'
          }}>
            {message}
          </div>
        )}

        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%'
        }}>
          {/* List Users */}
          {activePanel === 'list' && (
            <>
              <div style={{ marginBottom: '32px' }}>
                <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700', color: '#1a202c' }}>All Users</h1>
                <p style={{ margin: 0, color: '#718096', fontSize: '14px' }}>Manage and view all registered users</p>
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                  <thead>
                    <tr>
                      <th style={{
                        background: '#f7fafc',
                        padding: '16px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#4a5568',
                        fontSize: '14px',
                        borderBottom: '2px solid #e2e8f0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>Email Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, idx) => (
                      <tr key={user.id} style={{
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f7fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{
                          padding: '16px',
                          borderBottom: idx === users.length - 1 ? 'none' : '1px solid #e2e8f0',
                          color: '#2d3748',
                          fontSize: '15px'
                        }}>{user.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Add User */}
          {activePanel === 'add' && (
            <>
              <div style={{ marginBottom: '32px' }}>
                <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700', color: '#1a202c' }}>Add New User</h1>
                <p style={{ margin: 0, color: '#718096', fontSize: '14px' }}>Create a new user account</p>
              </div>
              
              <div style={{ maxWidth: '700px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#4a5568', fontSize: '14px' }}>Email Address</label>
                  <input
                    type="text"
                    placeholder="user@example.com"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '15px',
                      transition: 'border 0.2s ease',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>
                
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#4a5568', fontSize: '14px' }}>Password</label>
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '15px',
                      transition: 'border 0.2s ease',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>
                
                <button
                  onClick={handleAddUser}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                  }}
                >
                  Add User
                </button>
              </div>
            </>
          )}

          {/* Modify Users */}
          {activePanel === 'modify' && (
            <>
              <div style={{ marginBottom: '32px' }}>
                <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700', color: '#1a202c' }}>Modify Users</h1>
                <p style={{ margin: 0, color: '#718096', fontSize: '14px' }}>Update user information</p>
              </div>
              
              {!editUserId ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                    <thead>
                      <tr>
                        <th style={{
                          background: '#f7fafc',
                          padding: '16px',
                          textAlign: 'left',
                          fontWeight: '600',
                          color: '#4a5568',
                          fontSize: '14px',
                          borderBottom: '2px solid #e2e8f0',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>Email Address</th>
                        <th style={{
                          background: '#f7fafc',
                          padding: '16px',
                          textAlign: 'right',
                          fontWeight: '600',
                          color: '#4a5568',
                          fontSize: '14px',
                          borderBottom: '2px solid #e2e8f0',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, idx) => (
                        <tr key={user.id} style={{ transition: 'background 0.2s ease' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f7fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{
                            padding: '16px',
                            borderBottom: idx === users.length - 1 ? 'none' : '1px solid #e2e8f0',
                            color: '#2d3748',
                            fontSize: '15px'
                          }}>{user.email}</td>
                          <td style={{
                            padding: '16px',
                            borderBottom: idx === users.length - 1 ? 'none' : '1px solid #e2e8f0',
                            textAlign: 'right'
                          }}>
                            <button
                              onClick={() => handleModifyUser(user)}
                              style={{
                                padding: '8px 20px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ maxWidth: '700px' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#4a5568', fontSize: '14px' }}>Email Address</label>
                    <input
                      type="text"
                      placeholder="user@example.com"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '15px',
                        transition: 'border 0.2s ease',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#4a5568', fontSize: '14px' }}>Password</label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '15px',
                        transition: 'border 0.2s ease',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={handleSaveEdit}
                      style={{
                        flex: 1,
                        padding: '14px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      style={{
                        flex: 1,
                        padding: '14px',
                        background: '#e2e8f0',
                        color: '#4a5568',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Delete Users */}
          {activePanel === 'delete' && (
            <>
              <div style={{ marginBottom: '32px' }}>
                <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700', color: '#1a202c' }}>Delete Users</h1>
                <p style={{ margin: 0, color: '#718096', fontSize: '14px' }}>Remove users from the system</p>
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                  <thead>
                    <tr>
                      <th style={{
                        background: '#f7fafc',
                        padding: '16px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#4a5568',
                        fontSize: '14px',
                        borderBottom: '2px solid #e2e8f0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>Email Address</th>
                      <th style={{
                        background: '#f7fafc',
                        padding: '16px',
                        textAlign: 'right',
                        fontWeight: '600',
                        color: '#4a5568',
                        fontSize: '14px',
                        borderBottom: '2px solid #e2e8f0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, idx) => (
                      <tr key={user.id} style={{ transition: 'background 0.2s ease' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f7fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{
                          padding: '16px',
                          borderBottom: idx === users.length - 1 ? 'none' : '1px solid #e2e8f0',
                          color: '#2d3748',
                          fontSize: '15px'
                        }}>{user.email}</td>
                        <td style={{
                          padding: '16px',
                          borderBottom: idx === users.length - 1 ? 'none' : '1px solid #e2e8f0',
                          textAlign: 'right'
                        }}>
                          <button
                            onClick={() => handleRemoveUser(user.id)}
                            style={{
                              padding: '8px 20px',
                              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'transform 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminPage;
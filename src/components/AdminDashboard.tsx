import { useState, useEffect } from 'react';
import { Users, AlertTriangle, MessageSquare, Trash2, Ban } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  status: string;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock reports since reports API wasn't strictly built in prototype
  const mockReports = [
    { id: 1, type: 'Post', reason: 'Inappropriate language', reporter: 'System', targetId: 42 }
  ];

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    } else {
      setLoading(false); // They shouldn't be here
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users.php?admin_id=${user?.id}`);
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (error) {
      console.error("Failed to load users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBan = async (targetUserId: number) => {
    if (!confirm("Are you sure you want to change this user's ban status?")) return;
    try {
      const res = await api.post('/admin/ban.php', {
        admin_id: user?.id,
        user_id: targetUserId
      });
      if (res.data.success) {
        fetchUsers(); // Refresh list to reflect new status
      }
    } catch (error) {
      console.error("Failed to update user status", error);
      alert("Failed to update user. They might already be an admin.");
    }
  };

  if (user?.role !== 'admin') {
    return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}><h2>Access Denied</h2><p>You must be an administrator to view this page.</p></div>;
  }

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2>Admin Dashboard</h2>
        <p style={{ color: 'var(--text-muted)' }}>Manage users and moderate content</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 3fr', gap: '2rem' }}>
        <div className="card" style={{ height: 'fit-content' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <button 
              className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ justifyContent: 'flex-start', padding: '1rem', borderRadius: 0, borderBottom: '1px solid var(--border-light)' }}
              onClick={() => setActiveTab('users')}
            >
              <Users size={18} /> Manage Users
            </button>
            <button 
              className={`btn ${activeTab === 'reports' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ justifyContent: 'flex-start', padding: '1rem', borderRadius: 0, borderBottom: '1px solid var(--border-light)' }}
              onClick={() => setActiveTab('reports')}
            >
              <AlertTriangle size={18} /> Reported Content
            </button>
            <button 
              className={`btn ${activeTab === 'content' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ justifyContent: 'flex-start', padding: '1rem', borderRadius: 0 }}
              onClick={() => setActiveTab('content')}
            >
              <MessageSquare size={18} /> All Posts
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>{activeTab === 'users' ? 'User Directory' : activeTab === 'reports' ? 'Active Reports' : 'Content Moderation'}</h3>
          </div>
          <div className="card-body">
            {activeTab === 'users' && (
              loading ? <p>Loading directory...</p> : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '0.75rem' }}>Name</th>
                        <th style={{ padding: '0.75rem' }}>Email</th>
                        <th style={{ padding: '0.75rem' }}>Dept / Role</th>
                        <th style={{ padding: '0.75rem' }}>Status</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '0.75rem', fontWeight: 500 }}>{u.name}</td>
                          <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</td>
                          <td style={{ padding: '0.75rem' }}>
                            <span className="badge badge-gray" style={{ marginRight: '0.5rem' }}>{u.department}</span>
                            {u.role === 'admin' && <span className="badge badge-blue">Admin</span>}
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <span className={`badge ${u.status === 'active' ? 'badge-green' : 'badge-gray'}`} style={{ backgroundColor: u.status === 'banned' ? '#FEE2E2' : '', color: u.status === 'banned' ? '#DC2626' : '' }}>
                              {u.status}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                            {u.role !== 'admin' && (
                              <button 
                                onClick={() => handleToggleBan(u.id)}
                                className="btn btn-ghost" 
                                style={{ padding: '0.25rem', color: u.status === 'banned' ? '#66BB6A' : '#DC2626' }} 
                                title={u.status === 'banned' ? "Lift Ban" : "Ban User"}
                              >
                                {u.status === 'banned' ? <span>Unban</span> : <Ban size={18} />}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {activeTab === 'reports' && (
              mockReports.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {mockReports.map(r => (
                    <div key={r.id} style={{ padding: '1rem', border: '1px solid #FCA5A5', backgroundColor: '#FEF2F2', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span style={{ fontWeight: 600, color: '#DC2626', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <AlertTriangle size={16} /> Report on {r.type} #{r.targetId}
                          </span>
                          <p style={{ marginTop: '0.5rem' }}><strong>Reason:</strong> {r.reason}</p>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Reported by: {r.reporter}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-outline" style={{ borderColor: 'var(--border-light)', color: 'var(--text-main)' }}>Dismiss</button>
                          <button className="btn btn-primary" style={{ backgroundColor: '#DC2626' }}><Trash2 size={16} /> Delete Content</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No active reports.</p>
              )
            )}
            
            {activeTab === 'content' && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>Content moderation list will appear here.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

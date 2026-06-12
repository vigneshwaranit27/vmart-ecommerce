import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiSearch, FiCheckCircle, FiXCircle, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import styles from './AdminTable.module.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15, ...(search && { search }), ...(roleFilter && { role: roleFilter }) };
      const { data } = await api.get('/users', { params });
      setUsers(data.users);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load users');
    }
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, [page, search, roleFilter]);

  const handleToggle = async (id, name) => {
    if (!window.confirm(`Toggle status for "${name}"?`)) return;
    try {
      await api.put(`/users/${id}/toggle-status`);
      toast.success('User status updated');
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    }
  };

  return (
    <>
      <Helmet><title>Users - VMart Admin</title></Helmet>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <h1>Users</h1>
            <p>{pagination.total || 0} registered users</p>
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text" placeholder="Search users..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className={styles.searchInput}
            />
          </div>
          <select className={styles.filterSelect} value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <div className={styles.tableCard}>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Email Verified</th>
                      <th>Joined</th>
                      <th>Last Login</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id}>
                        <td>
                          <div className={styles.customerCell}>
                            <div className={styles.customerAvatar}>
                              {user.avatar?.url && user.avatar.url !== 'https://via.placeholder.com/150'
                                ? <img src={user.avatar.url} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                : user.name?.charAt(0)
                              }
                            </div>
                            <div>
                              <p className={styles.customerName}>{user.name}</p>
                              <p className={styles.customerEmail}>{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td>{user.phone || '—'}</td>
                        <td>
                          <span className={`${styles.roleBadge} ${user.role === 'admin' ? styles.roleAdmin : styles.roleUser}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          {user.isEmailVerified
                            ? <FiCheckCircle className={styles.verifiedBadge} />
                            : <FiXCircle className={styles.unverifiedBadge} />
                          }
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>{new Date(user.createdAt).toLocaleDateString('en-IN')}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-IN') : '—'}
                        </td>
                        <td>
                          <span className={`${styles.statusBadge} ${user.isActive ? styles.active : styles.inactive}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <button
                            className={`${styles.editBtn} ${styles.toggleBtn}`}
                            onClick={() => handleToggle(user._id, user.name)}
                            title={user.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {user.isActive ? <FiToggleRight style={{ color: 'var(--success)' }} /> : <FiToggleLeft style={{ color: 'var(--error)' }} />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {pagination.pages > 1 && (
              <div className="pagination">
                <button className="pagination-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</button>
                {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`pagination-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button className="pagination-btn" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>›</button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

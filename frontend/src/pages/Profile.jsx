import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { FiUser, FiPhone, FiLock, FiSave } from 'react-icons/fi';
import { updateProfile } from '../store/slices/authSlice';
import api from '../services/api';
import toast from 'react-hot-toast';
import styles from './Profile.module.css';

export default function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    await dispatch(updateProfile(profileForm));
    setSavingProfile(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSavingPassword(true);
    try {
      await api.put('/auth/update-password', passwordForm);
      toast.success('Password updated successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    }
    setSavingPassword(false);
  };

  return (
    <>
      <Helmet><title>My Profile - VMart</title></Helmet>
      <div className={`container ${styles.page}`}>
        <div className={styles.layout}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.userCard}>
              <div className={styles.avatar}>
                {user?.avatar?.url && user.avatar.url !== 'https://via.placeholder.com/150'
                  ? <img src={user.avatar.url} alt={user.name} />
                  : <span>{user?.name?.charAt(0)?.toUpperCase()}</span>
                }
              </div>
              <div>
                <p className={styles.userName}>{user?.name}</p>
                <p className={styles.userEmail}>{user?.email}</p>
                {user?.role === 'admin' && <span className="badge badge-primary" style={{ marginTop: '6px' }}>Admin</span>}
              </div>
            </div>

            <nav className={styles.profileNav}>
              {['profile', 'password'].map(tab => (
                <button
                  key={tab}
                  className={`${styles.navItem} ${activeTab === tab ? styles.navActive : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'profile' ? <FiUser /> : <FiLock />}
                  {tab === 'profile' ? 'Profile Info' : 'Change Password'}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className={styles.content}>
            {activeTab === 'profile' && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}><FiUser /> Profile Information</h2>
                <form onSubmit={handleProfileSave}>
                  <div className={styles.formGrid}>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input className="form-input" value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input className="form-input" value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input className="form-input" value={user?.email} disabled style={{ opacity: 0.6 }} />
                    <p className="form-error" style={{ color: 'var(--text-muted)' }}>Email cannot be changed</p>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                    <FiSave /> {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'password' && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}><FiLock /> Change Password</h2>
                <form onSubmit={handlePasswordChange}>
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input type="password" className="form-input" required value={passwordForm.currentPassword} onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input type="password" className="form-input" required value={passwordForm.newPassword} onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))} placeholder="Min 6 characters" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input type="password" className="form-input" required value={passwordForm.confirmPassword} onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))} />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={savingPassword}>
                    <FiSave /> {savingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

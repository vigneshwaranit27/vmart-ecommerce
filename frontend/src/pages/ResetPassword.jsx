// ResetPassword.jsx
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiLock } from 'react-icons/fi';
import api from '../services/api';
import styles from './Auth.module.css';

export function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await api.put(`/auth/reset-password/${token}`, { password });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet><title>Reset Password - VMart</title></Helmet>
      <div className={styles.authPage}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <Link to="/" className={styles.authLogo}><span className={styles.logoV}>V</span>Mart</Link>
            <h1>Reset Password</h1>
            <p>Enter your new password</p>
          </div>
          <form onSubmit={handleSubmit} className={styles.authForm}>
            {error && <div className={styles.errorAlert}>{error}</div>}
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className={styles.inputWrap}>
                <FiLock className={styles.inputIcon} />
                <input type="password" className={`form-input ${styles.inputWithIcon}`} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className={styles.inputWrap}>
                <FiLock className={styles.inputIcon} />
                <input type="password" className={`form-input ${styles.inputWithIcon}`} required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default ResetPassword;

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import api from '../services/api';
import styles from './Auth.module.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send email');
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet><title>Forgot Password - VMart</title></Helmet>
      <div className={styles.authPage}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <Link to="/" className={styles.authLogo}><span className={styles.logoV}>V</span>Mart</Link>
            <h1>Forgot Password</h1>
            <p>Enter your email to receive reset instructions</p>
          </div>

          {sent ? (
            <div>
              <div className={styles.successAlert}>
                ✓ Password reset email sent! Check your inbox.
              </div>
              <Link to="/login" className="btn btn-primary btn-full">Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.authForm}>
              {error && <div className={styles.errorAlert}>{error}</div>}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className={styles.inputWrap}>
                  <FiMail className={styles.inputIcon} />
                  <input type="email" className={`form-input ${styles.inputWithIcon}`} placeholder="you@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <p className={styles.switchAuth}>
            <Link to="/login"><FiArrowLeft /> Back to Login</Link>
          </p>
        </div>
      </div>
    </>
  );
}

// ─── Login.jsx ───────────────────────────────────────────
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { login } from '../store/slices/authSlice';
import styles from './Auth.module.css';

export function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useSelector(s => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => { if (isAuthenticated) navigate('/'); }, [isAuthenticated]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(form));
  };

  return (
    <>
      <Helmet><title>Login - VMart</title></Helmet>
      <div className={styles.authPage}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <Link to="/" className={styles.authLogo}><span className={styles.logoV}>V</span>Mart</Link>
            <h1>Welcome Back</h1>
            <p>Sign in to your VMart account</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.authForm}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className={styles.inputWrap}>
                <FiMail className={styles.inputIcon} />
                <input
                  type="email" className={`form-input ${styles.inputWithIcon}`}
                  placeholder="you@example.com" required
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className={styles.inputWrap}>
                <FiLock className={styles.inputIcon} />
                <input
                  type={showPass ? 'text' : 'password'}
                  className={`form-input ${styles.inputWithIcon}`}
                  placeholder="Your password" required
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
                <button type="button" className={styles.showPass} onClick={() => setShowPass(!showPass)}>
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <div className={styles.forgotRow}>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
            <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className={styles.demoBox}>
            <p>Demo Credentials</p>
            <button onClick={() => setForm({ email: 'admin@vmart.com', password: 'admin123' })}>Admin Account</button>
            <button onClick={() => setForm({ email: 'user@vmart.com', password: 'user123' })}>User Account</button>
          </div>

          <p className={styles.switchAuth}>
            Don't have an account? <Link to="/register">Sign Up</Link>
          </p>
        </div>
      </div>
    </>
  );
}
export default Login;

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import { register } from '../store/slices/authSlice';
import styles from './Auth.module.css';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useSelector(s => s.auth);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (isAuthenticated) navigate('/'); }, [isAuthenticated]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    dispatch(register({ name: form.name, email: form.email, phone: form.phone, password: form.password }));
  };

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  return (
    <>
      <Helmet><title>Register - VMart</title></Helmet>
      <div className={styles.authPage}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <Link to="/" className={styles.authLogo}><span className={styles.logoV}>V</span>Mart</Link>
            <h1>Create Account</h1>
            <p>Join VMart and start shopping!</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.authForm}>
            {error && <div className={styles.errorAlert}>{error}</div>}

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className={styles.inputWrap}>
                <FiUser className={styles.inputIcon} />
                <input type="text" className={`form-input ${styles.inputWithIcon}`} placeholder="Your full name" required value={form.name} onChange={set('name')} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className={styles.inputWrap}>
                <FiMail className={styles.inputIcon} />
                <input type="email" className={`form-input ${styles.inputWithIcon}`} placeholder="you@example.com" required value={form.email} onChange={set('email')} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span></label>
              <div className={styles.inputWrap}>
                <FiPhone className={styles.inputIcon} />
                <input type="tel" className={`form-input ${styles.inputWithIcon}`} placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={set('phone')} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className={styles.inputWrap}>
                <FiLock className={styles.inputIcon} />
                <input type={showPass ? 'text' : 'password'} className={`form-input ${styles.inputWithIcon}`} placeholder="Min 6 characters" required value={form.password} onChange={set('password')} />
                <button type="button" className={styles.showPass} onClick={() => setShowPass(!showPass)}>
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className={styles.inputWrap}>
                <FiLock className={styles.inputIcon} />
                <input type="password" className={`form-input ${styles.inputWithIcon}`} placeholder="Repeat password" required value={form.confirmPassword} onChange={set('confirmPassword')} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className={styles.switchAuth}>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </>
  );
}

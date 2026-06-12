import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiGrid, FiPackage, FiShoppingBag, FiUsers,
  FiMenu, FiX, FiLogOut, FiChevronRight, FiMoon, FiSun
} from 'react-icons/fi';
import { logout } from '../../store/slices/authSlice';
import { toggleTheme } from '../../store/slices/uiSlice';
import styles from './AdminLayout.module.css';

const NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: <FiGrid />, exact: true },
  { path: '/admin/products', label: 'Products', icon: <FiShoppingBag /> },
  { path: '/admin/orders', label: 'Orders', icon: <FiPackage /> },
  { path: '/admin/users', label: 'Users', icon: <FiUsers /> },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const { theme } = useSelector(s => s.ui);

  const isActive = (path, exact) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          {!collapsed && (
            <Link to="/admin" className={styles.logo}>
              <span className={styles.logoV}>V</span>
              <span>Mart Admin</span>
            </Link>
          )}
          <button className={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <FiChevronRight /> : <FiX />}
          </button>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navItem} ${isActive(item.path, item.exact) ? styles.navActive : ''}`}
              title={collapsed ? item.label : ''}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          {!collapsed && (
            <div className={styles.userInfo}>
              <div className={styles.avatar}>{user?.name?.charAt(0)}</div>
              <div className={styles.userDetails}>
                <p className={styles.name}>{user?.name}</p>
                <p className={styles.role}>Administrator</p>
              </div>
            </div>
          )}
          <button className={styles.footerBtn} onClick={() => dispatch(toggleTheme())} title="Toggle theme">
            {theme === 'light' ? <FiMoon /> : <FiSun />}
          </button>
          <button className={`${styles.footerBtn} ${styles.logoutBtn}`} onClick={() => { dispatch(logout()); navigate('/'); }} title="Logout">
            <FiLogOut />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        <div className={styles.topBar}>
          <button className={styles.menuBtn} onClick={() => setCollapsed(!collapsed)}>
            <FiMenu />
          </button>
          <div className={styles.topBarRight}>
            <Link to="/" className={styles.viewStore}>← View Store</Link>
          </div>
        </div>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

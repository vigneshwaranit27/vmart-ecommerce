import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiSearch, FiShoppingCart, FiHeart, FiUser, FiSun, FiMoon, FiMenu, FiX, FiPackage, FiLogOut, FiSettings, FiChevronDown } from 'react-icons/fi';
import { logout } from '../../store/slices/authSlice';
import { cartItemCount } from '../../store/slices/cartSlice';
import { toggleTheme, toggleMobileMenu, closeMobileMenu } from '../../store/slices/uiSlice';
import styles from './Header.module.css';

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector(s => s.auth);
  const itemCount = useSelector(cartItemCount);
  const wishlistCount = useSelector(s => s.wishlist.items.length);
  const { theme, isMobileMenuOpen } = useSelector(s => s.ui);
  const categories = useSelector(s => s.products.categories);

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    dispatch(closeMobileMenu());
    setShowUserMenu(false);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.headerInner}`}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoV}>V</span>
          <span className={styles.logoMart}>Mart</span>
        </Link>

        {/* Desktop Nav */}
        <nav className={styles.navCategories}>
          <Link to="/products" className={styles.navLink}>All Products</Link>
          {categories.slice(0, 5).map(cat => (
            <Link key={cat._id} to={`/products?category=${cat._id}`} className={styles.navLink}>
              {cat.name}
            </Link>
          ))}
        </nav>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={styles.searchBar}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products, brands..."
              className={styles.searchInput}
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} className={styles.searchClear}>
                <FiX />
              </button>
            )}
          </div>
        </form>

        {/* Actions */}
        <div className={styles.actions}>
          {/* Mobile Search Toggle */}
          <button className={`${styles.iconBtn} hide-desktop`} onClick={() => setShowSearch(!showSearch)}>
            <FiSearch />
          </button>

          {/* Theme Toggle */}
          <button className={styles.iconBtn} onClick={() => dispatch(toggleTheme())} title="Toggle theme">
            {theme === 'light' ? <FiMoon /> : <FiSun />}
          </button>

          {/* Wishlist */}
          {isAuthenticated && (
            <Link to="/wishlist" className={styles.iconBtn}>
              <FiHeart />
              {wishlistCount > 0 && <span className={styles.badge}>{wishlistCount}</span>}
            </Link>
          )}

          {/* Cart */}
          <Link to="/cart" className={styles.iconBtn}>
            <FiShoppingCart />
            {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
          </Link>

          {/* User Menu */}
          {isAuthenticated ? (
            <div className={styles.userMenu}>
              <button
                className={styles.userBtn}
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className={styles.avatar}>
                  {user?.avatar?.url && user.avatar.url !== 'https://via.placeholder.com/150'
                    ? <img src={user.avatar.url} alt={user.name} />
                    : <span>{user?.name?.charAt(0)?.toUpperCase()}</span>
                  }
                </div>
                <span className={styles.userName}>{user?.name?.split(' ')[0]}</span>
                <FiChevronDown className={`${styles.chevron} ${showUserMenu ? styles.open : ''}`} />
              </button>

              {showUserMenu && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <span className={styles.dropdownName}>{user?.name}</span>
                    <span className={styles.dropdownEmail}>{user?.email}</span>
                  </div>
                  <div className={styles.dropdownDivider} />
                  <Link to="/profile" className={styles.dropdownItem}><FiSettings /> My Profile</Link>
                  <Link to="/orders" className={styles.dropdownItem}><FiPackage /> My Orders</Link>
                  <Link to="/wishlist" className={styles.dropdownItem}><FiHeart /> Wishlist</Link>
                  {user?.role === 'admin' && (
                    <>
                      <div className={styles.dropdownDivider} />
                      <Link to="/admin" className={styles.dropdownItem}><FiSettings /> Admin Panel</Link>
                    </>
                  )}
                  <div className={styles.dropdownDivider} />
                  <button onClick={handleLogout} className={`${styles.dropdownItem} ${styles.logoutBtn}`}>
                    <FiLogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.authBtns}>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm hide-mobile">Sign Up</Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button className={`${styles.iconBtn} hide-desktop`} onClick={() => dispatch(toggleMobileMenu())}>
            {isMobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      {showSearch && (
        <div className={styles.mobileSearch}>
          <form onSubmit={handleSearch}>
            <div className={styles.searchBar}>
              <FiSearch className={styles.searchIcon} />
              <input
                ref={searchRef}
                autoFocus
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products, brands..."
                className={styles.searchInput}
              />
            </div>
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <Link to="/products" className={styles.mobileNavLink}>All Products</Link>
          {categories.map(cat => (
            <Link key={cat._id} to={`/products?category=${cat._id}`} className={styles.mobileNavLink}>
              {cat.name}
            </Link>
          ))}
          {!isAuthenticated && (
            <div className={styles.mobileAuthBtns}>
              <Link to="/login" className="btn btn-outline btn-full">Login</Link>
              <Link to="/register" className="btn btn-primary btn-full">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

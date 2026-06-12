import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiYoutube } from 'react-icons/fi';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerGrid}`}>
        {/* Brand */}
        <div className={styles.brand}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoV}>V</span>
            <span>Mart</span>
          </Link>
          <p className={styles.tagline}>Shop Smart, Live Better. Your one-stop destination for everything you need.</p>
          <div className={styles.social}>
            <a href="#" className={styles.socialLink}><FiFacebook /></a>
            <a href="#" className={styles.socialLink}><FiTwitter /></a>
            <a href="#" className={styles.socialLink}><FiInstagram /></a>
            <a href="#" className={styles.socialLink}><FiYoutube /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div className={styles.column}>
          <h4 className={styles.columnTitle}>Quick Links</h4>
          <ul className={styles.linkList}>
            <li><Link to="/products">All Products</Link></li>
            <li><Link to="/products?isFeatured=true">Featured</Link></li>
            <li><Link to="/products?isBestSeller=true">Best Sellers</Link></li>
            <li><Link to="/products?isNew=true">New Arrivals</Link></li>
          </ul>
        </div>

        {/* Account */}
        <div className={styles.column}>
          <h4 className={styles.columnTitle}>My Account</h4>
          <ul className={styles.linkList}>
            <li><Link to="/profile">Profile</Link></li>
            <li><Link to="/orders">My Orders</Link></li>
            <li><Link to="/wishlist">Wishlist</Link></li>
            <li><Link to="/cart">Cart</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className={styles.column}>
          <h4 className={styles.columnTitle}>Contact</h4>
          <ul className={styles.contactList}>
            <li><FiMapPin /> 123 VMart Tower, MG Road, Tamil Nadu-600001</li>
            <li><FiPhone /> +91 7339490669</li>
            <li><FiMail />Vigneshwaran@vmart.com</li>
          </ul>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className="container">
          <p>© {new Date().getFullYear()} VMart. All rights reserved.</p>
          <div className={styles.footerLinks}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Return Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

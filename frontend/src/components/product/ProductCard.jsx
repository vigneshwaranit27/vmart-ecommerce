import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiHeart, FiShoppingCart, FiStar, FiEye } from 'react-icons/fi';
import { addToCart } from '../../store/slices/cartSlice';
import { toggleWishlist } from '../../store/slices/wishlistSlice';
import { openAuthModal } from '../../store/slices/uiSlice';
import styles from './ProductCard.module.css';

const formatPrice = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(s => s.auth);
  const wishlistItems = useSelector(s => s.wishlist.items);
  const isWishlisted = wishlistItems.some(i => (i._id || i) === product._id);
  const [imgError, setImgError] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { dispatch(openAuthModal('login')); return; }
    if (product.stock === 0) return;
    setAdding(true);
    await dispatch(addToCart({ productId: product._id, quantity: 1 }));
    setAdding(false);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    if (!isAuthenticated) { dispatch(openAuthModal('login')); return; }
    dispatch(toggleWishlist(product._id));
  };

  const imageUrl = !imgError && product.images?.[0]?.url
    ? product.images[0].url
    : `https://via.placeholder.com/300x300?text=${encodeURIComponent(product.name?.substring(0, 10) || 'Product')}`;

  return (
    <Link to={`/products/${product._id}`} className={styles.card}>
      {/* Image */}
      <div className={styles.imageWrap}>
        <img
          src={imageUrl}
          alt={product.name}
          className={styles.image}
          onError={() => setImgError(true)}
          loading="lazy"
        />


        {/* Badges */}
        <div className={styles.badges}>
          {product.discount > 0 && (
            <span className={styles.badgeDiscount}>{product.discount}% OFF</span>
          )}
          {product.isNew && <span className={styles.badgeNew}>NEW</span>}
          {product.isBestSeller && <span className={styles.badgeBestSeller}>BESTSELLER</span>}
          {product.stock === 0 && <span className={styles.badgeOutOfStock}>OUT OF STOCK</span>}
        </div>

        {/* Actions overlay */}
        <div className={styles.overlay}>
         <button
           className={styles.overlayBtn}
            title="Quick View"
            onClick={(e) => {
             e.preventDefault();
             e.stopPropagation();
              window.location.href = `/products/${product._id}`;
              }}
>
              <FiEye />
              </button>
            <Link to={`/products/${product._id}`} className={styles.overlayBtn} title="Quick View">
             <FiEye />
            </Link>
      
        </div>
      </div>

      {/* Details */}
      <div className={styles.details}>
        <p className={styles.brand}>{product.brand}</p>
        <h3 className={styles.name}>{product.name}</h3>

        {/* Rating */}
        {product.ratings?.count > 0 && (
          <div className={styles.rating}>
            <div className={styles.stars}>
              {[1,2,3,4,5].map(s => (
                <FiStar
                  key={s}
                  className={s <= Math.round(product.ratings.average) ? styles.starFilled : styles.starEmpty}
                />
              ))}
            </div>
            <span className={styles.ratingCount}>({product.ratings.count})</span>
          </div>
        )}

        {/* Price */}
        <div className={styles.priceRow}>
          <span className={styles.price}>{formatPrice(product.price)}</span>
          {product.originalPrice > product.price && (
            <span className={styles.originalPrice}>{formatPrice(product.originalPrice)}</span>
          )}
        </div>

        {/* Free shipping tag */}
        {product.freeShipping && (
          <span className={styles.freeShipping}>✓ Free Delivery</span>
        )}

        {/* Add to Cart */}
        <button
          className={`${styles.cartBtn} ${product.stock === 0 ? styles.disabled : ''}`}
          onClick={handleAddToCart}
          disabled={product.stock === 0 || adding}
        >
          <FiShoppingCart />
          {adding ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
}

import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight, FiTag } from 'react-icons/fi';
import { fetchCart, updateCartItem, removeFromCart, clearCart, cartSubtotal } from '../store/slices/cartSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import styles from './Cart.module.css';

const fmt = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);
const SHIPPING_THRESHOLD = 499;
const SHIPPING_CHARGE = 49;

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, isLoading } = useSelector(s => s.cart);
  const subtotal = useSelector(cartSubtotal);
  const { isAuthenticated } = useSelector(s => s.auth);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchCart());
  }, [isAuthenticated]);

  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  const handleQtyChange = (itemId, delta, current) => {
    const newQty = current + delta;
    if (newQty < 1) return;
    dispatch(updateCartItem({ itemId, quantity: newQty }));
  };

  if (!isAuthenticated) {
    return (
      <div className={`container ${styles.page}`}>
        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <h3>Please login to view your cart</h3>
          <p>Sign in to access your shopping cart</p>
          <Link to="/login" className="btn btn-primary btn-lg">Login</Link>
        </div>
      </div>
    );
  }

  if (isLoading && items.length === 0) {
    return (
      <div className={`container ${styles.page}`}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
          <LoadingSpinner size="lg" text="Loading cart..." />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`container ${styles.page}`}>
        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything to your cart yet</p>
          <Link to="/products" className="btn btn-primary btn-lg">
            <FiShoppingBag /> Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Cart ({items.length}) - VMart</title></Helmet>
      <div className={`container ${styles.page}`}>
        <div className={styles.header}>
          <h1>Shopping Cart <span>({items.length} items)</span></h1>
          <button className={styles.clearBtn} onClick={() => dispatch(clearCart())}>
            <FiTrash2 /> Clear Cart
          </button>
        </div>

        <div className={styles.layout}>
          {/* Cart Items */}
          <div className={styles.itemsList}>
            {items.map(item => {
              const product = item.product;
              const imgUrl = product?.images?.[0]?.url || `https://via.placeholder.com/100`;
              return (
                <div key={item._id} className={styles.cartItem}>
                  <Link to={`/products/${product?._id}`} className={styles.itemImage}>
                    <img src={imgUrl} alt={product?.name} />
                  </Link>

                  <div className={styles.itemInfo}>
                    <p className={styles.itemBrand}>{product?.brand}</p>
                    <Link to={`/products/${product?._id}`} className={styles.itemName}>
                      {product?.name}
                    </Link>
                    {item.variant && (
                      <div className={styles.itemVariants}>
                        {item.variant.color && <span>Color: {item.variant.color}</span>}
                        {item.variant.size && <span>Size: {item.variant.size}</span>}
                      </div>
                    )}
                    <div className={styles.itemPriceRow}>
                      <span className={styles.itemPrice}>{fmt(item.price)}</span>
                      {product?.originalPrice > item.price && (
                        <span className={styles.itemOriginalPrice}>{fmt(product.originalPrice)}</span>
                      )}
                    </div>
                    {product?.stock < 10 && product?.stock > 0 && (
                      <span className={styles.lowStock}>Only {product.stock} left!</span>
                    )}
                  </div>

                  <div className={styles.itemActions}>
                    <div className={styles.qtyControl}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => handleQtyChange(item._id, -1, item.quantity)}
                        disabled={item.quantity <= 1}
                      >
                        <FiMinus />
                      </button>
                      <span className={styles.qtyVal}>{item.quantity}</span>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => handleQtyChange(item._id, 1, item.quantity)}
                        disabled={item.quantity >= (product?.stock || 99)}
                      >
                        <FiPlus />
                      </button>
                    </div>

                    <p className={styles.itemTotal}>{fmt(item.price * item.quantity)}</p>

                    <button
                      className={styles.removeBtn}
                      onClick={() => dispatch(removeFromCart(item._id))}
                      title="Remove"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className={styles.summary}>
            <div className={styles.summaryCard}>
              <h3>Order Summary</h3>

              {/* Free shipping progress */}
              {subtotal < SHIPPING_THRESHOLD && (
                <div className={styles.shippingProgress}>
                  <p>Add {fmt(SHIPPING_THRESHOLD - subtotal)} more for <strong>FREE delivery</strong></p>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${Math.min((subtotal / SHIPPING_THRESHOLD) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {subtotal >= SHIPPING_THRESHOLD && (
                <div className={styles.freeShippingMsg}>
                  🎉 You qualify for free delivery!
                </div>
              )}

              <div className={styles.summaryRows}>
                <div className={styles.summaryRow}>
                  <span>Subtotal ({items.length} items)</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Shipping</span>
                  <span className={shipping === 0 ? styles.free : ''}>
                    {shipping === 0 ? 'FREE' : fmt(shipping)}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span>GST (18%)</span>
                  <span>{fmt(tax)}</span>
                </div>
                <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                  <strong>Total</strong>
                  <strong>{fmt(total)}</strong>
                </div>
              </div>

              {/* Coupon */}
              <div className={styles.couponSection}>
                <div className={styles.couponInput}>
                  <FiTag className={styles.couponIcon} />
                  <input type="text" placeholder="Enter coupon code" className={styles.couponField} />
                  <button className="btn btn-outline btn-sm">Apply</button>
                </div>
              </div>

              <button
                className="btn btn-primary btn-lg btn-full"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout <FiArrowRight />
              </button>

              <Link to="/products" className={styles.continueShopping}>
                ← Continue Shopping
              </Link>
            </div>

            {/* Security note */}
            <div className={styles.securityNote}>
              🔒 Secure checkout with SSL encryption
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

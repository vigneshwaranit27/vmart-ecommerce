import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import {
  FiShoppingCart, FiHeart, FiStar, FiTruck, FiShield, FiRefreshCw,
  FiChevronRight, FiMinus, FiPlus, FiShare2, FiPackage
} from 'react-icons/fi';
import { fetchProduct } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { toggleWishlist } from '../store/slices/wishlistSlice';
import { openAuthModal } from '../store/slices/uiSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProductCard from '../components/product/ProductCard';
import api from '../services/api';
import styles from './ProductDetail.module.css';

const fmt = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProduct: product, isLoading } = useSelector(s => s.products);
  const { isAuthenticated } = useSelector(s => s.auth);
  const wishlistItems = useSelector(s => s.wishlist.items);
  const isWishlisted = wishlistItems.some(i => (i._id || i) === product?._id);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState({});
  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [adding, setAdding] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    dispatch(fetchProduct(id));
    setSelectedImage(0);
    setQuantity(1);
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (product?._id) {
      api.get(`/products/${product._id}/related`).then(r => setRelatedProducts(r.data.products || []));
    }
  }, [product?._id]);

  const handleAddToCart = async (buyNow = false) => {
    if (!isAuthenticated) { dispatch(openAuthModal('login')); return; }
    setAdding(true);
    await dispatch(addToCart({ productId: product._id, quantity, variant: selectedVariant }));
    setAdding(false);
    if (buyNow) navigate('/cart');
  };

  const handleWishlist = () => {
    if (!isAuthenticated) { dispatch(openAuthModal('login')); return; }
    dispatch(toggleWishlist(product._id));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { dispatch(openAuthModal('login')); return; }
    setSubmittingReview(true);
    try {
      await api.post(`/products/${product._id}/reviews`, reviewForm);
      dispatch(fetchProduct(id));
      setReviewForm({ rating: 5, title: '', comment: '' });
    } catch (err) {
      console.error(err);
    }
    setSubmittingReview(false);
  };

  if (isLoading || !product) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <LoadingSpinner size="lg" text="Loading product..." />
      </div>
    );
  }

  const imageUrl = !imgError && product.images?.[selectedImage]?.url
    ? product.images[selectedImage].url
    : `https://via.placeholder.com/600x600?text=${encodeURIComponent(product.name?.substring(0, 10))}`;

  const uniqueColors = [...new Set((product.variants || []).map(v => v.color).filter(Boolean))];
  const uniqueSizes = [...new Set((product.variants || []).map(v => v.size).filter(Boolean))];

  return (
    <>
      <Helmet>
        <title>{product.name} - VMart</title>
        <meta name="description" content={product.shortDescription || product.description?.substring(0, 160)} />
      </Helmet>

      <div className={`container ${styles.page}`}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link to="/">Home</Link>
          <FiChevronRight />
          <Link to="/products">Products</Link>
          <FiChevronRight />
          <Link to={`/products?category=${product.category?._id}`}>{product.category?.name}</Link>
          <FiChevronRight />
          <span>{product.name?.substring(0, 30)}...</span>
        </nav>

        {/* Main Product Section */}
        <div className={styles.productMain}>
          {/* Images */}
          <div className={styles.imagesSection}>
            <div className={styles.mainImageWrap}>
              {product.discount > 0 && (
                <span className={styles.discountBadge}>{product.discount}% OFF</span>
              )}
              <img
                src={imageUrl}
                alt={product.name}
                className={styles.mainImage}
                onError={() => setImgError(true)}
              />
              <button className={styles.shareBtn} title="Share">
                <FiShare2 />
              </button>
            </div>
            {product.images?.length > 1 && (
              <div className={styles.thumbnails}>
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    className={`${styles.thumb} ${i === selectedImage ? styles.thumbActive : ''}`}
                    onClick={() => setSelectedImage(i)}
                  >
                    <img src={img.url} alt={`View ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className={styles.detailsSection}>
            <p className={styles.brand}>{product.brand}</p>
            <h1 className={styles.productName}>{product.name}</h1>

            {/* Rating */}
            <div className={styles.ratingRow}>
              <div className={styles.stars}>
                {[1,2,3,4,5].map(s => (
                  <FiStar key={s} className={s <= Math.round(product.ratings?.average || 0) ? styles.starFilled : styles.starEmpty} />
                ))}
              </div>
              <span className={styles.ratingAvg}>{product.ratings?.average?.toFixed(1)}</span>
              <span className={styles.ratingCount}>({product.ratings?.count || 0} reviews)</span>
              {product.soldCount > 0 && <span className={styles.soldCount}>{product.soldCount}+ sold</span>}
            </div>

            {/* Price */}
            <div className={styles.priceSection}>
              <span className={styles.price}>{fmt(product.price)}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className={styles.originalPrice}>{fmt(product.originalPrice)}</span>
                  <span className={styles.savings}>Save {fmt(product.originalPrice - product.price)}</span>
                </>
              )}
            </div>

            {/* Stock indicator */}
            <div className={styles.stockRow}>
              {product.stock === 0 ? (
                <span className={styles.outOfStock}>Out of Stock</span>
              ) : product.stock < 10 ? (
                <span className={styles.lowStock}>⚠️ Only {product.stock} left!</span>
              ) : (
                <span className={styles.inStock}>✓ In Stock</span>
              )}
            </div>

            {/* Color Variants */}
            {uniqueColors.length > 0 && (
              <div className={styles.variantSection}>
                <p className={styles.variantLabel}>Color: <strong>{selectedVariant.color || 'Select'}</strong></p>
                <div className={styles.colorOptions}>
                  {uniqueColors.map(color => {
                    const v = product.variants.find(x => x.color === color);
                    return (
                      <button
                        key={color}
                        className={`${styles.colorBtn} ${selectedVariant.color === color ? styles.selectedColor : ''}`}
                        style={{ background: v?.colorHex || '#ccc' }}
                        onClick={() => setSelectedVariant(prev => ({ ...prev, color }))}
                        title={color}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Variants */}
            {uniqueSizes.length > 0 && (
              <div className={styles.variantSection}>
                <p className={styles.variantLabel}>Size: <strong>{selectedVariant.size || 'Select'}</strong></p>
                <div className={styles.sizeOptions}>
                  {uniqueSizes.map(size => (
                    <button
                      key={size}
                      className={`${styles.sizeBtn} ${selectedVariant.size === size ? styles.selectedSize : ''}`}
                      onClick={() => setSelectedVariant(prev => ({ ...prev, size }))}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className={styles.quantitySection}>
              <p className={styles.variantLabel}>Quantity</p>
              <div className={styles.quantityControl}>
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className={styles.qtyBtn}
                  disabled={quantity <= 1}
                >
                  <FiMinus />
                </button>
                <span className={styles.qtyVal}>{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className={styles.qtyBtn}
                  disabled={quantity >= product.stock}
                >
                  <FiPlus />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className={styles.actionsRow}>
              <button
                className={`${styles.cartBtn} btn btn-primary btn-lg`}
                onClick={() => handleAddToCart(false)}
                disabled={product.stock === 0 || adding}
              >
                <FiShoppingCart />
                {adding ? 'Adding...' : 'Add to Cart'}
              </button>
              <button
                className={`btn btn-secondary btn-lg`}
                onClick={() => handleAddToCart(true)}
                disabled={product.stock === 0}
                style={{ flex: 1 }}
              >
                <FiPackage />
                Buy Now
              </button>
              <button
                className={`${styles.wishlistBtn} ${isWishlisted ? styles.wishlisted : ''}`}
                onClick={handleWishlist}
                title="Wishlist"
              >
                <FiHeart />
              </button>
            </div>

            {/* Delivery Info */}
            <div className={styles.deliveryInfo}>
              <div className={styles.deliveryItem}>
                <FiTruck className={styles.deliveryIcon} />
                <div>
                  <strong>{product.freeShipping ? 'Free Delivery' : `Delivery: ${fmt(product.shippingCharge || 49)}`}</strong>
                  <p>Estimated delivery in 3-5 business days</p>
                </div>
              </div>
              <div className={styles.deliveryItem}>
                <FiRefreshCw className={styles.deliveryIcon} />
                <div>
                  <strong>{product.returnPolicy || '30 days return'}</strong>
                  <p>Easy returns and refunds</p>
                </div>
              </div>
              <div className={styles.deliveryItem}>
                <FiShield className={styles.deliveryIcon} />
                <div>
                  <strong>{product.warranty || '1 year warranty'}</strong>
                  <p>Brand warranty included</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabsSection}>
          <div className={styles.tabs}>
            {['description', 'specifications', 'reviews'].map(tab => (
              <button
                key={tab}
                className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'reviews' && product.ratings?.count > 0 && ` (${product.ratings.count})`}
              </button>
            ))}
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'description' && (
              <div className={styles.description}>
                <p>{product.description}</p>
                {product.features?.length > 0 && (
                  <div className={styles.features}>
                    <h4>Key Features</h4>
                    <ul>
                      {product.features.map((f, i) => <li key={i}>✓ {f}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className={styles.specifications}>
                {product.specifications?.length > 0 ? (
                  <table className={styles.specTable}>
                    <tbody>
                      {product.specifications.map((s, i) => (
                        <tr key={i}>
                          <td className={styles.specKey}>{s.key}</td>
                          <td className={styles.specVal}>{s.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ color: 'var(--text-muted)' }}>No specifications available.</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className={styles.reviewsTab}>
                {/* Rating Summary */}
                {product.ratings?.count > 0 && (
                  <div className={styles.ratingSummary}>
                    <div className={styles.ratingBig}>
                      <span className={styles.ratingNumber}>{product.ratings.average?.toFixed(1)}</span>
                      <div className={styles.stars}>
                        {[1,2,3,4,5].map(s => (
                          <FiStar key={s} className={s <= Math.round(product.ratings.average) ? styles.starFilled : styles.starEmpty} />
                        ))}
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{product.ratings.count} reviews</span>
                    </div>
                  </div>
                )}

                {/* Review List */}
                {product.reviews?.length > 0 ? (
                  <div className={styles.reviewList}>
                    {product.reviews.map(review => (
                      <div key={review._id} className={styles.reviewCard}>
                        <div className={styles.reviewHeader}>
                          <div className={styles.reviewAvatar}>
                            {review.avatar
                              ? <img src={review.avatar} alt={review.name} />
                              : <span>{review.name?.charAt(0)}</span>
                            }
                          </div>
                          <div>
                            <p className={styles.reviewName}>{review.name}</p>
                            <div className={styles.reviewStars}>
                              {[1,2,3,4,5].map(s => (
                                <FiStar key={s} className={s <= review.rating ? styles.starFilled : styles.starEmpty} />
                              ))}
                            </div>
                          </div>
                          <span className={styles.reviewDate}>
                            {new Date(review.createdAt).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        <p className={styles.reviewTitle}>{review.title}</p>
                        <p className={styles.reviewComment}>{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', margin: '24px 0' }}>No reviews yet. Be the first to review!</p>
                )}

                {/* Write Review */}
                {isAuthenticated && (
                  <div className={styles.writeReview}>
                    <h4>Write a Review</h4>
                    <form onSubmit={handleReviewSubmit}>
                      <div className={styles.ratingInput}>
                        <label>Rating</label>
                        <div className={styles.starInput}>
                          {[1,2,3,4,5].map(s => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setReviewForm(f => ({ ...f, rating: s }))}
                              className={s <= reviewForm.rating ? styles.starFilled : styles.starEmpty}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', padding: '2px' }}
                            >
                              <FiStar />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Review Title</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Summarize your experience"
                          value={reviewForm.title}
                          onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Your Review</label>
                        <textarea
                          className="form-input"
                          rows={4}
                          placeholder="Tell others about your experience..."
                          value={reviewForm.comment}
                          onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                          required
                          style={{ resize: 'vertical' }}
                        />
                      </div>
                      <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className={styles.relatedSection}>
            <h2 className="section-title">Related Products</h2>
            <div className="products-grid">
              {relatedProducts.slice(0, 8).map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

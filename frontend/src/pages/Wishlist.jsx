import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { fetchWishlist } from '../store/slices/wishlistSlice';
import ProductCard from '../components/product/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Wishlist() {
  const dispatch = useDispatch();
  const { items, isLoading } = useSelector(s => s.wishlist);

  useEffect(() => { dispatch(fetchWishlist()); }, []);

  return (
    <>
      <Helmet><title>Wishlist - VMart</title></Helmet>
      <div className="container page-wrapper">
        <h1 className="section-title">❤️ My Wishlist {items.length > 0 && `(${items.length})`}</h1>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <LoadingSpinner size="lg" text="Loading wishlist..." />
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💔</div>
            <h3>Your wishlist is empty</h3>
            <p>Save items you love to buy them later</p>
            <Link to="/products" className="btn btn-primary btn-lg">Browse Products</Link>
          </div>
        ) : (
          <div className="products-grid">
            {items.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>
    </>
  );
}

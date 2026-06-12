import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  return (
    <>
      <Helmet><title>404 - Page Not Found - VMart</title></Helmet>
      <div style={{ minHeight: 'calc(100vh - var(--header-height))', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ fontSize: '100px', lineHeight: 1, marginBottom: '24px' }}>🔍</div>
          <h1 style={{ fontSize: '80px', fontWeight: 900, color: 'var(--primary)', lineHeight: 1, marginBottom: '8px' }}>404</h1>
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>Page Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '16px' }}>
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" className="btn btn-primary btn-lg">Go Home</Link>
            <Link to="/products" className="btn btn-outline btn-lg">Browse Products</Link>
          </div>
        </div>
      </div>
    </>
  );
}

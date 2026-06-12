import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import styles from './AdminTable.module.css';

const fmt = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15, ...(search && { search }) };
      const { data } = await api.get('/products', { params });
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      toast.error('Failed to load products');
    }
    setLoading(false);
  };

  useEffect(() => { loadProducts(); }, [page, search]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      loadProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  return (
    <>
      <Helmet><title>Products - VMart Admin</title></Helmet>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <h1>Products</h1>
            <p>{pagination.total || 0} total products</p>
          </div>
          <Link to="/admin/products/new" className="btn btn-primary">
            <FiPlus /> Add Product
          </Link>
        </div>

        {/* Search */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className={styles.searchInput}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <div className={styles.tableCard}>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Sold</th>
                      <th>Rating</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product._id}>
                        <td>
                          <div className={styles.productCell}>
                            <img
                              src={product.images?.[0]?.url || 'https://via.placeholder.com/48'}
                              alt={product.name}
                              className={styles.productImg}
                            />
                            <div>
                              <p className={styles.productName}>{product.name?.substring(0, 40)}{product.name?.length > 40 ? '...' : ''}</p>
                              <span className={styles.productBrand}>{product.brand}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={styles.categoryBadge}>{product.category?.name || '—'}</span>
                        </td>
                        <td>
                          <div>
                            <p className={styles.price}>{fmt(product.price)}</p>
                            {product.discount > 0 && <span className={styles.discount}>{product.discount}% off</span>}
                          </div>
                        </td>
                        <td>
                          <span className={product.stock === 0 ? styles.outStock : product.stock < 10 ? styles.lowStock : styles.inStock}>
                            {product.stock}
                          </span>
                        </td>
                        <td>{product.soldCount || 0}</td>
                        <td>
                          <div className={styles.ratingCell}>
                            <span className={styles.star}>★</span>
                            {product.ratings?.average?.toFixed(1) || '0.0'}
                            <span className={styles.ratingCount}>({product.ratings?.count || 0})</span>
                          </div>
                        </td>
                        <td>
                          <span className={`${styles.statusBadge} ${product.isActive ? styles.active : styles.inactive}`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actions}>
                            <Link to={`/admin/products/edit/${product._id}`} className={styles.editBtn} title="Edit">
                              <FiEdit2 />
                            </Link>
                            <button
                              className={styles.deleteBtn}
                              onClick={() => handleDelete(product._id, product.name)}
                              title="Delete"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pagination">
                <button className="pagination-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`pagination-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button className="pagination-btn" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>›</button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

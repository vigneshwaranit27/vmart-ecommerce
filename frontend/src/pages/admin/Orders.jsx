import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiSearch } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import styles from './AdminTable.module.css';

const fmt = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

const STATUS_OPTIONS = ['pending','confirmed','processing','shipped','out_for_delivery','delivered','cancelled','refunded'];
const STATUS_COLORS = {
  pending: '#ffab00', confirmed: '#2196f3', processing: '#9c27b0',
  shipped: '#00bcd4', out_for_delivery: '#ff9800', delivered: '#00c853',
  cancelled: '#f44336', refunded: '#795548'
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15, ...(search && { search }), ...(statusFilter && { status: statusFilter }) };
      const { data } = await api.get('/orders', { params });
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load orders');
    }
    setLoading(false);
  };

  useEffect(() => { loadOrders(); }, [page, search, statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus, message: `Order ${newStatus}` });
      toast.success('Order status updated');
      loadOrders();
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <>
      <Helmet><title>Orders - VMart Admin</title></Helmet>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <h1>Orders</h1>
            <p>{pagination.total || 0} total orders</p>
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text" placeholder="Search by order number..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className={styles.searchInput}
            />
          </div>
          <select className={styles.filterSelect} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
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
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Update Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order._id}>
                        <td>
                          <a href={`/orders/${order._id}`} className={styles.orderNumber} target="_blank" rel="noreferrer">
                            #{order.orderNumber}
                          </a>
                        </td>
                        <td>
                          <div className={styles.customerCell}>
                            <div className={styles.customerAvatar}>{order.user?.name?.charAt(0)}</div>
                            <div>
                              <p className={styles.customerName}>{order.user?.name}</p>
                              <p className={styles.customerEmail}>{order.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td>{order.items?.length} item(s)</td>
                        <td><strong>{fmt(order.pricing?.total)}</strong></td>
                        <td>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: '12px', textTransform: 'uppercase' }}>{order.paymentInfo?.method}</p>
                            <span style={{
                              fontSize: '11px',
                              color: order.paymentInfo?.status === 'completed' ? 'var(--success)' : 'var(--warning)',
                              fontWeight: 700
                            }}>
                              {order.paymentInfo?.status}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span
                            className={styles.orderStatusBadge}
                            style={{
                              background: (STATUS_COLORS[order.orderStatus] || '#ccc') + '20',
                              color: STATUS_COLORS[order.orderStatus] || '#ccc'
                            }}
                          >
                            {order.orderStatus?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                        <td>
                          {!['delivered', 'cancelled', 'refunded'].includes(order.orderStatus) && (
                            <select
                              className={styles.selectStatus}
                              value={order.orderStatus}
                              onChange={e => handleStatusChange(order._id, e.target.value)}
                            >
                              {STATUS_OPTIONS.map(s => (
                                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                              ))}
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {pagination.pages > 1 && (
              <div className="pagination">
                <button className="pagination-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</button>
                {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => i + 1).map(p => (
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

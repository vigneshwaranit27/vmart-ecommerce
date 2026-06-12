import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { FiPackage, FiChevronRight, FiEye } from 'react-icons/fi';
import { fetchMyOrders } from '../store/slices/orderSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import styles from './Orders.module.css';

const fmt = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

const STATUS_COLORS = {
  pending: 'warning', confirmed: 'info', processing: 'info',
  shipped: 'primary', out_for_delivery: 'primary',
  delivered: 'success', cancelled: 'error', refunded: 'error'
};

export default function Orders() {
  const dispatch = useDispatch();
  const { items: orders, isLoading } = useSelector(s => s.orders);

  useEffect(() => { dispatch(fetchMyOrders()); }, []);

  if (isLoading) return (
    <div className="container page-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
      <LoadingSpinner size="lg" text="Loading orders..." />
    </div>
  );

  return (
    <>
      <Helmet><title>My Orders - VMart</title></Helmet>
      <div className={`container ${styles.page}`}>
        <h1 className="section-title"><FiPackage /> My Orders</h1>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>No orders yet</h3>
            <p>Your order history will appear here once you make a purchase</p>
            <Link to="/products" className="btn btn-primary btn-lg">Start Shopping</Link>
          </div>
        ) : (
          <div className={styles.ordersList}>
            {orders.map(order => (
              <div key={order._id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div>
                    <p className={styles.orderNumber}>Order #{order.orderNumber}</p>
                    <p className={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div className={styles.orderRight}>
                    <span className={`badge badge-${STATUS_COLORS[order.orderStatus] || 'primary'}`}>
                      {order.orderStatus?.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <strong className={styles.orderTotal}>{fmt(order.pricing?.total)}</strong>
                  </div>
                </div>

                <div className={styles.orderItems}>
                  {order.items?.slice(0, 3).map((item, i) => (
                    <div key={i} className={styles.orderItem}>
                      <img src={item.image} alt={item.name} />
                      <div className={styles.orderItemInfo}>
                        <p>{item.name}</p>
                        <span>Qty: {item.quantity} × {fmt(item.price)}</span>
                      </div>
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <p className={styles.moreItems}>+{order.items.length - 3} more items</p>
                  )}
                </div>

                <div className={styles.orderFooter}>
                  <span className={styles.payMethod}>{order.paymentInfo?.method?.toUpperCase()} · {order.paymentInfo?.status?.toUpperCase()}</span>
                  <Link to={`/orders/${order._id}`} className="btn btn-outline btn-sm">
                    <FiEye /> View Details <FiChevronRight />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

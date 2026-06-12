// OrderSuccess.jsx
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { FiCheckCircle, FiPackage, FiShoppingBag } from 'react-icons/fi';
import { fetchOrder } from '../store/slices/orderSlice';
import { useSelector } from 'react-redux';
import styles from './OrderSuccess.module.css';

const fmt = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

export function OrderSuccess() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentOrder: order } = useSelector(s => s.orders);

  useEffect(() => { dispatch(fetchOrder(id)); }, [id]);

  return (
    <>
      <Helmet><title>Order Confirmed - VMart</title></Helmet>
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.iconWrap}>
            <FiCheckCircle className={styles.icon} />
          </div>
          <h1>Order Confirmed! 🎉</h1>
          <p className={styles.subtitle}>Thank you for shopping with VMart</p>

          {order && (
            <div className={styles.orderInfo}>
              <div className={styles.orderInfoItem}>
                <span>Order Number</span>
                <strong>#{order.orderNumber}</strong>
              </div>
              <div className={styles.orderInfoItem}>
                <span>Total</span>
                <strong>{fmt(order.pricing?.total)}</strong>
              </div>
              <div className={styles.orderInfoItem}>
                <span>Payment</span>
                <strong className={styles.payStatus}>{order.paymentInfo?.method?.toUpperCase()}</strong>
              </div>
              <div className={styles.orderInfoItem}>
                <span>Estimated Delivery</span>
                <strong>3-5 Business Days</strong>
              </div>
            </div>
          )}

          <p className={styles.emailNote}>
            A confirmation email will be sent to your registered email address.
          </p>

          <div className={styles.actions}>
            <Link to={`/orders/${id}`} className="btn btn-primary btn-lg">
              <FiPackage /> Track Order
            </Link>
            <Link to="/products" className="btn btn-ghost btn-lg">
              <FiShoppingBag /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default OrderSuccess;

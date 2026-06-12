import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { FiPackage, FiCheck, FiTruck, FiMapPin, FiX } from 'react-icons/fi';
import { fetchOrder, cancelOrder } from '../store/slices/orderSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import styles from './OrderDetail.module.css';

const fmt = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

const TRACKING_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

export default function OrderDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentOrder: order, isLoading } = useSelector(s => s.orders);

  useEffect(() => { dispatch(fetchOrder(id)); }, [id]);

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      dispatch(cancelOrder({ id, reason: 'Cancelled by customer' }));
    }
  };

  if (isLoading || !order) return (
    <div className="container page-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
      <LoadingSpinner size="lg" text="Loading order details..." />
    </div>
  );

  const currentStep = TRACKING_STEPS.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === 'cancelled';

  return (
    <>
      <Helmet><title>Order #{order.orderNumber} - VMart</title></Helmet>
      <div className={`container ${styles.page}`}>
        <div className={styles.header}>
          <div>
            <Link to="/orders" className={styles.back}>← Back to Orders</Link>
            <h1>Order #{order.orderNumber}</h1>
            <p className={styles.date}>Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className={styles.headerRight}>
            <span className={`badge badge-${isCancelled ? 'error' : 'success'}`}>
              {order.orderStatus?.replace(/_/g, ' ').toUpperCase()}
            </span>
            {['pending', 'confirmed'].includes(order.orderStatus) && (
              <button className="btn btn-danger btn-sm" onClick={handleCancel}>
                <FiX /> Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* Tracking */}
        {!isCancelled && (
          <div className={styles.trackingCard}>
            <h3><FiTruck /> Order Tracking</h3>
            <div className={styles.trackingSteps}>
              {TRACKING_STEPS.map((step, i) => {
                const isDone = i <= currentStep;
                const isActive = i === currentStep;
                return (
                  <div key={step} className={`${styles.trackStep} ${isDone ? styles.done : ''} ${isActive ? styles.active : ''}`}>
                    <div className={styles.trackDot}>
                      {isDone ? <FiCheck /> : i + 1}
                    </div>
                    <span className={styles.trackLabel}>{step.replace(/_/g, ' ')}</span>
                    {i < TRACKING_STEPS.length - 1 && <div className={`${styles.trackLine} ${isDone && i < currentStep ? styles.trackLineDone : ''}`} />}
                  </div>
                );
              })}
            </div>

            {/* Tracking History */}
            {order.trackingHistory?.length > 0 && (
              <div className={styles.trackHistory}>
                {[...order.trackingHistory].reverse().map((h, i) => (
                  <div key={i} className={styles.trackEvent}>
                    <div className={styles.trackEventDot} />
                    <div>
                      <p className={styles.trackEventMsg}>{h.message}</p>
                      <span className={styles.trackEventTime}>{new Date(h.timestamp).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className={styles.layout}>
          {/* Order Items */}
          <div className={styles.mainCol}>
            <div className={styles.card}>
              <h3>Order Items ({order.items?.length})</h3>
              <div className={styles.itemsList}>
                {order.items?.map((item, i) => (
                  <div key={i} className={styles.item}>
                    <img src={item.image} alt={item.name} />
                    <div className={styles.itemInfo}>
                      <p className={styles.itemName}>{item.name}</p>
                      {item.variant && (
                        <span className={styles.itemVariant}>
                          {item.variant.color && `Color: ${item.variant.color}`}
                          {item.variant.size && ` | Size: ${item.variant.size}`}
                        </span>
                      )}
                      <span className={styles.itemQty}>Qty: {item.quantity}</span>
                    </div>
                    <span className={styles.itemPrice}>{fmt(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side info */}
          <div className={styles.sideCol}>
            {/* Delivery Address */}
            <div className={styles.card}>
              <h3><FiMapPin /> Delivery Address</h3>
              <div className={styles.addressInfo}>
                <p><strong>{order.shippingAddress?.name}</strong></p>
                <p>{order.shippingAddress?.street}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</p>
                <p>{order.shippingAddress?.phone}</p>
              </div>
            </div>

            {/* Payment */}
            <div className={styles.card}>
              <h3>Payment Info</h3>
              <div className={styles.payInfo}>
                <div className={styles.payRow}><span>Method</span><strong>{order.paymentInfo?.method?.toUpperCase()}</strong></div>
                <div className={styles.payRow}><span>Status</span><strong className={order.paymentInfo?.status === 'completed' ? styles.paid : styles.pending}>{order.paymentInfo?.status?.toUpperCase()}</strong></div>
              </div>
              <div className={styles.pricingRows}>
                <div className={styles.pricingRow}><span>Subtotal</span><span>{fmt(order.pricing?.subtotal)}</span></div>
                <div className={styles.pricingRow}><span>Shipping</span><span>{order.pricing?.shippingCharge === 0 ? 'FREE' : fmt(order.pricing?.shippingCharge)}</span></div>
                <div className={styles.pricingRow}><span>GST</span><span>{fmt(order.pricing?.tax)}</span></div>
                <div className={`${styles.pricingRow} ${styles.totalRow}`}><strong>Total</strong><strong>{fmt(order.pricing?.total)}</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

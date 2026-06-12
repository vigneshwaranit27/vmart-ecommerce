import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { FiCheckCircle, FiCreditCard, FiTruck, FiSmartphone, FiEdit } from 'react-icons/fi';
import { cartSubtotal } from '../store/slices/cartSlice';
import { createOrder } from '../store/slices/orderSlice';
import api from '../services/api';
import toast from 'react-hot-toast';
import styles from './Checkout.module.css';

const fmt = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

const STEPS = ['Address', 'Payment', 'Review'];

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector(s => s.cart);
  const { user } = useSelector(s => s.auth);
  const subtotal = useSelector(cartSubtotal);

  const [step, setStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [placing, setPlacing] = useState(false);

  const shipping = subtotal >= 499 ? 0 : 49;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India'
  });

  useEffect(() => {
    if (items.length === 0) navigate('/cart');
  }, [items]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    setStep(1);
  };

  const handleRazorpayPayment = async () => {
    try {
      const { data } = await api.post('/payment/razorpay/create-order', { amount: total });
      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: 'INR',
        name: 'VMart',
        description: 'Order Payment',
        order_id: data.order.id,
        handler: async (response) => {
          try {
            await api.post('/payment/razorpay/verify', response);
            await placeOrder('razorpay', {
              razorpayOrderId: data.order.id,
              razorpayPaymentId: response.razorpay_payment_id,
              status: 'completed'
            });
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        prefill: { name: user?.name, email: user?.email, contact: address.phone },
        theme: { color: '#1a73e8' },
        modal: { ondismiss: () => toast.error('Payment cancelled') }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error('Failed to initialize payment');
    }
  };

  const placeOrder = async (method = paymentMethod, paymentDetails = {}) => {
    setPlacing(true);
    try {
      const orderData = {
        items: items.map(i => ({
          product: i.product._id,
          name: i.product.name,
          image: i.product.images?.[0]?.url || '',
          price: i.price,
          quantity: i.quantity,
          variant: i.variant
        })),
        shippingAddress: address,
        paymentMethod: method,
        pricing: { subtotal, shippingCharge: shipping, tax, total, discount: 0 }
      };
      const result = await dispatch(createOrder(orderData));
      if (result.payload?._id) navigate(`/order-success/${result.payload._id}`);
    } catch (err) {
      toast.error('Failed to place order');
    }
    setPlacing(false);
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'razorpay') {
      await handleRazorpayPayment();
    } else {
      await placeOrder('cod');
    }
  };

  const Summary = () => (
    <div className={styles.summaryCard}>
      <h3>Order Summary</h3>
      <div className={styles.summaryItems}>
        {items.slice(0, 3).map(item => (
          <div key={item._id} className={styles.summaryItem}>
            <img src={item.product?.images?.[0]?.url || ''} alt={item.product?.name} />
            <div className={styles.summaryItemInfo}>
              <p>{item.product?.name?.substring(0, 40)}...</p>
              <span>Qty: {item.quantity}</span>
            </div>
            <span className={styles.summaryItemPrice}>{fmt(item.price * item.quantity)}</span>
          </div>
        ))}
        {items.length > 3 && <p className={styles.moreItems}>+{items.length - 3} more items</p>}
      </div>
      <div className={styles.summaryTotals}>
        <div className={styles.summaryRow}><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
        <div className={styles.summaryRow}><span>Shipping</span><span className={shipping === 0 ? styles.free : ''}>{shipping === 0 ? 'FREE' : fmt(shipping)}</span></div>
        <div className={styles.summaryRow}><span>GST (18%)</span><span>{fmt(tax)}</span></div>
        <div className={`${styles.summaryRow} ${styles.totalRow}`}><strong>Total</strong><strong>{fmt(total)}</strong></div>
      </div>
    </div>
  );

  return (
    <>
      <Helmet><title>Checkout - VMart</title></Helmet>
      <div className={`container ${styles.page}`}>
        <h1 className={styles.title}>Checkout</h1>

        {/* Step indicator */}
        <div className={styles.stepIndicator}>
          {STEPS.map((s, i) => (
            <div key={s} className={styles.stepWrap}>
              <button
                className={`${styles.step} ${i === step ? styles.stepActive : ''} ${i < step ? styles.stepDone : ''}`}
                onClick={() => i < step && setStep(i)}
              >
                {i < step ? <FiCheckCircle /> : i + 1}
              </button>
              <span className={`${styles.stepLabel} ${i === step ? styles.stepLabelActive : ''}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`${styles.stepLine} ${i < step ? styles.stepLineDone : ''}`} />}
            </div>
          ))}
        </div>

        <div className={styles.layout}>
          <div className={styles.mainContent}>
            {/* Step 0: Address */}
            {step === 0 && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}><FiTruck /> Delivery Address</h2>

                {/* Saved Addresses */}
                {user?.addresses?.length > 0 && (
                  <div className={styles.savedAddresses}>
                    <p className={styles.savedLabel}>Saved Addresses</p>
                    {user.addresses.map(addr => (
                      <label key={addr._id} className={styles.savedAddr}>
                        <input
                          type="radio"
                          name="savedAddress"
                          onChange={() => setAddress({ name: addr.name, phone: addr.phone, street: addr.street, city: addr.city, state: addr.state, postalCode: addr.postalCode, country: addr.country })}
                        />
                        <div>
                          <p><strong>{addr.name}</strong> — {addr.phone}</p>
                          <p>{addr.street}, {addr.city}, {addr.state} {addr.postalCode}</p>
                        </div>
                      </label>
                    ))}
                    <p className={styles.orDivider}>Or enter a new address</p>
                  </div>
                )}

                <form onSubmit={handleAddressSubmit}>
                  <div className={styles.formGrid}>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input className="form-input" required value={address.name} onChange={e => setAddress(a => ({ ...a, name: e.target.value }))} placeholder="Full Name" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input className="form-input" required value={address.phone} onChange={e => setAddress(a => ({ ...a, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Street Address</label>
                    <input className="form-input" required value={address.street} onChange={e => setAddress(a => ({ ...a, street: e.target.value }))} placeholder="House no, building, street, area" />
                  </div>
                  <div className={styles.formGrid}>
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input className="form-input" required value={address.city} onChange={e => setAddress(a => ({ ...a, city: e.target.value }))} placeholder="City" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">State</label>
                      <input className="form-input" required value={address.state} onChange={e => setAddress(a => ({ ...a, state: e.target.value }))} placeholder="State" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">PIN Code</label>
                      <input className="form-input" required value={address.postalCode} onChange={e => setAddress(a => ({ ...a, postalCode: e.target.value }))} placeholder="PIN Code" maxLength={6} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Country</label>
                      <input className="form-input" value={address.country} readOnly />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg">Continue to Payment</button>
                </form>
              </div>
            )}

            {/* Step 1: Payment */}
            {step === 1 && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}><FiCreditCard /> Payment Method</h2>
                <div className={styles.paymentOptions}>
                  <label className={`${styles.paymentOption} ${paymentMethod === 'razorpay' ? styles.paymentSelected : ''}`}>
                    <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} />
                    <div className={styles.paymentIcon}><FiCreditCard /></div>
                    <div>
                      <strong>Razorpay</strong>
                      <p>UPI, Cards, Net Banking, Wallets</p>
                    </div>
                    <span className={styles.paymentBadge}>Recommended</span>
                  </label>

                  <label className={`${styles.paymentOption} ${paymentMethod === 'cod' ? styles.paymentSelected : ''}`}>
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                    <div className={styles.paymentIcon}><FiSmartphone /></div>
                    <div>
                      <strong>Cash on Delivery</strong>
                      <p>Pay when your order arrives</p>
                    </div>
                  </label>
                </div>
                <div className={styles.stepBtns}>
                  <button className="btn btn-ghost" onClick={() => setStep(0)}><FiEdit /> Edit Address</button>
                  <button className="btn btn-primary btn-lg" onClick={() => setStep(2)}>Review Order</button>
                </div>
              </div>
            )}

            {/* Step 2: Review */}
            {step === 2 && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Review Order</h2>

                <div className={styles.reviewSection}>
                  <div className={styles.reviewBlock}>
                    <div className={styles.reviewBlockHeader}>
                      <h4>Delivery Address</h4>
                      <button className={styles.editBtn} onClick={() => setStep(0)}><FiEdit /> Edit</button>
                    </div>
                    <p><strong>{address.name}</strong></p>
                    <p>{address.street}, {address.city}, {address.state} {address.postalCode}</p>
                    <p>{address.phone}</p>
                  </div>

                  <div className={styles.reviewBlock}>
                    <div className={styles.reviewBlockHeader}>
                      <h4>Payment Method</h4>
                      <button className={styles.editBtn} onClick={() => setStep(1)}><FiEdit /> Edit</button>
                    </div>
                    <p>{paymentMethod === 'razorpay' ? '💳 Razorpay (UPI/Cards/NetBanking)' : '💵 Cash on Delivery'}</p>
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-lg btn-full"
                  onClick={handlePlaceOrder}
                  disabled={placing}
                >
                  {placing ? 'Placing Order...' : paymentMethod === 'razorpay' ? `Pay ${fmt(total)}` : `Place Order (COD) ${fmt(total)}`}
                </button>
              </div>
            )}
          </div>

          <Summary />
        </div>
      </div>
    </>
  );
}

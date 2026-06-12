import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FiUsers, FiShoppingBag, FiPackage, FiDollarSign,
  FiTrendingUp, FiTrendingDown, FiArrowRight
} from 'react-icons/fi';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import styles from './Dashboard.module.css';

const fmt = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

const STATUS_COLORS = {
  pending: '#ffab00', confirmed: '#2196f3', processing: '#9c27b0',
  shipped: '#00bcd4', out_for_delivery: '#ff9800', delivered: '#00c853',
  cancelled: '#f44336', refunded: '#795548'
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [chart, setChart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/revenue-chart')
    ]).then(([statsRes, chartRes]) => {
      setStats(statsRes.data.stats);
      setChart(chartRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
      <LoadingSpinner size="lg" text="Loading dashboard..." />
    </div>
  );

  const maxRevenue = Math.max(...chart.map(d => d.revenue), 1);

  const STAT_CARDS = [
    { label: 'Total Users', value: stats?.totalUsers?.toLocaleString(), icon: <FiUsers />, color: '#1a73e8', bg: '#e8f0fe', trend: '+12%' },
    { label: 'Total Products', value: stats?.totalProducts?.toLocaleString(), icon: <FiShoppingBag />, color: '#00c853', bg: '#e8f5e9', trend: '+5%' },
    { label: 'Total Orders', value: stats?.totalOrders?.toLocaleString(), icon: <FiPackage />, color: '#ff6b00', bg: '#fff3e0', trend: '+18%' },
    { label: 'Monthly Revenue', value: fmt(stats?.monthlyRevenue || 0), icon: <FiDollarSign />, color: '#9c27b0', bg: '#f3e5f5', trend: `${stats?.revenueGrowth > 0 ? '+' : ''}${stats?.revenueGrowth}%` },
  ];

  return (
    <>
      <Helmet><title>Dashboard - VMart Admin</title></Helmet>

      <div className={styles.page}>
        <div className={styles.header}>
          <h1>Dashboard</h1>
          <p>Welcome back! Here's what's happening at VMart.</p>
        </div>

        {/* Stat Cards */}
        <div className={styles.statsGrid}>
          {STAT_CARDS.map((card, i) => (
            <div key={i} className={styles.statCard}>
              <div className={styles.statLeft}>
                <p className={styles.statLabel}>{card.label}</p>
                <p className={styles.statValue}>{card.value}</p>
                <div className={styles.statTrend}>
                  {parseFloat(card.trend) >= 0
                    ? <FiTrendingUp style={{ color: '#00c853' }} />
                    : <FiTrendingDown style={{ color: '#f44336' }} />
                  }
                  <span style={{ color: parseFloat(card.trend) >= 0 ? '#00c853' : '#f44336' }}>
                    {card.trend} this month
                  </span>
                </div>
              </div>
              <div className={styles.statIcon} style={{ background: card.bg, color: card.color }}>
                {card.icon}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.mainGrid}>
          {/* Revenue Chart */}
          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <h3>Revenue (Last 7 Days)</h3>
            </div>
            <div className={styles.barChart}>
              {chart.map((d, i) => (
                <div key={i} className={styles.barGroup}>
                  <div className={styles.barWrap}>
                    <div
                      className={styles.bar}
                      style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                      title={fmt(d.revenue)}
                    />
                  </div>
                  <span className={styles.barLabel}>{d.date}</span>
                  <span className={styles.barValue}>{d.orders} orders</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Status */}
          <div className={styles.statusCard}>
            <div className={styles.cardHeader}>
              <h3>Order Status</h3>
              <Link to="/admin/orders" className={styles.viewAll}>View All <FiArrowRight /></Link>
            </div>
            <div className={styles.statusList}>
              {stats?.ordersByStatus?.map((s, i) => (
                <div key={i} className={styles.statusRow}>
                  <div className={styles.statusDot} style={{ background: STATUS_COLORS[s._id] || '#ccc' }} />
                  <span className={styles.statusName}>{s._id?.replace(/_/g, ' ')}</span>
                  <span className={styles.statusCount}>{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.bottomGrid}>
          {/* Recent Orders */}
          <div className={styles.tableCard}>
            <div className={styles.cardHeader}>
              <h3>Recent Orders</h3>
              <Link to="/admin/orders" className={styles.viewAll}>View All <FiArrowRight /></Link>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentOrders?.map(order => (
                    <tr key={order._id}>
                      <td>
                        <Link to={`/orders/${order._id}`} className={styles.orderLink}>
                          #{order.orderNumber}
                        </Link>
                      </td>
                      <td>
                        <div className={styles.customerCell}>
                          <div className={styles.customerAvatar}>{order.user?.name?.charAt(0)}</div>
                          <div>
                            <p>{order.user?.name}</p>
                            <span>{order.user?.email}</span>
                          </div>
                        </div>
                      </td>
                      <td><strong>{fmt(order.pricing?.total)}</strong></td>
                      <td>
                        <span
                          className={styles.statusBadge}
                          style={{ background: STATUS_COLORS[order.orderStatus] + '20', color: STATUS_COLORS[order.orderStatus] }}
                        >
                          {order.orderStatus?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Products */}
          <div className={styles.topProductsCard}>
            <div className={styles.cardHeader}>
              <h3>Top Products</h3>
              <Link to="/admin/products" className={styles.viewAll}>View All <FiArrowRight /></Link>
            </div>
            <div className={styles.topProductsList}>
              {stats?.topProducts?.map((product, i) => (
                <div key={product._id} className={styles.topProduct}>
                  <span className={styles.rank}>#{i + 1}</span>
                  <img
                    src={product.images?.[0]?.url || 'https://via.placeholder.com/48'}
                    alt={product.name}
                    className={styles.productThumb}
                  />
                  <div className={styles.productInfo}>
                    <p className={styles.productName}>{product.name?.substring(0, 32)}...</p>
                    <span className={styles.productSold}>{product.soldCount} sold</span>
                  </div>
                  <strong className={styles.productPrice}>{fmt(product.price)}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

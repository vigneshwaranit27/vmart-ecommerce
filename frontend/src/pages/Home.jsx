import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { FiArrowRight, FiShoppingBag, FiTruck, FiShield, FiRefreshCw, FiStar, FiZap } from 'react-icons/fi';
import { fetchProducts } from '../store/slices/productSlice';
import ProductCard from '../components/product/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import styles from './Home.module.css';

const HERO_SLIDES = [
  {
    title: 'Premium Electronics',
    subtitle: 'Up to 40% off on top brands',
    cta: 'Shop Electronics',
    link: '/products?category=electronics',
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600',
    accent: '#4a9eff',
  },
  {
    title: "Season's Best Fashion",
    subtitle: 'New arrivals every week',
    cta: 'Explore Fashion',
    link: '/products?category=fashion',
    gradient: 'linear-gradient(135deg, #2d1a4e 0%, #4a1942 50%, #7b1fa2 100%)',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600',
    accent: '#ce93d8',
  },
  {
    title: 'Home & Living',
    subtitle: 'Transform your living space',
    cta: 'Shop Home',
    link: '/products?category=home-living',
    gradient: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 50%, #40916c 100%)',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',
    accent: '#95d5b2',
  }
];

const PERKS = [
  { icon: <FiTruck />, title: 'Free Delivery', desc: 'On orders above ₹499' },
  { icon: <FiShield />, title: 'Secure Payment', desc: '100% secure transactions' },
  { icon: <FiRefreshCw />, title: 'Easy Returns', desc: '30-day return policy' },
  { icon: <FiStar />, title: 'Top Brands', desc: '500+ trusted brands' },
];

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: products, isLoading, categories } = useSelector(s => s.products);
  const [heroSlide, setHeroSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);

  useEffect(() => {
    dispatch(fetchProducts({ isFeatured: true, limit: 8 })).then(action => {
      if (action.payload) setFeaturedProducts(action.payload.products || []);
    });
    dispatch(fetchProducts({ isBestSeller: true, limit: 8 })).then(action => {
      if (action.payload) setBestSellers(action.payload.products || []);
    });
    dispatch(fetchProducts({ isNew: true, limit: 8 })).then(action => {
      if (action.payload) setNewArrivals(action.payload.products || []);
    });

    const interval = setInterval(() => setHeroSlide(s => (s + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(interval);
  }, []);

  const slide = HERO_SLIDES[heroSlide];

  return (
    <>
      <Helmet>
        <title>VMart - Shop Smart, Live Better</title>
        <meta name="description" content="VMart - Your premium online shopping destination. Electronics, Fashion, Home & more." />
      </Helmet>

      {/* Hero */}
      <section className={styles.hero} style={{ background: slide.gradient }}>
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroText}>
            <div className={styles.heroBadge} style={{ color: slide.accent, borderColor: slide.accent }}>
              <FiZap /> Exclusive Deals
            </div>
            <h1 className={styles.heroTitle}>{slide.title}</h1>
            <p className={styles.heroSubtitle}>{slide.subtitle}</p>
            <div className={styles.heroBtns}>
              <Link to={slide.link} className={styles.heroBtn} style={{ background: slide.accent, color: '#000' }}>
                {slide.cta} <FiArrowRight />
              </Link>
              <Link to="/products" className={styles.heroBtnOutline} style={{ borderColor: slide.accent, color: slide.accent }}>
                Browse All
              </Link>
            </div>
          </div>
          <div className={styles.heroImage}>
            <img src={slide.image} alt={slide.title} />
          </div>
        </div>

        {/* Slide indicators */}
        <div className={styles.slideIndicators}>
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === heroSlide ? styles.dotActive : ''}`}
              onClick={() => setHeroSlide(i)}
            />
          ))}
        </div>
      </section>

      {/* Perks Bar */}
      <section className={styles.perksBar}>
        <div className={`container ${styles.perksGrid}`}>
          {PERKS.map((p, i) => (
            <div key={i} className={styles.perk}>
              <div className={styles.perkIcon}>{p.icon}</div>
              <div>
                <div className={styles.perkTitle}>{p.title}</div>
                <div className={styles.perkDesc}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className={`${styles.section} container`}>
        <h2 className="section-title"><FiShoppingBag /> Shop by Category</h2>
        <div className={styles.categoriesGrid}>
          {categories.map(cat => (
            <Link key={cat._id} to={`/products?category=${cat._id}`} className={styles.catCard}>
              <div className={styles.catImageWrap}>
                <img src={cat.image?.url} alt={cat.name} loading="lazy" />
              </div>
              <span className={styles.catName}>{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className={`${styles.section} container`}>
        <div className={styles.sectionHeader}>
          <h2 className="section-title">⚡ Featured Products</h2>
          <Link to="/products?isFeatured=true" className={styles.viewAll}>
            View All <FiArrowRight />
          </Link>
        </div>
        {isLoading && featuredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <LoadingSpinner size="lg" text="Loading products..." />
          </div>
        ) : (
          <div className="products-grid">
            {featuredProducts.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>

      {/* Promo Banner */}
      <section className={`${styles.promoBanner} container`}>
        <div className={styles.promoContent}>
          <div className={styles.promoBadge}>Limited Time Offer</div>
          <h2 className={styles.promoTitle}>Get 20% Off Your First Order</h2>
          <p className={styles.promoText}>Use code <strong>VMART20</strong> at checkout</p>
          <Link to="/register" className="btn btn-secondary btn-lg">
            Sign Up & Save
          </Link>
        </div>
        <div className={styles.promoDecor}>
          <div className={styles.promoCircle1} />
          <div className={styles.promoCircle2} />
        </div>
      </section>

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className={`${styles.section} container`}>
          <div className={styles.sectionHeader}>
            <h2 className="section-title">🏆 Best Sellers</h2>
            <Link to="/products?isBestSeller=true" className={styles.viewAll}>
              View All <FiArrowRight />
            </Link>
          </div>
          <div className="products-grid">
            {bestSellers.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className={`${styles.section} container`}>
          <div className={styles.sectionHeader}>
            <h2 className="section-title">✨ New Arrivals</h2>
            <Link to="/products?isNew=true" className={styles.viewAll}>
              View All <FiArrowRight />
            </Link>
          </div>
          <div className="products-grid">
            {newArrivals.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </>
  );
}

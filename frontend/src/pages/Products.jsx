import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { FiFilter, FiX, FiChevronDown, FiChevronUp, FiGrid, FiList, FiSearch } from 'react-icons/fi';
import { fetchProducts } from '../store/slices/productSlice';
import ProductCard from '../components/product/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import styles from './Products.module.css';

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-ratings.average', label: 'Top Rated' },
  { value: '-soldCount', label: 'Best Selling' },
];

const PRICE_RANGES = [
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 – ₹2,000', min: 500, max: 2000 },
  { label: '₹2,000 – ₹10,000', min: 2000, max: 10000 },
  { label: '₹10,000 – ₹50,000', min: 10000, max: 50000 },
  { label: 'Above ₹50,000', min: 50000, max: '' },
];

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={styles.filterSection}>
      <button className={styles.filterSectionHeader} onClick={() => setOpen(!open)}>
        <span>{title}</span>
        {open ? <FiChevronUp /> : <FiChevronDown />}
      </button>
      {open && <div className={styles.filterSectionBody}>{children}</div>}
    </div>
  );
}

export default function Products() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items: products, isLoading, pagination, categories } = useSelector(s => s.products);

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  // Filter state
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    sort: searchParams.get('sort') || '-createdAt',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: searchParams.get('rating') || '',
    inStock: searchParams.get('inStock') || '',
    isFeatured: searchParams.get('isFeatured') || '',
    isBestSeller: searchParams.get('isBestSeller') || '',
    isNew: searchParams.get('isNew') || '',
    freeShipping: searchParams.get('freeShipping') || '',
    page: parseInt(searchParams.get('page')) || 1,
  });

  const loadProducts = useCallback(() => {
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    params.limit = 12;
    dispatch(fetchProducts(params));
    // Sync URL
    const urlParams = {};
    Object.entries(filters).forEach(([k, v]) => { if (v && v !== '-createdAt' && k !== 'page') urlParams[k] = v; });
    if (filters.page > 1) urlParams.page = filters.page;
    setSearchParams(urlParams);
  }, [filters]);

  useEffect(() => { loadProducts(); }, [filters]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: key !== 'page' ? 1 : value }));
  };

  const setPriceRange = (min, max) => {
    setFilters(prev => ({ ...prev, minPrice: min, maxPrice: max, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', sort: '-createdAt', minPrice: '', maxPrice: '', rating: '', inStock: '', isFeatured: '', isBestSeller: '', isNew: '', freeShipping: '', page: 1 });
  };

  const activeFilterCount = [
    filters.category, filters.minPrice, filters.maxPrice, filters.rating,
    filters.inStock, filters.isFeatured, filters.isBestSeller, filters.isNew, filters.freeShipping
  ].filter(Boolean).length;

  const totalPages = pagination?.pages || 1;

  const FilterPanel = () => (
    <aside className={styles.filterPanel}>
      <div className={styles.filterHeader}>
        <h3>Filters {activeFilterCount > 0 && <span className={styles.filterCount}>{activeFilterCount}</span>}</h3>
        {activeFilterCount > 0 && (
          <button className={styles.clearFilters} onClick={clearFilters}>Clear All</button>
        )}
      </div>

      <FilterSection title="Category">
        <div className={styles.filterOptions}>
          <label className={`${styles.filterOption} ${!filters.category ? styles.active : ''}`}>
            <input type="radio" name="category" value="" checked={!filters.category} onChange={() => updateFilter('category', '')} />
            All Categories
          </label>
          {categories.map(cat => (
            <label key={cat._id} className={`${styles.filterOption} ${filters.category === cat._id ? styles.active : ''}`}>
              <input type="radio" name="category" value={cat._id} checked={filters.category === cat._id} onChange={() => updateFilter('category', cat._id)} />
              {cat.name}
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Price Range">
        <div className={styles.filterOptions}>
          {PRICE_RANGES.map((r, i) => (
            <label key={i} className={`${styles.filterOption} ${filters.minPrice == r.min && filters.maxPrice == r.max ? styles.active : ''}`}>
              <input type="radio" name="price" checked={filters.minPrice == r.min && filters.maxPrice == r.max} onChange={() => setPriceRange(r.min, r.max)} />
              {r.label}
            </label>
          ))}
        </div>
        <div className={styles.priceInputs}>
          <input type="number" placeholder="Min ₹" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)} className={styles.priceInput} />
          <span>–</span>
          <input type="number" placeholder="Max ₹" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)} className={styles.priceInput} />
        </div>
      </FilterSection>

      <FilterSection title="Rating">
        <div className={styles.filterOptions}>
          {[4, 3, 2, 1].map(r => (
            <label key={r} className={`${styles.filterOption} ${filters.rating == r ? styles.active : ''}`}>
              <input type="radio" name="rating" checked={filters.rating == r} onChange={() => updateFilter('rating', r)} />
              {'★'.repeat(r)}{'☆'.repeat(5 - r)} & above
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="More Filters">
        <div className={styles.filterOptions}>
          {[
            { key: 'inStock', label: 'In Stock' },
            { key: 'freeShipping', label: 'Free Shipping' },
            { key: 'isFeatured', label: 'Featured' },
            { key: 'isBestSeller', label: 'Best Seller' },
            { key: 'isNew', label: 'New Arrival' },
          ].map(({ key, label }) => (
            <label key={key} className={styles.filterCheckbox}>
              <input
                type="checkbox"
                checked={filters[key] === 'true'}
                onChange={e => updateFilter(key, e.target.checked ? 'true' : '')}
              />
              <span className={styles.checkmark} />
              {label}
            </label>
          ))}
        </div>
      </FilterSection>
    </aside>
  );

  return (
    <>
      <Helmet>
        <title>Products - VMart</title>
      </Helmet>

      <div className={`container ${styles.page}`}>
        {/* Top Bar */}
        <div className={styles.topBar}>
          <div className={styles.searchBarWrap}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={e => updateFilter('search', e.target.value)}
              className={styles.searchInput}
            />
            {filters.search && (
              <button className={styles.clearSearch} onClick={() => updateFilter('search', '')}>
                <FiX />
              </button>
            )}
          </div>

          <div className={styles.topBarRight}>
            <select
              value={filters.sort}
              onChange={e => updateFilter('sort', e.target.value)}
              className={styles.sortSelect}
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <button
              className={`${styles.filterToggle} ${activeFilterCount > 0 ? styles.hasFilters : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter />
              Filters
              {activeFilterCount > 0 && <span className={styles.filterBadge}>{activeFilterCount}</span>}
            </button>

            <div className={styles.viewToggle}>
              <button className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.activeView : ''}`} onClick={() => setViewMode('grid')}><FiGrid /></button>
              <button className={`${styles.viewBtn} ${viewMode === 'list' ? styles.activeView : ''}`} onClick={() => setViewMode('list')}><FiList /></button>
            </div>
          </div>
        </div>

        {/* Results info */}
        {!isLoading && (
          <p className={styles.resultsInfo}>
            Showing {products.length} of {pagination?.total || 0} products
            {filters.search && ` for "${filters.search}"`}
          </p>
        )}

        <div className={styles.layout}>
          {/* Desktop Filter Sidebar */}
          <div className={`${styles.sidebar} ${showFilters ? styles.sidebarOpen : ''}`}>
            <div className={styles.sidebarOverlay} onClick={() => setShowFilters(false)} />
            <div className={styles.sidebarContent}>
              <div className={styles.sidebarMobileHeader}>
                <h3>Filters</h3>
                <button onClick={() => setShowFilters(false)}><FiX /></button>
              </div>
              <FilterPanel />
            </div>
          </div>

          {/* Products */}
          <div className={styles.productsArea}>
            {isLoading ? (
              <div className={styles.loadingState}>
                <LoadingSpinner size="lg" text="Loading products..." />
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms</p>
                <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'products-grid' : styles.listGrid}>
                {products.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  disabled={filters.page <= 1}
                  onClick={() => updateFilter('page', filters.page - 1)}
                >
                  ‹
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let page = i + 1;
                  if (totalPages > 7) {
                    if (filters.page <= 4) page = i + 1;
                    else if (filters.page >= totalPages - 3) page = totalPages - 6 + i;
                    else page = filters.page - 3 + i;
                  }
                  return (
                    <button
                      key={page}
                      className={`pagination-btn ${filters.page === page ? 'active' : ''}`}
                      onClick={() => updateFilter('page', page)}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  className="pagination-btn"
                  disabled={filters.page >= totalPages}
                  onClick={() => updateFilter('page', filters.page + 1)}
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

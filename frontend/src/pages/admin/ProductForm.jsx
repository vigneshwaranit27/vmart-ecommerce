import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiSave, FiArrowLeft, FiPlus, FiX, FiUpload } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import styles from './ProductForm.module.css';

const EMPTY = {
  name: '', description: '', shortDescription: '', price: '', originalPrice: '',
  brand: '', category: '', stock: '', sku: '',
  isFeatured: false, isNew: true, isBestSeller: false, freeShipping: false,
  returnPolicy: '30 days return policy', warranty: '1 year warranty',
  tags: '', features: '', images: [],
};

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.categories || []));
    if (isEdit) {
      setLoading(true);
      api.get(`/products/${id}`).then(r => {
        const p = r.data.product;
        setForm({
          ...EMPTY, ...p,
          category: p.category?._id || '',
          tags: (p.tags || []).join(', '),
          features: (p.features || []).join('\n'),
          images: p.images || [],
        });
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const set = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [key]: val }));
  };

  const addImageUrl = () => {
    if (!imageUrl.trim()) return;
    setForm(f => ({ ...f, images: [...f.images, { url: imageUrl.trim(), alt: form.name }] }));
    setImageUrl('');
  };

  const removeImage = (index) => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('images', f));
      const { data } = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(f => ({ ...f, images: [...f.images, ...data.images] }));
      toast.success(`${data.images.length} image(s) uploaded`);
    } catch {
      toast.error('Failed to upload images');
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category || !form.brand) {
      toast.error('Please fill all required fields');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        stock: Number(form.stock),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        features: form.features ? form.features.split('\n').filter(Boolean) : [],
      };

      if (isEdit) {
        await api.put(`/products/${id}`, payload);
        toast.success('Product updated successfully!');
      } else {
        await api.post('/products', payload);
        toast.success('Product created successfully!');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    }
    setSaving(false);
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
      <LoadingSpinner size="lg" text="Loading product..." />
    </div>
  );

  return (
    <>
      <Helmet><title>{isEdit ? 'Edit Product' : 'Add Product'} - VMart Admin</title></Helmet>
      <div className={styles.page}>
        <div className={styles.header}>
          <Link to="/admin/products" className={styles.back}><FiArrowLeft /> Back to Products</Link>
          <h1>{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.layout}>
            {/* Main Info */}
            <div className={styles.mainCol}>
              <div className={styles.card}>
                <h3>Basic Information</h3>
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input className="form-input" value={form.name} onChange={set('name')} placeholder="Enter product name" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Short Description</label>
                  <input className="form-input" value={form.shortDescription} onChange={set('shortDescription')} placeholder="Brief description (shown on cards)" maxLength={200} />
                </div>
                <div className="form-group">
                  <label className="form-label">Full Description *</label>
                  <textarea
                    className="form-input"
                    value={form.description} onChange={set('description')}
                    placeholder="Detailed product description..."
                    rows={5} style={{ resize: 'vertical' }} required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Key Features (one per line)</label>
                  <textarea
                    className="form-input"
                    value={form.features} onChange={set('features')}
                    placeholder="Noise Cancellation&#10;30hr Battery&#10;USB-C Charging"
                    rows={4} style={{ resize: 'vertical' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tags (comma-separated)</label>
                  <input className="form-input" value={form.tags} onChange={set('tags')} placeholder="wireless, headphones, premium" />
                </div>
              </div>

              {/* Images */}
              <div className={styles.card}>
                <h3>Product Images</h3>
                <div className={styles.imageGrid}>
                  {form.images.map((img, i) => (
                    <div key={i} className={styles.imageItem}>
                      <img src={img.url} alt={img.alt || `Image ${i + 1}`} />
                      <button type="button" className={styles.removeImage} onClick={() => removeImage(i)}>
                        <FiX />
                      </button>
                    </div>
                  ))}
                  <label className={styles.uploadBox}>
                    <input type="file" multiple accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                    <FiUpload />
                    <span>{uploading ? 'Uploading...' : 'Upload Images'}</span>
                  </label>
                </div>
                <div className={styles.imageUrlRow}>
                  <input
                    type="url" className="form-input"
                    value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                    placeholder="Or paste image URL..."
                    style={{ flex: 1 }}
                  />
                  <button type="button" className="btn btn-outline" onClick={addImageUrl}>
                    <FiPlus /> Add URL
                  </button>
                </div>
              </div>
            </div>

            {/* Side */}
            <div className={styles.sideCol}>
              <div className={styles.card}>
                <h3>Pricing & Inventory</h3>
                <div className="form-group">
                  <label className="form-label">Selling Price (₹) *</label>
                  <input type="number" className="form-input" value={form.price} onChange={set('price')} placeholder="0" min={0} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Original Price (₹)</label>
                  <input type="number" className="form-input" value={form.originalPrice} onChange={set('originalPrice')} placeholder="0 (for discount display)" min={0} />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Quantity *</label>
                  <input type="number" className="form-input" value={form.stock} onChange={set('stock')} placeholder="0" min={0} required />
                </div>
                <div className="form-group">
                  <label className="form-label">SKU</label>
                  <input className="form-input" value={form.sku} onChange={set('sku')} placeholder="PROD-001" />
                </div>
              </div>

              <div className={styles.card}>
                <h3>Organization</h3>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-input" value={form.category} onChange={set('category')} required>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Brand *</label>
                  <input className="form-input" value={form.brand} onChange={set('brand')} placeholder="Brand name" required />
                </div>
              </div>

              <div className={styles.card}>
                <h3>Shipping & Policies</h3>
                <div className="form-group">
                  <label className="form-label">Return Policy</label>
                  <input className="form-input" value={form.returnPolicy} onChange={set('returnPolicy')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Warranty</label>
                  <input className="form-input" value={form.warranty} onChange={set('warranty')} />
                </div>
              </div>

              <div className={styles.card}>
                <h3>Flags</h3>
                <div className={styles.checkboxGrid}>
                  {[
                    { key: 'isFeatured', label: '⚡ Featured' },
                    { key: 'isNew', label: '✨ New Arrival' },
                    { key: 'isBestSeller', label: '🏆 Best Seller' },
                    { key: 'freeShipping', label: '🚚 Free Shipping' },
                  ].map(({ key, label }) => (
                    <label key={key} className={styles.checkLabel}>
                      <input type="checkbox" checked={form[key]} onChange={set(key)} />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={saving}>
                <FiSave />
                {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

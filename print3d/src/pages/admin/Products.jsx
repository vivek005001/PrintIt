import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AdminNav } from './Dashboard'
import api from '../../utils/api'

const CATEGORIES = ['Home & Office', 'Tech', 'Accessories', 'Other']
const MATERIALS = ['PLA', 'PETG', 'ABS', 'TPU', 'Resin']

function ProductModal({ product, onClose, onSaved }) {
  const [form, setForm] = useState(product || { name: '', description: '', price: '', category: 'Home & Office', material: 'PLA', print_time: '', in_stock: true })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const fileRef = useRef()

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (imageFile) fd.append('image', imageFile)
      const method = product ? 'put' : 'post'
      const url = product ? `/products/${product.id}` : '/products'
      const { data } = await api[method](url, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      onSaved(data, !!product)
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <motion.div
        className="modal"
        style={{ maxWidth: 540 }}
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{product ? 'Edit Product' : 'Add Product'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g. Geometric Desk Organizer" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={3} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the product…" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Price (₹) *</label>
              <input className="form-input" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required min={1} />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={form.category || ''} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Material</label>
              <select className="form-input" value={form.material || 'PLA'} onChange={e => setForm(f => ({ ...f, material: e.target.value }))}>
                {MATERIALS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Print Time</label>
              <input className="form-input" value={form.print_time || ''} onChange={e => setForm(f => ({ ...f, print_time: e.target.value }))} placeholder="e.g. 3-4 hrs" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Product Image</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => fileRef.current.click()}>
                📷 {imageFile ? imageFile.name : (form.image_url ? 'Change Image' : 'Choose Image')}
              </button>
              {(imageFile || form.image_url) && (
                <img src={imageFile ? URL.createObjectURL(imageFile) : form.image_url} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setImageFile(e.target.files[0] || null)} />
            </div>
          </div>
          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" id="in_stock" checked={form.in_stock !== false && form.in_stock !== 0} onChange={e => setForm(f => ({ ...f, in_stock: e.target.checked }))} style={{ width: 16, height: 16 }} />
            <label htmlFor="in_stock" className="form-label" style={{ marginBottom: 0 }}>In Stock</label>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Saving…' : (product ? 'Save Changes' : '+ Add Product')}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'add' | product
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    api.get('/products').then(r => setProducts(r.data)).finally(() => setLoading(false))
  }, [])

  const handleSaved = (product, isEdit) => {
    if (isEdit) setProducts(prev => prev.map(p => p.id === product.id ? product : p))
    else setProducts(prev => [product, ...prev])
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    setDeleting(id)
    try {
      await api.delete(`/products/${id}`)
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch { alert('Failed to delete') }
    finally { setDeleting(null) }
  }

  return (
    <div className="admin-layout">
      <AdminNav />
      <main className="admin-content">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
            <div className="page-header" style={{ marginBottom: 0 }}>
              <h1>Products</h1>
              <p style={{ color: 'var(--text-muted)' }}>{products.length} products in catalog</p>
            </div>
            <button className="btn btn-primary" onClick={() => setModal('add')}>+ Add Product</button>
          </div>

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>🗃️</div>
              <h3>No products yet</h3>
              <p style={{ marginBottom: 20 }}>Add your first product below.</p>
              <button className="btn btn-primary" onClick={() => setModal('add')}>+ Add Product</button>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Product</th><th>Category</th><th>Material</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {products.map(p => (
                      <motion.tr key={p.id} layout exit={{ opacity: 0 }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0, overflow: 'hidden' }}>
                              {p.image_url ? <img src={p.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🖨️'}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 200 }}>{p.description?.slice(0, 60)}{(p.description?.length ?? 0) > 60 ? '…' : ''}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{p.category}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{p.material}</td>
                        <td><strong>₹{p.price}</strong></td>
                        <td>
                          <span style={{ color: p.in_stock ? 'var(--success)' : 'var(--error)', fontWeight: 600, fontSize: '0.8rem' }}>
                            {p.in_stock ? '● In Stock' : '● Out of Stock'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => setModal(p)}>✏️ Edit</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)} disabled={deleting === p.id}>
                              {deleting === p.id ? '…' : '🗑️'}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </main>

      <AnimatePresence>
        {modal && (
          <ProductModal
            product={modal === 'add' ? null : modal}
            onClose={() => setModal(null)}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

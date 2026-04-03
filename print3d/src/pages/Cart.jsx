import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import AnimatedPage from '../components/AnimatedPage'
import { useCart } from '../context/CartContext'
import api from '../utils/api'

export default function Cart() {
  const { items, removeItem, updateQty, clearCart, total } = useCart()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const placeOrder = async () => {
    setError('')
    setLoading(true)
    try {
      const orderItems = items.map(i => ({ product_id: i.id, quantity: i.quantity }))
      const { data } = await api.post('/orders', { items: orderItems })
      clearCart()
      navigate(`/checkout/${data.id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <AnimatedPage>
        <div className="page">
          <div className="container page-inner">
            <div className="empty-state" style={{ padding: '80px 20px' }}>
              <div style={{ fontSize: '4rem', marginBottom: 16 }}>🛒</div>
              <h3>Your cart is empty</h3>
              <p style={{ marginBottom: 24 }}>Add some products from the catalog to get started.</p>
              <Link to="/catalog" className="btn btn-primary">Browse Catalog →</Link>
            </div>
          </div>
        </div>
      </AnimatedPage>
    )
  }

  return (
    <AnimatedPage>
      <div className="page">
        <div className="container page-inner">
          <div className="page-header">
            <h1>Your <span className="gradient-text">Cart</span></h1>
            <p style={{ color: 'var(--text-muted)' }}>{items.length} item{items.length !== 1 ? 's' : ''} ready to order</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'start' }}>
            {/* Items list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <AnimatePresence>
                {items.map(item => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                    className="card"
                    style={{ display: 'flex', alignItems: 'center', gap: 16 }}
                  >
                    <div style={{ width: 70, height: 70, borderRadius: 12, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>
                      {item.image_url ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} /> : '🖨️'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 3 }}>{item.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>₹{item.price} each</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => updateQty(item.id, item.quantity - 1)} style={{ width: 32, height: 32, padding: 0, fontSize: '1rem' }}>-</button>
                      <span style={{ fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                      <button className="btn btn-secondary btn-sm" onClick={() => updateQty(item.id, item.quantity + 1)} style={{ width: 32, height: 32, padding: 0, fontSize: '1rem' }}>+</button>
                    </div>
                    <div style={{ width: 80, textAlign: 'right', fontWeight: 700, color: 'var(--accent-secondary)', fontFamily: 'Space Grotesk' }}>
                      ₹{(item.price * item.quantity).toFixed(0)}
                    </div>
                    <button onClick={() => removeItem(item.id)} className="btn btn-danger btn-sm" style={{ padding: '6px 10px' }}>✕</button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Summary */}
            <div className="card" style={{ position: 'sticky', top: 90 }}>
              <h3 style={{ marginBottom: 20, fontSize: '1.1rem' }}>Order Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {items.map(i => (
                  <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span>{i.name} ×{i.quantity}</span>
                    <span>₹{(i.price * i.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontFamily: 'Space Grotesk', fontSize: '1.2rem' }}>
                  <span>Total</span>
                  <span className="gradient-text">₹{total.toFixed(0)}</span>
                </div>
              </div>

              {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}

              <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: '0.8rem', color: '#fcd34d', marginBottom: 16, lineHeight: 1.5 }}>
                ℹ️ Admin will review and approve your order before payment.
              </div>

              <button className="btn btn-primary" onClick={placeOrder} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? '⏳ Placing…' : '📦 Place Order'}
              </button>

              <button onClick={clearCart} className="btn btn-danger btn-sm" style={{ marginTop: 10, width: '100%', justifyContent: 'center' }}>
                🗑️ Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  )
}

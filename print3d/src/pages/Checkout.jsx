import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AnimatedPage from '../components/AnimatedPage'
import api from '../utils/api'

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: '📦', desc: 'Awaiting admin review' },
  { key: 'approved', label: 'Approved', icon: '✅', desc: 'Admin approved — please pay' },
  { key: 'payment_uploaded', label: 'Payment Sent', icon: '💳', desc: 'Receipt uploaded, verifying' },
  { key: 'confirmed', label: 'Confirmed', icon: '🖨️', desc: 'Printing started' },
  { key: 'delivered', label: 'Delivered', icon: '🎉', desc: 'Ready for pickup' },
]

function getStepIndex(status) {
  const idx = STATUS_STEPS.findIndex(s => s.key === status)
  return idx === -1 ? 0 : idx
}

export default function Checkout() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    api.get(`/orders/${orderId}`)
      .then(r => setOrder(r.data))
      .finally(() => setLoading(false))
    // Poll every 30s for status updates
    const t = setInterval(() => {
      api.get(`/orders/${orderId}`).then(r => setOrder(r.data)).catch(() => {})
    }, 30000)
    return () => clearInterval(t)
  }, [orderId])

  const uploadReceipt = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadError('')
    setUploading(true)
    const fd = new FormData()
    fd.append('receipt', file)
    try {
      const { data } = await api.put(`/orders/${orderId}/upload-receipt`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setOrder(data)
      setUploadSuccess(true)
    } catch (err) {
      setUploadError(err.response?.data?.error || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <div className="loading-center" style={{ minHeight: '100vh' }}><div className="spinner" /></div>
  if (!order) return <div style={{ textAlign: 'center', padding: '120px 20px', color: 'var(--text-muted)' }}>Order not found.</div>

  const stepIdx = getStepIndex(order.status)
  const isRejected = order.status === 'rejected'

  return (
    <AnimatedPage>
      <div className="page">
        <div className="container page-inner" style={{ maxWidth: 760 }}>
          {/* Header */}
          <div className="page-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <Link to="/orders" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem' }}>← My Orders</Link>
            </div>
            <h1>Order <span className="gradient-text">#{order.id}</span></h1>
            <p style={{ color: 'var(--text-muted)' }}>Placed {new Date(order.created_at).toLocaleString()}</p>
          </div>

          {/* Status Timeline */}
          {isRejected ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
              style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', marginBottom: 24 }}
            >
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>❌</div>
              <h3 style={{ color: 'var(--error)', marginBottom: 6 }}>Order Rejected</h3>
              {order.admin_notes && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Reason: {order.admin_notes}</p>}
              <Link to="/catalog" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>Browse Again →</Link>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
              style={{ marginBottom: 24 }}
            >
              <h3 style={{ marginBottom: 24, fontSize: '1rem' }}>Order Status</h3>
              <div style={{ display: 'flex', gap: 0 }}>
                {STATUS_STEPS.map((step, i) => {
                  const done = i <= stepIdx
                  const active = i === stepIdx
                  return (
                    <div key={step.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                      {i < STATUS_STEPS.length - 1 && (
                        <div style={{ position: 'absolute', top: 18, left: '50%', right: '-50%', height: 2, background: i < stepIdx ? 'var(--accent-primary)' : 'var(--border)', zIndex: 0 }} />
                      )}
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1rem', zIndex: 1,
                        background: done ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                        border: `2px solid ${done ? 'var(--accent-primary)' : 'var(--border)'}`,
                        boxShadow: active ? '0 0 16px var(--accent-glow)' : 'none',
                        transform: active ? 'scale(1.15)' : 'scale(1)',
                        transition: 'all 0.3s'
                      }}>{step.icon}</div>
                      <div style={{ marginTop: 8, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: active ? 700 : 500, color: done ? 'var(--text-primary)' : 'var(--text-muted)' }}>{step.label}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
              {order.delivery_estimate && (
                <div style={{ marginTop: 20, padding: '10px 14px', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 10, fontSize: '0.875rem', color: 'var(--accent-secondary)' }}>
                  📅 Estimated delivery: <strong>{order.delivery_estimate}</strong>
                </div>
              )}
              {order.admin_notes && order.status !== 'rejected' && (
                <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 10, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  💬 Admin note: {order.admin_notes}
                </div>
              )}
            </motion.div>
          )}

          {/* Payment Section — show when approved */}
          {order.status === 'approved' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card"
              style={{ borderColor: 'rgba(6,182,212,0.3)', marginBottom: 24 }}
            >
              <h3 style={{ marginBottom: 4, color: 'var(--accent-secondary)' }}>💳 Make Payment</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 20 }}>
                Scan the QR below to pay <strong style={{ color: 'var(--text-primary)' }}>₹{order.total_amount}</strong> via UPI, then upload your screenshot.
              </p>

              {/* QR Code placeholder */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <div style={{
                  width: 180, height: 180, background: '#fff', borderRadius: 16, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 30px rgba(6,182,212,0.2)'
                }}>
                  {/* Placeholder QR pattern */}
                  <svg width="140" height="140" viewBox="0 0 140 140">
                    <rect width="140" height="140" fill="white"/>
                    <rect x="10" y="10" width="50" height="50" fill="none" stroke="#000" strokeWidth="5"/>
                    <rect x="20" y="20" width="30" height="30" fill="#000"/>
                    <rect x="80" y="10" width="50" height="50" fill="none" stroke="#000" strokeWidth="5"/>
                    <rect x="90" y="20" width="30" height="30" fill="#000"/>
                    <rect x="10" y="80" width="50" height="50" fill="none" stroke="#000" strokeWidth="5"/>
                    <rect x="20" y="90" width="30" height="30" fill="#000"/>
                    <rect x="75" y="75" width="10" height="10" fill="#000"/>
                    <rect x="90" y="75" width="10" height="10" fill="#000"/>
                    <rect x="105" y="75" width="10" height="10" fill="#000"/>
                    <rect x="120" y="75" width="10" height="10" fill="#000"/>
                    <rect x="75" y="90" width="10" height="10" fill="#000"/>
                    <rect x="90" y="90" width="10" height="10" fill="#000"/>
                    <rect x="105" y="105" width="10" height="10" fill="#000"/>
                    <rect x="120" y="90" width="10" height="10" fill="#000"/>
                    <rect x="75" y="105" width="10" height="10" fill="#000"/>
                    <rect x="90" y="120" width="10" height="10" fill="#000"/>
                    <rect x="105" y="120" width="10" height="10" fill="#000"/>
                    <rect x="120" y="120" width="10" height="10" fill="#000"/>
                  </svg>
                  <div style={{ fontSize: '0.65rem', color: '#777', marginTop: 4 }}>Replace with your UPI QR</div>
                </div>
              </div>

              {uploadSuccess || order.receipt_image ? (
                <div className="alert alert-success">✅ Receipt uploaded! Admin will verify and confirm your order.</div>
              ) : (
                <>
                  {uploadError && <div className="alert alert-error">{uploadError}</div>}
                  <div
                    onClick={() => fileRef.current.click()}
                    style={{
                      border: '2px dashed var(--border)', borderRadius: 14, padding: '24px', textAlign: 'center',
                      cursor: 'pointer', transition: 'all 0.2s',
                      ':hover': { borderColor: 'var(--accent-secondary)' }
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>📸</div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>Upload Payment Screenshot</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Click to select image (JPG, PNG — max 10MB)</div>
                    {uploading && <div style={{ marginTop: 10 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadReceipt} />
                </>
              )}
            </motion.div>
          )}

          {/* Order Items */}
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 18, fontSize: '1rem' }}>Order Items</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {order.items?.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.product_name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>×{item.quantity} @ ₹{item.price}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--accent-secondary)' }}>₹{(item.price * item.quantity).toFixed(0)}</div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', paddingTop: 8 }}>
                <span>Total</span>
                <span className="gradient-text">₹{order.total_amount}</span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link to="/orders" className="btn btn-secondary">← View All Orders</Link>
          </div>
        </div>
      </div>
    </AnimatedPage>
  )
}

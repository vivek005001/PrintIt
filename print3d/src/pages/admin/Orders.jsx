import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AdminNav } from './Dashboard'
import api from '../../utils/api'
import { useAutoRefresh } from '../../hooks/useAutoRefresh'

const STATUS_META = {
  pending: { label: 'Pending', color: 'var(--status-pending)', icon: '⏳' },
  approved: { label: 'Approved', color: 'var(--status-approved)', icon: '✅' },
  payment_uploaded: { label: 'Pay Uploaded', color: 'var(--status-payment_uploaded)', icon: '💳' },
  confirmed: { label: 'Confirmed', color: 'var(--status-confirmed)', icon: '🖨️' },
  delivered: { label: 'Delivered', color: 'var(--status-delivered)', icon: '🎉' },
  rejected: { label: 'Rejected', color: 'var(--status-rejected)', icon: '❌' },
}

function ApproveModal({ order, onClose, onDone }) {
  const [deliveryEstimate, setDeliveryEstimate] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleApprove = async () => {
    if (!deliveryEstimate.trim()) return setError('Please enter delivery estimate')
    setLoading(true)
    try {
      const { data } = await api.put(`/orders/${order.id}/approve`, { delivery_estimate: deliveryEstimate, admin_notes: notes })
      onDone(data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed')
    } finally { setLoading(false) }
  }

  const handleReject = async () => {
    if (!window.confirm('Reject this order?')) return
    setLoading(true)
    try {
      const { data } = await api.put(`/orders/${order.id}/reject`, { admin_notes: notes })
      onDone(data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <motion.div className="modal" initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Review Order #{order.id}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Customer info */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: '0.85rem' }}>
          <div style={{ fontWeight: 600 }}>{order.user_name}</div>
          <div style={{ color: 'var(--text-muted)' }}>{order.user_email} {order.user_college ? `· ${order.user_college}` : ''}</div>
        </div>

        {/* Items */}
        <div style={{ marginBottom: 16 }}>
          {order.items?.map(i => (
            <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '5px 0', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              <span>{i.product_name} × {i.quantity}</span>
              <span>₹{(i.price * i.quantity).toFixed(0)}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginTop: 8 }}>
            <span>Total</span>
            <span className="gradient-text">₹{order.total_amount}</span>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-group" style={{ marginBottom: 12 }}>
          <label className="form-label">Estimated Delivery *</label>
          <input className="form-input" placeholder="e.g. 2026-04-05 or 2 days" value={deliveryEstimate} onChange={e => setDeliveryEstimate(e.target.value)} />
        </div>
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">Note to Customer (optional)</label>
          <textarea className="form-input" rows={2} placeholder="Any instructions or message…" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-success" onClick={handleApprove} disabled={loading} style={{ flex: 1 }}>✅ Approve</button>
          <button className="btn btn-danger" onClick={handleReject} disabled={loading} style={{ flex: 1 }}>❌ Reject</button>
        </div>
      </motion.div>
    </div>
  )
}

function ReceiptModal({ order, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      const { data } = await api.put(`/orders/${order.id}/confirm`)
      onConfirm(data)
      onClose()
    } catch { alert('Failed to confirm') }
    finally { setLoading(false) }
  }

  const handleDeliver = async () => {
    setLoading(true)
    try {
      const { data } = await api.put(`/orders/${order.id}/deliver`)
      onConfirm(data)
      onClose()
    } catch { alert('Failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <motion.div className="modal" style={{ maxWidth: 520 }} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Order #{order.id} — {order.status === 'payment_uploaded' ? 'Verify Payment' : 'Manage'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ marginBottom: 12, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>{order.user_name}</strong> · {order.user_email}
        </div>

        {order.receipt_image && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Payment Receipt:</div>
            <a href={order.receipt_image} target="_blank" rel="noreferrer">
              <img src={order.receipt_image} alt="Receipt" style={{ maxWidth: '100%', borderRadius: 12, border: '1px solid var(--border)', maxHeight: 300, objectFit: 'contain' }} />
            </a>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {order.status === 'payment_uploaded' && (
            <button className="btn btn-success" onClick={handleConfirm} disabled={loading} style={{ flex: 1 }}>
              {loading ? '…' : '✅ Confirm Payment & Start Print'}
            </button>
          )}
          {order.status === 'confirmed' && (
            <button className="btn btn-cyan" onClick={handleDeliver} disabled={loading} style={{ flex: 1 }}>
              {loading ? '…' : '🎉 Mark as Delivered'}
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </motion.div>
    </div>
  )
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [approveModal, setApproveModal] = useState(null)
  const [receiptModal, setReceiptModal] = useState(null)

  const fetchOrders = useCallback(() => {
    api.get('/orders').then(r => setOrders(r.data)).finally(() => setLoading(false))
  }, [])

  // Pause refresh while a modal is open (avoid stale data overwrite during action)
  const modalOpen = !!(approveModal || receiptModal)
  useAutoRefresh(fetchOrders, 10000, !modalOpen)

  const updateOrder = (updated) => {
    setOrders(prev => prev.map(o => o.id === updated.id ? updated : o))
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  return (
    <div className="admin-layout">
      <AdminNav />
      <main className="admin-content">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="page-header">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <h1>Orders</h1>
                <p style={{ color: 'var(--text-muted)' }}>{orders.length} total orders</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
                Auto-refreshing
              </div>
            </div>
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            {['all', 'pending', 'approved', 'payment_uploaded', 'confirmed', 'delivered', 'rejected'].map(f => {
              const s = STATUS_META[f]
              const count = f === 'all' ? orders.length : orders.filter(o => o.status === f).length
              return (
                <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}>
                  {f === 'all' ? 'All' : s?.icon + ' ' + s?.label} <span style={{ opacity: 0.7 }}>({count})</span>
                </button>
              )
            })}
          </div>

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><h3>No orders</h3></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>#</th><th>Customer</th><th>Items</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map(order => {
                    const s = STATUS_META[order.status] || { label: order.status, color: 'var(--text-muted)', icon: '📦' }
                    return (
                      <tr key={order.id}>
                        <td><strong>#{order.id}</strong></td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{order.user_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.user_email}</div>
                          {order.user_college && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{order.user_college}</div>}
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: 160 }}>
                          {order.items?.slice(0, 2).map(i => <div key={i.id}>{i.product_name} ×{i.quantity}</div>)}
                          {(order.items?.length || 0) > 2 && <div>+{order.items.length - 2} more</div>}
                        </td>
                        <td><strong>₹{order.total_amount}</strong></td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, background: `${s.color}18`, color: s.color, fontSize: '0.75rem', fontWeight: 600 }}>
                            {s.icon} {s.label}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(order.updated_at).toLocaleDateString()}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {order.status === 'pending' && (
                              <button className="btn btn-sm btn-success" onClick={() => setApproveModal(order)}>Review</button>
                            )}
                            {(order.status === 'payment_uploaded' || order.status === 'confirmed') && (
                              <button className="btn btn-sm btn-primary" onClick={() => setReceiptModal(order)}>
                                {order.status === 'payment_uploaded' ? '💳 Verify' : '📦 Manage'}
                              </button>
                            )}
                            {['delivered', 'rejected', 'approved'].includes(order.status) && (
                              <button className="btn btn-sm btn-secondary" onClick={() => setReceiptModal(order)}>View</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </main>

      <AnimatePresence>
        {approveModal && (
          <ApproveModal order={approveModal} onClose={() => setApproveModal(null)} onDone={updateOrder} />
        )}
        {receiptModal && (
          <ReceiptModal order={receiptModal} onClose={() => setReceiptModal(null)} onConfirm={updateOrder} />
        )}
      </AnimatePresence>
    </div>
  )
}

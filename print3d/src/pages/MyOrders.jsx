import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AnimatedPage from '../components/AnimatedPage'
import api from '../utils/api'

const STATUS_LABELS = {
  pending: { label: 'Pending Approval', color: 'var(--status-pending)', icon: '⏳' },
  approved: { label: 'Approved — Pay Now', color: 'var(--status-approved)', icon: '✅' },
  payment_uploaded: { label: 'Payment Uploaded', color: 'var(--status-payment_uploaded)', icon: '💳' },
  confirmed: { label: 'Printing...', color: 'var(--status-confirmed)', icon: '🖨️' },
  delivered: { label: 'Delivered', color: 'var(--status-delivered)', icon: '🎉' },
  rejected: { label: 'Rejected', color: 'var(--status-rejected)', icon: '❌' },
}

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    api.get('/orders')
      .then(r => setOrders(r.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  return (
    <AnimatedPage>
      <div className="page">
        <div className="container page-inner">
          <div className="page-header">
            <h1>My <span className="gradient-text">Orders</span></h1>
            <p style={{ color: 'var(--text-muted)' }}>Track all your 3D print orders in one place.</p>
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
            {['all', 'pending', 'approved', 'payment_uploaded', 'confirmed', 'delivered', 'rejected'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
              >
                {f === 'all' ? 'All Orders' : (STATUS_LABELS[f]?.icon + ' ' + STATUS_LABELS[f]?.label)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>📭</div>
              <h3>{filter === 'all' ? 'No orders yet' : 'No orders with this status'}</h3>
              <p style={{ marginBottom: 20 }}>Start by browsing the catalog!</p>
              <Link to="/catalog" className="btn btn-primary">Browse Catalog →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filtered.map((order, i) => {
                const status = STATUS_LABELS[order.status] || { label: order.status, color: 'var(--text-muted)', icon: '📦' }
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="card order-card-row"
                    style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}
                  >
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>Order #{order.id}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''} ·{' '}
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                      {order.delivery_estimate && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--accent-secondary)', marginTop: 4 }}>
                          📅 Est. {order.delivery_estimate}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {order.items?.slice(0, 2).map(item => (
                        <div key={item.id} style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {item.product_name} ×{item.quantity}
                        </div>
                      ))}
                      {(order.items?.length || 0) > 2 && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+{order.items.length - 2} more</div>}
                    </div>

                    <div style={{ fontWeight: 800, fontFamily: 'Space Grotesk', fontSize: '1.1rem', color: 'var(--accent-secondary)' }}>
                      ₹{order.total_amount}
                    </div>

                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: `${status.color}18`, color: status.color, fontSize: '0.8rem', fontWeight: 600 }}>
                      {status.icon} {status.label}
                    </div>

                    <Link
                      to={`/checkout/${order.id}`}
                      className={`btn btn-sm ${order.status === 'approved' ? 'btn-cyan' : 'btn-secondary'}`}
                    >
                      {order.status === 'approved' ? '💳 Pay Now' : 'View'}
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AnimatedPage>
  )
}

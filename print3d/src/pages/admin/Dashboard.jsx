import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../../utils/api'
import Logo from '../../components/Logo'

function AdminNav() {
  const location = useLocation()
  const isActive = (p) => location.pathname === p

  return (
    <aside className="admin-sidebar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
        <Logo size={26} />
        <span style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: '1rem' }} className="gradient-text">Admin Panel</span>
      </div>
      <h3>Overview</h3>
      <Link to="/admin" className={`sidebar-link ${isActive('/admin') ? 'active' : ''}`}>📊 Dashboard</Link>
      <h3>Manage</h3>
      <Link to="/admin/products" className={`sidebar-link ${isActive('/admin/products') ? 'active' : ''}`}>🗃️ Products</Link>
      <Link to="/admin/orders" className={`sidebar-link ${isActive('/admin/orders') ? 'active' : ''}`}>📦 Orders</Link>
      <h3>Site</h3>
      <Link to="/" className="sidebar-link">🌐 View Site</Link>
    </aside>
  )
}

export { AdminNav }

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders/admin/stats')
      .then(r => setStats(r.data))
      .finally(() => setLoading(false))
  }, [])

  const STATUS_LABELS = {
    pending: { label: 'Pending', color: 'var(--status-pending)', icon: '⏳' },
    approved: { label: 'Approved', color: 'var(--status-approved)', icon: '✅' },
    payment_uploaded: { label: 'Pay Pending', color: 'var(--status-payment_uploaded)', icon: '💳' },
    confirmed: { label: 'Confirmed', color: 'var(--status-confirmed)', icon: '🖨️' },
    delivered: { label: 'Delivered', color: 'var(--status-delivered)', icon: '🎉' },
    rejected: { label: 'Rejected', color: 'var(--status-rejected)', icon: '❌' },
  }

  return (
    <div className="admin-layout">
      <AdminNav />
      <main className="admin-content">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="page-header">
            <h1>Dashboard</h1>
            <p style={{ color: 'var(--text-muted)' }}>Overview of PrintIt platform</p>
          </div>

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : (
            <>
              <div className="stats-grid">
                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                  <div className="stat-icon">📦</div>
                  <div className="stat-label">Total Orders</div>
                  <div className="stat-value gradient-text">{stats.total}</div>
                </motion.div>
                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <div className="stat-icon">⏳</div>
                  <div className="stat-label">Pending Approval</div>
                  <div className="stat-value" style={{ color: 'var(--status-pending)' }}>{stats.pending}</div>
                </motion.div>
                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                  <div className="stat-icon">✅</div>
                  <div className="stat-label">Confirmed Orders</div>
                  <div className="stat-value" style={{ color: 'var(--success)' }}>{stats.confirmed}</div>
                </motion.div>
                <motion.div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(192,86,42,0.08), rgba(79,70,160,0.06))', borderColor: 'rgba(192,86,42,0.25)' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <div className="stat-icon">💰</div>
                  <div className="stat-label">Total Revenue</div>
                  <div className="stat-value gradient-text">₹{stats.revenue.toFixed(0)}</div>
                </motion.div>
              </div>

              {/* Recent Orders */}
              <div style={{ marginTop: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h2 style={{ fontSize: '1.1rem' }}>Recent Orders</h2>
                  <Link to="/admin/orders" className="btn btn-secondary btn-sm">View All →</Link>
                </div>
                {stats.recent?.length === 0 ? (
                  <div className="empty-state"><h3>No orders yet</h3></div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>#</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th><th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recent?.map(order => {
                          const s = STATUS_LABELS[order.status] || { label: order.status, color: 'var(--text-muted)', icon: '📦' }
                          return (
                            <tr key={order.id}>
                              <td><strong>#{order.id}</strong></td>
                              <td>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{order.user_name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.user_email}</div>
                              </td>
                              <td><strong>₹{order.total_amount}</strong></td>
                              <td>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, background: `${s.color}18`, color: s.color, fontSize: '0.75rem', fontWeight: 600 }}>
                                  {s.icon} {s.label}
                                </span>
                              </td>
                              <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(order.updated_at).toLocaleDateString()}</td>
                              <td><Link to="/admin/orders" className="btn btn-sm btn-secondary">Manage</Link></td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </main>
    </div>
  )
}

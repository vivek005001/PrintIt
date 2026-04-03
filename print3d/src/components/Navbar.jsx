import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import Logo from './Logo'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false) }
  const isActive = (path) => location.pathname === path

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(250, 248, 245, 0.88)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1.5px solid var(--border)',
        height: 70
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', height: '100%', gap: 8 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: '1.2rem' }}>
          <Logo size={30} />
          <span className="gradient-text">PrintIt</span>
        </Link>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 32 }}>
          <NavLink to="/catalog" active={isActive('/catalog')}>Catalog</NavLink>
          {user && <NavLink to="/orders" active={isActive('/orders')}>My Orders</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin" active={location.pathname.startsWith('/admin')}>Admin</NavLink>}
        </div>

        {/* Right side */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <>
              <Link to="/cart" style={{ position: 'relative', padding: '8px 12px', borderRadius: 'var(--r-md)', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', color: 'var(--text-primary)', textDecoration: 'none' }}>
                🛒 Cart
                {count > 0 && (
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    style={{ background: 'var(--accent-primary)', color: '#fff', fontSize: '0.7rem', fontWeight: 700, borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >{count}</motion.span>
                )}
              </Link>
              <div style={{ position: 'relative' }} ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(o => !o)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 'var(--r-md)', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.9rem', cursor: 'pointer' }}
                >
                  <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
                    {user.name[0].toUpperCase()}
                  </span>
                  {user.name.split(' ')[0]}
                  <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>▼</span>
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      transition={{ duration: 0.15 }}
                      style={{ position: 'absolute', top: '110%', right: 0, minWidth: 180, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '8px', boxShadow: 'var(--shadow-card)', zIndex: 200 }}
                    >
                      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', marginBottom: 6 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                      </div>
                      {user.role === 'admin' && (
                        <DropItem to="/admin" onClick={() => setMenuOpen(false)}>🛠️ Admin Panel</DropItem>
                      )}
                      <DropItem to="/orders" onClick={() => setMenuOpen(false)}>📦 My Orders</DropItem>
                      <button onClick={handleLogout} style={{ display: 'block', width: '100%', padding: '8px 12px', borderRadius: 8, border: 'none', background: 'none', color: 'var(--error)', textAlign: 'left', fontSize: '0.875rem', cursor: 'pointer', marginTop: 4 }}>
                        🚪 Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 18px' }}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '8px 18px' }}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  )
}

function NavLink({ to, active, children }) {
  return (
    <Link
      to={to}
      style={{
        padding: '8px 14px',
        borderRadius: '8px',
        fontSize: '0.9rem',
        fontWeight: 500,
        color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
        background: active ? 'rgba(192,86,42,0.08)' : 'transparent',
        transition: 'all 0.2s',
        textDecoration: 'none'
      }}
    >{children}</Link>
  )
}

function DropItem({ to, onClick, children }) {
  return (
    <Link to={to} onClick={onClick} style={{ display: 'block', padding: '8px 12px', borderRadius: 8, color: 'var(--text-secondary)', fontSize: '0.875rem', textDecoration: 'none', transition: 'all 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
    >{children}</Link>
  )
}

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
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef(null)

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); setMobileOpen(false) }
  const isActive = (path) => location.pathname === path

  // Close dropdowns on route change
  useEffect(() => { setMenuOpen(false); setMobileOpen(false) }, [location.pathname])

  // Close user dropdown when clicking outside
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: 'rgba(250, 248, 245, 0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1.5px solid var(--border)',
          height: 64
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', height: '100%', gap: 8 }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: '1.2rem', flexShrink: 0 }}>
            <Logo size={28} />
            <span className="gradient-text">PrintIt</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="nav-links-desktop">
            <NavLink to="/catalog" active={isActive('/catalog')}>Catalog</NavLink>
            {user && <NavLink to="/orders" active={isActive('/orders')}>My Orders</NavLink>}
            {user?.role === 'admin' && <NavLink to="/admin" active={location.pathname.startsWith('/admin')}>Admin</NavLink>}
          </div>

          {/* Right side — desktop */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            {user ? (
              <>
                {/* Cart — visible on desktop */}
                <Link to="/cart" className="nav-cart-btn" style={{ position: 'relative', padding: '7px 12px', borderRadius: 'var(--r-md)', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem', color: 'var(--text-primary)', textDecoration: 'none' }}>
                  🛒 <span className="hide-xs">Cart</span>
                  {count > 0 && (
                    <motion.span
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      style={{ background: 'var(--accent-primary)', color: '#fff', fontSize: '0.68rem', fontWeight: 700, borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >{count}</motion.span>
                  )}
                </Link>

                {/* User menu — desktop */}
                <div style={{ position: 'relative' }} ref={menuRef} className="nav-user-desktop">
                  <button
                    onClick={() => setMenuOpen(o => !o)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 'var(--r-md)', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.88rem', cursor: 'pointer' }}
                  >
                    <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--accent-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>
                      {user.name[0].toUpperCase()}
                    </span>
                    <span className="hide-sm">{user.name.split(' ')[0]}</span>
                    <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>▼</span>
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
                        {user.role === 'admin' && <DropItem to="/admin" onClick={() => setMenuOpen(false)}>🛠️ Admin Panel</DropItem>}
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
              <div className="nav-auth-desktop">
                <Link to="/login" className="btn btn-secondary" style={{ padding: '7px 16px', fontSize: '0.88rem' }}>Login</Link>
                <Link to="/register" className="btn btn-primary" style={{ padding: '7px 16px', fontSize: '0.88rem' }}>Sign Up</Link>
              </div>
            )}

            {/* Hamburger — mobile only */}
            <button
              className="hamburger"
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Toggle menu"
              style={{ display: 'none', flexDirection: 'column', gap: 5, background: 'none', border: 'none', padding: 8, cursor: 'pointer' }}
            >
              <span className={`ham-line ${mobileOpen ? 'ham-open-1' : ''}`} />
              <span className={`ham-line ${mobileOpen ? 'ham-open-2' : ''}`} />
              <span className={`ham-line ${mobileOpen ? 'ham-open-3' : ''}`} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', top: 64, left: 0, right: 0, zIndex: 99,
              background: 'rgba(250, 248, 245, 0.97)',
              backdropFilter: 'blur(24px)',
              borderBottom: '1.5px solid var(--border)',
              padding: '16px 20px 24px',
              boxShadow: '0 8px 32px rgba(28,26,24,0.12)'
            }}
          >
            {/* User info strip */}
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0 16px', borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
                <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {user.name[0].toUpperCase()}
                </span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                </div>
              </div>
            )}

            {/* Mobile nav links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <MobileLink to="/catalog" onClick={() => setMobileOpen(false)}>📦 Catalog</MobileLink>
              {user && <MobileLink to="/orders" onClick={() => setMobileOpen(false)}>📋 My Orders</MobileLink>}
              {user && (
                <MobileLink to="/cart" onClick={() => setMobileOpen(false)}>
                  🛒 Cart {count > 0 && <span style={{ background: 'var(--accent-primary)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>}
                </MobileLink>
              )}
              {user?.role === 'admin' && <MobileLink to="/admin" onClick={() => setMobileOpen(false)}>🛠️ Admin Panel</MobileLink>}
            </div>

            {/* Auth buttons */}
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              {user ? (
                <button onClick={handleLogout} className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }}>🚪 Logout</button>
              ) : (
                <div style={{ display: 'flex', gap: 10 }}>
                  <Link to="/login" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setMobileOpen(false)}>Login</Link>
                  <Link to="/register" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setMobileOpen(false)}>Sign Up</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function NavLink({ to, active, children }) {
  return (
    <Link to={to} style={{ padding: '7px 14px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 500, color: active ? 'var(--accent-primary)' : 'var(--text-secondary)', background: active ? 'rgba(192,86,42,0.08)' : 'transparent', transition: 'all 0.2s', textDecoration: 'none' }}>
      {children}
    </Link>
  )
}

function MobileLink({ to, onClick, children }) {
  return (
    <Link to={to} onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderRadius: 'var(--r-md)', color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500, textDecoration: 'none', transition: 'all 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
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

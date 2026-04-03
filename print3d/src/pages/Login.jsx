import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AnimatedPage from '../components/AnimatedPage'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      navigate(user.role === 'admin' ? '/admin' : '/')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatedPage>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 20px 40px' }}>
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, background: 'radial-gradient(circle, rgba(192,86,42,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: 420 }}
        >
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><Logo size={52} /></div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: 8 }}>Welcome back</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sign in to your PrintIt account</p>
          </div>

          <div className="card">
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="form-group">
                <label className="form-label">Email address</label>
                <input className="form-input" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 4 }}>
                {loading ? 'Signing in…' : 'Sign In →'}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Sign up free</Link>
          </p>
        </motion.div>
      </div>
    </AnimatedPage>
  )
}

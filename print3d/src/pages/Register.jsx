import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AnimatedPage from '../components/AnimatedPage'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', college: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) return setError('Password must be at least 6 characters')
    setLoading(true)
    try {
      await register(form.name, form.email, form.password, form.college)
      navigate('/catalog')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatedPage>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 20px 40px' }}>
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, background: 'radial-gradient(circle, rgba(79,70,160,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: 440 }}
        >
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><Logo size={52} /></div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: 8 }}>Create Account</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Create a free account to get started</p>
          </div>

          <div className="card">
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" type="text" placeholder="Your Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 4 }}>
                {loading ? 'Creating account…' : 'Create Account 🚀'}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </motion.div>
      </div>
    </AnimatedPage>
  )
}

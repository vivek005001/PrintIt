import { Link } from 'react-router-dom'
import AnimatedPage from '../components/AnimatedPage'
import Logo from '../components/Logo'

export default function NotFound() {
  return (
    <AnimatedPage>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><Logo size={64} /></div>
        <h1 style={{ fontSize: '5rem', fontFamily: 'Space Grotesk', fontWeight: 900, lineHeight: 1 }} className="gradient-text">404</h1>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 12, marginTop: 8 }}>Page not found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Looks like this page got lost in the print queue.</p>
        <Link to="/" className="btn btn-primary btn-lg">← Go Home</Link>
      </div>
    </AnimatedPage>
  )
}

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import AnimatedPage from '../components/AnimatedPage'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'

const features = [
  { icon: '⚡', title: 'Fast Turnaround', desc: 'Most prints ready within 24-48 hours for your deadlines.' },
  { icon: '💸', title: 'Student Pricing', desc: 'Specially priced plans. No hidden charges.' },
  { icon: '📊', title: 'Live Tracking', desc: 'Track every stage of your order in real-time.' },
  { icon: '🔒', title: 'Transparent Process', desc: 'Admin approval & payment confirmation — no surprises.' },
  { icon: '🎨', title: 'Multiple Materials', desc: 'PLA, ABS, PETG, TPU — choose what your project needs.' },
  { icon: '📧', title: 'Email Updates', desc: 'Get notified at every step via email automatically.' },
]

const steps = [
  { num: '01', title: 'Browse Catalog', desc: 'Pick from a curated range of 3D printable products.' },
  { num: '02', title: 'Place Order', desc: 'Add to cart and submit — admin reviews your order.' },
  { num: '03', title: 'Admin Approves', desc: 'You receive delivery estimate and payment details.' },
  { num: '04', title: 'Pay via QR', desc: 'Scan the QR, pay, upload the screenshot.' },
  { num: '05', title: 'Printing Starts', desc: 'Admin confirms your payment and starts printing.' },
  { num: '06', title: 'Pick Up!', desc: 'Collect your print from the communicated place.' },
]

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } }
}

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

export default function Landing() {
  const { user } = useAuth()

  return (
    <AnimatedPage>
      {/* Hero */}
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Background glow orbs */}
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(192,86,42,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(79,70,160,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ marginBottom: 20 }}
        >
          <Logo size={72} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{ display: 'inline-block', background: 'rgba(192,86,42,0.08)', border: '1px solid rgba(192,86,42,0.25)', borderRadius: 20, padding: '5px 18px', fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: 24 }}
        >
          🎓 Fast. Easy. Affordable.
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: 20, maxWidth: 800 }}
        >
          Your Ideas,<br />
          <span className="gradient-text">Printed Fast</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'var(--text-secondary)', maxWidth: 560, lineHeight: 1.7, marginBottom: 40 }}
        >
          Order custom 3D prints for your projects, models, and side-hustles.
          Fast delivery, transparent tracking, honest prices.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <Link to="/catalog" className="btn btn-primary btn-lg" style={{ fontSize: '1.05rem' }}>
            🚀 Browse Catalog
          </Link>
          {!user && (
            <Link to="/register" className="btn btn-secondary btn-lg">
              Create Account →
            </Link>
          )}
        </motion.div>

        {/* Stats row */}
        {/* <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          style={{ display: 'flex', gap: 40, marginTop: 64, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          {[['100+', 'Orders Delivered'], ['8+', 'Products Available'], ['24hr', 'Avg Turnaround'], ['3', 'Materials']].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Space Grotesk' }} className="gradient-text">{val}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </motion.div> */}
      </div>

      <section style={{ padding: '80px 20px', background: 'var(--bg-secondary)' }}>
        {/* <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center', marginBottom: 56 }}
          >
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: 12 }}>Why <span className="gradient-text">PrintIt?</span></h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>Everything you need for seamless 3D printing on campus.</p>
          </motion.div>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid-3"
          >
            {features.map(f => (
              <motion.div key={f.title} variants={fadeUp} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontSize: '1.05rem', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div> */}
      </section>

      {/* How it works */}
      <section style={{ padding: '80px 20px' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center', marginBottom: 56 }}
          >
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: 12 }}>How It <span className="gradient-text">Works</span></h2>
            <p style={{ color: 'var(--text-secondary)' }}>Six simple steps from order to pickup.</p>
          </motion.div>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}
          >
            {steps.map((s, i) => (
              <motion.div key={s.num} variants={fadeUp} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0 }}>{s.num}</div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', marginBottom: 5 }}>{s.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: '80px 20px' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{
              background: 'linear-gradient(135deg, rgba(192,86,42,0.07), rgba(79,70,160,0.06))',
              border: '1.5px solid rgba(192,86,42,0.2)',
              borderRadius: 28,
              padding: '60px 40px',
              textAlign: 'center'
            }}
          >
            <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', marginBottom: 16 }}>Ready to Start Printing?</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 440, margin: '0 auto 32px', lineHeight: 1.7 }}>
              Bring your ideas to life. Fast turnaround, transparent pricing, zero hassle.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/catalog" className="btn btn-primary btn-lg">Browse Products</Link>
              {!user && <Link to="/register" className="btn btn-secondary btn-lg">Sign Up Free</Link>}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}><Logo size={28} /></div>
        <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, marginBottom: 4 }} className="gradient-text">PrintIt</div>
      </footer>
    </AnimatedPage>
  )
}

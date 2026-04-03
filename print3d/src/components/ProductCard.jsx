import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'

const CATEGORY_COLORS = {
  'Home & Office': '#7c3aed',
  'Tech': '#06b6d4',
  'Accessories': '#f59e0b',
  'default': '#6d28d9'
}

const MATERIAL_ICONS = { PLA: '🟢', PETG: '🔵', ABS: '🟠', TPU: '🟡' }

export default function ProductCard({ product }) {
  const { addItem, items } = useCart()
  const navigate = useNavigate()
  const inCart = items.some(i => i.id === product.id)
  const catColor = CATEGORY_COLORS[product.category] || CATEGORY_COLORS.default

  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: '0 20px 50px rgba(124, 58, 237, 0.2)' }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'default'
      }}
    >
      {/* Image area */}
      <div style={{
        height: 180,
        background: `linear-gradient(135deg, ${catColor}22, transparent)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '5rem',
        position: 'relative',
        borderBottom: '1px solid var(--border)'
      }}>
        {product.image_url
          ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span>{getEmoji(product.category)}</span>
        }
        {product.category && (
          <div style={{
            position: 'absolute', top: 12, left: 12,
            background: `${catColor}22`, border: `1px solid ${catColor}55`,
            color: catColor, padding: '3px 10px', borderRadius: 20,
            fontSize: '0.72rem', fontWeight: 600
          }}>{product.category}</div>
        )}
        {!product.in_stock && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1rem' }}>
            Out of Stock
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.3 }}>{product.name}</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>
          {product.description?.slice(0, 80)}{product.description?.length > 80 ? '…' : ''}
        </p>

        <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
          {product.material && <span>{MATERIAL_ICONS[product.material] || '⚪'} {product.material}</span>}
          {product.print_time && <span>⏱ {product.print_time}</span>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'Space Grotesk', color: 'var(--accent-secondary)' }}>
            ₹{product.price}
          </span>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className={`btn btn-sm ${inCart ? 'btn-secondary' : 'btn-primary'}`}
            disabled={!product.in_stock}
            onClick={() => {
              if (inCart) { navigate('/cart') }
              else { addItem(product) }
            }}
          >
            {!product.in_stock ? 'Unavailable' : inCart ? '✓ In Cart' : '+ Add'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

function getEmoji(category) {
  const map = { 'Home & Office': '🗂️', 'Tech': '⚙️', 'Accessories': '🔑', 'default': '🖨️' }
  return map[category] || map.default
}

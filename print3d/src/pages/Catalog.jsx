import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AnimatedPage from '../components/AnimatedPage'
import ProductCard from '../components/ProductCard'
import api from '../utils/api'

const stagger = { animate: { transition: { staggerChildren: 0.06 } } }
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

export default function Catalog() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState(['All'])
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/products/categories').then(r => setCategories(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (activeCategory !== 'All') params.category = activeCategory
    if (search) params.search = search
    api.get('/products', { params })
      .then(r => setProducts(r.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [activeCategory, search])

  return (
    <AnimatedPage>
      <div className="page">
        <div className="container page-inner">
          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', marginBottom: 8 }}
            >
              Product <span className="gradient-text">Catalog</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              style={{ color: 'var(--text-muted)' }}
            >Browse and order 3D prints for your projects.</motion.p>
          </div>

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap', alignItems: 'center' }}
          >
            <input
              className="form-input"
              placeholder="🔍 Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ maxWidth: 280 }}
            />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Products Grid */}
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔍</div>
              <h3>No products found</h3>
              <p>Try a different search or category</p>
            </div>
          ) : (
            <motion.div
              variants={stagger}
              initial="initial"
              animate="animate"
              className="grid-4"
            >
              {products.map(p => (
                <motion.div key={p.id} variants={fadeUp}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </AnimatedPage>
  )
}

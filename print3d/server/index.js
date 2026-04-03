import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { initDb } from './db.js'
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import orderRoutes from './routes/orders.js'

const app = express()
const PORT = process.env.PORT || 3001

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173']

app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json())

// NOTE: /uploads is no longer served locally — files are on Supabase Storage

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)

app.get('/api/health', (req, res) => res.json({ ok: true }))

// Start only after DB is ready
initDb()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🖨️  PrintIt server running on http://localhost:${PORT}`)
        })
    })
    .catch(err => {
        console.error('❌ Failed to connect to database:', err.message)
        process.exit(1)
    })

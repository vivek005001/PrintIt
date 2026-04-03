import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import supabase from '../db.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'printit_secret'

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, college } = req.body
        if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' })

        const { data: existing } = await supabase.from('users').select('id').eq('email', email).single()
        if (existing) return res.status(409).json({ error: 'Email already registered' })

        const hashed = bcrypt.hashSync(password, 10)
        const { data: user, error } = await supabase
            .from('users')
            .insert({ name, email, password: hashed, college: college || null })
            .select('id, name, email, role, college, created_at')
            .single()
        if (error) throw error

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' })
        res.json({ token, user })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Server error' })
    }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

        const { data: user } = await supabase.from('users').select('*').eq('email', email).single()
        if (!user) return res.status(401).json({ error: 'Invalid credentials' })

        const valid = bcrypt.compareSync(password, user.password)
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' })
        const { password: _, ...safeUser } = user
        res.json({ token, user: safeUser })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Server error' })
    }
})

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
    try {
        const { data: user } = await supabase
            .from('users')
            .select('id, name, email, role, college, created_at')
            .eq('id', req.user.id)
            .single()
        res.json(user)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Server error' })
    }
})

export default router

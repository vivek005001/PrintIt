import express from 'express'
import multer from 'multer'
import supabase from '../db.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { uploadFile } from '../supabase.js'

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

// GET /api/products
router.get('/', async (req, res) => {
    try {
        const { category, search } = req.query
        let query = supabase.from('products').select('*').order('created_at', { ascending: false })
        if (category && category !== 'All') query = query.eq('category', category)
        if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
        const { data, error } = await query
        if (error) throw error
        res.json(data)
    } catch (err) {
        console.error(err); res.status(500).json({ error: 'Server error' })
    }
})

// GET /api/products/categories
router.get('/categories', async (req, res) => {
    try {
        const { data, error } = await supabase.from('products').select('category').not('category', 'is', null)
        if (error) throw error
        const cats = [...new Set(data.map(r => r.category))].sort()
        res.json(['All', ...cats])
    } catch (err) {
        console.error(err); res.status(500).json({ error: 'Server error' })
    }
})

// GET /api/products/:id
router.get('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase.from('products').select('*').eq('id', req.params.id).single()
        if (error || !data) return res.status(404).json({ error: 'Product not found' })
        res.json(data)
    } catch (err) {
        console.error(err); res.status(500).json({ error: 'Server error' })
    }
})

// POST /api/products (admin)
router.post('/', authenticate, requireAdmin, upload.single('image'), async (req, res) => {
    try {
        const { name, description, price, category, material, print_time, in_stock } = req.body
        if (!name || !price) return res.status(400).json({ error: 'Name and price required' })

        let image_url = null
        if (req.file) {
            const filename = `products/product-${Date.now()}-${req.file.originalname.replace(/\s/g, '_')}`
            image_url = await uploadFile(req.file.buffer, filename, req.file.mimetype)
        }

        const { data, error } = await supabase.from('products').insert({
            name, description: description || null,
            price: parseFloat(price), category: category || null,
            material: material || 'PLA', print_time: print_time || null,
            image_url, in_stock: in_stock === 'false' ? 0 : 1
        }).select().single()
        if (error) throw error
        res.json(data)
    } catch (err) {
        console.error(err); res.status(500).json({ error: 'Server error' })
    }
})

// PUT /api/products/:id (admin)
router.put('/:id', authenticate, requireAdmin, upload.single('image'), async (req, res) => {
    try {
        const { data: existing, error: fetchErr } = await supabase.from('products').select('*').eq('id', req.params.id).single()
        if (fetchErr || !existing) return res.status(404).json({ error: 'Product not found' })

        const { name, description, price, category, material, print_time, in_stock } = req.body

        let image_url = existing.image_url
        if (req.file) {
            const filename = `products/product-${Date.now()}-${req.file.originalname.replace(/\s/g, '_')}`
            image_url = await uploadFile(req.file.buffer, filename, req.file.mimetype)
        }

        const { data, error } = await supabase.from('products').update({
            name: name || existing.name,
            description: description ?? existing.description,
            price: parseFloat(price) || existing.price,
            category: category ?? existing.category,
            material: material || existing.material,
            print_time: print_time ?? existing.print_time,
            image_url,
            in_stock: in_stock !== undefined ? (in_stock === 'false' || in_stock === false ? 0 : 1) : existing.in_stock,
            updated_at: new Date().toISOString()
        }).eq('id', req.params.id).select().single()
        if (error) throw error
        res.json(data)
    } catch (err) {
        console.error(err); res.status(500).json({ error: 'Server error' })
    }
})

// DELETE /api/products/:id (admin)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const { error } = await supabase.from('products').delete().eq('id', req.params.id)
        if (error) throw error
        res.json({ ok: true })
    } catch (err) {
        console.error(err); res.status(500).json({ error: 'Server error' })
    }
})

export default router

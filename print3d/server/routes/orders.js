import express from 'express'
import multer from 'multer'
import supabase from '../db.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { uploadFile } from '../supabase.js'
import { emailOrderPlaced, emailOrderApproved, emailOrderRejected, emailPaymentConfirmed } from '../services/email.js'

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

async function getOrderWithItems(id) {
    const { data: order } = await supabase
        .from('orders')
        .select('*, users(name, email, college)')
        .eq('id', id)
        .single()
    if (!order) return null

    const { data: items } = await supabase
        .from('order_items')
        .select('*, products(image_url)')
        .eq('order_id', id)

    // Flatten the nested user fields to match old API shape
    const { users, ...rest } = order
    return {
        ...rest,
        user_name: users?.name,
        user_email: users?.email,
        user_college: users?.college,
        items: (items || []).map(({ products, ...item }) => ({ ...item, image_url: products?.image_url }))
    }
}

// POST /api/orders — place a new order
router.post('/', authenticate, async (req, res) => {
    try {
        const { items } = req.body
        if (!items || items.length === 0) return res.status(400).json({ error: 'Cart is empty' })

        let total = 0
        const orderItems = []
        for (const item of items) {
            const { data: product } = await supabase.from('products').select('*').eq('id', item.product_id).eq('in_stock', 1).single()
            if (!product) return res.status(400).json({ error: `Product ${item.product_id} not available` })
            const qty = parseInt(item.quantity) || 1
            orderItems.push({ product, qty })
            total += product.price * qty
        }

        const { data: newOrder, error: orderErr } = await supabase
            .from('orders')
            .insert({ user_id: req.user.id, total_amount: Math.round(total * 100) / 100 })
            .select()
            .single()
        if (orderErr) throw orderErr

        const itemsToInsert = orderItems.map(({ product, qty }) => ({
            order_id: newOrder.id,
            product_id: product.id,
            product_name: product.name,
            quantity: qty,
            price: product.price
        }))
        await supabase.from('order_items').insert(itemsToInsert)

        const order = await getOrderWithItems(newOrder.id)
        const { data: user } = await supabase.from('users').select('name, email').eq('id', req.user.id).single()
        emailOrderPlaced(user, order)
        res.json(order)
    } catch (err) {
        console.error(err); res.status(500).json({ error: 'Server error' })
    }
})

// GET /api/orders
router.get('/', authenticate, async (req, res) => {
    try {
        const { status } = req.query
        let query

        if (req.user.role === 'admin') {
            query = supabase.from('orders').select('*, users(name, email, college)').order('updated_at', { ascending: false })
            if (status) query = query.eq('status', status)
        } else {
            query = supabase.from('orders').select('*, users(name)').eq('user_id', req.user.id).order('created_at', { ascending: false })
            if (status) query = query.eq('status', status)
        }

        const { data: orders, error } = await query
        if (error) throw error

        // Fetch items for each order and flatten user fields
        const result = await Promise.all(orders.map(async ({ users, ...order }) => {
            const { data: items } = await supabase.from('order_items').select('*').eq('order_id', order.id)
            return {
                ...order,
                user_name: users?.name,
                user_email: users?.email,
                user_college: users?.college,
                items: items || []
            }
        }))
        res.json(result)
    } catch (err) {
        console.error(err); res.status(500).json({ error: 'Server error' })
    }
})

// GET /api/orders/:id
router.get('/:id', authenticate, async (req, res) => {
    try {
        const order = await getOrderWithItems(req.params.id)
        if (!order) return res.status(404).json({ error: 'Order not found' })
        if (req.user.role !== 'admin' && order.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' })
        res.json(order)
    } catch (err) {
        console.error(err); res.status(500).json({ error: 'Server error' })
    }
})

// PUT /api/orders/:id/approve — admin
router.put('/:id/approve', authenticate, requireAdmin, async (req, res) => {
    try {
        const order = await getOrderWithItems(req.params.id)
        if (!order) return res.status(404).json({ error: 'Order not found' })
        if (order.status !== 'pending') return res.status(400).json({ error: 'Order is not pending' })
        const { delivery_estimate, admin_notes } = req.body
        if (!delivery_estimate) return res.status(400).json({ error: 'Delivery estimate required' })
        await supabase.from('orders').update({ status: 'approved', delivery_estimate, admin_notes: admin_notes || null, updated_at: new Date().toISOString() }).eq('id', req.params.id)
        const updated = await getOrderWithItems(req.params.id)
        const { data: user } = await supabase.from('users').select('name, email').eq('id', order.user_id).single()
        emailOrderApproved(user, updated)
        res.json(updated)
    } catch (err) {
        console.error(err); res.status(500).json({ error: 'Server error' })
    }
})

// PUT /api/orders/:id/reject — admin
router.put('/:id/reject', authenticate, requireAdmin, async (req, res) => {
    try {
        const order = await getOrderWithItems(req.params.id)
        if (!order) return res.status(404).json({ error: 'Order not found' })
        if (order.status !== 'pending') return res.status(400).json({ error: 'Order is not pending' })
        const { admin_notes } = req.body
        await supabase.from('orders').update({ status: 'rejected', admin_notes: admin_notes || null, updated_at: new Date().toISOString() }).eq('id', req.params.id)
        const updated = await getOrderWithItems(req.params.id)
        const { data: user } = await supabase.from('users').select('name, email').eq('id', order.user_id).single()
        emailOrderRejected(user, updated)
        res.json(updated)
    } catch (err) {
        console.error(err); res.status(500).json({ error: 'Server error' })
    }
})

// PUT /api/orders/:id/upload-receipt
router.put('/:id/upload-receipt', authenticate, upload.single('receipt'), async (req, res) => {
    try {
        const order = await getOrderWithItems(req.params.id)
        if (!order) return res.status(404).json({ error: 'Order not found' })
        if (order.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' })
        if (order.status !== 'approved') return res.status(400).json({ error: 'Order must be approved before payment' })
        if (!req.file) return res.status(400).json({ error: 'Receipt image required' })

        const ext = req.file.mimetype.split('/')[1] || 'jpg'
        const filename = `receipts/receipt-${req.params.id}-${Date.now()}.${ext}`
        const receipt_image = await uploadFile(req.file.buffer, filename, req.file.mimetype)
        await supabase.from('orders').update({ status: 'payment_uploaded', receipt_image, updated_at: new Date().toISOString() }).eq('id', req.params.id)
        res.json(await getOrderWithItems(req.params.id))
    } catch (err) {
        console.error(err); res.status(500).json({ error: 'Server error' })
    }
})

// PUT /api/orders/:id/confirm — admin
router.put('/:id/confirm', authenticate, requireAdmin, async (req, res) => {
    try {
        const order = await getOrderWithItems(req.params.id)
        if (!order) return res.status(404).json({ error: 'Order not found' })
        if (order.status !== 'payment_uploaded') return res.status(400).json({ error: 'No receipt to confirm' })
        await supabase.from('orders').update({ status: 'confirmed', updated_at: new Date().toISOString() }).eq('id', req.params.id)
        const updated = await getOrderWithItems(req.params.id)
        const { data: user } = await supabase.from('users').select('name, email').eq('id', order.user_id).single()
        emailPaymentConfirmed(user, updated)
        res.json(updated)
    } catch (err) {
        console.error(err); res.status(500).json({ error: 'Server error' })
    }
})

// PUT /api/orders/:id/deliver — admin
router.put('/:id/deliver', authenticate, requireAdmin, async (req, res) => {
    try {
        const order = await getOrderWithItems(req.params.id)
        if (!order) return res.status(404).json({ error: 'Order not found' })
        if (order.status !== 'confirmed') return res.status(400).json({ error: 'Order must be confirmed first' })
        await supabase.from('orders').update({ status: 'delivered', updated_at: new Date().toISOString() }).eq('id', req.params.id)
        res.json(await getOrderWithItems(req.params.id))
    } catch (err) {
        console.error(err); res.status(500).json({ error: 'Server error' })
    }
})

// GET /api/orders/admin/stats
router.get('/admin/stats', authenticate, requireAdmin, async (req, res) => {
    try {
        const { count: total } = await supabase.from('orders').select('*', { count: 'exact', head: true })
        const { count: pending } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending')
        const { count: confirmed } = await supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['confirmed', 'delivered'])
        const { data: revenueRows } = await supabase.from('orders').select('total_amount').in('status', ['confirmed', 'delivered'])
        const revenue = revenueRows?.reduce((sum, r) => sum + r.total_amount, 0) || 0
        const { data: recent } = await supabase.from('orders').select('*, users(name, email)').order('updated_at', { ascending: false }).limit(10)
        const recentFlat = (recent || []).map(({ users, ...o }) => ({ ...o, user_name: users?.name, user_email: users?.email }))
        res.json({ total, pending, confirmed, revenue, recent: recentFlat })
    } catch (err) {
        console.error(err); res.status(500).json({ error: 'Server error' })
    }
})

export default router

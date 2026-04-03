import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

export default supabase

export async function initDb() {
  // Seed admin user if not exists
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@printit.local'
  const { data: existing } = await supabase.from('users').select('id').eq('email', adminEmail).single()
  if (!existing) {
    const hashed = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10)
    const { error } = await supabase.from('users').insert({
      name: process.env.ADMIN_NAME || 'Admin',
      email: adminEmail,
      password: hashed,
      role: 'admin'
    })
    if (error) throw new Error(`Admin seed failed: ${error.message}`)
    console.log(`✅ Seeded admin: ${adminEmail}`)
  }

  // Seed products if none exist
  const { count } = await supabase.from('products').select('*', { count: 'exact', head: true })
  if (count === 0) await seedProducts()

  console.log('✅ Database ready (Supabase)')
}

async function seedProducts() {
  const products = [
    { name: 'Geometric Desk Organizer', description: 'A sleek geometric organizer for pens and stationery.', price: 149, category: 'Home & Office', material: 'PLA', print_time: '4-5 hrs', in_stock: 1 },
    { name: 'Custom Name Keychain', description: 'Personalized keychain with your name. Lightweight and durable.', price: 49, category: 'Accessories', material: 'PLA', print_time: '1-2 hrs', in_stock: 1 },
    { name: 'Phone Stand (Adjustable)', description: 'Multi-angle phone stand. Supports all phone sizes.', price: 99, category: 'Home & Office', material: 'PETG', print_time: '3 hrs', in_stock: 1 },
    { name: 'Mechanical Keyboard Feet', description: 'Replacement feet for mechanical keyboards.', price: 59, category: 'Tech', material: 'TPU', print_time: '2 hrs', in_stock: 1 },
    { name: 'Mini Planter Pot', description: 'Cute mini planter for succulents. Drainage hole included.', price: 79, category: 'Home & Office', material: 'PLA', print_time: '3-4 hrs', in_stock: 1 },
    { name: 'Cable Management Clips', description: 'Set of 6 clips to organize your cables.', price: 69, category: 'Tech', material: 'PLA', print_time: '2 hrs', in_stock: 1 },
    { name: 'Fidget Cube', description: 'The classic fidget cube with six different sides.', price: 89, category: 'Accessories', material: 'ABS', print_time: '4 hrs', in_stock: 1 },
    { name: 'Wall-mounted Headphone Hook', description: 'Clean wall mount for your headphones.', price: 119, category: 'Tech', material: 'PLA', print_time: '2-3 hrs', in_stock: 1 },
  ]
  const { error } = await supabase.from('products').insert(products)
  if (error) console.error('Seed products error:', error.message)
  else console.log('✅ Seeded sample products')
}

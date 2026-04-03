import { createClient } from '@supabase/supabase-js'

// Service role key gives unrestricted access to Storage (bypasses RLS)
// NEVER expose this on the frontend
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

export const BUCKET = 'printit-uploads'

/**
 * Upload a file buffer to Supabase Storage.
 * Returns the public URL of the uploaded file.
 * @param {Buffer} buffer
 * @param {string} filename  e.g. 'receipt-42-1234567890.jpg'
 * @param {string} mimetype  e.g. 'image/jpeg'
 */
export async function uploadFile(buffer, filename, mimetype) {
    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(filename, buffer, { contentType: mimetype, upsert: true })

    if (error) throw new Error(`Storage upload failed: ${error.message}`)

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename)
    return data.publicUrl
}

export default supabase

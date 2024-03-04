import { createClient } from '@supabase/supabase-js'

if (!process.env.SUPABASE_URL) {
  throw new Error('Missing SUPABASE_URL env var')
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY env var')
}

const SUPABASE_URL = process.env.SUPABASE_URL as string
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export async function getBlogById(id: number) {
  const { data, error } = await supabase
    .from('blogs')
    .select()
    .eq('id', id)
    .single()

  return data
}

export async function getAllBlogs() {
  const { data, error } = await supabase
    .from('blogs')
    .select()
    .order('created_at', { ascending: false })

  return data
}

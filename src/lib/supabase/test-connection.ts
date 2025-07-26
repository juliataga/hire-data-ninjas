import { createClient } from './client'

export async function testSupabaseConnection() {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count(*)')
      .limit(1)
    
    if (error) {
      console.error('Supabase connection error:', error)
      return false
    }
    
    console.log('✅ Supabase connected successfully!')
    return true
  } catch (error) {
    console.error('Supabase connection failed:', error)
    return false
  }
}

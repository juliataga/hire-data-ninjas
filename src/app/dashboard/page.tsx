import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/login')
  }

  // Get user profile to determine role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Redirect based on user role
  if (profile?.role === 'freelancer') {
    redirect('/dashboard/freelancer')
  } else if (profile?.role === 'client') {
    redirect('/dashboard/client')
  } else {
    redirect('/dashboard/freelancer') // Default fallback
  }
}

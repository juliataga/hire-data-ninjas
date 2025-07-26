import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FreelancerProfileForm } from '@/components/freelancers/freelancer-profile-form'

export default async function FreelancerProfilePage() {
  const supabase = createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/login')
  }

  // Verify user is a freelancer
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'freelancer') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🥷 HireDataNinjas
              </h1>
              <p className="text-gray-600">Complete Your Profile</p>
            </div>
            <form action="/auth/signout" method="post">
              <button className="text-gray-600 hover:text-gray-900">
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Complete Your Profile
            </h2>
            <p className="text-gray-600">
              A complete profile helps you get more job opportunities and builds trust with clients
            </p>
          </div>

          <FreelancerProfileForm />
        </div>
      </main>
    </div>
  )
}

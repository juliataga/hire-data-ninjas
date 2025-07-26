import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function FreelancerDashboard() {
  const supabase = createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get user's applications
  const { data: applications } = await supabase
    .from('applications')
    .select(`
      *,
      jobs!inner (
        id,
        title,
        category,
        status,
        budget_min,
        budget_max,
        budget_type,
        created_at,
        profiles!jobs_client_id_fkey (
          first_name,
          last_name
        )
      )
    `)
    .eq('freelancer_id', user.id)
    .order('created_at', { ascending: false })

  // Get freelancer profile for completion percentage
  const { data: freelancerProfile } = await supabase
    .from('freelancer_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Calculate profile completion
  const calculateProfileCompletion = () => {
    let completed = 0
    const total = 8
    
    if (profile?.first_name) completed++
    if (profile?.last_name) completed++
    if (profile?.bio) completed++
    if (profile?.location) completed++
    if (freelancerProfile?.hourly_rate) completed++
    if (freelancerProfile?.experience_level) completed++
    if (freelancerProfile?.skills && freelancerProfile.skills.length > 0) completed++
    if (profile?.portfolio_url || profile?.linkedin_url || profile?.github_url) completed++
    
    return Math.round((completed / total) * 100)
  }

  const profileCompletion = calculateProfileCompletion()

  // Calculate stats
  const activeApplications = applications?.filter(app => app.status === 'pending') || []
  const totalApplications = applications?.length || 0
  const acceptedApplications = applications?.filter(app => app.status === 'accepted') || []
  const successRate = totalApplications > 0 ? Math.round((acceptedApplications.length / totalApplications) * 100) : 0

  // Recent applications (last 5)
  const recentApplications = applications?.slice(0, 5) || []

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
              <p className="text-gray-600">Freelancer Dashboard</p>
            </div>
            <form action="/auth/signout" method="post">
              <Button variant="outline" type="submit">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.first_name || 'Freelancer'}! 👋
          </h2>
          <p className="text-gray-600">
            Here's what's happening with your freelance work
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeApplications.length}</div>
              <p className="text-xs text-gray-600">
                {activeApplications.length === 0 ? 'No pending applications' : 'Waiting for response'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Profile Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-gray-600">Complete your profile to get more views</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Jobs Applied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalApplications}</div>
              <p className="text-xs text-gray-600">
                {totalApplications === 0 ? 'Start applying to jobs' : 'Total applications sent'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalApplications > 0 ? `${successRate}%` : '--'}
              </div>
              <p className="text-xs text-gray-600">
                {totalApplications === 0 ? 'Apply to jobs to see stats' : 'Application acceptance rate'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Profile</CardTitle>
              <CardDescription>
                A complete profile gets 5x more views from clients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Profile completion</span>
                  <span>{profileCompletion}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${profileCompletion}%` }}
                  ></div>
                </div>
              </div>
              <Link href="/dashboard/freelancer/profile">
                <Button className="w-full">
                  Complete Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Find Your Next Job</CardTitle>
              <CardDescription>
                Browse through curated data science opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/jobs">
                <Button className="w-full">
                  Browse Jobs
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>
              Your latest job applications and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentApplications.length > 0 ? (
              <div className="space-y-4">
                {recentApplications.map((application) => (
                  <div key={application.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      {/* Left side - Job info */}
                      <div className="flex-1 min-w-0 pr-6">
                        <h4 className="font-medium text-lg mb-1">{application.jobs.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          by {application.jobs.profiles.first_name} {application.jobs.profiles.last_name}
                        </p>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">
                            {application.jobs.category}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Applied on {formatDate(application.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* Right side - Status and action in vertical stack */}
                      <div className="flex flex-col items-end gap-3 flex-shrink-0">
                        <Badge 
                          variant={
                            application.status === 'pending' ? 'outline' :
                            application.status === 'accepted' ? 'default' : 'destructive'
                          }
                          className="text-sm px-3 py-1"
                        >
                          {application.status}
                        </Badge>
                        <Link href={`/jobs/${application.jobs.id}`}>
                          <Button size="sm" variant="outline">
                            View Job
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No applications yet.</p>
                <p className="text-sm">Start by browsing jobs and applying to opportunities that match your skills!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'

interface FreelancerDashboardProps {
  searchParams: { 
    applied?: string
    profile_updated?: string
  }
}

export default async function FreelancerDashboard({ searchParams }: FreelancerDashboardProps) {
  const supabase = createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/login')
  }

  console.log('Current user:', user.id)

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get freelancer profile
  const { data: freelancerProfile } = await supabase
    .from('freelancer_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get user's applications with job details
  const { data: applications, error: appsError } = await supabase
    .from('applications')
    .select(`
      *,
      jobs!inner (
        title,
        category,
        budget_min,
        budget_max,
        budget_type
      )
    `)
    .eq('freelancer_id', user.id)
    .order('created_at', { ascending: false })

  console.log('Applications query result:', { applications, appsError, userId: user.id })

  // Calculate profile completion
  const calculateProfileCompletion = () => {
    let completed = 0
    const total = 7
    
    // Basic profile fields
    if (profile?.first_name) completed++
    if (profile?.last_name) completed++
    
    // Freelancer profile fields
    if (freelancerProfile?.hourly_rate) completed++
    if (freelancerProfile?.experience_level) completed++
    if (freelancerProfile?.skills && freelancerProfile.skills.length > 0) completed++
    if (freelancerProfile?.portfolio_url) completed++
    if (freelancerProfile?.resume_url) completed++
    
    return Math.round((completed / total) * 100)
  }

  const profileCompletion = calculateProfileCompletion()

  // Calculate real stats from actual data
  const activeApplications = applications?.filter(app => app.status === 'pending') || []
  const totalApplications = applications?.length || 0
  const acceptedApplications = applications?.filter(app => app.status === 'accepted') || []
  const rejectedApplications = applications?.filter(app => app.status === 'rejected') || []
  const successRate = totalApplications > 0 
    ? Math.round((acceptedApplications.length / totalApplications) * 100)
    : 0

  // Calculate profile views (fake data based on completion)
  const profileViews = profileCompletion >= 70 ? Math.floor(Math.random() * 50) + 10 : 0

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Success Messages */}
          {searchParams.applied && (
            <div className="mb-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
              <p className="text-green-800 dark:text-green-200">
                🎉 Application submitted successfully! The client will review your application and get back to you.
              </p>
            </div>
          )}

          {searchParams.profile_updated && (
            <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
              <p className="text-blue-800 dark:text-blue-200">
                ✅ Profile updated successfully! Your profile is now {profileCompletion}% complete.
              </p>
            </div>
          )}

          <div className="mb-8">
            <h1 className="text-3xl font-medium tracking-tight mb-2">
              Welcome back, {profile?.first_name || 'Freelancer'}! ��
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your freelance work
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Active Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activeApplications.length}
                </div>
                <p className="text-muted-foreground text-sm">
                  Applications pending review
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profile Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {profileViews}
                </div>
                <p className="text-muted-foreground text-sm">
                  {profileCompletion >= 70 ? 'This week' : 'Complete your profile to get more views'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Jobs Applied</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalApplications}</div>
                <p className="text-muted-foreground text-sm">
                  Total applications
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalApplications > 0 ? `${successRate}%` : '--'}
                </div>
                <p className="text-muted-foreground text-sm">
                  Application success rate
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Profile Completion */}
            <Card>
              <CardHeader>
                <CardTitle>Complete Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Profile completion</span>
                    <span className="text-sm font-medium">{profileCompletion}%</span>
                  </div>
                  <Progress value={profileCompletion} className="h-2" />
                </div>
                
                <p className="text-sm text-muted-foreground">
                  A complete profile gets 5x more views from clients
                </p>

                {/* Profile completion checklist */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${profile?.first_name ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className={profile?.first_name ? 'text-green-600' : 'text-muted-foreground'}>
                      Basic info
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${freelancerProfile?.hourly_rate ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className={freelancerProfile?.hourly_rate ? 'text-green-600' : 'text-muted-foreground'}>
                      Hourly rate
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${freelancerProfile?.skills?.length ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className={freelancerProfile?.skills?.length ? 'text-green-600' : 'text-muted-foreground'}>
                      Skills ({freelancerProfile?.skills?.length || 0})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${freelancerProfile?.portfolio_url ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className={freelancerProfile?.portfolio_url ? 'text-green-600' : 'text-muted-foreground'}>
                      Portfolio
                    </span>
                  </div>
                </div>

                <Button asChild className="w-full">
                  <Link href="/dashboard/freelancer/profile">
                    {profileCompletion < 100 ? 'Complete Profile' : 'Edit Profile'}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Applications */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {applications && applications.length > 0 ? (
                  <div className="space-y-4">
                    {applications.slice(0, 3).map((application) => (
                      <div key={application.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{application.jobs.title}</p>
                          <p className="text-sm text-muted-foreground">
                            ${application.proposed_rate}/hr • {application.jobs.category}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            application.status === 'pending' ? 'secondary' :
                            application.status === 'accepted' ? 'default' :
                            'destructive'
                          }>
                            {application.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    
                    {applications.length > 3 && (
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link href="/dashboard/freelancer/applications">
                          View All Applications ({applications.length})
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No applications yet</p>
                    <Button asChild>
                      <Link href="/jobs">Browse Jobs</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Button asChild className="h-auto p-4 flex-col">
                  <Link href="/jobs">
                    <span className="text-lg mb-1">🔍</span>
                    <span>Browse New Jobs</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto p-4 flex-col">
                  <Link href="/dashboard/freelancer/profile">
                    <span className="text-lg mb-1">👤</span>
                    <span>Edit Profile</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto p-4 flex-col">
                  <Link href="/dashboard/freelancer/applications">
                    <span className="text-lg mb-1">📋</span>
                    <span>View Applications</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

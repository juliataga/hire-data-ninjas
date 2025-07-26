import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { formatDate, formatCurrency } from '@/lib/utils'

export default async function ClientDashboard() {
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

  // Get user's jobs
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

  // Get applications for user's jobs
  const { data: applications } = await supabase
    .from('applications')
    .select(`
      *,
      jobs!inner (
        client_id,
        title
      ),
      profiles!applications_freelancer_id_fkey (
        first_name,
        last_name
      )
    `)
    .eq('jobs.client_id', user.id)
    .order('created_at', { ascending: false })

  // Calculate stats
  const activeJobs = jobs?.filter(job => job.status === 'published') || []
  const totalApplications = applications?.length || 0
  const hiredFreelancers = applications?.filter(app => app.status === 'accepted')?.length || 0
  const successRate = totalApplications > 0 ? Math.round((hiredFreelancers / totalApplications) * 100) : 0

  // Recent activity (last 5 items)
  const recentJobs = jobs?.slice(0, 3) || []
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
              <p className="text-gray-600">Client Dashboard</p>
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
            Welcome back, {profile?.first_name || 'Client'}! 👋
          </h2>
          <p className="text-gray-600">
            Manage your job postings and find great data talent
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeJobs.length}</div>
              <p className="text-xs text-gray-600">
                {activeJobs.length === 0 ? 'Post your first job' : `${jobs?.length || 0} total jobs`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalApplications}</div>
              <p className="text-xs text-gray-600">
                {totalApplications === 0 ? 'No applications yet' : 'Across all jobs'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Hired Freelancers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hiredFreelancers}</div>
              <p className="text-xs text-gray-600">
                {hiredFreelancers === 0 ? 'Start hiring talent' : 'Successfully hired'}
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
                {totalApplications === 0 ? 'Post jobs to see stats' : 'Hiring success rate'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Post Your {jobs?.length === 0 ? 'First' : 'Next'} Job</CardTitle>
              <CardDescription>
                Find the perfect data professional for your project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/client/jobs/new">
                <Button className="w-full">
                  Post a Job
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Browse Freelancers</CardTitle>
              <CardDescription>
                Explore our curated pool of data science talent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/freelancers">
                <Button className="w-full" variant="outline">
                  Browse Talent
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Jobs */}
        {recentJobs.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Recent Jobs</CardTitle>
              <CardDescription>
                Your latest job postings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{job.title}</h4>
                      <p className="text-sm text-gray-600">{job.category}</p>
                      <p className="text-xs text-gray-500">
                        Posted {formatDate(job.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={job.status === 'published' ? 'default' : 'secondary'}>
                        {job.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {job.applications_count} applications
                      </p>
                    </div>
                    <Link href={`/dashboard/client/jobs/${job.id}`}>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest job posts and applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentApplications.length > 0 || recentJobs.length > 0 ? (
              <div className="space-y-3">
                {/* Recent Applications */}
                {recentApplications.map((application) => (
                  <div key={application.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">
                          {application.profiles.first_name} {application.profiles.last_name}
                        </span>
                        {' '}applied to{' '}
                        <span className="font-medium">{application.jobs.title}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(application.created_at)}
                      </p>
                    </div>
                    <Badge variant={
                      application.status === 'pending' ? 'outline' :
                      application.status === 'accepted' ? 'default' : 'destructive'
                    }>
                      {application.status}
                    </Badge>
                  </div>
                ))}

                {/* Recent Jobs if no applications */}
                {recentApplications.length === 0 && recentJobs.map((job) => (
                  <div key={job.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm">
                        You posted{' '}
                        <span className="font-medium">{job.title}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(job.created_at)}
                      </p>
                    </div>
                    <Badge variant={job.status === 'published' ? 'default' : 'secondary'}>
                      {job.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No recent activity yet.</p>
                <p className="text-sm">Start by posting your first job!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

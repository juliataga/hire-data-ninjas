import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'

interface JobDetailPageProps {
  params: {
    id: string
  }
}

export default async function PublicJobDetailPage({ params }: JobDetailPageProps) {
  const supabase = createClient()
  
  // Get job details
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select(`
      *,
      profiles!jobs_client_id_fkey (
        first_name,
        last_name,
        bio,
        location
      )
    `)
    .eq('id', params.id)
    .eq('status', 'published')
    .single()

  if (jobError || !job) {
    notFound()
  }

  // Check if user is logged in and get their info
  const { data: { user } } = await supabase.auth.getUser()
  let userProfile = null
  let hasApplied = false

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    userProfile = profile

    // Check if user has already applied
    if (profile?.role === 'freelancer') {
      const { data: application } = await supabase
        .from('applications')
        .select('id')
        .eq('job_id', params.id)
        .eq('freelancer_id', user.id)
        .single()
      
      hasApplied = !!application
    }
  }

  const formatBudgetRange = (min: number | null, max: number | null, type: string) => {
    if (!min && !max) return 'Budget not specified'
    
    const prefix = type === 'hourly' ? '/hour' : type === 'monthly' ? '/month' : ''
    
    if (min && max) {
      return `${formatCurrency(min)} - ${formatCurrency(max)}${prefix}`
    } else if (min) {
      return `From ${formatCurrency(min)}${prefix}`
    } else if (max) {
      return `Up to ${formatCurrency(max)}${prefix}`
    }
    
    return 'Budget not specified'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/jobs">
              <h1 className="text-2xl font-bold text-gray-900">
                🥷 HireDataNinjas
              </h1>
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="outline">Dashboard</Button>
                  </Link>
                  <form action="/auth/signout" method="post">
                    <Button variant="ghost" type="submit">Sign Out</Button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="outline">Login</Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button>Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back to Jobs */}
          <div className="mb-6">
            <Link href="/jobs">
              <Button variant="outline" size="sm">
                ← Back to Jobs
              </Button>
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Job Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{job.title}</CardTitle>
                      <CardDescription className="mt-2">
                        Posted by {job.profiles.first_name} {job.profiles.last_name} • {formatDate(job.created_at)}
                      </CardDescription>
                    </div>
                    <Badge variant="default">{job.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Job Meta */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Job Type:</span>
                      <p className="font-medium">{job.job_type}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Experience Level:</span>
                      <p className="font-medium">{job.experience_level}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Location:</span>
                      <p className="font-medium">
                        {job.location_type}
                        {job.location && ` - ${job.location}`}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Budget:</span>
                      <p className="font-medium text-green-600">
                        {formatBudgetRange(job.budget_min, job.budget_max, job.budget_type)}
                      </p>
                    </div>
                  </div>

                  {job.deadline && (
                    <div>
                      <span className="text-gray-600">Project Deadline:</span>
                      <p className="font-medium">{formatDate(job.deadline)}</p>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Job Description</h3>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap text-gray-700">{job.description}</p>
                    </div>
                  </div>

                  {/* Required Skills */}
                  {job.required_skills && job.required_skills.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Required Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {job.required_skills.map((skill: string) => (
                          <Badge key={skill} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Apply Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Ready to Apply?</CardTitle>
                </CardHeader>
                <CardContent>
                  {!user ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        You need to sign up as a freelancer to apply for this job.
                      </p>
                      <Link href="/auth/signup/freelancer">
                        <Button className="w-full">
                          Sign Up to Apply
                        </Button>
                      </Link>
                      <div className="text-center">
                        <Link href="/auth/login" className="text-sm text-blue-600 hover:underline">
                          Already have an account? Login
                        </Link>
                      </div>
                    </div>
                  ) : userProfile?.role === 'client' ? (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-3">
                        You're logged in as a client. Switch to a freelancer account to apply.
                      </p>
                      <Link href="/auth/signup/freelancer">
                        <Button variant="outline" className="w-full">
                          Create Freelancer Account
                        </Button>
                      </Link>
                    </div>
                  ) : hasApplied ? (
                    <div className="text-center">
                      <Badge variant="default" className="mb-3">
                        ✓ Applied
                      </Badge>
                      <p className="text-sm text-gray-600">
                        You have already applied to this job. Check your dashboard for updates.
                      </p>
                    </div>
                  ) : (
                    <Link href={`/jobs/${job.id}/apply`}>
                      <Button className="w-full">
                        Apply Now
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>

              {/* Job Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Job Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Applications:</span>
                    <span className="font-medium">{job.applications_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Posted:</span>
                    <span className="font-medium">{formatDate(job.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Client Info */}
              <Card>
                <CardHeader>
                  <CardTitle>About the Client</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium">
                      {job.profiles.first_name} {job.profiles.last_name}
                    </h4>
                    {job.profiles.location && (
                      <p className="text-sm text-gray-600">{job.profiles.location}</p>
                    )}
                  </div>
                  {job.profiles.bio && (
                    <p className="text-sm text-gray-700">{job.profiles.bio}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

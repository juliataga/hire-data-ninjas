import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ApplicationActions } from '@/components/jobs/application-actions'

interface JobDetailPageProps {
  params: {
    id: string
  }
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const supabase = createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/login')
  }

  // Get job details
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select(`
      *,
      profiles!jobs_client_id_fkey (
        first_name,
        last_name
      )
    `)
    .eq('id', params.id)
    .single()

  if (jobError || !job) {
    notFound()
  }

  // Verify user owns this job
  if (job.client_id !== user.id) {
    redirect('/dashboard')
  }

  // Get applications with profile data (separate queries to avoid join issues)
  const { data: applications } = await supabase
    .from('applications')
    .select(`
      *,
      profiles!applications_freelancer_id_fkey (
        first_name,
        last_name,
        email,
        bio,
        location,
        linkedin_url,
        github_url
      )
    `)
    .eq('job_id', params.id)
    .order('created_at', { ascending: false })

  // Get freelancer profiles separately
  const freelancerIds = applications?.map(app => app.freelancer_id) || []
  const { data: freelancerProfiles } = await supabase
    .from('freelancer_profiles')
    .select('*')
    .in('id', freelancerIds)

  // Create a map for easy lookup
  const freelancerProfileMap = new Map(
    freelancerProfiles?.map(fp => [fp.id, fp]) || []
  )

  const actualApplicationsCount = applications?.length || 0

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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🥷 HireDataNinjas
              </h1>
              <p className="text-gray-600">Job Details & Applications</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard/client">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
              <form action="/auth/signout" method="post">
                <Button variant="ghost" type="submit">Sign Out</Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Job Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{job.title}</CardTitle>
                  <CardDescription className="mt-2">
                    Posted on {formatDate(job.created_at)} • {actualApplicationsCount} applications
                  </CardDescription>
                </div>
                <Badge variant={job.status === 'published' ? 'default' : 'secondary'}>
                  {job.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Category:</span>
                  <p className="font-medium">{job.category}</p>
                </div>
                <div>
                  <span className="text-gray-600">Type:</span>
                  <p className="font-medium">{job.job_type}</p>
                </div>
                <div>
                  <span className="text-gray-600">Location:</span>
                  <p className="font-medium">
                    {job.location_type}
                    {job.location && ` - ${job.location}`}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Experience:</span>
                  <p className="font-medium">{job.experience_level}</p>
                </div>
              </div>

              <div>
                <span className="text-gray-600">Budget:</span>
                <p className="font-medium">
                  {formatBudgetRange(job.budget_min, job.budget_max, job.budget_type)}
                </p>
              </div>

              {job.required_skills && Array.isArray(job.required_skills) && job.required_skills.length > 0 && (
                <div>
                  <span className="text-gray-600">Required Skills:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
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

          {/* Applications */}
          <Card>
            <CardHeader>
              <CardTitle>Applications ({actualApplicationsCount})</CardTitle>
              <CardDescription>
                Review and manage applications for this job
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applications && applications.length > 0 ? (
                <div className="space-y-6">
                  {applications.map((application) => {
                    const freelancerProfile = freelancerProfileMap.get(application.freelancer_id)
                    
                    return (
                      <div key={application.id} className="border rounded-lg p-6 space-y-4 hover:shadow-md transition-shadow">
                        {/* Applicant Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-start gap-4">
                              {/* Avatar */}
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                                {application.profiles?.first_name?.[0]}{application.profiles?.last_name?.[0]}
                              </div>
                              
                              <div className="flex-1">
                                <h4 className="font-semibold text-xl">
                                  {application.profiles?.first_name} {application.profiles?.last_name}
                                </h4>
                                <p className="text-gray-600">{application.profiles?.email}</p>
                                {application.profiles?.location && (
                                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                    📍 {application.profiles.location}
                                  </p>
                                )}
                                
                                {/* Bio */}
                                {application.profiles?.bio && (
                                  <p className="text-sm text-gray-700 mt-3 max-w-2xl leading-relaxed">
                                    {application.profiles.bio}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            {/* Professional Info Grid */}
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                              {freelancerProfile?.experience_level && (
                                <div>
                                  <span className="text-xs text-gray-500 uppercase tracking-wide">Experience</span>
                                  <p className="font-medium text-sm">{freelancerProfile.experience_level}</p>
                                </div>
                              )}
                              {freelancerProfile?.hourly_rate && (
                                <div>
                                  <span className="text-xs text-gray-500 uppercase tracking-wide">Hourly Rate</span>
                                  <p className="font-medium text-sm">{formatCurrency(freelancerProfile.hourly_rate)}/hr</p>
                                </div>
                              )}
                              {application.proposed_rate && (
                                <div>
                                  <span className="text-xs text-gray-500 uppercase tracking-wide">Proposed Rate</span>
                                  <p className="font-medium text-sm text-green-600">
                                    {formatCurrency(application.proposed_rate)}
                                    {job.budget_type === 'hourly' && '/hr'}
                                    {job.budget_type === 'monthly' && '/mo'}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Skills */}
                            {freelancerProfile?.skills && Array.isArray(freelancerProfile.skills) && freelancerProfile.skills.length > 0 && (
                              <div className="mt-4">
                                <span className="text-sm font-medium text-gray-700 mb-2 block">Skills & Expertise</span>
                                <div className="flex flex-wrap gap-2">
                                  {freelancerProfile.skills.slice(0, 8).map((skill: string) => (
                                    <Badge key={skill} variant="secondary" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {freelancerProfile.skills.length > 8 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{freelancerProfile.skills.length - 8} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Status & Actions */}
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
                            
                            {application.status === 'pending' && (
                              <ApplicationActions 
                                applicationId={application.id}
                                jobId={job.id}
                              />
                            )}
                          </div>
                        </div>

                        {/* Cover Letter */}
                        {application.cover_letter && (
                          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                            <h5 className="font-medium text-sm text-blue-900 mb-2">Cover Letter</h5>
                            <p className="text-sm whitespace-pre-wrap text-blue-800 leading-relaxed">
                              {application.cover_letter}
                            </p>
                          </div>
                        )}

                        {/* Links & Resume */}
                        <div className="flex flex-wrap gap-3">
                          {freelancerProfile?.portfolio_url && (
                            <a 
                              href={freelancerProfile.portfolio_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
                            >
                              🎨 Portfolio
                            </a>
                          )}
                          {application.profiles?.linkedin_url && (
                            <a 
                              href={application.profiles.linkedin_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                            >
                              💼 LinkedIn
                            </a>
                          )}
                          {application.profiles?.github_url && (
                            <a 
                              href={application.profiles.github_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                            >
                              💻 GitHub
                            </a>
                          )}
                          {freelancerProfile?.resume_url && (
                            <a 
                              href={freelancerProfile.resume_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                            >
                              📄 Resume
                            </a>
                          )}
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                          <p className="text-xs text-gray-500">
                            Applied on {formatDate(application.created_at)}
                          </p>
                          {freelancerProfile?.availability && (
                            <Badge variant="outline" className="text-xs">
                              {freelancerProfile.availability}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-lg font-medium">No applications yet</p>
                  <p className="text-sm">Share your job posting to get more visibility!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ApplicationCard } from '@/components/applications/application-card'
import Link from 'next/link'
import { MapPin, Clock, DollarSign, User, ArrowLeft, Users } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { notFound } from 'next/navigation'

interface JobDetailPageProps {
  params: {
    id: string
  }
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const supabase = createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get job with client info
  const { data: job } = await supabase
    .from('jobs')
    .select(`
      *,
      profiles!jobs_client_id_fkey (
        first_name,
        last_name
      )
    `)
    .eq('id', params.id)
    .eq('status', 'published')
    .single()

  if (!job) {
    notFound()
  }

  // Get application count
  const { count: applicationCount } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('job_id', params.id)

  // Get applications if user is the job owner
  let applications = null
  if (user && user.id === job.client_id) {
    const { data: apps } = await supabase
      .from('applications')
      .select(`
        *,
        profiles!applications_freelancer_id_fkey (
          first_name,
          last_name
        )
      `)
      .eq('job_id', params.id)
      .order('created_at', { ascending: false })
    
    applications = apps
  }

  const isJobOwner = user && user.id === job.client_id

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <Button variant="ghost" size="sm" className="mb-8" asChild>
          <Link href="/jobs">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to jobs
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl md:text-4xl font-medium tracking-tight mb-4">
                    {job.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      {job.profiles?.first_name} {job.profiles?.last_name}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {job.location_type} {job.location && ` - ${job.location}`}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      {applicationCount || 0} applications
                    </div>
                  </div>
                </div>
                <Badge className="ml-4">
                  {job.job_type}
                </Badge>
              </div>
            </div>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>About this role</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-neutral dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  {job.description}
                </div>
              </CardContent>
            </Card>

            {/* Applications Section - Only visible to job owner */}
            {isJobOwner && applications && (
              <Card>
                <CardHeader>
                  <CardTitle>Applications ({applications.length})</CardTitle>
                  <CardDescription>
                    Review and manage applications for this job
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {applications.length > 0 ? (
                    <div className="space-y-6">
                      {applications.map((application) => (
                        <ApplicationCard 
                          key={application.id}
                          application={application}
                          jobTitle={job.title}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No applications yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card - Only show if not job owner */}
            {!isJobOwner && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Apply for this role</CardTitle>
                  <CardDescription>
                    Join {applicationCount || 0} other applicants
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button size="lg" className="w-full" asChild>
                    <Link href={`/jobs/${job.id}/apply`}>
                      Apply now
                    </Link>
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    You'll need to sign in to apply
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Job Owner Actions */}
            {isJobOwner && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Manage Job</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button size="sm" variant="outline" className="w-full">
                    Edit Job
                  </Button>
                  <Button size="sm" variant="outline" className="w-full">
                    Close Job
                  </Button>
                  <Button size="sm" variant="outline" className="w-full">
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Job Details */}
            <Card>
              <CardHeader>
                <CardTitle>Job details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1">Budget</p>
                    <div className="flex items-center text-lg font-semibold">
                      <DollarSign className="w-5 h-5 mr-1" />
                      {job.budget_type === 'hourly' 
                        ? `$${job.budget_min}-$${job.budget_max}/hour`
                        : job.budget_type === 'monthly'
                        ? `$${job.budget_min?.toLocaleString()}-$${job.budget_max?.toLocaleString()}/month`
                        : `$${job.budget_min?.toLocaleString()}-$${job.budget_max?.toLocaleString()} total`
                      }
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1">Category</p>
                    <Badge variant="outline">{job.category}</Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1">Experience level</p>
                    <p className="text-muted-foreground">{job.experience_level || 'Not specified'}</p>
                  </div>
                  
                  {job.deadline && (
                    <div>
                      <p className="text-sm font-medium mb-1">Deadline</p>
                      <p className="text-muted-foreground">{new Date(job.deadline).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Required Skills */}
            {job.required_skills && job.required_skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Required skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.required_skills.map((skill: string) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

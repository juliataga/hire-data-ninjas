import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { notFound } from 'next/navigation'

interface ApplyPageProps {
  params: {
    id: string
  }
  searchParams: {
    error?: string
  }
}

export default async function ApplyPage({ params, searchParams }: ApplyPageProps) {
  const supabase = createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/login?redirect=' + encodeURIComponent(`/jobs/${params.id}/apply`))
  }

  // Get job details
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

  // Check if user already applied
  const { data: existingApplication } = await supabase
    .from('applications')
    .select('id')
    .eq('job_id', params.id)
    .eq('freelancer_id', user.id)
    .single()

  // Error messages
  const errorMessages = {
    already_applied: 'You have already applied to this job.',
    submission_failed: 'Failed to submit application. Please try again.',
    unexpected: 'An unexpected error occurred. Please try again.'
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Job Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{job.title}</CardTitle>
                  <p className="text-muted-foreground mt-1">
                    {job.profiles?.first_name} {job.profiles?.last_name}
                  </p>
                </div>
                <Badge>{job.job_type}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground line-clamp-3">
                {job.description?.slice(0, 200)}...
              </p>
            </CardContent>
          </Card>

          {/* Error Message */}
          {searchParams.error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <p className="text-red-800 dark:text-red-200 text-sm">
                {errorMessages[searchParams.error as keyof typeof errorMessages] || 'An error occurred'}
              </p>
            </div>
          )}

          {/* Application Form or Already Applied Message */}
          {existingApplication ? (
            <Card>
              <CardContent className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">
                  You've already applied!
                </h3>
                <p className="text-muted-foreground">
                  Your application is being reviewed. We'll notify you of any updates.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Apply for {job.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <form action="/api/apply" method="post" className="space-y-6">
                  <input type="hidden" name="job_id" value={params.id} />
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Your Proposed Rate (per hour)
                    </label>
                    <Input 
                      name="proposed_rate" 
                      type="number" 
                      step="0.01"
                      placeholder="e.g. 75.00"
                      required 
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter your hourly rate in USD
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Cover Letter
                    </label>
                    <Textarea 
                      name="cover_letter" 
                      placeholder="Tell the client why you're the perfect fit for this role..."
                      className="min-h-32"
                      required 
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    Submit Application
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

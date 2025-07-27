import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { MapPin, Clock, DollarSign, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default async function JobsPage() {
  const supabase = createClient()
  
  // Get all published jobs with client info
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select(`
      *,
      profiles!jobs_client_id_fkey (
        first_name,
        last_name
      )
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  console.log('Jobs query result:', { jobs, error })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
            Data jobs
          </h1>
          <p className="text-xl text-muted-foreground">
            Discover opportunities with leading companies looking for data expertise.
          </p>
        </div>

        {/* Debug Info */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-red-800 dark:text-red-200 text-sm">Error: {error.message}</p>
          </div>
        )}

        {/* Jobs Grid */}
        <div className="grid gap-6 max-w-4xl">
          {jobs && jobs.length > 0 ? (
            jobs.map((job) => (
              <Card key={job.id} className="group hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        <Link href={`/jobs/${job.id}`}>
                          {job.title}
                        </Link>
                      </CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {job.profiles?.first_name} {job.profiles?.last_name}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {job.location_type} {job.location && ` - ${job.location}`}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="ml-4">
                      {job.job_type}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <CardDescription className="text-base leading-relaxed">
                    {job.description?.slice(0, 200)}...
                  </CardDescription>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-sm font-medium">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {job.budget_type === 'hourly' 
                          ? `$${job.budget_min}-$${job.budget_max}/hr`
                          : job.budget_type === 'monthly'
                          ? `$${job.budget_min?.toLocaleString()}-$${job.budget_max?.toLocaleString()}/month`
                          : `$${job.budget_min?.toLocaleString()}-$${job.budget_max?.toLocaleString()}`
                        }
                      </div>
                      <Badge variant="outline">
                        {job.category}
                      </Badge>
                    </div>
                    
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/jobs/${job.id}`}>
                        View details
                      </Link>
                    </Button>
                  </div>
                  
                  {/* Skills */}
                  {job.required_skills && job.required_skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {job.required_skills.slice(0, 4).map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {job.required_skills.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{job.required_skills.length - 4} more
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">
                {error ? 'Error loading jobs' : 'No jobs available yet'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {error ? 'Please try again later.' : 'Be the first to post a data science opportunity.'}
              </p>
              <Button asChild>
                <Link href="/auth/signup/client">Post the first job</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

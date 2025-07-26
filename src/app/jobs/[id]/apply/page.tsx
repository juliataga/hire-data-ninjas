import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ApplicationForm } from '@/components/jobs/application-form'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface ApplyPageProps {
  params: {
    id: string
  }
}

export default async function ApplyPage({ params }: ApplyPageProps) {
  const supabase = createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/login')
  }

  // Check if user is a freelancer
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'freelancer') {
    redirect('/auth/signup/freelancer')
  }

  // Get job details
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', params.id)
    .eq('status', 'published')
    .single()

  if (jobError || !job) {
    notFound()
  }

  // Check if user has already applied
  const { data: existingApplication } = await supabase
    .from('applications')
    .select('id')
    .eq('job_id', params.id)
    .eq('freelancer_id', user.id)
    .single()

  if (existingApplication) {
    redirect(`/jobs/${params.id}?applied=true`)
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
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
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
        <div className="mb-6">
          <Link href={`/jobs/${params.id}`}>
            <Button variant="outline" size="sm">
              ← Back to Job Details
            </Button>
          </Link>
        </div>

        <ApplicationForm jobId={params.id} job={job} />
      </main>
    </div>
  )
}

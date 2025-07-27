import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { JobForm } from '@/components/jobs/job-form'
import { Navbar } from '@/components/layout/navbar'

export default async function NewJobPage() {
  const supabase = createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/login')
  }

  // For now, let's allow anyone to post jobs until we implement proper user types
  // Later we'll add proper client verification

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-medium tracking-tight mb-2">
              Post a new job
            </h1>
            <p className="text-muted-foreground">
              Find the perfect data professional for your project.
            </p>
          </div>
          <JobForm />
        </div>
      </div>
    </div>
  )
}

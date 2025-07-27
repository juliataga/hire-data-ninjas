import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return redirect('/auth/login')
  }

  // Get form data
  const formData = await request.formData()
  const jobId = formData.get('job_id') as string
  const proposedRate = parseFloat(formData.get('proposed_rate') as string)
  const coverLetter = formData.get('cover_letter') as string

  try {
    // Insert application
    const { error } = await supabase
      .from('applications')
      .insert({
        job_id: jobId,
        freelancer_id: user.id,
        proposed_rate: proposedRate,
        cover_letter: coverLetter,
        status: 'pending'
      })

    if (error) {
      console.error('Application submission error:', error)
      
      // If duplicate application
      if (error.code === '23505') {
        return redirect(`/jobs/${jobId}/apply?error=already_applied`)
      }
      
      return redirect(`/jobs/${jobId}/apply?error=submission_failed`)
    }

    // Success - redirect to dashboard
    return redirect('/dashboard/freelancer?applied=true')
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return redirect(`/jobs/${jobId}/apply?error=unexpected`)
  }
}

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Get form data
    const formData = await request.formData()
    const jobId = formData.get('job_id') as string
    const proposedRate = parseFloat(formData.get('proposed_rate') as string)
    const coverLetter = formData.get('cover_letter') as string

    console.log('Submitting application:', { jobId, proposedRate, coverLetter, userId: user.id })

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
        return NextResponse.redirect(new URL(`/jobs/${jobId}/apply?error=already_applied`, request.url))
      }
      
      return NextResponse.redirect(new URL(`/jobs/${jobId}/apply?error=submission_failed`, request.url))
    }

    console.log('Application submitted successfully')
    
    // Success - redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard/freelancer?applied=true', request.url))
    
  } catch (error) {
    console.error('Unexpected error in apply route:', error)
    const jobId = (await request.formData()).get('job_id') as string
    return NextResponse.redirect(new URL(`/jobs/${jobId}/apply?error=unexpected`, request.url))
  }
}

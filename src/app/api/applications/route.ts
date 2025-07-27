import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(request: NextRequest) {
  const supabase = createClient()
  
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get request data
    const { applicationId, action } = await request.json()
    
    if (!applicationId || !action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    // Verify the user owns the job this application is for
    const { data: application } = await supabase
      .from('applications')
      .select(`
        *,
        jobs!inner (
          client_id
        )
      `)
      .eq('id', applicationId)
      .single()

    if (!application || application.jobs.client_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized to modify this application' }, { status: 403 })
    }

    // Update application status
    const { error: updateError } = await supabase
      .from('applications')
      .update({ 
        status: action === 'accept' ? 'accepted' : 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)

    if (updateError) {
      console.error('Error updating application:', updateError)
      return NextResponse.json({ error: 'Failed to update application' }, { status: 500 })
    }

    return NextResponse.json({ success: true, status: action === 'accept' ? 'accepted' : 'rejected' })
    
  } catch (error) {
    console.error('Unexpected error in applications route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

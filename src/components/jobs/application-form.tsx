'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

interface ApplicationFormProps {
  jobId: string
  jobTitle: string
}

export function ApplicationForm({ jobId, jobTitle }: ApplicationFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const applicationData = {
        job_id: jobId,
        freelancer_id: user.id,
        cover_letter: formData.get('cover_letter') as string,
        proposed_rate: parseFloat(formData.get('proposed_rate') as string),
        status: 'pending'
      }

      const { error } = await supabase
        .from('applications')
        .insert(applicationData)

      if (error) throw error

      // Redirect to dashboard with success message
      router.push('/dashboard/freelancer?applied=true')
    } catch (error) {
      console.error('Error submitting application:', error)
      alert('Failed to submit application. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apply for {jobTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="Tell the client why you're the perfect fit for this role. Highlight your relevant experience and skills..."
              className="min-h-32"
              required 
            />
            <p className="text-xs text-muted-foreground mt-1">
              Make it personal and specific to this job
            </p>
          </div>

          <Button type="submit" size="lg" disabled={loading} className="w-full">
            {loading ? 'Submitting Application...' : 'Submit Application'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

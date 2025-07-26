'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ApplicationFormProps {
  jobId: string
  job: {
    title: string
    budget_type: string
    budget_min?: number
    budget_max?: number
  }
}

export function ApplicationForm({ jobId, job }: ApplicationFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [proposedRate, setProposedRate] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('You must be logged in to apply')
        return
      }

      const applicationData = {
        job_id: jobId,
        freelancer_id: user.id,
        cover_letter: coverLetter,
        proposed_rate: proposedRate ? parseFloat(proposedRate) : null,
        status: 'pending',
      }

      const { error: insertError } = await supabase
        .from('applications')
        .insert([applicationData])

      if (insertError) {
        if (insertError.code === '23505') { // Unique constraint violation
          setError('You have already applied to this job')
        } else {
          setError(insertError.message)
        }
        return
      }

      // Redirect to success page or job detail
      router.push(`/jobs/${jobId}?applied=true`)
      router.refresh()
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Apply to: {job.title}</CardTitle>
        <CardDescription>
          Tell the client why you're the perfect fit for this project
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="coverLetter" className="text-sm font-medium">
              Cover Letter *
            </label>
            <Textarea
              id="coverLetter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Explain your relevant experience, approach to this project, and why you're the best fit..."
              rows={8}
              required
            />
            <p className="text-xs text-gray-600">
              Tip: Mention specific skills and experience relevant to this project
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="proposedRate" className="text-sm font-medium">
              Proposed Rate ($)
              {job.budget_type === 'hourly' && ' per hour'}
              {job.budget_type === 'monthly' && ' per month'}
            </label>
            <Input
              id="proposedRate"
              type="number"
              value={proposedRate}
              onChange={(e) => setProposedRate(e.target.value)}
              placeholder={
                job.budget_min && job.budget_max 
                  ? `Suggested: $${job.budget_min} - $${job.budget_max}`
                  : 'Enter your rate'
              }
              min="0"
              step="0.01"
            />
            <p className="text-xs text-gray-600">
              {job.budget_type === 'fixed' && 'Total project cost'}
              {job.budget_type === 'hourly' && 'Your hourly rate'}
              {job.budget_type === 'monthly' && 'Monthly retainer fee'}
            </p>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

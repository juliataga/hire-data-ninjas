'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { JOB_CATEGORIES, JOB_TYPES, LOCATION_TYPES, EXPERIENCE_LEVELS, DATA_SCIENCE_SKILLS } from '@/lib/constants'

export function JobForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    job_type: '',
    location_type: '',
    location: '',
    budget_min: '',
    budget_max: '',
    budget_type: 'fixed',
    experience_level: '',
    deadline: '',
    required_skills: [] as string[],
  })

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      required_skills: prev.required_skills.includes(skill)
        ? prev.required_skills.filter(s => s !== skill)
        : [...prev.required_skills, skill]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('You must be logged in to post a job')
        return
      }

      const jobData = {
        client_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        job_type: formData.job_type,
        location_type: formData.location_type,
        location: formData.location || null,
        budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
        budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
        budget_type: formData.budget_type,
        experience_level: formData.experience_level,
        deadline: formData.deadline || null,
        required_skills: formData.required_skills,
        status: 'published',
      }

      const { data, error } = await supabase
        .from('jobs')
        .insert([jobData])
        .select()
        .single()

      if (error) {
        setError(error.message)
        return
      }

      // Redirect to job detail page
      router.push(`/dashboard/client/jobs/${data.id}`)
      router.refresh()
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>
            Provide the basic information about your job posting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Job Title *
            </label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Senior Data Scientist for ML Project"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Job Description *
            </label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the project, requirements, and expectations..."
              rows={6}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category *</label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Job Type *</label>
              <Select
                value={formData.job_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, job_type: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Experience Level *</label>
            <Select
              value={formData.experience_level}
              onValueChange={(value) => setFormData(prev => ({ ...prev, experience_level: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCE_LEVELS.map(level => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Location & Budget */}
      <Card>
        <CardHeader>
          <CardTitle>Location & Budget</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Work Type *</label>
              <Select
                value={formData.location_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, location_type: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select work type" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATION_TYPES.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">
                Location {formData.location_type !== 'Remote' && '*'}
              </label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g. San Francisco, CA"
                required={formData.location_type !== 'Remote'}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Budget Type</label>
              <Select
                value={formData.budget_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, budget_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly Rate</SelectItem>
                  <SelectItem value="fixed">Fixed Price</SelectItem>
                  <SelectItem value="monthly">Monthly Retainer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="budget_min" className="text-sm font-medium">
                  Budget Min ($)
                </label>
                <Input
                  id="budget_min"
                  type="number"
                  value={formData.budget_min}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget_min: e.target.value }))}
                  placeholder="1000"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="budget_max" className="text-sm font-medium">
                  Budget Max ($)
                </label>
                <Input
                  id="budget_max"
                  type="number"
                  value={formData.budget_max}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget_max: e.target.value }))}
                  placeholder="5000"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="deadline" className="text-sm font-medium">
              Project Deadline
            </label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Required Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Required Skills</CardTitle>
          <CardDescription>
            Select the skills required for this job
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {DATA_SCIENCE_SKILLS.map(skill => (
              <Badge
                key={skill}
                variant={formData.required_skills.includes(skill) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleSkillToggle(skill)}
              >
                {skill}
              </Badge>
            ))}
          </div>
          {formData.required_skills.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Selected: {formData.required_skills.join(', ')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Publishing...' : 'Publish Job'}
        </Button>
      </div>
    </form>
  )
}

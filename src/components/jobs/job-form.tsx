'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

const categories = [
  'Data Science',
  'Machine Learning',
  'Data Analysis',
  'Data Engineering',
  'Business Intelligence',
  'Statistical Analysis',
  'Deep Learning',
  'NLP',
  'Computer Vision'
]

const experienceLevels = [
  'Entry Level (0-2 years)',
  'Mid Level (2-5 years)', 
  'Senior Level (5-10 years)',
  'Expert Level (10+ years)'
]

const jobTypes = [
  'Full-time Contract',
  'Part-time Contract',
  'Project-based',
  'Hourly',
  'Fixed Price'
]

const locationTypes = ['Remote', 'On-site', 'Hybrid']
const budgetTypes = ['hourly', 'fixed', 'monthly']

export function JobForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const jobData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        category: formData.get('category') as string,
        job_type: formData.get('job_type') as string,
        location_type: formData.get('location_type') as string,
        location: formData.get('location') as string || null,
        experience_level: formData.get('experience_level') as string || null,
        budget_type: formData.get('budget_type') as string,
        budget_min: parseFloat(formData.get('budget_min') as string),
        budget_max: parseFloat(formData.get('budget_max') as string),
        required_skills: skills,
        deadline: formData.get('deadline') ? new Date(formData.get('deadline') as string).toISOString().split('T')[0] : null,
        client_id: user.id,
        status: 'published'
      }

      console.log('Attempting to create job with data:', jobData)

      const { data, error } = await supabase
        .from('jobs')
        .insert(jobData)
        .select()
        .single()

      console.log('Supabase response:', { data, error })

      if (error) {
        console.error('Supabase error:', error)
        setError(`Database error: ${error.message}`)
        return
      }

      console.log('Job created successfully:', data)
      router.push(`/jobs/${data.id}`)
    } catch (error: any) {
      console.error('Error creating job:', error)
      setError(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">Job Title</label>
              <Input name="title" placeholder="e.g. Senior Data Scientist" required />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select name="category" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Job Type</label>
              <Select name="job_type" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {jobTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Location Type</label>
              <Select name="location_type" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select location type" />
                </SelectTrigger>
                <SelectContent>
                  {locationTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Location (optional)</label>
              <Input name="location" placeholder="e.g. New York, San Francisco" />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Experience Level</label>
              <Select name="experience_level">
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {experienceLevels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Deadline (optional)</label>
              <Input name="deadline" type="date" />
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="text-sm font-medium mb-2 block">Budget</label>
            <div className="grid md:grid-cols-3 gap-4">
              <Select name="budget_type" required>
                <SelectTrigger>
                  <SelectValue placeholder="Budget type" />
                </SelectTrigger>
                <SelectContent>
                  {budgetTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type === 'hourly' ? 'Hourly Rate' : type === 'fixed' ? 'Fixed Price' : 'Monthly Rate'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input name="budget_min" type="number" step="0.01" placeholder="Min ($)" required />
              <Input name="budget_max" type="number" step="0.01" placeholder="Max ($)" required />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium mb-2 block">Job Description</label>
            <Textarea 
              name="description" 
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              className="min-h-32"
              required 
            />
          </div>

          {/* Skills */}
          <div>
            <label className="text-sm font-medium mb-2 block">Required Skills</label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input 
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill (e.g. Python, SQL, etc.)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill} variant="outline">
                  Add
                </Button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Button type="submit" size="lg" disabled={loading} className="w-full">
            {loading ? 'Creating Job...' : 'Post Job'}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}

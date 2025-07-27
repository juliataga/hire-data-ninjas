'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

const experienceLevels = [
  'Entry Level (0-2 years)',
  'Mid Level (2-5 years)', 
  'Senior Level (5-10 years)',
  'Expert Level (10+ years)'
]

const availabilityOptions = ['Available', 'Busy', 'Not Available']

const commonSkills = [
  'Python', 'R', 'SQL', 'Machine Learning', 'Deep Learning', 'Data Visualization',
  'Statistical Analysis', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn',
  'Tableau', 'Power BI', 'Apache Spark', 'AWS', 'Azure', 'GCP', 'Docker', 'Git',
  'Jupyter', 'MongoDB', 'PostgreSQL', 'ETL', 'Data Mining', 'NLP', 'Computer Vision',
  'Time Series Analysis', 'A/B Testing', 'Business Intelligence', 'Data Engineering'
]

export function FreelancerProfileForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState<any>(null)
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')
  const router = useRouter()
  const supabase = createClient()

  // Load existing profile
  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: existingProfile } = await supabase
        .from('freelancer_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (existingProfile) {
        setProfile(existingProfile)
        setSkills(existingProfile.skills || [])
      }
    }

    loadProfile()
  }, [supabase])

  const addSkill = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill])
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

      const profileData = {
        id: user.id,
        hourly_rate: parseFloat(formData.get('hourly_rate') as string) || null,
        experience_level: formData.get('experience_level') as string || null,
        skills: skills,
        portfolio_url: formData.get('portfolio_url') as string || null,
        resume_url: formData.get('resume_url') as string || null,
        availability: formData.get('availability') as string || 'Available'
      }

      console.log('Saving profile data:', profileData)

      const { error } = await supabase
        .from('freelancer_profiles')
        .upsert(profileData)

      if (error) throw error

      router.push('/dashboard/freelancer?profile_updated=true')
    } catch (error: any) {
      console.error('Error saving profile:', error)
      setError(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-medium tracking-tight mb-2">
          Complete Your Profile
        </h1>
        <p className="text-muted-foreground">
          A complete profile gets 5x more views from clients.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Experience Level</label>
                <Select name="experience_level" defaultValue={profile?.experience_level || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Hourly Rate (USD)</label>
                <Input 
                  name="hourly_rate" 
                  type="number"
                  step="0.01"
                  placeholder="e.g. 75.00"
                  defaultValue={profile?.hourly_rate || ''}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Availability</label>
              <Select name="availability" defaultValue={profile?.availability || 'Available'}>
                <SelectTrigger>
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  {availabilityOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Skills & Expertise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Skills</label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input 
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill(newSkill))}
                  />
                  <Button type="button" onClick={() => addSkill(newSkill)} variant="outline">
                    Add
                  </Button>
                </div>
                
                {/* Common Skills */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Popular skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {commonSkills.slice(0, 12).map(skill => (
                      <Badge 
                        key={skill} 
                        variant={skills.includes(skill) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => addSkill(skill)}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Selected Skills */}
                {skills.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Your skills ({skills.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {skills.map(skill => (
                        <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                          {skill}
                          <X className="w-3 h-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio & Links */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio & Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Portfolio URL</label>
              <Input 
                name="portfolio_url" 
                type="url"
                placeholder="https://yourportfolio.com"
                defaultValue={profile?.portfolio_url || ''}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Showcase your best work and projects
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Resume URL</label>
              <Input 
                name="resume_url" 
                type="url"
                placeholder="https://drive.google.com/your-resume"
                defaultValue={profile?.resume_url || ''}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Link to your resume (Google Drive, Dropbox, etc.)
              </p>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading ? 'Saving Profile...' : 'Save Profile'}
        </Button>
      </form>
    </div>
  )
}

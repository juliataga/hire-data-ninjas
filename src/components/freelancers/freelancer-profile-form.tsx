'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileUpload } from '@/components/common/file-upload'
import { EXPERIENCE_LEVELS, DATA_SCIENCE_SKILLS } from '@/lib/constants'

export function FreelancerProfileForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [initializing, setInitializing] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Form state
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    location: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
  })

  const [freelancerData, setFreelancerData] = useState({
    hourly_rate: '',
    experience_level: '',
    skills: [] as string[],
    resume_url: '',
  })

  useEffect(() => {
    loadExistingData()
  }, [])

  const loadExistingData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setProfileData({
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          bio: profile.bio || '',
          location: profile.location || '',
          linkedin_url: profile.linkedin_url || '',
          github_url: profile.github_url || '',
          portfolio_url: profile.portfolio_url || '',
        })
      }

      // Load freelancer profile data
      const { data: freelancerProfile } = await supabase
        .from('freelancer_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (freelancerProfile) {
        setFreelancerData({
          hourly_rate: freelancerProfile.hourly_rate?.toString() || '',
          experience_level: freelancerProfile.experience_level || '',
          skills: freelancerProfile.skills || [],
          resume_url: freelancerProfile.resume_url || '',
        })
      }
    } catch (error) {
      console.error('Error loading profile data:', error)
    } finally {
      setInitializing(false)
    }
  }

  const handleSkillToggle = (skill: string) => {
    setFreelancerData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in')
        return
      }

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          bio: profileData.bio,
          location: profileData.location,
          linkedin_url: profileData.linkedin_url,
          github_url: profileData.github_url,
          portfolio_url: profileData.portfolio_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (profileError) {
        setError(profileError.message)
        return
      }

      // Update or insert freelancer_profiles
      const { error: freelancerError } = await supabase
        .from('freelancer_profiles')
        .upsert({
          id: user.id,
          hourly_rate: freelancerData.hourly_rate ? parseFloat(freelancerData.hourly_rate) : null,
          experience_level: freelancerData.experience_level,
          skills: freelancerData.skills,
          resume_url: freelancerData.resume_url,
          updated_at: new Date().toISOString(),
        })

      if (freelancerError) {
        setError(freelancerError.message)
        return
      }

      // Redirect back to dashboard
      router.push('/dashboard/freelancer')
      router.refresh()
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleResumeUpload = (url: string) => {
    setFreelancerData(prev => ({ ...prev, resume_url: url }))
  }

  if (initializing) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
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
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Tell clients about yourself and your background
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">First Name *</label>
              <Input
                value={profileData.first_name}
                onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name *</label>
              <Input
                value={profileData.last_name}
                onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <Textarea
              value={profileData.bio}
              onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell clients about your experience, expertise, and what makes you unique..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <Input
              value={profileData.location}
              onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g. San Francisco, CA"
            />
          </div>
        </CardContent>
      </Card>

      {/* Professional Details */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Hourly Rate ($)</label>
              <Input
                type="number"
                value={freelancerData.hourly_rate}
                onChange={(e) => setFreelancerData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                placeholder="e.g. 75"
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Experience Level</label>
              <Select
                value={freelancerData.experience_level}
                onValueChange={(value) => setFreelancerData(prev => ({ ...prev, experience_level: value }))}
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
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Skills</label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border rounded">
              {DATA_SCIENCE_SKILLS.map(skill => (
                <Badge
                  key={skill}
                  variant={freelancerData.skills.includes(skill) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleSkillToggle(skill)}
                >
                  {skill}
                </Badge>
              ))}
            </div>
            {freelancerData.skills.length > 0 && (
              <p className="text-xs text-gray-600">
                Selected: {freelancerData.skills.join(', ')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Links & Files */}
      <Card>
        <CardHeader>
          <CardTitle>Links & Documents</CardTitle>
          <CardDescription>
            Add your portfolio, social links, and resume
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Portfolio URL</label>
            <Input
              type="url"
              value={profileData.portfolio_url}
              onChange={(e) => setProfileData(prev => ({ ...prev, portfolio_url: e.target.value }))}
              placeholder="https://yourportfolio.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">LinkedIn URL</label>
              <Input
                type="url"
                value={profileData.linkedin_url}
                onChange={(e) => setProfileData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">GitHub URL</label>
              <Input
                type="url"
                value={profileData.github_url}
                onChange={(e) => setProfileData(prev => ({ ...prev, github_url: e.target.value }))}
                placeholder="https://github.com/yourusername"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Resume</label>
            <FileUpload
              onUpload={handleResumeUpload}
              bucket="resumes"
              accept=".pdf,.doc,.docx"
              maxSize={10}
              label="Upload Resume"
              currentFile={freelancerData.resume_url}
            />
          </div>
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
          {loading ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </form>
  )
}

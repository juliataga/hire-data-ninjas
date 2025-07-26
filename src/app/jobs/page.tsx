'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { JobCard } from '@/components/jobs/job-card'
import { JobFilters } from '@/components/jobs/job-filters'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/use-auth'

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [filteredJobs, setFilteredJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<any>({})
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    fetchJobs()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [jobs, filters])

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          profiles!jobs_client_id_fkey (
            first_name,
            last_name
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching jobs:', error)
        return
      }

      setJobs(data || [])
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...jobs]

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.description.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(job => job.category === filters.category)
    }

    // Job type filter
    if (filters.job_type && filters.job_type !== 'all') {
      filtered = filtered.filter(job => job.job_type === filters.job_type)
    }

    // Location type filter
    if (filters.location_type && filters.location_type !== 'all') {
      filtered = filtered.filter(job => job.location_type === filters.location_type)
    }

    // Experience level filter
    if (filters.experience_level && filters.experience_level !== 'all') {
      filtered = filtered.filter(job => job.experience_level === filters.experience_level)
    }

    // Skills filter
    if (filters.skills && filters.skills.length > 0) {
      filtered = filtered.filter(job =>
        job.required_skills && job.required_skills.some((skill: string) => filters.skills.includes(skill))
      )
    }

    // Budget filter
    if (filters.budget_min) {
      filtered = filtered.filter(job => 
        job.budget_max && job.budget_max >= parseFloat(filters.budget_min)
      )
    }

    if (filters.budget_max) {
      filtered = filtered.filter(job =>
        job.budget_min && job.budget_min <= parseFloat(filters.budget_max)
      )
    }

    setFilteredJobs(filtered)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="text-2xl font-bold text-gray-900">
                🥷 HireDataNinjas
              </h1>
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="outline">Dashboard</Button>
                  </Link>
                  <form action="/auth/signout" method="post">
                    <Button variant="ghost" type="submit">Sign Out</Button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="outline">Login</Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button>Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Find Your Next Data Science Opportunity
          </h2>
          <p className="text-gray-600">
            Browse through {jobs.length} curated data science jobs from top companies
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <JobFilters onFiltersChange={setFilters} />
          </div>

          {/* Jobs List */}
          <div className="lg:col-span-3">
            {filteredJobs.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {filteredJobs.length} of {jobs.length} jobs
                  </p>
                </div>
                
                <div className="grid gap-4">
                  {filteredJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500">
                  <p className="text-lg">No jobs found matching your criteria</p>
                  <p className="text-sm mt-2">Try adjusting your filters or check back later for new opportunities</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

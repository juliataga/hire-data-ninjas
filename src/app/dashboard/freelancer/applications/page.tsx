'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Clock, DollarSign } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

type FilterType = 'all' | 'pending' | 'accepted' | 'rejected'

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadApplications = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
          router.push('/auth/login')
          return
        }
        
        setUser(user)

        const { data: apps, error } = await supabase
          .from('applications')
          .select(`
            *,
            jobs (
              id,
              title,
              category,
              budget_min,
              budget_max,
              budget_type,
              location_type,
              location,
              status,
              created_at,
              profiles!jobs_client_id_fkey (
                first_name,
                last_name
              )
            )
          `)
          .eq('freelancer_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error loading applications:', error)
        } else {
          setApplications(apps || [])
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadApplications()
  }, [supabase, router])

  // Filter applications based on active filter
  const filteredApplications = applications.filter(app => {
    switch (activeFilter) {
      case 'pending':
        return app.status === 'pending'
      case 'accepted':
        return app.status === 'accepted'
      case 'rejected':
        return app.status === 'rejected'
      default:
        return true
    }
  })

  // Calculate stats
  const pendingApps = applications.filter(app => app.status === 'pending')
  const acceptedApps = applications.filter(app => app.status === 'accepted')
  const rejectedApps = applications.filter(app => app.status === 'rejected')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getFilterButtonStyle = (filter: FilterType) => {
    return activeFilter === filter 
      ? 'bg-primary text-primary-foreground' 
      : 'bg-muted hover:bg-muted/80'
  }

  const ApplicationCard = ({ application }: { application: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg">
              {application.jobs ? (
                <Link 
                  href={`/jobs/${application.jobs.id}`}
                  className="hover:text-primary transition-colors flex items-center gap-2"
                >
                  {application.jobs.title}
                  <ExternalLink className="w-4 h-4" />
                </Link>
              ) : (
                <span>Job not found</span>
              )}
            </CardTitle>
            {application.jobs && (
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>{application.jobs.profiles?.first_name} {application.jobs.profiles?.last_name}</span>
                <span>•</span>
                <Badge variant="outline" className="text-xs">
                  {application.jobs.category}
                </Badge>
                <span>•</span>
                <span>{application.jobs.location_type}</span>
              </div>
            )}
          </div>
          <Badge className={getStatusColor(application.status)}>
            {application.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-medium text-muted-foreground mb-1">Your Rate</p>
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              <span className="font-medium">${application.proposed_rate}/hr</span>
            </div>
          </div>
          
          {application.jobs && (
            <>
              <div>
                <p className="font-medium text-muted-foreground mb-1">Job Budget</p>
                <span>
                  ${application.jobs.budget_min}-${application.jobs.budget_max}
                  {application.jobs.budget_type === 'hourly' ? '/hr' : ''}
                </span>
              </div>
              
              <div>
                <p className="font-medium text-muted-foreground mb-1">Applied</p>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}</span>
                </div>
              </div>
            </>
          )}
        </div>
        
        {application.cover_letter && (
          <div>
            <p className="font-medium text-muted-foreground mb-2">Cover Letter</p>
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm line-clamp-3">{application.cover_letter}</p>
            </div>
          </div>
        )}
        
        {application.jobs && (
          <div className="flex justify-between items-center pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              Job posted {formatDistanceToNow(new Date(application.jobs.created_at), { addSuffix: true })}
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/jobs/${application.jobs.id}`}>
                View Job
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">Loading applications...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" size="sm" className="mb-4" asChild>
              <Link href="/dashboard/freelancer">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            
            <h1 className="text-3xl font-medium tracking-tight mb-2">
              My Applications
            </h1>
            <p className="text-muted-foreground">
              Track all your job applications and their status
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button 
              variant="ghost" 
              size="sm"
              className={getFilterButtonStyle('all')}
              onClick={() => setActiveFilter('all')}
            >
              All ({applications.length})
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className={getFilterButtonStyle('pending')}
              onClick={() => setActiveFilter('pending')}
            >
              Pending ({pendingApps.length})
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className={getFilterButtonStyle('accepted')}
              onClick={() => setActiveFilter('accepted')}
            >
              Accepted ({acceptedApps.length})
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className={getFilterButtonStyle('rejected')}
              onClick={() => setActiveFilter('rejected')}
            >
              Rejected ({rejectedApps.length})
            </Button>
          </div>

          {/* Stats Summary */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{pendingApps.length}</div>
                <p className="text-muted-foreground text-sm">Pending Review</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">{acceptedApps.length}</div>
                <p className="text-muted-foreground text-sm">Accepted</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-600">{rejectedApps.length}</div>
                <p className="text-muted-foreground text-sm">Not Selected</p>
              </CardContent>
            </Card>
          </div>

          {/* Applications List */}
          {filteredApplications.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {activeFilter === 'all' ? 'All Applications' : 
                   activeFilter === 'pending' ? 'Pending Applications' :
                   activeFilter === 'accepted' ? 'Accepted Applications' :
                   'Rejected Applications'} ({filteredApplications.length})
                </h2>
              </div>
              
              {filteredApplications.map((application) => (
                <ApplicationCard key={application.id} application={application} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium mb-2">
                  {activeFilter === 'all' ? 'No applications yet' : 
                   `No ${activeFilter} applications`}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {activeFilter === 'all' 
                    ? 'Start applying to jobs to track your applications here.'
                    : `You don't have any ${activeFilter} applications yet.`
                  }
                </p>
                <Button asChild>
                  <Link href="/jobs">Browse Jobs</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

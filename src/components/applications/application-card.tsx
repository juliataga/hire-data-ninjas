'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useRouter } from 'next/navigation'

interface ApplicationCardProps {
  application: {
    id: string
    status: string
    proposed_rate: number
    cover_letter: string
    created_at: string
    profiles: {
      first_name: string
      last_name: string
    }
  }
  jobTitle: string
}

export function ApplicationCard({ application, jobTitle }: ApplicationCardProps) {
  const [loading, setLoading] = useState('')
  const router = useRouter()

  const handleAction = async (action: 'accept' | 'reject') => {
    setLoading(action)
    
    try {
      const response = await fetch('/api/applications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: application.id,
          action: action
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update application')
      }

      const data = await response.json()
      
      if (data.success) {
        // Refresh the page to show updated status
        router.refresh()
      } else {
        alert('Failed to update application')
      }
    } catch (error) {
      console.error('Error updating application:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setLoading('')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Accepted</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const initials = `${application.profiles.first_name?.[0] || ''}${application.profiles.last_name?.[0] || ''}`

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">
                {application.profiles.first_name} {application.profiles.last_name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Applied for: {jobTitle}
              </p>
            </div>
          </div>
          {getStatusBadge(application.status)}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-1">Proposed Rate</p>
          <p className="text-lg font-semibold">${application.proposed_rate}/hour</p>
        </div>
        
        <div>
          <p className="text-sm font-medium mb-2">Cover Letter</p>
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {application.cover_letter}
            </p>
          </div>
        </div>
        
        <div>
          <p className="text-xs text-muted-foreground">
            Applied {new Date(application.created_at).toLocaleDateString()}
          </p>
        </div>

        {application.status === 'pending' && (
          <div className="flex space-x-3 pt-4">
            <Button 
              onClick={() => handleAction('accept')}
              disabled={loading !== ''}
              className="flex-1"
            >
              {loading === 'accept' ? 'Accepting...' : 'Accept'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleAction('reject')}
              disabled={loading !== ''}
              className="flex-1"
            >
              {loading === 'reject' ? 'Rejecting...' : 'Reject'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

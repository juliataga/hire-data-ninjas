'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, truncateText } from '@/lib/utils'

interface JobCardProps {
  job: {
    id: string
    title: string
    description: string
    category: string
    job_type: string
    location_type: string
    location?: string
    budget_min?: number
    budget_max?: number
    budget_type: string
    experience_level: string
    required_skills?: string[]
    created_at: string
    applications_count: number
    profiles: {
      first_name: string
      last_name: string
    }
  }
}

export function JobCard({ job }: JobCardProps) {
  const formatBudgetRange = (min: number | null, max: number | null, type: string) => {
    if (!min && !max) return 'Budget not specified'
    
    const prefix = type === 'hourly' ? '/hr' : type === 'monthly' ? '/mo' : ''
    
    if (min && max) {
      return `${formatCurrency(min)} - ${formatCurrency(max)}${prefix}`
    } else if (min) {
      return `From ${formatCurrency(min)}${prefix}`
    } else if (max) {
      return `Up to ${formatCurrency(max)}${prefix}`
    }
    
    return 'Budget not specified'
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{job.title}</CardTitle>
            <CardDescription className="mt-1">
              by {job.profiles.first_name} {job.profiles.last_name}
            </CardDescription>
          </div>
          <Badge variant="outline">{job.category}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          {truncateText(job.description, 150)}
        </p>

        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="secondary">{job.job_type}</Badge>
          <Badge variant="secondary">
            {job.location_type}
            {job.location && ` - ${job.location}`}
          </Badge>
          <Badge variant="secondary">{job.experience_level}</Badge>
        </div>

        {job.required_skills && job.required_skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.required_skills.slice(0, 4).map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {job.required_skills.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{job.required_skills.length - 4} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="text-sm">
            <p className="font-medium text-green-600">
              {formatBudgetRange(job.budget_min, job.budget_max, job.budget_type)}
            </p>
            <p className="text-gray-500">
              {job.applications_count} application{job.applications_count !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-right text-xs text-gray-500">
            <p>{formatDate(job.created_at)}</p>
          </div>
        </div>

        <Link href={`/jobs/${job.id}`}>
          <Button className="w-full">View Details</Button>
        </Link>
      </CardContent>
    </Card>
  )
}

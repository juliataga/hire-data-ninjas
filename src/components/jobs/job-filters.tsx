'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { JOB_CATEGORIES, JOB_TYPES, LOCATION_TYPES, EXPERIENCE_LEVELS, DATA_SCIENCE_SKILLS } from '@/lib/constants'

interface JobFiltersProps {
  onFiltersChange: (filters: any) => void
}

export function JobFilters({ onFiltersChange }: JobFiltersProps) {
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    job_type: 'all',
    location_type: 'all',
    experience_level: 'all',
    skills: [] as string[],
    budget_min: '',
    budget_max: '',
  })

  const handleSkillToggle = (skill: string) => {
    const newSkills = filters.skills.includes(skill)
      ? filters.skills.filter(s => s !== skill)
      : [...filters.skills, skill]
    
    const newFilters = { ...filters, skills: newSkills }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      category: 'all',
      job_type: 'all',
      location_type: 'all',
      experience_level: 'all',
      skills: [],
      budget_min: '',
      budget_max: '',
    }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Filters</CardTitle>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Search</label>
          <Input
            placeholder="Search jobs..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {JOB_CATEGORIES.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Job Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Job Type</label>
          <Select value={filters.job_type} onValueChange={(value) => handleFilterChange('job_type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {JOB_TYPES.map(type => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Work Type</label>
          <Select value={filters.location_type} onValueChange={(value) => handleFilterChange('location_type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              {LOCATION_TYPES.map(type => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Experience Level */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Experience Level</label>
          <Select value={filters.experience_level} onValueChange={(value) => handleFilterChange('experience_level', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              {EXPERIENCE_LEVELS.map(level => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Budget Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Budget Range</label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Min"
              type="number"
              value={filters.budget_min}
              onChange={(e) => handleFilterChange('budget_min', e.target.value)}
            />
            <Input
              placeholder="Max"
              type="number"
              value={filters.budget_max}
              onChange={(e) => handleFilterChange('budget_max', e.target.value)}
            />
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Skills</label>
          <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
            {DATA_SCIENCE_SKILLS.slice(0, 15).map(skill => (
              <Badge
                key={skill}
                variant={filters.skills.includes(skill) ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => handleSkillToggle(skill)}
              >
                {skill}
              </Badge>
            ))}
          </div>
          {filters.skills.length > 0 && (
            <p className="text-xs text-gray-600">
              Selected: {filters.skills.join(', ')}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

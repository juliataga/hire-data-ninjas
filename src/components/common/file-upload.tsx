'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface FileUploadProps {
  onUpload: (url: string) => void
  bucket: string
  accept?: string
  maxSize?: number // in MB
  label?: string
  currentFile?: string
}

export function FileUpload({ 
  onUpload, 
  bucket, 
  accept = '.pdf,.doc,.docx',
  maxSize = 10,
  label = 'Upload File',
  currentFile 
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      setError('')

      if (!event.target.files || event.target.files.length === 0) {
        return
      }

      const file = event.target.files[0]

      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File size must be less than ${maxSize}MB`)
        return
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in to upload files')
        return
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Math.random()}.${fileExt}`

      // Upload file
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file)

      if (uploadError) {
        setError(uploadError.message)
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)

      onUpload(publicUrl)
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setUploading(false)
      // Reset the input
      if (event.target) {
        event.target.value = ''
      }
    }
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
      
      <div className="flex items-center gap-3">
        <Input
          type="file"
          accept={accept}
          onChange={uploadFile}
          disabled={uploading}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => document.querySelector('input[type="file"]')?.click()}
        >
          {uploading ? 'Uploading...' : label}
        </Button>
      </div>

      {currentFile && (
        <div className="text-sm text-gray-600">
          Current file: 
          <a 
            href={currentFile} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline ml-1"
          >
            View File
          </a>
        </div>
      )}
    </div>
  )
}

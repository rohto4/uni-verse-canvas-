'use client'

import { useState, useCallback, useId } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
type UploadAction = (formData: FormData) => Promise<{ url: string | null; error?: string }>

interface ImageUploadMultipleProps {
  images: string[]
  onChange: (images: string[]) => void
  uploadAction: UploadAction
  maxImages?: number
  label?: string
}

export function ImageUploadMultiple({
  images,
  onChange,
  uploadAction,
  maxImages = 10,
  label,
}: ImageUploadMultipleProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const inputId = useId()

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return

      const remaining = maxImages - images.length
      if (remaining <= 0) {
        alert(`最大${maxImages}枚までアップロードできます`)
        return
      }

      const filesToUpload = Array.from(files).slice(0, remaining)
      const validFiles = filesToUpload.filter((file) => {
        if (!file.type.startsWith('image/')) {
          alert(`${file.name}は画像ファイルではありません`)
          return false
        }
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name}は5MBを超えています`)
          return false
        }
        return true
      })

      if (validFiles.length === 0) return

      setIsUploading(true)

      try {
        const uploadPromises = validFiles.map(async (file) => {
          const formData = new FormData()
          formData.append('file', file)
          const result = await uploadAction(formData)
          
          if (result.error) {
            console.error(`Upload failed for ${file.name}:`, result.error)
            alert(`${file.name}のアップロードに失敗しました: ${result.error}`)
            return null
          }
          return result.url
        })

        const results = await Promise.all(uploadPromises)
        const successfulUrls = results.filter((url): url is string => url !== null)

        if (successfulUrls.length > 0) {
          onChange([...images, ...successfulUrls])
        }
      } catch (error) {
        console.error('Upload error:', error)
        alert('画像のアップロード中にエラーが発生しました')
      } finally {
        setIsUploading(false)
      }
    },
    [images, maxImages, onChange, uploadAction]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (isUploading) return
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles, isUploading]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!isUploading) {
      setIsDragging(true)
    }
  }, [isUploading])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const removeImage = useCallback(
    (index: number) => {
      const newImages = images.filter((_, i) => i !== index)
      onChange(newImages)
    },
    [images, onChange]
  )

  const moveImage = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (toIndex < 0 || toIndex >= images.length) return
      const newImages = [...images]
      const [moved] = newImages.splice(fromIndex, 1)
      newImages.splice(toIndex, 0, moved)
      onChange(newImages)
    },
    [images, onChange]
  )

  const displayLabel = label || `ギャラリー画像（最大${maxImages}枚）`

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>{displayLabel}</Label>
        <span className="text-sm text-muted-foreground">
          {images.length} / {maxImages}
        </span>
      </div>

      {images.length < maxImages && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                画像をアップロード中...
              </p>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                画像をドラッグ＆ドロップ、または
              </p>
              <Input
                type="file"
                accept="image/*"
                multiple
                disabled={isUploading}
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
                id={inputId}
              />
              <Button type="button" variant="outline" size="sm" asChild disabled={isUploading}>
                <label htmlFor={inputId} className="cursor-pointer">
                  ファイルを選択
                </label>
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                JPG, PNG, WebP (最大5MB/枚)
              </p>
            </>
          )}
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={`${image}-${index}`} className="relative group aspect-video">
              <Image
                src={image}
                alt={`Gallery ${index + 1}`}
                fill
                className="object-cover rounded-lg"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              />
              {!isUploading && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => moveImage(index, index - 1)}
                    disabled={index === 0}
                    className={index === 0 ? 'invisible' : ''}
                  >
                    ←
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => moveImage(index, index + 1)}
                    disabled={index === images.length - 1}
                    className={index === images.length - 1 ? 'invisible' : ''}
                  >
                    →
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

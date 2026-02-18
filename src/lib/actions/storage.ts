'use server'

import { createAdminClient, createServerClient } from '@/lib/supabase/server'

const BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'images'

async function ensureBucketExists() {
  const adminClient = createAdminClient()
  const { data, error } = await adminClient.storage.listBuckets()
  if (error) {
    console.error('Supabase Storage Bucket List Error:', error)
    return adminClient
  }

  const exists = data?.some((bucket) => bucket.name === BUCKET_NAME)
  if (!exists) {
    const { error: createError } = await adminClient.storage.createBucket(BUCKET_NAME, {
      public: true,
    })
    if (createError) {
      console.error('Supabase Storage Bucket Create Error:', createError)
    }
  }

  return adminClient
}

export async function uploadFile(formData: FormData): Promise<{ url: string | null; error?: string }> {
  const supabase = await createServerClient()
  const file = formData.get('file') as File

  if (!file) {
    return { url: null, error: 'ファイルが見つかりません。' }
  }

  // ファイル名のサニタイズ（日本語ファイル名などのトラブル防止）
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const fileName = `${Date.now()}-${safeName}`
  
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file)

  if (error) {
    console.error('Supabase Storage Error:', error)
    const adminClient = await ensureBucketExists()
    const { error: adminError } = await adminClient.storage
      .from(BUCKET_NAME)
      .upload(fileName, file)

    if (adminError) {
      console.error('Supabase Storage Admin Error:', adminError)
      return { url: null, error: '画像のアップロードに失敗しました。' }
    }

    const { data: { publicUrl } } = adminClient.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName)

    return { url: publicUrl }
  }

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName)

  return { url: publicUrl }
}

'use server'

import { createServerClient } from '@/lib/supabase/server'

export async function uploadFile(formData: FormData): Promise<{ url: string | null; error?: string }> {
  const supabase = createServerClient()
  const file = formData.get('file') as File

  if (!file) {
    return { url: null, error: 'ファイルが見つかりません。' }
  }

  // ファイル名のサニタイズ（日本語ファイル名などのトラブル防止）
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const fileName = `${Date.now()}-${safeName}`
  
  const { error } = await supabase.storage
    .from('images')
    .upload(fileName, file)

  if (error) {
    console.error('Supabase Storage Error:', error)
    return { url: null, error: '画像のアップロードに失敗しました。' }
  }

  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(fileName)

  return { url: publicUrl }
}

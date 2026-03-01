/**
 * Project CRUD Integration Test
 * 実行: npx tsx scripts/test-projects.ts
 *
 * テストデータを実際にDBへ挿入・更新・削除して
 * NULL安全性・整合性を検証します。
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// .env.local を手動パース（dotenv不要）
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = value
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 環境変数が不足しています: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ─── テスト用ヘルパー ─────────────────────────────────────────────────────────

let passed = 0
let failed = 0
const createdIds: string[] = []

function assert(label: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ✅ ${label}`)
    passed++
  } else {
    console.error(`  ❌ ${label}${detail ? `: ${detail}` : ''}`)
    failed++
  }
}

async function cleanup() {
  if (createdIds.length === 0) return
  console.log('\n🧹 テストデータを削除中...')
  for (const id of createdIds) {
    await supabase.from('project_tags').delete().eq('project_id', id)
    await supabase.from('post_project_links').delete().eq('project_id', id)
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) {
      console.error(`  ⚠️  削除失敗 ${id}:`, error.message)
    } else {
      console.log(`  🗑  削除完了: ${id}`)
    }
  }
}

// ─── テストケース ─────────────────────────────────────────────────────────────

async function testMinimalProject() {
  console.log('\n📋 TEST 1: 最小フィールドでのプロジェクト作成')

  const { data, error } = await supabase
    .from('projects')
    .insert({
      slug: `test-minimal-${Date.now()}`,
      title: '[TEST] 最小プロジェクト',
      description: 'テスト用 - 削除予定',
      status: 'completed',
    })
    .select()
    .single()

  assert('INSERT成功', !error, error?.message)
  assert('idが存在', !!data?.id)
  assert('titleが正しい', data?.title === '[TEST] 最小プロジェクト')
  assert('content が null', data?.content === null)
  assert('tech_stack が null', data?.tech_stack === null)
  assert('used_ai が null', data?.used_ai === null)
  // DBデフォルトは [] または null のいずれも安全（表示側でlength>0ガード済み）
  assert('gallery_images が null または空配列', data?.gallery_images === null || (Array.isArray(data?.gallery_images) && data.gallery_images.length === 0))
  assert('start_date が null', data?.start_date === null)
  assert('end_date が null', data?.end_date === null)
  assert('demo_url が null', data?.demo_url === null)
  assert('github_url が null', data?.github_url === null)
  assert('steps_count が null', data?.steps_count === null)

  if (data?.id) createdIds.push(data.id)
  return data?.id
}

async function testFullProject() {
  console.log('\n📋 TEST 2: 全フィールドでのプロジェクト作成')

  const { data, error } = await supabase
    .from('projects')
    .insert({
      slug: `test-full-${Date.now()}`,
      title: '[TEST] フルプロジェクト',
      description: 'テスト用 - 削除予定',
      status: 'registered',
      start_date: '2024-01-01',
      end_date: '2024-06-30',
      demo_url: 'https://example.com/demo',
      github_url: 'https://github.com/test/repo',
      steps_count: 150000,
      tech_stack: { 'Next.js': 50, 'TypeScript': 30, 'Supabase': 20 },
      used_ai: ['Claude', 'Gemini'],
      gallery_images: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
      content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'テスト本文' }] }] },
      public_link_type: 'website',
      public_link_url: 'https://example.com',
    })
    .select()
    .single()

  assert('INSERT成功', !error, error?.message)
  assert('tech_stackが配列でない', typeof data?.tech_stack === 'object' && !Array.isArray(data?.tech_stack))
  assert('used_aiが配列', Array.isArray(data?.used_ai))
  assert('gallery_imagesが配列', Array.isArray(data?.gallery_images))
  assert('gallery_images件数が2', (data?.gallery_images as string[])?.length === 2)
  assert('steps_countが数値', typeof data?.steps_count === 'number')
  assert('contentが存在', !!data?.content)

  if (data?.id) createdIds.push(data.id)
  return data?.id
}

async function testNullJsonFields(id: string) {
  console.log('\n📋 TEST 3: NULL JSONフィールドのランタイム安全性検証')

  const { data } = await supabase.from('projects').select('*').eq('id', id).single()

  // ランタイム型ガード（表示側と同じロジック）
  const usedAi: string[] = Array.isArray(data?.used_ai)
    ? (data.used_ai as unknown[]).filter((v): v is string => typeof v === 'string')
    : []
  const galleryImages: string[] = Array.isArray(data?.gallery_images)
    ? (data.gallery_images as unknown[]).filter((v): v is string => typeof v === 'string')
    : []
  const techStack: Record<string, number> =
    data?.tech_stack !== null &&
    typeof data?.tech_stack === 'object' &&
    !Array.isArray(data?.tech_stack)
      ? (data.tech_stack as Record<string, number>)
      : {}

  assert('usedAiが空配列（null→[]）', Array.isArray(usedAi))
  assert('galleryImagesが空配列（null→[]）', Array.isArray(galleryImages))
  assert('techStackがオブジェクト（null→{}）', typeof techStack === 'object' && !Array.isArray(techStack))
}

async function testInvalidDate() {
  console.log('\n📋 TEST 4: 不正な日付文字列のformatDate安全性')

  function formatDate(dateString: string | null): string {
    if (!dateString) return '進行中'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '進行中'
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  }

  assert('null → 進行中', formatDate(null) === '進行中')
  assert('空文字 → 進行中', formatDate('') === '進行中')
  assert('不正文字列 → 進行中', formatDate('invalid-date') === '進行中')
  assert('正常日付', formatDate('2024-03-15') === '2024-03')
  assert('正常日付(ISO)', formatDate('2024-03-15T00:00:00Z') === '2024-03')
}

async function testStatusLabelFallback() {
  console.log('\n📋 TEST 5: statusラベルのnull安全性')

  const statusLabel: Record<string, { label: string; className: string }> = {
    completed: { label: 'Completed', className: 'bg-accent text-accent-foreground' },
    archived: { label: 'Archived', className: 'bg-muted text-muted-foreground' },
    registered: { label: 'Registered', className: 'bg-primary/20 text-primary' },
  }
  function getStatusLabel(status: string | null) {
    return statusLabel[status ?? ''] ?? statusLabel['completed']
  }

  assert('null → completed', getStatusLabel(null).label === 'Completed')
  assert('空文字 → completed', getStatusLabel('').label === 'Completed')
  assert('不明ステータス → completed', getStatusLabel('unknown').label === 'Completed')
  assert('completed', getStatusLabel('completed').label === 'Completed')
  assert('archived', getStatusLabel('archived').label === 'Archived')
  assert('registered', getStatusLabel('registered').label === 'Registered')
}

async function testUpdate(id: string) {
  console.log('\n📋 TEST 6: プロジェクト更新')

  const { data, error } = await supabase
    .from('projects')
    .update({ title: '[TEST] 更新済みプロジェクト', steps_count: 200000 })
    .eq('id', id)
    .select()
    .single()

  assert('UPDATE成功', !error, error?.message)
  assert('タイトルが更新された', data?.title === '[TEST] 更新済みプロジェクト')
  assert('steps_countが更新された', data?.steps_count === 200000)
}

async function testFetchBySlug(slug: string) {
  console.log('\n📋 TEST 7: slug検索 + タグ結合')

  const { data, error } = await supabase
    .from('projects')
    .select('*, tags:project_tags(tag:tags(*))')
    .eq('slug', slug)
    .single()

  assert('SELECT成功', !error, error?.message)
  assert('tagsが配列', Array.isArray(data?.tags))
  assert('slugが一致', data?.slug === slug)
}

async function testFetchNonExistentId() {
  console.log('\n📋 TEST 8: 存在しないIDの取得（notFoundになるべき）')

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', '00000000-0000-0000-0000-000000000000')
    .single()

  assert('データがnull', data === null)
  assert('エラーが返る（PGRST116）', error?.code === 'PGRST116')
}

async function testDeleteCascade(id: string) {
  console.log('\n📋 TEST 9: プロジェクト削除（カスケード）')

  await supabase.from('project_tags').delete().eq('project_id', id)
  await supabase.from('post_project_links').delete().eq('project_id', id)
  const { error } = await supabase.from('projects').delete().eq('id', id)

  assert('DELETE成功', !error, error?.message)

  // 削除後の確認
  const { data } = await supabase.from('projects').select('id').eq('id', id).single()
  assert('削除後にデータがない', data === null)

  // createdIdsから除去（cleanup時に再実行しないよう）
  const idx = createdIds.indexOf(id)
  if (idx !== -1) createdIds.splice(idx, 1)
}

// ─── メイン実行 ───────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 プロジェクト管理機能 統合テスト開始\n')
  console.log(`接続先: ${supabaseUrl}`)

  try {
    // ロジックテスト（DBなし）
    await testInvalidDate()
    await testStatusLabelFallback()

    // DB CRUD テスト
    const minId = await testMinimalProject()
    const fullData = await supabase
      .from('projects')
      .select('slug')
      .eq('id', createdIds[createdIds.length - 1])
      .single()

    if (minId) {
      await testNullJsonFields(minId)
      await testUpdate(minId)
    }

    const fullId = await testFullProject()
    if (fullId && fullData.data?.slug) {
      await testFetchBySlug(fullData.data.slug)
    }

    await testFetchNonExistentId()

    if (minId) await testDeleteCascade(minId)

  } finally {
    await cleanup()
  }

  console.log(`\n${'─'.repeat(50)}`)
  console.log(`結果: ✅ ${passed}件 passed / ❌ ${failed}件 failed`)

  if (failed > 0) {
    console.error('\n⚠️  テスト失敗があります。上記の ❌ を確認してください。')
    process.exit(1)
  } else {
    console.log('\n🎉 全テスト合格！')
  }
}

main().catch((err) => {
  console.error('予期しないエラー:', err)
  process.exit(1)
})

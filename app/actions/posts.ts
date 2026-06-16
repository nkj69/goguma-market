'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createPost(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요.' }

  const title       = formData.get('title') as string
  const description = formData.get('description') as string
  const price       = parseInt(formData.get('price') as string, 10)
  const category    = formData.get('category') as string
  const location    = formData.get('location') as string
  const imageUrlsRaw = formData.get('image_urls') as string
  const image_urls  = imageUrlsRaw ? JSON.parse(imageUrlsRaw) : []

  if (!title || !description || isNaN(price) || !category) {
    return { error: '모든 항목을 입력해 주세요.' }
  }

  const { error } = await supabase.from('posts').insert({
    user_id: user.id, title, description, price, category, location, image_urls,
  })

  if (error) return { error: error.message }

  revalidatePath('/')
  redirect('/')
}

export async function updatePost(postId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요.' }

  const { data: post } = await supabase
    .from('posts').select('user_id, image_urls').eq('id', postId).single()
  if (!post || post.user_id !== user.id) return { error: '수정 권한이 없어요.' }

  const title       = formData.get('title') as string
  const description = formData.get('description') as string
  const price       = parseInt(formData.get('price') as string, 10)
  const category    = formData.get('category') as string
  const location    = formData.get('location') as string
  const status      = (formData.get('status') as string) || 'selling'
  const imageUrlsRaw = formData.get('image_urls') as string
  const image_urls  = imageUrlsRaw ? JSON.parse(imageUrlsRaw) : []
  const deletedPathsRaw = formData.get('deleted_paths') as string
  const deletedPaths = deletedPathsRaw ? JSON.parse(deletedPathsRaw) : []

  if (!title || !description || isNaN(price) || !category) {
    return { error: '모든 항목을 입력해 주세요.' }
  }

  if (deletedPaths.length > 0) {
    await supabase.storage.from('market-images').remove(deletedPaths)
  }

  const { error } = await supabase
    .from('posts')
    .update({ title, description, price, category, location, status, image_urls })
    .eq('id', postId)

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath(`/posts/${postId}`)
  redirect(`/posts/${postId}`)
}

export async function deletePost(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요.' }

  const { data: post } = await supabase
    .from('posts').select('user_id, image_urls').eq('id', postId).single()
  if (!post || post.user_id !== user.id) return { error: '삭제 권한이 없어요.' }

  const urls: string[] = (post.image_urls as string[]) || []
  if (urls.length > 0) {
    const paths = urls
      .map(url => {
        const parts = url.split('/market-images/')
        return parts[1] ? decodeURIComponent(parts[1]) : null
      })
      .filter(Boolean) as string[]
    if (paths.length > 0) {
      await supabase.storage.from('market-images').remove(paths)
    }
  }

  const { error } = await supabase.from('posts').delete().eq('id', postId)
  if (error) return { error: error.message }

  revalidatePath('/')
  redirect('/')
}

export async function buyPost(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요.' }

  const { error } = await supabase
    .from('purchases')
    .insert({ buyer_id: user.id, post_id: postId })

  if (error) {
    if (error.code === '23505') return { error: '이미 구매한 상품이에요.' }
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath(`/posts/${postId}`)
  redirect(`/posts/${postId}`)
}

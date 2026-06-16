'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/* ── 댓글 작성 ── */
export async function addComment(postId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요.' }

  const content = (formData.get('content') as string)?.trim()
  if (!content) return { error: '댓글 내용을 입력해 주세요.' }
  if (content.length > 500) return { error: '댓글은 500자까지 쓸 수 있어요.' }

  const { error } = await supabase
    .from('comments')
    .insert({ post_id: postId, user_id: user.id, content })

  if (error) return { error: error.message }

  revalidatePath(`/posts/${postId}`)
  return { success: true }
}

/* ── 댓글 삭제 (본인만) ── */
export async function deleteComment(commentId: string, postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요.' }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/posts/${postId}`)
  return { success: true }
}

/* ── 좋아요 토글 ── */
export async function toggleLike(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요.' }

  // 이미 눌렀는지 확인
  const { data: existing } = await supabase
    .from('likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase.from('likes').delete().eq('id', existing.id)
    if (error) return { error: error.message }
    revalidatePath(`/posts/${postId}`)
    return { liked: false }
  } else {
    const { error } = await supabase
      .from('likes')
      .insert({ post_id: postId, user_id: user.id })
    if (error) return { error: error.message }
    revalidatePath(`/posts/${postId}`)
    return { liked: true }
  }
}

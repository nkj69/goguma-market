'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요.' }

  const nickname  = (formData.get('nickname') as string)?.trim()
  const bio       = ((formData.get('bio') as string) ?? '').trim()
  const avatarUrl = (formData.get('avatar_url') as string) ?? ''

  if (!nickname)            return { error: '닉네임을 입력해 주세요.' }
  if (nickname.length > 20) return { error: '닉네임은 20자까지 가능해요.' }
  if (bio.length > 300)     return { error: '자기소개는 300자까지 가능해요.' }

  const { error } = await supabase
    .from('profiles')
    .update({ nickname, bio, avatar_url: avatarUrl })
    .eq('id', user.id)

  if (error) return { error: error.message }

  // 헤더 등에서 쓰는 user_metadata 닉네임도 함께 갱신
  await supabase.auth.updateUser({ data: { nickname } })

  revalidatePath('/', 'layout')
  revalidatePath(`/users/${user.id}`)
  redirect(`/users/${user.id}`)
}

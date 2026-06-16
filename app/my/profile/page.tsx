'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { updateProfile } from '@/app/actions/profile'

export default function EditProfilePage() {
  const router = useRouter()
  const [fetching, setFetching] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [nickname, setNickname] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')          // 저장된 아바타 URL
  const [newFile, setNewFile] = useState<File | null>(null) // 새로 고른 파일
  const [preview, setPreview] = useState('')              // 미리보기 URL
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles').select('nickname, bio, avatar_url').eq('id', user.id).single()

      setNickname(profile?.nickname ?? '')
      setBio(profile?.bio ?? '')
      setAvatarUrl(profile?.avatar_url ?? '')
      setFetching(false)
    }
    load()
  }, [router])

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setNewFile(f)
    setPreview(URL.createObjectURL(f))
    e.target.value = ''
  }

  function removeAvatar() {
    setNewFile(null)
    setPreview('')
    setAvatarUrl('')
  }

  async function uploadAvatar(file: File): Promise<string> {
    const supabase = createClient()
    const ext  = file.name.split('.').pop()
    const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const { data, error } = await supabase.storage
      .from('avatars').upload(path, file, { cacheControl: '3600' })
    if (error) throw new Error('사진 업로드 실패: ' + error.message)
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(data.path)
    return publicUrl
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    try {
      let finalUrl = avatarUrl
      if (newFile) finalUrl = await uploadAvatar(newFile)
      formData.set('avatar_url', finalUrl)
      const result = await updateProfile(formData)
      if (result?.error) setError(result.error)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'transparent' }}>
        <div className="text-4xl animate-bounce">🍠</div>
      </div>
    )
  }

  const shownAvatar = preview || avatarUrl

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      <header className="sticky top-0 z-10 shadow-sm" style={{ background: '#E8650A' }}>
        <div className="app-container mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-white text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            ←
          </button>
          <span className="text-white font-bold text-lg flex-1">프로필 수정</span>
          <span className="text-2xl">🍠</span>
        </div>
      </header>

      <main className="app-container mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-3 rounded-xl text-sm font-medium" style={{ background: '#FFE4E4', color: '#C0392B' }}>
            ⚠️ {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-4">
          {/* 프로필 사진 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col items-center gap-3">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickFile} />
            <div
              onClick={() => fileRef.current?.click()}
              className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center cursor-pointer"
              style={{ background: '#FFF3E0', border: '3px solid #F5CBA7' }}
            >
              {shownAvatar
                ? <img src={shownAvatar} alt="프로필" className="w-full h-full object-cover" />
                : <span className="text-4xl">🙂</span>}
            </div>
            <div className="flex gap-2">
              <button
                type="button" onClick={() => fileRef.current?.click()}
                className="text-sm font-bold px-3 py-1.5 rounded-full"
                style={{ background: '#FFF3E0', color: '#E8650A' }}
              >
                📷 사진 변경
              </button>
              {shownAvatar && (
                <button
                  type="button" onClick={removeAvatar}
                  className="text-sm font-bold px-3 py-1.5 rounded-full"
                  style={{ background: '#FFE4E4', color: '#C0392B' }}
                >
                  삭제
                </button>
              )}
            </div>
          </div>

          {/* 닉네임 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-bold mb-2" style={{ color: '#5D3A1A' }}>
              닉네임 <span style={{ color: '#E8650A' }}>*</span>
            </label>
            <input
              name="nickname" type="text" required maxLength={20}
              value={nickname} onChange={e => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요"
              className="w-full px-3 py-2.5 rounded-xl border-2 outline-none text-sm"
              style={{ borderColor: '#F5CBA7', background: '#FFFAF6' }}
              onFocus={e => (e.target.style.borderColor = '#E8650A')}
              onBlur={e => (e.target.style.borderColor = '#F5CBA7')}
            />
          </div>

          {/* 자기소개 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-bold mb-2" style={{ color: '#5D3A1A' }}>
              자기소개
            </label>
            <textarea
              name="bio" rows={4} maxLength={300}
              value={bio} onChange={e => setBio(e.target.value)}
              placeholder="자신을 소개해 주세요. (예: 따뜻한 거래 좋아하는 고구마 유저예요 🍠)"
              className="w-full px-3 py-2.5 rounded-xl border-2 outline-none text-sm resize-none"
              style={{ borderColor: '#F5CBA7', background: '#FFFAF6' }}
              onFocus={e => (e.target.style.borderColor = '#E8650A')}
              onBlur={e => (e.target.style.borderColor = '#F5CBA7')}
            />
            <p className="text-xs text-right mt-1" style={{ color: '#A0522D' }}>{bio.length}/300</p>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-white text-base"
            style={{ background: loading ? '#D4A96A' : '#E8650A' }}
          >
            {loading ? '저장 중...' : '✅ 프로필 저장'}
          </button>
        </form>
      </main>
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { updatePost } from '@/app/actions/posts'

const CATEGORIES = [
  '디지털/가전', '의류/잡화', '도서/음반', '스포츠/레저',
  '가구/인테리어', '생활/주방', '게임/취미', '식물', '기타',
]

export default function EditPostPage() {
  const router  = useRouter()
  const params  = useParams()
  const postId  = params.id as string

  const [loading,  setLoading]  = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error,    setError]    = useState<string | null>(null)
  const [price,    setPrice]    = useState('')
  const [fields,   setFields]   = useState({ title: '', description: '', category: '', location: '', status: 'selling' })

  /* 이미지 상태 */
  const [existingUrls,  setExistingUrls]  = useState<string[]>([])   // DB에 저장된 URL들
  const [deletedIndices, setDeletedIndices] = useState<Set<number>>(new Set()) // 삭제할 기존 이미지 인덱스
  const [newFiles,   setNewFiles]   = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: post } = await supabase.from('posts').select('*').eq('id', postId).single()
      if (!post) { router.push('/'); return }
      if (post.user_id !== user.id) { alert('수정 권한이 없어요.'); router.push(`/posts/${postId}`); return }

      setFields({ title: post.title, description: post.description, category: post.category, location: post.location ?? '', status: post.status ?? 'selling' })
      setPrice(post.price === 0 ? '0' : post.price.toLocaleString())
      setExistingUrls((post.image_urls as string[]) || [])
      setFetching(false)
    }
    load()
  }, [postId, router])

  function formatPrice(value: string) {
    const num = value.replace(/[^0-9]/g, '')
    return num ? Number(num).toLocaleString() : ''
  }

  function toggleDelete(i: number) {
    setDeletedIndices(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  function handleNewFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const kept    = existingUrls.length - deletedIndices.size
    const canAdd  = 5 - kept - newFiles.length
    if (canAdd <= 0) { alert('이미지는 최대 5장까지 등록할 수 있어요.'); return }
    const added   = Array.from(e.target.files || []).slice(0, canAdd)
    const next    = [...newFiles, ...added]
    setNewFiles(next)
    setNewPreviews(next.map(f => URL.createObjectURL(f)))
    e.target.value = ''
  }

  function removeNewFile(i: number) {
    const next = newFiles.filter((_, idx) => idx !== i)
    setNewFiles(next)
    setNewPreviews(next.map(f => URL.createObjectURL(f)))
  }

  async function uploadNewFiles(list: File[]): Promise<string[]> {
    const supabase = createClient()
    const urls: string[] = []
    for (const file of list) {
      const ext  = file.name.split('.').pop()
      const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const { data, error } = await supabase.storage.from('market-images').upload(path, file, { cacheControl: '3600' })
      if (error) throw new Error('이미지 업로드 실패: ' + error.message)
      const { data: { publicUrl } } = supabase.storage.from('market-images').getPublicUrl(data.path)
      urls.push(publicUrl)
    }
    return urls
  }

  async function handleSubmit(formData: FormData) {
    const rawPrice = price.replace(/[^0-9]/g, '')
    formData.set('price', rawPrice)
    formData.set('status', fields.status)
    setLoading(true)
    setError(null)
    try {
      /* 삭제할 스토리지 경로 */
      const deletedPaths = [...deletedIndices]
        .map(i => {
          const url   = existingUrls[i]
          const parts = url?.split('/market-images/')
          return parts?.[1] ? decodeURIComponent(parts[1]) : null
        })
        .filter(Boolean) as string[]

      /* 유지할 기존 URL + 새로 업로드한 URL */
      const keptUrls = existingUrls.filter((_, i) => !deletedIndices.has(i))
      const newUrls  = newFiles.length > 0 ? await uploadNewFiles(newFiles) : []
      const image_urls = [...keptUrls, ...newUrls]

      formData.set('image_urls',   JSON.stringify(image_urls))
      formData.set('deleted_paths', JSON.stringify(deletedPaths))

      const result = await updatePost(postId, formData)
      if (result?.error) setError(result.error)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFF8F0' }}>
        <div className="text-4xl animate-bounce">🍠</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#FFF8F0' }}>
      <header className="sticky top-0 z-10 shadow-sm" style={{ background: '#E8650A' }}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-white text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            ←
          </button>
          <span className="text-white font-bold text-lg flex-1">판매글 수정</span>
          <span className="text-2xl">🍠</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-3 rounded-xl text-sm font-medium" style={{ background: '#FFE4E4', color: '#C0392B' }}>
            ⚠️ {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-4">
          {/* 이미지 관리 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-bold mb-3" style={{ color: '#5D3A1A' }}>
              사진 관리 <span className="font-normal text-xs" style={{ color: '#A0522D' }}>최대 5장 · X 누르면 삭제 표시</span>
            </label>

            {/* 기존 이미지 */}
            {existingUrls.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium mb-2" style={{ color: '#A0522D' }}>등록된 사진</p>
                <div className="flex gap-2 flex-wrap">
                  {existingUrls.map((url, i) => (
                    <div key={i} className="relative w-20 h-20 flex-shrink-0">
                      <img
                        src={url} alt=""
                        className="w-20 h-20 object-cover rounded-xl border-2 transition-opacity"
                        style={{ borderColor: deletedIndices.has(i) ? '#E74C3C' : '#F5CBA7', opacity: deletedIndices.has(i) ? 0.3 : 1 }}
                      />
                      <button
                        type="button" onClick={() => toggleDelete(i)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white font-bold shadow"
                        style={{ background: deletedIndices.has(i) ? '#6B7280' : '#E74C3C', border: '2px solid white', fontSize: '10px' }}
                      >
                        {deletedIndices.has(i) ? '↩' : '✕'}
                      </button>
                      {i === 0 && !deletedIndices.has(0) && (
                        <span className="absolute bottom-1 left-1 text-white font-bold rounded px-1" style={{ fontSize: '9px', background: 'rgba(0,0,0,0.5)' }}>
                          대표
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 새 이미지 추가 */}
            <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleNewFiles} />
            <div className="flex gap-2 flex-wrap">
              {newPreviews.map((src, i) => (
                <div key={i} className="relative w-20 h-20 flex-shrink-0">
                  <img src={src} alt="" className="w-20 h-20 object-cover rounded-xl border-2 border-dashed" style={{ borderColor: '#E8650A' }} />
                  <button
                    type="button" onClick={() => removeNewFile(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white font-bold shadow"
                    style={{ background: '#E74C3C', border: '2px solid white', fontSize: '10px' }}
                  >
                    ✕
                  </button>
                  <span className="absolute bottom-1 left-1 text-white font-bold rounded px-1" style={{ fontSize: '9px', background: 'rgba(232,101,10,0.8)' }}>
                    NEW
                  </span>
                </div>
              ))}
              {(existingUrls.length - deletedIndices.size + newFiles.length) < 5 && (
                <button
                  type="button" onClick={() => fileRef.current?.click()}
                  className="w-20 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 flex-shrink-0"
                  style={{ borderColor: '#F5CBA7', background: '#FFFAF6' }}
                >
                  <span className="text-2xl">📷</span>
                  <span className="text-xs font-bold" style={{ color: '#A0522D' }}>
                    {existingUrls.length - deletedIndices.size + newFiles.length}/5
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* 제목 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-bold mb-2" style={{ color: '#5D3A1A' }}>제목 <span style={{ color: '#E8650A' }}>*</span></label>
            <input
              name="title" type="text" required maxLength={50}
              value={fields.title} onChange={e => setFields(f => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border-2 outline-none text-sm"
              style={{ borderColor: '#F5CBA7', background: '#FFFAF6' }}
              onFocus={e => (e.target.style.borderColor = '#E8650A')}
              onBlur={e => (e.target.style.borderColor = '#F5CBA7')}
            />
          </div>

          {/* 카테고리 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-bold mb-2" style={{ color: '#5D3A1A' }}>카테고리 <span style={{ color: '#E8650A' }}>*</span></label>
            <select
              name="category" required
              value={fields.category} onChange={e => setFields(f => ({ ...f, category: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border-2 outline-none text-sm appearance-none"
              style={{ borderColor: '#F5CBA7', background: '#FFFAF6', color: '#3D2B1F' }}
              onFocus={e => (e.target.style.borderColor = '#E8650A')}
              onBlur={e => (e.target.style.borderColor = '#F5CBA7')}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* 가격 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-bold mb-2" style={{ color: '#5D3A1A' }}>가격 <span style={{ color: '#E8650A' }}>*</span></label>
            <div className="relative">
              <input
                name="price_display" type="text" inputMode="numeric" required
                value={price} onChange={e => setPrice(formatPrice(e.target.value))}
                className="w-full pl-3 pr-10 py-2.5 rounded-xl border-2 outline-none text-sm"
                style={{ borderColor: '#F5CBA7', background: '#FFFAF6' }}
                onFocus={e => (e.target.style.borderColor = '#E8650A')}
                onBlur={e => (e.target.style.borderColor = '#F5CBA7')}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: '#A0522D' }}>원</span>
            </div>
          </div>

          {/* 판매 상태 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-bold mb-3" style={{ color: '#5D3A1A' }}>판매 상태</label>
            <div className="flex gap-2">
              {[['selling','판매중'], ['reserved','예약중'], ['sold','판매완료']].map(([val, label]) => (
                <button
                  key={val} type="button"
                  onClick={() => setFields(f => ({ ...f, status: val }))}
                  className="flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all"
                  style={{
                    borderColor: fields.status === val ? '#E8650A' : '#F5CBA7',
                    background:  fields.status === val ? '#FFF3E0' : 'white',
                    color:       fields.status === val ? '#E8650A' : '#A0522D',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 설명 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-bold mb-2" style={{ color: '#5D3A1A' }}>설명 <span style={{ color: '#E8650A' }}>*</span></label>
            <textarea
              name="description" required rows={6}
              value={fields.description} onChange={e => setFields(f => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border-2 outline-none text-sm resize-none"
              style={{ borderColor: '#F5CBA7', background: '#FFFAF6' }}
              onFocus={e => (e.target.style.borderColor = '#E8650A')}
              onBlur={e => (e.target.style.borderColor = '#F5CBA7')}
            />
          </div>

          {/* 거래 장소 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-bold mb-2" style={{ color: '#5D3A1A' }}>거래 희망 장소</label>
            <input
              name="location" type="text" placeholder="예: 강남역 2번 출구 근처 (선택사항)"
              value={fields.location} onChange={e => setFields(f => ({ ...f, location: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border-2 outline-none text-sm"
              style={{ borderColor: '#F5CBA7', background: '#FFFAF6' }}
              onFocus={e => (e.target.style.borderColor = '#E8650A')}
              onBlur={e => (e.target.style.borderColor = '#F5CBA7')}
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-white text-base"
            style={{ background: loading ? '#D4A96A' : '#E8650A' }}
          >
            {loading ? '저장 중...' : '✅ 수정 완료'}
          </button>
        </form>
      </main>
    </div>
  )
}

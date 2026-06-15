'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { updatePost } from '@/app/actions/posts'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = [
  '디지털/가전', '의류/잡화', '도서/음반', '스포츠/레저',
  '가구/인테리어', '생활/주방', '게임/취미', '식물', '기타',
]

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [price, setPrice] = useState('')
  const [fields, setFields] = useState({
    title: '', description: '', category: '', location: '',
  })

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: post } = await supabase
        .from('posts').select('*').eq('id', postId).single()

      if (!post) { router.push('/'); return }

      // 본인 글이 아니면 접근 차단
      if (post.user_id !== user.id) {
        alert('수정 권한이 없어요.')
        router.push(`/posts/${postId}`)
        return
      }

      setFields({
        title: post.title,
        description: post.description,
        category: post.category,
        location: post.location ?? '',
      })
      setPrice(post.price === 0 ? '0' : post.price.toLocaleString())
      setFetching(false)
    }
    load()
  }, [postId, router])

  function formatPrice(value: string) {
    const num = value.replace(/[^0-9]/g, '')
    return num ? Number(num).toLocaleString() : ''
  }

  async function handleSubmit(formData: FormData) {
    const rawPrice = price.replace(/[^0-9]/g, '')
    formData.set('price', rawPrice)
    setLoading(true)
    setError(null)
    const result = await updatePost(postId, formData)
    if (result?.error) {
      setError(result.error)
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
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-bold mb-2" style={{ color: '#5D3A1A' }}>
              제목 <span style={{ color: '#E8650A' }}>*</span>
            </label>
            <input
              name="title"
              type="text"
              required
              maxLength={50}
              value={fields.title}
              onChange={e => setFields(f => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border-2 outline-none text-sm transition-all"
              style={{ borderColor: '#F5CBA7', background: '#FFFAF6' }}
              onFocus={e => (e.target.style.borderColor = '#E8650A')}
              onBlur={e => (e.target.style.borderColor = '#F5CBA7')}
            />
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-bold mb-2" style={{ color: '#5D3A1A' }}>
              카테고리 <span style={{ color: '#E8650A' }}>*</span>
            </label>
            <select
              name="category"
              required
              value={fields.category}
              onChange={e => setFields(f => ({ ...f, category: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border-2 outline-none text-sm appearance-none"
              style={{ borderColor: '#F5CBA7', background: '#FFFAF6', color: '#3D2B1F' }}
              onFocus={e => (e.target.style.borderColor = '#E8650A')}
              onBlur={e => (e.target.style.borderColor = '#F5CBA7')}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-bold mb-2" style={{ color: '#5D3A1A' }}>
              가격 <span style={{ color: '#E8650A' }}>*</span>
            </label>
            <div className="relative">
              <input
                name="price_display"
                type="text"
                inputMode="numeric"
                required
                value={price}
                onChange={e => setPrice(formatPrice(e.target.value))}
                className="w-full pl-3 pr-10 py-2.5 rounded-xl border-2 outline-none text-sm transition-all"
                style={{ borderColor: '#F5CBA7', background: '#FFFAF6' }}
                onFocus={e => (e.target.style.borderColor = '#E8650A')}
                onBlur={e => (e.target.style.borderColor = '#F5CBA7')}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: '#A0522D' }}>원</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-bold mb-2" style={{ color: '#5D3A1A' }}>
              설명 <span style={{ color: '#E8650A' }}>*</span>
            </label>
            <textarea
              name="description"
              required
              rows={6}
              value={fields.description}
              onChange={e => setFields(f => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border-2 outline-none text-sm resize-none transition-all"
              style={{ borderColor: '#F5CBA7', background: '#FFFAF6' }}
              onFocus={e => (e.target.style.borderColor = '#E8650A')}
              onBlur={e => (e.target.style.borderColor = '#F5CBA7')}
            />
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-bold mb-2" style={{ color: '#5D3A1A' }}>
              거래 희망 장소
            </label>
            <input
              name="location"
              type="text"
              value={fields.location}
              onChange={e => setFields(f => ({ ...f, location: e.target.value }))}
              placeholder="예: 강남역 2번 출구 근처 (선택사항)"
              className="w-full px-3 py-2.5 rounded-xl border-2 outline-none text-sm transition-all"
              style={{ borderColor: '#F5CBA7', background: '#FFFAF6' }}
              onFocus={e => (e.target.style.borderColor = '#E8650A')}
              onBlur={e => (e.target.style.borderColor = '#F5CBA7')}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
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

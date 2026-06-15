'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPost } from '@/app/actions/posts'

const CATEGORIES = [
  '디지털/가전', '의류/잡화', '도서/음반', '스포츠/레저',
  '가구/인테리어', '생활/주방', '게임/취미', '식물', '기타',
]

export default function NewPostPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [price, setPrice] = useState('')

  function formatPrice(value: string) {
    const num = value.replace(/[^0-9]/g, '')
    return num ? Number(num).toLocaleString() : ''
  }

  async function handleSubmit(formData: FormData) {
    // price는 숫자만 추출해서 교체
    const rawPrice = price.replace(/[^0-9]/g, '')
    formData.set('price', rawPrice)

    setLoading(true)
    setError(null)
    const result = await createPost(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#FFF8F0' }}>
      {/* 헤더 */}
      <header className="sticky top-0 z-10 shadow-sm" style={{ background: '#E8650A' }}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-white text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            ←
          </button>
          <span className="text-white font-bold text-lg flex-1">판매글 작성</span>
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
          {/* 제목 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-bold mb-2" style={{ color: '#5D3A1A' }}>
              제목 <span style={{ color: '#E8650A' }}>*</span>
            </label>
            <input
              name="title"
              type="text"
              required
              placeholder="판매할 물건의 제목을 입력하세요"
              maxLength={50}
              className="w-full px-3 py-2.5 rounded-xl border-2 outline-none text-sm transition-all"
              style={{ borderColor: '#F5CBA7', background: '#FFFAF6' }}
              onFocus={e => (e.target.style.borderColor = '#E8650A')}
              onBlur={e => (e.target.style.borderColor = '#F5CBA7')}
            />
          </div>

          {/* 카테고리 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-bold mb-2" style={{ color: '#5D3A1A' }}>
              카테고리 <span style={{ color: '#E8650A' }}>*</span>
            </label>
            <select
              name="category"
              required
              className="w-full px-3 py-2.5 rounded-xl border-2 outline-none text-sm transition-all appearance-none"
              style={{ borderColor: '#F5CBA7', background: '#FFFAF6', color: '#3D2B1F' }}
              onFocus={e => (e.target.style.borderColor = '#E8650A')}
              onBlur={e => (e.target.style.borderColor = '#F5CBA7')}
            >
              <option value="">카테고리 선택</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* 가격 */}
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
                placeholder="0"
                value={price}
                onChange={e => setPrice(formatPrice(e.target.value))}
                className="w-full pl-3 pr-10 py-2.5 rounded-xl border-2 outline-none text-sm transition-all"
                style={{ borderColor: '#F5CBA7', background: '#FFFAF6' }}
                onFocus={e => (e.target.style.borderColor = '#E8650A')}
                onBlur={e => (e.target.style.borderColor = '#F5CBA7')}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: '#A0522D' }}>원</span>
            </div>
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded"
                onChange={e => setPrice(e.target.checked ? '0' : '')}
              />
              <span className="text-xs" style={{ color: '#A0522D' }}>가격 협의 (0원으로 설정)</span>
            </label>
          </div>

          {/* 설명 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-bold mb-2" style={{ color: '#5D3A1A' }}>
              설명 <span style={{ color: '#E8650A' }}>*</span>
            </label>
            <textarea
              name="description"
              required
              rows={6}
              placeholder="물건의 상태, 구매 시기, 가격 제안 여부 등 자세히 적어주세요"
              className="w-full px-3 py-2.5 rounded-xl border-2 outline-none text-sm transition-all resize-none"
              style={{ borderColor: '#F5CBA7', background: '#FFFAF6' }}
              onFocus={e => (e.target.style.borderColor = '#E8650A')}
              onBlur={e => (e.target.style.borderColor = '#F5CBA7')}
            />
          </div>

          {/* 거래 희망 장소 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-bold mb-2" style={{ color: '#5D3A1A' }}>
              거래 희망 장소
            </label>
            <input
              name="location"
              type="text"
              placeholder="예: 강남역 2번 출구 근처 (선택사항)"
              className="w-full px-3 py-2.5 rounded-xl border-2 outline-none text-sm transition-all"
              style={{ borderColor: '#F5CBA7', background: '#FFFAF6' }}
              onFocus={e => (e.target.style.borderColor = '#E8650A')}
              onBlur={e => (e.target.style.borderColor = '#F5CBA7')}
            />
          </div>

          {/* 등록 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all"
            style={{ background: loading ? '#D4A96A' : '#E8650A' }}
          >
            {loading ? '등록 중...' : '🍠 판매글 등록하기'}
          </button>
        </form>
      </main>
    </div>
  )
}

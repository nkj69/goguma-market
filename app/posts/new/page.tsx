'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  function formatPrice(value: string) {
    const num = value.replace(/[^0-9]/g, '')
    return num ? Number(num).toLocaleString() : ''
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const added = Array.from(e.target.files || []).slice(0, 5 - files.length)
    const next = [...files, ...added]
    setFiles(next)
    setPreviews(next.map(f => URL.createObjectURL(f)))
    e.target.value = ''
  }

  function removeFile(i: number) {
    const next = files.filter((_, idx) => idx !== i)
    setFiles(next)
    setPreviews(next.map(f => URL.createObjectURL(f)))
  }

  async function uploadFiles(list: File[]): Promise<string[]> {
    const supabase = createClient()
    const urls: string[] = []
    for (const file of list) {
      const ext  = file.name.split('.').pop()
      const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const { data, error } = await supabase.storage
        .from('market-images')
        .upload(path, file, { cacheControl: '3600' })
      if (error) throw new Error('이미지 업로드 실패: ' + error.message)
      const { data: { publicUrl } } = supabase.storage.from('market-images').getPublicUrl(data.path)
      urls.push(publicUrl)
    }
    return urls
  }

  async function handleSubmit(formData: FormData) {
    const rawPrice = price.replace(/[^0-9]/g, '')
    formData.set('price', rawPrice)
    setLoading(true)
    setError(null)
    try {
      const imageUrls = files.length > 0 ? await uploadFiles(files) : []
      formData.set('image_urls', JSON.stringify(imageUrls))
      const result = await createPost(formData)
      if (result?.error) setError(result.error)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#FFF8F0' }}>
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
          {/* 사진 업로드 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-bold mb-3" style={{ color: '#5D3A1A' }}>
              사진 <span className="font-normal text-xs" style={{ color: '#A0522D' }}>최대 5장</span>
            </label>
            <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
            <div className="flex gap-2 flex-wrap">
              {previews.map((src, i) => (
                <div key={i} className="relative w-20 h-20 flex-shrink-0">
                  <img src={src} alt="" className="w-20 h-20 object-cover rounded-xl border-2" style={{ borderColor: '#F5CBA7' }} />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white font-bold shadow"
                    style={{ background: '#E74C3C', border: '2px solid white', fontSize: '10px' }}
                  >
                    ✕
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 text-white font-bold rounded px-1" style={{ fontSize: '9px', background: 'rgba(0,0,0,0.5)' }}>
                      대표
                    </span>
                  )}
                </div>
              ))}
              {files.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-20 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 flex-shrink-0 transition-colors"
                  style={{ borderColor: '#F5CBA7', background: '#FFFAF6' }}
                >
                  <span className="text-2xl">📷</span>
                  <span className="text-xs font-bold" style={{ color: '#A0522D' }}>{files.length}/5</span>
                </button>
              )}
            </div>
          </div>

          {/* 제목 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-bold mb-2" style={{ color: '#5D3A1A' }}>
              제목 <span style={{ color: '#E8650A' }}>*</span>
            </label>
            <input
              name="title" type="text" required placeholder="판매할 물건의 제목을 입력하세요" maxLength={50}
              className="w-full px-3 py-2.5 rounded-xl border-2 outline-none text-sm"
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
              name="category" required
              className="w-full px-3 py-2.5 rounded-xl border-2 outline-none text-sm appearance-none"
              style={{ borderColor: '#F5CBA7', background: '#FFFAF6', color: '#3D2B1F' }}
              onFocus={e => (e.target.style.borderColor = '#E8650A')}
              onBlur={e => (e.target.style.borderColor = '#F5CBA7')}
            >
              <option value="">카테고리 선택</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* 가격 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-bold mb-2" style={{ color: '#5D3A1A' }}>
              가격 <span style={{ color: '#E8650A' }}>*</span>
            </label>
            <div className="relative">
              <input
                name="price_display" type="text" inputMode="numeric" required placeholder="0"
                value={price} onChange={e => setPrice(formatPrice(e.target.value))}
                className="w-full pl-3 pr-10 py-2.5 rounded-xl border-2 outline-none text-sm"
                style={{ borderColor: '#F5CBA7', background: '#FFFAF6' }}
                onFocus={e => (e.target.style.borderColor = '#E8650A')}
                onBlur={e => (e.target.style.borderColor = '#F5CBA7')}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: '#A0522D' }}>원</span>
            </div>
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input type="checkbox" onChange={e => setPrice(e.target.checked ? '0' : '')} />
              <span className="text-xs" style={{ color: '#A0522D' }}>가격 협의 (0원으로 설정)</span>
            </label>
          </div>

          {/* 설명 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-bold mb-2" style={{ color: '#5D3A1A' }}>
              설명 <span style={{ color: '#E8650A' }}>*</span>
            </label>
            <textarea
              name="description" required rows={6}
              placeholder="물건의 상태, 구매 시기, 가격 제안 여부 등 자세히 적어주세요"
              className="w-full px-3 py-2.5 rounded-xl border-2 outline-none text-sm resize-none"
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
              name="location" type="text" placeholder="예: 강남역 2번 출구 근처 (선택사항)"
              className="w-full px-3 py-2.5 rounded-xl border-2 outline-none text-sm"
              style={{ borderColor: '#F5CBA7', background: '#FFFAF6' }}
              onFocus={e => (e.target.style.borderColor = '#E8650A')}
              onBlur={e => (e.target.style.borderColor = '#F5CBA7')}
            />
          </div>

          <button
            type="submit" disabled={loading}
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

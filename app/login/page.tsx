'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { login } from '@/app/actions/auth'
import { Suspense } from 'react'

function LoginForm() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await login(formData)
    if (result?.error) {
      setError('이메일 또는 비밀번호가 올바르지 않아요.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)' }}>
      <div className="w-full max-w-md">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🍠</div>
          <h1 className="text-3xl font-bold" style={{ color: '#8B4513' }}>고구마마켓</h1>
          <p className="text-sm mt-1" style={{ color: '#A0522D' }}>우리 동네 따뜻한 중고거래</p>
        </div>

        {/* 카드 */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h2 className="text-xl font-bold mb-6" style={{ color: '#5D3A1A' }}>로그인</h2>

          {message && (
            <div className="mb-4 p-3 rounded-xl text-sm font-medium" style={{ background: '#FFF3CD', color: '#856404' }}>
              ✉️ {message}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm font-medium" style={{ background: '#FFE4E4', color: '#C0392B' }}>
              ⚠️ {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#5D3A1A' }}>
                이메일
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="example@email.com"
                className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all text-sm"
                style={{ borderColor: '#F5CBA7', background: '#FFFAF6' }}
                onFocus={e => e.target.style.borderColor = '#E8650A'}
                onBlur={e => e.target.style.borderColor = '#F5CBA7'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#5D3A1A' }}>
                비밀번호
              </label>
              <input
                name="password"
                type="password"
                required
                placeholder="비밀번호를 입력하세요"
                className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all text-sm"
                style={{ borderColor: '#F5CBA7', background: '#FFFAF6' }}
                onFocus={e => e.target.style.borderColor = '#E8650A'}
                onBlur={e => e.target.style.borderColor = '#F5CBA7'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white transition-all mt-2"
              style={{ background: loading ? '#D4A96A' : '#E8650A' }}
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm" style={{ color: '#A0522D' }}>
            아직 계정이 없으신가요?{' '}
            <Link href="/signup" className="font-bold" style={{ color: '#E8650A' }}>
              회원가입
            </Link>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#C4956A' }}>
          © 2026 고구마마켓 · 따뜻하게 거래해요 🍠
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

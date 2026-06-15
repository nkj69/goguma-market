'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signup } from '@/app/actions/auth'

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  async function handleSubmit(formData: FormData) {
    if (password !== confirm) {
      setError('비밀번호가 일치하지 않아요.')
      return
    }
    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 해요.')
      return
    }
    setLoading(true)
    setError(null)
    const result = await signup(formData)
    if (result?.error) {
      const msg = result.error.includes('already registered')
        ? '이미 사용 중인 이메일이에요.'
        : result.error
      setError(msg)
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
          <h2 className="text-xl font-bold mb-6" style={{ color: '#5D3A1A' }}>회원가입</h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm font-medium" style={{ background: '#FFE4E4', color: '#C0392B' }}>
              ⚠️ {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#5D3A1A' }}>
                닉네임
              </label>
              <input
                name="nickname"
                type="text"
                required
                placeholder="동네 친구들에게 보여질 이름"
                className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all text-sm"
                style={{ borderColor: '#F5CBA7', background: '#FFFAF6' }}
                onFocus={e => e.target.style.borderColor = '#E8650A'}
                onBlur={e => e.target.style.borderColor = '#F5CBA7'}
              />
            </div>

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
                placeholder="6자 이상 입력하세요"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all text-sm"
                style={{ borderColor: '#F5CBA7', background: '#FFFAF6' }}
                onFocus={e => e.target.style.borderColor = '#E8650A'}
                onBlur={e => e.target.style.borderColor = '#F5CBA7'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#5D3A1A' }}>
                비밀번호 확인
              </label>
              <input
                type="password"
                required
                placeholder="비밀번호를 다시 입력하세요"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all text-sm"
                style={{
                  borderColor: confirm && confirm !== password ? '#E74C3C' : '#F5CBA7',
                  background: '#FFFAF6'
                }}
                onFocus={e => e.target.style.borderColor = '#E8650A'}
                onBlur={e => e.target.style.borderColor = confirm !== password ? '#E74C3C' : '#F5CBA7'}
              />
              {confirm && confirm !== password && (
                <p className="text-xs mt-1" style={{ color: '#E74C3C' }}>비밀번호가 일치하지 않아요</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white transition-all mt-2"
              style={{ background: loading ? '#D4A96A' : '#E8650A' }}
            >
              {loading ? '가입 중...' : '가입하기'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm" style={{ color: '#A0522D' }}>
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="font-bold" style={{ color: '#E8650A' }}>
              로그인
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

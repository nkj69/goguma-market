'use client'

import { useEffect, useState } from 'react'

const WIDTHS = {
  mobile: '26rem',  // 스마트폰 최적화 (기본)
  wide:   '48rem',  // 넓게 보기
}

export default function ViewToggle() {
  const [mode, setMode] = useState<'mobile' | 'wide'>('mobile')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = (localStorage.getItem('goguma-view') as 'mobile' | 'wide') || 'mobile'
    setMode(saved)
    document.documentElement.style.setProperty('--app-w', WIDTHS[saved])
    setMounted(true)
  }, [])

  function toggle() {
    const next = mode === 'mobile' ? 'wide' : 'mobile'
    setMode(next)
    localStorage.setItem('goguma-view', next)
    document.documentElement.style.setProperty('--app-w', WIDTHS[next])
  }

  if (!mounted) return null

  return (
    <button
      onClick={toggle}
      aria-label="화면 폭 전환"
      className="fixed bottom-6 left-4 z-50 flex items-center gap-1.5 px-3.5 py-2.5 rounded-full shadow-lg font-bold text-sm float-btn"
      style={{ background: 'white', color: '#E8650A', border: '2px solid #FFD9B3' }}
    >
      <span className="text-base">{mode === 'mobile' ? '📱' : '🖥️'}</span>
      <span>{mode === 'mobile' ? '모바일' : '와이드'}</span>
    </button>
  )
}

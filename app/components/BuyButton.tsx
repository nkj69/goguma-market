'use client'

import { useState } from 'react'
import { buyPost } from '@/app/actions/posts'

export default function BuyButton({ postId }: { postId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleBuy() {
    if (!confirm('정말 구매하시겠어요?')) return
    setLoading(true)
    const result = await buyPost(postId)
    if (result?.error) {
      alert(result.error)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className="px-6 py-3 rounded-xl font-bold text-white text-sm"
      style={{ background: loading ? '#D4A96A' : '#E8650A' }}
    >
      {loading ? '처리 중...' : '🛒 구매하기'}
    </button>
  )
}

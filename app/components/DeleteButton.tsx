'use client'

import { useState } from 'react'
import { deletePost } from '@/app/actions/posts'

export default function DeleteButton({ postId }: { postId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('정말 삭제하시겠어요? 되돌릴 수 없어요.')) return
    setLoading(true)
    const result = await deletePost(postId)
    if (result?.error) {
      alert(result.error)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex-1 py-3 rounded-xl font-bold text-sm transition-colors"
      style={{ background: '#FFE4E4', color: loading ? '#aaa' : '#C0392B' }}
    >
      {loading ? '삭제 중...' : '🗑️ 삭제'}
    </button>
  )
}

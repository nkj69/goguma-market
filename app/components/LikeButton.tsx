'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleLike } from '@/app/actions/social'

interface Props {
  postId: string
  initialLiked: boolean
  initialCount: number
  loggedIn: boolean
}

export default function LikeButton({ postId, initialLiked, initialCount, loggedIn }: Props) {
  const router = useRouter()
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [popping, setPopping] = useState(false)
  const [, startTransition] = useTransition()

  async function handleClick() {
    if (!loggedIn) {
      if (confirm('좋아요는 로그인 후 가능해요. 로그인하러 갈까요?')) router.push('/login')
      return
    }

    // 낙관적 업데이트 (먼저 화면 반영)
    const nextLiked = !liked
    setLiked(nextLiked)
    setCount(c => c + (nextLiked ? 1 : -1))
    if (nextLiked) {
      setPopping(true)
      setTimeout(() => setPopping(false), 450)
    }

    startTransition(async () => {
      const result = await toggleLike(postId)
      if (result?.error) {
        // 실패 시 원복
        setLiked(liked)
        setCount(initialCount)
        alert(result.error)
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1.5 px-4 py-3 rounded-xl font-bold text-sm transition-all active:scale-90"
      style={{
        background: liked ? '#FFE9EC' : '#FFF3E0',
        color: liked ? '#E74C3C' : '#A0522D',
      }}
    >
      <span className={popping ? 'heart-pop' : ''} style={{ fontSize: '18px', display: 'inline-block' }}>{liked ? '❤️' : '🤍'}</span>
      <span>{count}</span>
    </button>
  )
}

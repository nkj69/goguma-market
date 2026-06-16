'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addComment, deleteComment } from '@/app/actions/social'

export interface CommentItem {
  id: string
  content: string
  created_at: string
  user_id: string
  nickname: string
}

interface Props {
  postId: string
  comments: CommentItem[]
  currentUserId: string | null
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}

export default function CommentSection({ postId, comments, currentUserId }: Props) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(formData: FormData) {
    if (!currentUserId) {
      if (confirm('댓글은 로그인 후 작성할 수 있어요. 로그인하러 갈까요?')) router.push('/login')
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await addComment(postId, formData)
      if (result?.error) setError(result.error)
      else formRef.current?.reset()
    })
  }

  function handleDelete(commentId: string) {
    if (!confirm('댓글을 삭제할까요?')) return
    startTransition(async () => {
      const result = await deleteComment(commentId, postId)
      if (result?.error) alert(result.error)
    })
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <h2 className="font-bold text-sm mb-4" style={{ color: '#3D2B1F' }}>
        💬 댓글 <span style={{ color: '#E8650A' }}>{comments.length}</span>
      </h2>

      {/* 댓글 목록 */}
      {comments.length > 0 ? (
        <div className="space-y-4 mb-5">
          {comments.map(c => (
            <div key={c.id} className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs flex-shrink-0" style={{ background: '#E8650A' }}>
                {(c.nickname ?? '?')[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs" style={{ color: '#3D2B1F' }}>{c.nickname || '알 수 없음'}</span>
                  <span className="text-xs" style={{ color: '#B89878' }}>{timeAgo(c.created_at)}</span>
                  {c.user_id === currentUserId && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={pending}
                      className="text-xs ml-auto"
                      style={{ color: '#C0392B' }}
                    >
                      삭제
                    </button>
                  )}
                </div>
                <p className="text-sm mt-0.5 whitespace-pre-wrap break-words" style={{ color: '#5D3A1A' }}>{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-center py-6 mb-2" style={{ color: '#B89878' }}>
          아직 댓글이 없어요. 첫 댓글을 남겨보세요!
        </p>
      )}

      {/* 댓글 작성 */}
      {error && (
        <p className="text-xs mb-2" style={{ color: '#C0392B' }}>⚠️ {error}</p>
      )}
      <form ref={formRef} action={handleSubmit} className="flex items-end gap-2">
        <textarea
          name="content"
          rows={1}
          maxLength={500}
          placeholder={currentUserId ? '댓글을 입력하세요' : '로그인 후 댓글을 쓸 수 있어요'}
          className="flex-1 px-3 py-2.5 rounded-xl border-2 outline-none text-sm resize-none"
          style={{ borderColor: '#F5CBA7', background: '#FFFAF6' }}
          onFocus={e => (e.target.style.borderColor = '#E8650A')}
          onBlur={e => (e.target.style.borderColor = '#F5CBA7')}
        />
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2.5 rounded-xl font-bold text-white text-sm flex-shrink-0"
          style={{ background: pending ? '#D4A96A' : '#E8650A' }}
        >
          {pending ? '...' : '등록'}
        </button>
      </form>
    </div>
  )
}

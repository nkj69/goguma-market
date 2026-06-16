import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'
import BuyButton from '@/app/components/BuyButton'
import DeleteButton from '@/app/components/DeleteButton'
import ImageCarousel from '@/app/components/ImageCarousel'
import LikeButton from '@/app/components/LikeButton'
import CommentSection, { type CommentItem } from '@/app/components/CommentSection'

// 항상 DB에서 최신 댓글·좋아요를 새로 불러오도록 캐시 비활성화
export const dynamic = 'force-dynamic'

const CATEGORY_EMOJI: Record<string, string> = {
  '디지털/가전': '📱', '의류/잡화': '👗', '도서/음반': '📚',
  '스포츠/레저': '⚽', '가구/인테리어': '🛋️', '생활/주방': '🍳',
  '게임/취미': '🎮', '식물': '🌿', '기타': '📦',
}

const STATUS_LABEL: Record<string, { label: string; bg: string; color: string }> = {
  selling:  { label: '판매중',   bg: '#E8F5E9', color: '#2E7D32' },
  reserved: { label: '예약중',   bg: '#FFF3CD', color: '#856404' },
  sold:     { label: '판매완료', bg: '#F0F0F0', color: '#888' },
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: post } = await supabase
    .from('posts')
    .select('*, profiles(nickname)')
    .eq('id', id)
    .single()

  if (!post) notFound()

  const seller   = post.profiles as { nickname: string } | null
  const isMyPost = user?.id === post.user_id
  const isSelling = post.status === 'selling'
  const status   = STATUS_LABEL[post.status] ?? STATUS_LABEL.selling
  const imageUrls = (post.image_urls as string[]) || []

  // 좋아요 정보
  const { count: likeCount } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', id)

  let likedByMe = false
  if (user) {
    const { data: myLike } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', user.id)
      .maybeSingle()
    likedByMe = !!myLike
  }

  // 댓글 목록
  const { data: rawComments } = await supabase
    .from('comments')
    .select('id, content, created_at, user_id, profiles(nickname)')
    .eq('post_id', id)
    .order('created_at', { ascending: true })

  const comments: CommentItem[] = (rawComments ?? []).map(c => {
    const profile = c.profiles as unknown as { nickname: string } | { nickname: string }[] | null
    const nickname = Array.isArray(profile) ? profile[0]?.nickname : profile?.nickname
    return {
      id: c.id,
      content: c.content,
      created_at: c.created_at,
      user_id: c.user_id,
      nickname: nickname ?? '알 수 없음',
    }
  })

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      <header className="sticky top-0 z-10 shadow-sm" style={{ background: '#E8650A' }}>
        <div className="app-container mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="text-white text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            ←
          </Link>
          <span className="text-white font-bold text-lg flex-1 truncate">{post.title}</span>
          {user && (
            <form action={logout}>
              <button type="submit" className="text-sm px-3 py-1.5 rounded-full font-medium flex-shrink-0" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                로그아웃
              </button>
            </form>
          )}
        </div>
      </header>

      <main className="app-container mx-auto px-4 py-6 space-y-4 pb-28">
        {/* 이미지 — 있으면 캐러셀, 없으면 카테고리 이모지 */}
        {imageUrls.length > 0 ? (
          <ImageCarousel urls={imageUrls} alt={post.title} />
        ) : (
          <div className="w-full rounded-3xl flex items-center justify-center" style={{ background: '#FFF3E0', height: '220px' }}>
            <span style={{ fontSize: '80px' }}>{CATEGORY_EMOJI[post.category] || '📦'}</span>
          </div>
        )}

        {/* 판매자 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-lg flex-shrink-0" style={{ background: '#E8650A' }}>
            {(seller?.nickname ?? '?')[0]}
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: '#3D2B1F' }}>{seller?.nickname ?? '알 수 없음'}</p>
            <p className="text-xs" style={{ color: '#A0522D' }}>판매자</p>
          </div>
          {isMyPost && (
            <span className="ml-auto text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: '#FFF3E0', color: '#E8650A' }}>
              내 글
            </span>
          )}
        </div>

        {/* 글 내용 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-2 mb-3">
            <h1 className="font-bold text-lg flex-1" style={{ color: '#3D2B1F' }}>{post.title}</h1>
            <span className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 mt-0.5" style={{ background: status.bg, color: status.color }}>
              {status.label}
            </span>
          </div>
          <p className="text-xs mb-4" style={{ color: '#A0522D' }}>
            {post.category} · {timeAgo(post.created_at)}
          </p>
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#5D3A1A' }}>
            {post.description}
          </p>
          {post.location && (
            <div className="mt-4 p-3 rounded-xl flex items-center gap-2 text-sm" style={{ background: 'transparent' }}>
              <span>📍</span>
              <span style={{ color: '#5D3A1A' }}>{post.location}</span>
            </div>
          )}

          {/* 좋아요 */}
          <div className="mt-4 flex items-center gap-3">
            <LikeButton
              postId={post.id}
              initialLiked={likedByMe}
              initialCount={likeCount ?? 0}
              loggedIn={!!user}
            />
            <span className="text-xs" style={{ color: '#A0522D' }}>
              관심 있으면 좋아요를 눌러보세요
            </span>
          </div>
        </div>

        {/* 댓글 */}
        <CommentSection postId={post.id} comments={comments} currentUserId={user?.id ?? null} />

        {/* 내 글일 때 수정/삭제 버튼 */}
        {isMyPost && (
          <div className="flex gap-3">
            <DeleteButton postId={post.id} />
            <Link
              href={`/posts/${post.id}/edit`}
              className="flex-1 py-3 rounded-xl font-bold text-sm text-center"
              style={{ background: '#FFF3E0', color: '#E8650A' }}
            >
              ✏️ 수정
            </Link>
          </div>
        )}
      </main>

      {/* 하단 가격 + 구매 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 border-t" style={{ background: 'white', borderColor: '#F5E6D3' }}>
        <div className="app-container mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs" style={{ color: '#A0522D' }}>가격</p>
            <p className="font-bold text-lg" style={{ color: '#E8650A' }}>
              {post.price === 0 ? '가격 협의' : `${post.price.toLocaleString()}원`}
            </p>
          </div>
          {isMyPost && (
            <Link href="/" className="px-6 py-3 rounded-xl font-bold text-sm" style={{ background: '#FFF3E0', color: '#E8650A' }}>
              목록으로
            </Link>
          )}
          {!isMyPost && isSelling && <BuyButton postId={post.id} />}
          {!isMyPost && !isSelling && (
            <span className="px-6 py-3 rounded-xl font-bold text-sm" style={{ background: '#F0F0F0', color: '#888' }}>
              {post.status === 'sold' ? '판매완료' : '예약중'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const CATEGORY_EMOJI: Record<string, string> = {
  '디지털/가전': '📱', '의류/잡화': '👗', '도서/음반': '📚',
  '스포츠/레저': '⚽', '가구/인테리어': '🛋️', '생활/주방': '🍳',
  '게임/취미': '🎮', '식물': '🌿', '기타': '📦',
}

const STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
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

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, nickname, bio, avatar_url, created_at')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  const isMe = user?.id === id

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      <header className="sticky top-0 z-10 shadow-sm" style={{ background: 'linear-gradient(135deg, #FF8A3D 0%, #E8650A 60%, #F5A623 100%)' }}>
        <div className="app-container mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="text-white text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            ←
          </Link>
          <span className="text-white font-bold text-lg flex-1">프로필</span>
          <span className="text-2xl bounce-y">🍠</span>
        </div>
      </header>

      <main className="app-container mx-auto px-4 py-6 space-y-4 pb-16">
        {/* 프로필 카드 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm pop-in" style={{ border: '1.5px solid #FFE7CE' }}>
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
              style={{ background: '#FFF3E0', border: '3px solid #F5CBA7' }}
            >
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt={profile.nickname} className="w-full h-full object-cover" />
                : <span className="text-3xl">🙂</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg" style={{ color: '#3D2B1F' }}>{profile.nickname || '고구마 유저'}</p>
              <p className="text-xs mt-0.5" style={{ color: '#A0522D' }}>
                판매 {posts?.length ?? 0}건
              </p>
            </div>
            {isMe && (
              <Link
                href="/my/profile"
                className="text-sm font-bold px-3 py-1.5 rounded-full flex-shrink-0"
                style={{ background: '#FFF3E0', color: '#E8650A' }}
              >
                ✏️ 수정
              </Link>
            )}
          </div>

          {/* 자기소개 */}
          {profile.bio ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap mt-4 p-3 rounded-xl" style={{ color: '#5D3A1A', background: '#FFF8F0' }}>
              {profile.bio}
            </p>
          ) : (
            <p className="text-sm mt-4 p-3 rounded-xl text-center" style={{ color: '#B89878', background: '#FFF8F0' }}>
              아직 자기소개가 없어요.
            </p>
          )}
        </div>

        {/* 판매 목록 */}
        <h2 className="font-bold text-sm px-1" style={{ color: '#3D2B1F' }}>
          🛒 {isMe ? '내' : `${profile.nickname}님의`} 판매글
        </h2>

        {posts && posts.length > 0 ? (
          <div className="space-y-3">
            {posts.map(post => {
              const s = STATUS_STYLE[post.status] ?? STATUS_STYLE.selling
              return (
                <Link key={post.id} href={`/posts/${post.id}`}>
                  <div className="bg-white rounded-2xl p-4 shadow-sm flex items-start gap-3 active:scale-95 transition-transform" style={{ border: '1.5px solid #FFE7CE' }}>
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden" style={{ background: '#FFF3E0' }}>
                      {(post.image_urls as string[] | null)?.[0]
                        ? <img src={(post.image_urls as string[])[0]} alt={post.title} className="w-full h-full object-cover" />
                        : (CATEGORY_EMOJI[post.category] || '📦')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: '#3D2B1F' }}>{post.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#A0522D' }}>
                        {post.category} · {timeAgo(post.created_at)}
                      </p>
                      <p className="font-bold text-sm mt-1.5" style={{ color: '#E8650A' }}>
                        {post.price === 0 ? '가격 협의' : `${post.price.toLocaleString()}원`}
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0" style={{ background: s.bg, color: s.color }}>
                      {s.label}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-3 bounce-y">📦</div>
            <p className="text-sm" style={{ color: '#A0522D' }}>아직 등록한 판매글이 없어요.</p>
          </div>
        )}
      </main>
    </div>
  )
}

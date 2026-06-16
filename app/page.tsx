import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'
import NavTabs from '@/app/components/NavTabs'

const CATEGORY_EMOJI: Record<string, string> = {
  '디지털/가전': '📱', '의류/잡화': '👗', '도서/음반': '📚',
  '스포츠/레저': '⚽', '가구/인테리어': '🛋️', '생활/주방': '🍳',
  '게임/취미': '🎮', '식물': '🌿', '기타': '📦',
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const nickname = user.user_metadata?.nickname || user.email?.split('@')[0] || '고구마 유저'

  const { data: posts } = await supabase
    .from('posts')
    .select('*, profiles(nickname)')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen" style={{ background: '#FFF8F0' }}>
      <div className="sticky top-0 z-20">
        <header className="shadow-sm" style={{ background: '#E8650A' }}>
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍠</span>
              <span className="text-white font-bold text-lg">고구마마켓</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white text-sm opacity-80">{nickname}님</span>
              <form action={logout}>
                <button type="submit" className="text-sm px-3 py-1.5 rounded-full font-medium" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                  로그아웃
                </button>
              </form>
            </div>
          </div>
        </header>
        <NavTabs />
      </div>

      <main className="max-w-lg mx-auto px-4 py-4 pb-28">
        {posts && posts.length > 0 ? (
          <div className="space-y-3">
            {posts.map(post => (
              <Link key={post.id} href={`/posts/${post.id}`}>
                <div className="bg-white rounded-2xl p-4 shadow-sm flex items-start gap-3 active:scale-95 transition-transform">
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden" style={{ background: '#FFF3E0' }}>
                    {(post.image_urls as string[] | null)?.[0]
                      ? <img src={(post.image_urls as string[])[0]} alt={post.title} className="w-full h-full object-cover" />
                      : (CATEGORY_EMOJI[post.category] || '📦')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: '#3D2B1F' }}>{post.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#A0522D' }}>
                      {(post.profiles as { nickname: string } | null)?.nickname || '알 수 없음'}
                      {post.location && ` · ${post.location}`}
                      {' · '}{timeAgo(post.created_at)}
                    </p>
                    <p className="text-xs mt-1 line-clamp-1" style={{ color: '#7A5C3A' }}>{post.description}</p>
                    <p className="font-bold text-sm mt-1.5" style={{ color: '#E8650A' }}>
                      {post.price === 0 ? '가격 협의' : `${post.price.toLocaleString()}원`}
                    </p>
                  </div>
                  {post.status !== 'selling' && (
                    <span className="text-xs px-2 py-1 rounded-lg font-medium flex-shrink-0" style={{
                      background: post.status === 'sold' ? '#F0F0F0' : '#FFF3CD',
                      color: post.status === 'sold' ? '#888' : '#856404',
                    }}>
                      {post.status === 'sold' ? '판매완료' : '예약중'}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🍠</div>
            <p className="font-bold text-lg mb-1" style={{ color: '#8B4513' }}>아직 올라온 매물이 없어요</p>
            <p className="text-sm" style={{ color: '#A0522D' }}>첫 번째 판매글을 작성해 보세요!</p>
          </div>
        )}
      </main>

      <div className="fixed bottom-6 right-0 left-0 flex justify-center pointer-events-none">
        <div className="max-w-lg w-full px-4 flex justify-end pointer-events-auto">
          <Link href="/posts/new" className="flex items-center gap-2 px-5 py-3.5 rounded-full shadow-lg font-bold text-white" style={{ background: '#E8650A' }}>
            <span className="text-lg">+</span>
            <span>판매글 쓰기</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

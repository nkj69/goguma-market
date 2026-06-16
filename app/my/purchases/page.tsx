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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default async function MyPurchasesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const nickname = user.user_metadata?.nickname || user.email?.split('@')[0] || '고구마 유저'

  const { data: purchases } = await supabase
    .from('purchases')
    .select('*, posts(*, profiles(nickname))')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      <div className="sticky top-0 z-20">
        <header className="shadow-sm" style={{ background: '#E8650A' }}>
          <div className="app-container mx-auto px-4 py-3 flex items-center justify-between">
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

      <main className="app-container mx-auto px-4 py-4 pb-10">
        <p className="text-sm font-medium mb-3" style={{ color: '#A0522D' }}>
          총 {purchases?.length ?? 0}건 구매
        </p>

        {purchases && purchases.length > 0 ? (
          <div className="space-y-3">
            {purchases.map(purchase => {
              const post = purchase.posts as {
                id: string; title: string; price: number; category: string
                description: string; profiles: { nickname: string } | null
              } | null
              if (!post) return null
              return (
                <Link key={purchase.id} href={`/posts/${post.id}`}>
                  <div className="bg-white rounded-2xl p-4 shadow-sm flex items-start gap-3 active:scale-95 transition-transform">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: '#FFF3E0' }}>
                      {CATEGORY_EMOJI[post.category] || '📦'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: '#3D2B1F' }}>{post.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#A0522D' }}>
                        판매자: {post.profiles?.nickname || '알 수 없음'}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#C4956A' }}>
                        구매일: {formatDate(purchase.created_at)}
                      </p>
                      <p className="font-bold text-sm mt-1.5" style={{ color: '#E8650A' }}>
                        {post.price === 0 ? '가격 협의' : `${post.price.toLocaleString()}원`}
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0" style={{ background: '#E8F5E9', color: '#2E7D32' }}>
                      구매완료
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💳</div>
            <p className="font-bold text-lg mb-1" style={{ color: '#8B4513' }}>아직 구매 내역이 없어요</p>
            <p className="text-sm mb-6" style={{ color: '#A0522D' }}>마음에 드는 물건을 찾아보세요!</p>
            <Link href="/" className="px-6 py-3 rounded-xl font-bold text-white" style={{ background: '#E8650A' }}>
              매물 보러 가기
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}

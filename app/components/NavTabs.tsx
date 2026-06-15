'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/',              icon: '🏠', label: '전체' },
  { href: '/my/selling',    icon: '📦', label: '내 판매글' },
  { href: '/my/purchases',  icon: '💳', label: '구매목록' },
]

export default function NavTabs() {
  const pathname = usePathname()

  return (
    <nav className="flex bg-white border-b" style={{ borderColor: '#F5E6D3' }}>
      {TABS.map(tab => {
        const active = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex-1 py-2.5 flex flex-col items-center gap-0.5 text-xs font-medium transition-colors"
            style={{
              color: active ? '#E8650A' : '#A0522D',
              borderBottom: active ? '2px solid #E8650A' : '2px solid transparent',
            }}
          >
            <span className="text-base">{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

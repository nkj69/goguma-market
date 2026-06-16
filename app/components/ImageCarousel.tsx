'use client'

import { useState } from 'react'

interface Props {
  urls: string[]
  alt: string
}

export default function ImageCarousel({ urls, alt }: Props) {
  const [idx, setIdx] = useState(0)

  if (urls.length === 0) return null

  return (
    <div className="relative w-full overflow-hidden rounded-3xl" style={{ background: '#111', aspectRatio: '4/3' }}>
      <img
        src={urls[idx]}
        alt={alt}
        className="w-full h-full object-contain"
      />

      {urls.length > 1 && (
        <div
          className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold text-white"
          style={{ background: 'rgba(0,0,0,0.55)' }}
        >
          {idx + 1} / {urls.length}
        </div>
      )}

      {urls.length > 1 && idx > 0 && (
        <button
          onClick={() => setIdx(i => i - 1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg text-xl"
          style={{ background: 'rgba(255,255,255,0.92)', color: '#333' }}
        >
          ‹
        </button>
      )}

      {urls.length > 1 && idx < urls.length - 1 && (
        <button
          onClick={() => setIdx(i => i + 1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg text-xl"
          style={{ background: 'rgba(255,255,255,0.92)', color: '#333' }}
        >
          ›
        </button>
      )}

      {urls.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {urls.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className="rounded-full transition-all duration-200"
              style={{
                height: '7px',
                width: i === idx ? '20px' : '7px',
                background: i === idx ? 'white' : 'rgba(255,255,255,0.5)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

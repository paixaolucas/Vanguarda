'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
}: PaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function buildHref(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    return `${pathname}?${params.toString()}`
  }

  const from = Math.min((currentPage - 1) * pageSize + 1, totalItems)
  const to = Math.min(currentPage * pageSize, totalItems)

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-xs text-white/30">
        {from}–{to} de {totalItems}
      </p>
      <div className="flex items-center gap-1">
        {currentPage > 1 ? (
          <Link
            href={buildHref(currentPage - 1)}
            className="flex items-center justify-center w-7 h-7 border border-[#222] text-white/50 hover:text-white hover:border-[#333] transition-colors"
          >
            <ChevronLeft size={14} />
          </Link>
        ) : (
          <span className="flex items-center justify-center w-7 h-7 border border-[#1a1a1a] text-white/20 cursor-not-allowed">
            <ChevronLeft size={14} />
          </span>
        )}

        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let page: number
          if (totalPages <= 5) {
            page = i + 1
          } else if (currentPage <= 3) {
            page = i + 1
          } else if (currentPage >= totalPages - 2) {
            page = totalPages - 4 + i
          } else {
            page = currentPage - 2 + i
          }

          return (
            <Link
              key={page}
              href={buildHref(page)}
              className={`flex items-center justify-center w-7 h-7 text-xs transition-colors ${
                page === currentPage
                  ? 'bg-white text-black font-medium'
                  : 'border border-[#222] text-white/50 hover:text-white hover:border-[#333]'
              }`}
            >
              {page}
            </Link>
          )
        })}

        {currentPage < totalPages ? (
          <Link
            href={buildHref(currentPage + 1)}
            className="flex items-center justify-center w-7 h-7 border border-[#222] text-white/50 hover:text-white hover:border-[#333] transition-colors"
          >
            <ChevronRight size={14} />
          </Link>
        ) : (
          <span className="flex items-center justify-center w-7 h-7 border border-[#1a1a1a] text-white/20 cursor-not-allowed">
            <ChevronRight size={14} />
          </span>
        )}
      </div>
    </div>
  )
}

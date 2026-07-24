'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function DashboardFilter() {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    // Default to '30days' if no filter is set
    const currentFilter = searchParams.get('filter') || '30days'

    const filters = [
        { id: '3days', label: '3 DAYS' },
        { id: '7days', label: '1 WEEK' },
        { id: '30days', label: '1 MONTH' },
        { id: 'all', label: 'ALL TIME' }
    ]

    const handleFilterChange = (filterId: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('filter', filterId)
        router.push(`?${params.toString()}`)
    }

    return (
        <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-8">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 mr-2 md:mr-4 w-full sm:w-auto mb-2 sm:mb-0">
                TIMEFRAME FILTER:
            </span>
            <div className="flex flex-wrap gap-2">
                {filters.map(filter => {
                    const isActive = currentFilter === filter.id
                    return (
                        <button
                            key={filter.id}
                            onClick={() => handleFilterChange(filter.id)}
                            className={`px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-colors border ${
                                isActive 
                                    ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' 
                                    : 'bg-transparent text-zinc-500 border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 hover:text-black dark:hover:text-white'
                            }`}
                        >
                            [ {filter.label} ]
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

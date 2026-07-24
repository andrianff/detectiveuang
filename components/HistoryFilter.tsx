'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Filter } from 'lucide-react'

type Category = {
    id: string
    name: string
    type: string
}

export default function HistoryFilter({ categories }: { categories: Category[] }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const currentTimeframe = searchParams.get('timeframe') || 'all'
    const currentCategory = searchParams.get('category') || 'all'

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set(key, value)
        params.set('page', '1') // Reset page on filter change
        router.push(`?${params.toString()}`)
    }

    return (
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center bg-[#FAFAFA] dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 p-4 md:p-6 mb-8">
            <div className="flex items-center gap-2 text-zinc-500 mr-4">
                <Filter size={16} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">FILTERS:</span>
            </div>

            {/* Timeframe Filter */}
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 w-24 sm:w-auto">TIME:</span>
                <select 
                    value={currentTimeframe}
                    onChange={(e) => handleFilterChange('timeframe', e.target.value)}
                    className="bg-transparent border-b border-black/20 dark:border-white/20 text-xs font-bold uppercase tracking-widest py-1 outline-none cursor-pointer hover:border-black dark:hover:border-white transition-colors"
                >
                    <option value="all">ALL TIME</option>
                    <option value="7days">LAST 7 DAYS</option>
                    <option value="30days">LAST 30 DAYS</option>
                    <option value="thisMonth">THIS MONTH</option>
                </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 sm:ml-4">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 w-24 sm:w-auto">CATEGORY:</span>
                <select 
                    value={currentCategory}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="bg-transparent border-b border-black/20 dark:border-white/20 text-xs font-bold uppercase tracking-widest py-1 outline-none cursor-pointer hover:border-black dark:hover:border-white transition-colors max-w-[150px] sm:max-w-none"
                >
                    <option value="all">ALL CATEGORIES</option>
                    <optgroup label="EXPENSE">
                        {categories.filter(c => c.type === 'EXPENSE').map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </optgroup>
                    <optgroup label="INCOME">
                        {categories.filter(c => c.type === 'INCOME').map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </optgroup>
                </select>
            </div>
        </div>
    )
}

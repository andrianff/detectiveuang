import { getCurrentMonthIncome, getAllocationPockets, deleteAllocationPocket } from '@/features/budget/actions'
import { getCategories } from '@/features/category/actions'
import Link from 'next/link'
import { ArrowRight, Plus, Trash2, PieChart } from 'lucide-react'

export default async function BudgetPage() {
    const totalIncome = await getCurrentMonthIncome()
    const pockets = await getAllocationPockets()
    const categories = await getCategories()

    // Calculate Unallocated Percentage
    const allocatedPercentage = pockets.reduce((acc: number, curr: any) => acc + curr.percentage, 0)
    const unallocatedPercentage = Math.max(0, 100 - allocatedPercentage)

    return (
        <div className="space-y-12 pb-24 md:pb-8">

            {/* Header */}
            <div className="sticky top-0 z-40 bg-[#FAFAFA]/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-black/10 dark:border-white/10 -mt-6 pt-6 -mx-6 px-6 pb-6 mb-8 md:mb-0 md:static md:bg-transparent md:mt-0 md:pt-0 md:mx-0 md:px-0 md:pb-8">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-2 md:mb-4">SMART ALLOCATION</p>
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-black dark:text-white">
                        BUDGET POCKETS
                    </h1>
                </div>
                <div className="flex gap-4">
                    <Link href="/dashboard/budget/new" className="inline-block border border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 px-8 py-3 text-xs font-semibold uppercase tracking-widest text-blue-700 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-black transition-colors">
                        [ + ] NEW POCKET
                    </Link>
                </div>
            </div>

            {/* Income Basis */}
            <div className="border border-black/10 dark:border-white/10 p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="absolute top-0 right-0 p-8 md:p-12 opacity-[0.03] pointer-events-none">
                    <PieChart size={160} strokeWidth={1} />
                </div>
                <div className="relative z-10">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-4">MONTHLY INCOME BASIS</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold tracking-widest text-zinc-400">IDR</span>
                        <span className="text-4xl md:text-6xl font-bold tracking-tighter text-black dark:text-white">
                            {totalIncome.toLocaleString('id-ID')}
                        </span>
                    </div>
                    <p className="text-xs font-medium text-zinc-500 mt-4">
                        All pocket limits are dynamically calculated based on this actual income.
                    </p>
                </div>
                
                {/* Allocation Summary */}
                <div className="relative z-10 flex gap-12 md:pl-12 md:border-l border-black/10 dark:border-white/10">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-2">ALLOCATED</p>
                        <span className="text-2xl font-bold tracking-tighter text-black dark:text-white">{allocatedPercentage.toFixed(0)}%</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-2">UNALLOCATED</p>
                        <span className="text-2xl font-bold tracking-tighter text-emerald-600 dark:text-emerald-500">{unallocatedPercentage.toFixed(0)}%</span>
                    </div>
                </div>
            </div>

            {/* Pockets List */}
            <div className="space-y-0 border-t border-black/10 dark:border-white/10">
                {pockets.length === 0 ? (
                    <div className="p-12 text-center border-b border-black/10 dark:border-white/10">
                        <p className="text-sm text-zinc-500 uppercase tracking-widest font-semibold">NO POCKETS DEFINED YET</p>
                    </div>
                ) : (
                    pockets.map(pocket => {
                        const limit = (totalIncome * pocket.percentage) / 100
                        const spent = pocket.spent
                        const isOver = spent > limit
                        const progress = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0

                        return (
                            <div key={pocket.id} className="border-b border-black/10 dark:border-white/10 p-6 md:p-8 flex flex-col md:flex-row gap-8 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                                {/* Info */}
                                <div className="md:w-1/3 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="inline-flex items-center justify-center bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold px-2 py-1 tracking-widest">
                                                {pocket.percentage}%
                                            </span>
                                            <h3 className="text-lg font-bold tracking-tight uppercase text-black dark:text-white">
                                                {pocket.name}
                                            </h3>
                                        </div>
                                        <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">
                                            {pocket.categories.length} CATEGORIES LINKED
                                        </p>
                                    </div>

                                    {/* Delete Form */}
                                    <div className="mt-6">
                                        <form action={deleteAllocationPocket.bind(null, pocket.id)}>
                                            <button type="submit" className="text-rose-600 hover:text-rose-700 text-xs font-semibold uppercase tracking-widest flex items-center gap-2 transition-colors">
                                                <Trash2 size={12} /> REMOVE POCKET
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* Tracking */}
                                <div className="md:w-2/3 flex flex-col justify-center">
                                    <div className="flex justify-between items-end mb-4">
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-1">SPENT</p>
                                            <span className={`text-2xl font-bold tracking-tighter ${isOver ? 'text-rose-600' : 'text-black dark:text-white'}`}>
                                                {spent.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-1">DYNAMIC LIMIT</p>
                                            <span className="text-xl font-semibold tracking-tight text-zinc-400">
                                                / {limit.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Brutalist Progress Bar */}
                                    <div className="h-2 w-full bg-black/5 dark:bg-white/10 overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${isOver ? 'bg-rose-600' : 'bg-blue-600'}`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    {isOver && (
                                        <p className="text-[10px] text-rose-600 uppercase tracking-widest font-bold mt-3 text-right">
                                            EXCEEDED BY {(spent - limit).toLocaleString('id-ID')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

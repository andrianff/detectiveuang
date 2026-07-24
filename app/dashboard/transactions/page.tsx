import { createClient } from '@/lib/utils/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowDownRight, ArrowUpRight, Activity, Download } from 'lucide-react'
import { deleteTransaction } from '@/features/transaction/actions'
import HistoryFilter from '@/components/HistoryFilter'

export default async function TransactionsArchivePage({
    searchParams
}: {
    searchParams: { page?: string, timeframe?: string, category?: string }
}) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) redirect('/login')

    // Parameters
    const page = Number(searchParams?.page) || 1
    const limit = 20
    const skip = (page - 1) * limit
    const timeframe = searchParams?.timeframe || 'all'
    const categoryId = searchParams?.category || 'all'

    // Build Where Clause
    let dateFilter: any = undefined
    if (timeframe === '7days') {
        const d = new Date(); d.setDate(d.getDate() - 7); dateFilter = { gte: d }
    } else if (timeframe === '30days') {
        const d = new Date(); d.setDate(d.getDate() - 30); dateFilter = { gte: d }
    } else if (timeframe === 'thisMonth') {
        const d = new Date(); const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1); dateFilter = { gte: startOfMonth }
    }

    const whereClause: any = {
        wallet: { userId: user.id },
        ...(dateFilter ? { transactionDate: dateFilter } : {}),
        ...(categoryId !== 'all' ? { categoryId } : {})
    }

    // Fetch Paginated Transactions
    const transactions = await prisma.transaction.findMany({
        where: whereClause,
        orderBy: { transactionDate: 'desc' },
        skip,
        take: limit,
        include: { category: true, wallet: true }
    })

    const totalCount = await prisma.transaction.count({ where: whereClause })
    const totalPages = Math.ceil(totalCount / limit)

    // Fetch All Categories for Filter
    const categories = await prisma.category.findMany({
        where: { userId: user.id },
        orderBy: { name: 'asc' }
    })

    // Fetch All Un-paginated Transactions matching the filter to calculate stats
    const allFilteredTx = await prisma.transaction.findMany({
        where: whereClause,
        include: { category: true }
    })

    let filteredIncome = 0
    let filteredExpense = 0
    allFilteredTx.forEach((tx: any) => {
        if (tx.category?.type === 'INCOME') filteredIncome += tx.amount
        if (tx.category?.type === 'EXPENSE') filteredExpense += tx.amount
    })
    const netBalance = filteredIncome - filteredExpense

    // Construct export URL
    const params = new URLSearchParams()
    if (timeframe !== 'all') params.set('timeframe', timeframe)
    if (categoryId !== 'all') params.set('category', categoryId)
    const exportUrl = `/api/export?${params.toString()}`

    return (
        <div className="space-y-12 pb-24 md:pb-8">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-[#FAFAFA]/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-black/10 dark:border-white/10 -mt-6 pt-6 -mx-6 px-6 pb-6 mb-8 md:mb-0 md:static md:bg-transparent md:mt-0 md:pt-0 md:mx-0 md:px-0 md:pb-8">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-2 md:mb-4">ALL RECORDS</p>
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-black dark:text-white">
                        TRANSACTION ARCHIVE
                    </h1>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <a href={exportUrl} className="inline-flex items-center justify-center gap-2 border border-black/20 dark:border-white/20 bg-transparent px-4 py-3 text-xs font-semibold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors flex-1 sm:flex-none">
                        <Download size={14} /> EXPORT CSV
                    </a>
                    <Link href="/dashboard/transactions/new" className="inline-block border border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 px-8 py-3 text-xs font-semibold uppercase tracking-widest text-blue-700 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-black transition-colors flex-1 sm:flex-none text-center">
                        [ + ] NEW
                    </Link>
                </div>
            </div>

            {/* Filter */}
            <HistoryFilter categories={categories} />

            {/* Descriptive Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-black/10 dark:border-white/10 mb-8">
                <div className="p-6 border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 bg-emerald-50/30 dark:bg-emerald-950/10">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-600 mb-2">FILTERED INCOME</p>
                    <p className="text-2xl font-bold tracking-tighter text-emerald-600">Rp {filteredIncome.toLocaleString('id-ID')}</p>
                </div>
                <div className="p-6 border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 bg-rose-50/30 dark:bg-rose-950/10">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-600 mb-2">FILTERED EXPENSE</p>
                    <p className="text-2xl font-bold tracking-tighter text-rose-600">Rp {filteredExpense.toLocaleString('id-ID')}</p>
                </div>
                <div className="p-6 bg-[#FAFAFA] dark:bg-[#0A0A0A]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-2">NET BALANCE (CASHFLOW)</p>
                    <p className={`text-2xl font-bold tracking-tighter ${netBalance >= 0 ? 'text-black dark:text-white' : 'text-rose-600'}`}>
                        {netBalance < 0 ? '-' : ''}Rp {Math.abs(netBalance).toLocaleString('id-ID')}
                    </p>
                </div>
            </div>

            {/* List */}
            <div>
                {transactions.length === 0 ? (
                    <div className="py-32 flex flex-col items-center justify-center text-center border border-dashed border-black/20 dark:border-white/20">
                        <Activity size={32} strokeWidth={1} className="mb-6 opacity-30 text-blue-600" />
                        <p className="text-sm uppercase tracking-widest font-semibold text-zinc-500">NO TRANSACTIONS FOUND</p>
                        <p className="text-xs mt-2 text-zinc-400 max-w-sm">TRY ADJUSTING YOUR FILTERS OR TIME RANGE.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-black/10 dark:divide-white/10 border-t border-b border-black/10 dark:border-white/10">
                        {transactions.map((tx: any) => {
                            const isIncome = tx.category?.type === 'INCOME'
                            const txDate = new Date(tx.transactionDate).toLocaleDateString('id-ID', {
                                day: '2-digit', month: 'short', year: 'numeric'
                            })

                            return (
                                <div key={tx.id} className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-black/5 dark:hover:bg-white/5 px-4 -mx-4 transition-colors relative group">
                                    
                                    {/* Left: Icon & Title & Date */}
                                    <div className="flex flex-col md:w-2/5">
                                        <div className="flex items-center gap-6">
                                            {isIncome ? (
                                                <ArrowDownRight size={16} strokeWidth={1.5} className="text-emerald-600" />
                                            ) : (
                                                <ArrowUpRight size={16} strokeWidth={1.5} className="text-rose-600" />
                                            )}
                                            <p className="text-sm font-bold uppercase tracking-widest text-black dark:text-white truncate">
                                                {tx.title}
                                            </p>
                                        </div>
                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mt-2 md:pl-[40px]">
                                            {txDate}
                                        </p>
                                    </div>

                                    {/* Center: Category & Wallet */}
                                    <div className="flex items-center gap-8 md:w-2/5 justify-between md:justify-start text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                                        <span className="w-32 truncate flex items-center gap-2">
                                            {tx.category?.color && (
                                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tx.category.color }} />
                                            )}
                                            {tx.category?.name || 'UNCATEGORIZED'}
                                        </span>
                                        <span className="w-24 truncate text-right md:text-left">{tx.wallet.name}</span>
                                    </div>

                                    {/* Right: Amount & Action */}
                                    <div className="flex items-center justify-between md:w-1/5 md:justify-end text-sm font-bold tracking-wider">
                                        <span className="text-[10px] text-zinc-400 md:hidden">AMOUNT</span>
                                        <div className="flex items-center gap-4">
                                            <span className={isIncome ? 'text-emerald-600 dark:text-emerald-500' : 'text-black dark:text-white'}>
                                                {isIncome ? '+' : '-'} {tx.amount.toLocaleString('id-ID')}
                                            </span>
                                            <form action={deleteTransaction.bind(null, tx.id)}>
                                                <button type="submit" title="Delete Transaction" className="opacity-0 group-hover:opacity-100 md:focus:opacity-100 text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-600 transition-all text-[8px] px-2 py-1 font-bold active:opacity-100">
                                                    [ X ]
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-8">
                    {page > 1 ? (
                        <Link href={`/dashboard/transactions?page=${page - 1}&timeframe=${timeframe}&category=${categoryId}`} className="text-xs font-bold tracking-widest uppercase border border-black/20 dark:border-white/20 px-4 py-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                            PREV
                        </Link>
                    ) : (
                        <span className="text-xs font-bold tracking-widest uppercase border border-black/10 dark:border-white/10 px-4 py-2 text-zinc-400 opacity-50 cursor-not-allowed">
                            PREV
                        </span>
                    )}

                    <span className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
                        PAGE {page} OF {totalPages}
                    </span>

                    {page < totalPages ? (
                        <Link href={`/dashboard/transactions?page=${page + 1}&timeframe=${timeframe}&category=${categoryId}`} className="text-xs font-bold tracking-widest uppercase border border-black/20 dark:border-white/20 px-4 py-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                            NEXT
                        </Link>
                    ) : (
                        <span className="text-xs font-bold tracking-widest uppercase border border-black/10 dark:border-white/10 px-4 py-2 text-zinc-400 opacity-50 cursor-not-allowed">
                            NEXT
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}

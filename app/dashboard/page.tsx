import { redirect } from 'next/navigation'
import { createClient } from '@/lib/utils/supabase/server'
import prisma from '@/lib/prisma'
import { ArrowDownRight, ArrowUpRight, Activity, Settings } from 'lucide-react'
import Link from 'next/link'
import { deleteTransaction } from '@/features/transaction/actions'
import DashboardFilter from '@/components/DashboardFilter'

export default async function DashboardPage({
    searchParams
}: {
    searchParams: { filter?: string }
}) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/login')
    }

    // Logika Filter Rentang Waktu
    const filter = searchParams.filter || '30days'
    let filterDate: Date | undefined = new Date()

    if (filter === '3days') {
        filterDate.setDate(filterDate.getDate() - 3)
    } else if (filter === '7days') {
        filterDate.setDate(filterDate.getDate() - 7)
    } else if (filter === '30days') {
        filterDate.setDate(filterDate.getDate() - 30)
    } else if (filter === 'all') {
        filterDate = undefined
    }

    // FIX #4: Jalankan semua query secara PARALEL dengan Promise.all
    // Sebelumnya: 4 query berurutan (total ~4x latency)
    // Sekarang: 4 query bersamaan (total ~1x latency query terlambat)
    const [dbUser, wallets, recentTransactions, filteredTransactions] = await Promise.all([
        prisma.user.findUnique({ where: { id: user.id } }),
        prisma.wallet.findMany({ where: { userId: user.id } }),
        prisma.transaction.findMany({
            where: { wallet: { userId: user.id } },
            orderBy: { transactionDate: 'desc' },
            take: 5,
            include: { category: true, wallet: true }
        }),
        prisma.transaction.findMany({
            where: {
                wallet: { userId: user.id },
                ...(filterDate ? { transactionDate: { gte: filterDate } } : {})
            },
            include: { category: true }
        })
    ])

    const totalBalance = wallets.reduce((sum: number, wallet: any) => sum + wallet.balance, 0)

    let totalIncome = 0
    let totalExpense = 0
    for (const tx of filteredTransactions) {
        if ((tx as any).category?.type === 'INCOME') totalIncome += tx.amount
        if ((tx as any).category?.type === 'EXPENSE') totalExpense += tx.amount
    }

    return (
        <div className="space-y-12">

            {/* Header Editorial */}
            <div className="sticky top-0 z-40 bg-[#FAFAFA]/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md flex flex-row sm:items-end justify-between gap-6 border-b border-black/10 dark:border-white/10 -mt-6 pt-6 -mx-6 px-6 pb-6 mb-8 md:mb-0 md:static md:bg-transparent md:mt-0 md:pt-0 md:mx-0 md:px-0 md:pb-8">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-2 md:mb-4">PORTFOLIO OVERVIEW</p>
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-black dark:text-white">
                        {dbUser?.name?.toUpperCase() || 'KAWAN'}
                    </h1>
                </div>
                <div className="flex flex-col gap-4 items-end justify-between h-full">
                    {/* Ikon Pengaturan Khusus Mobile (karena di Navigasi Bawah tidak muat) */}
                    <div className="md:hidden flex justify-end w-full mb-2">
                        <Link href="/dashboard/settings" className="p-2 border border-black/10 dark:border-white/10 text-zinc-500 hover:text-black dark:hover:text-white bg-black/5 dark:bg-white/5">
                            <Settings size={20} strokeWidth={1.5} />
                        </Link>
                    </div>
                    {/* Tombol New Record yang tampil di semua perangkat (Bisa juga disembunyikan di mobile jika sudah ada tombol [+]) */}
                    <div className="hidden md:block">
                        <Link href="/dashboard/transactions/new" className="inline-block border border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 px-8 py-3 text-xs font-semibold uppercase tracking-widest text-blue-700 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-black transition-colors w-full text-center md:w-auto">
                            [ + ] NEW RECORD
                        </Link>
                    </div>
                </div>
            </div>

            {/* Filter Interaktif */}
            <DashboardFilter />

            {/* Grid Finansial */}
            <div className="grid md:grid-cols-12 gap-0 border border-black/10 dark:border-white/10">
                {/* Total Saldo */}
                <div className="md:col-span-8 p-6 md:p-12 border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 md:p-12 opacity-[0.03] pointer-events-none">
                        <span className="text-7xl md:text-9xl font-bold tracking-tighter">IDR</span>
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 relative z-10">TOTAL BALANCE</span>
                    <div className="mt-12 md:mt-24 relative z-10 break-words">
                        <span className="text-sm font-semibold tracking-widest text-zinc-400">IDR</span>
                        <p className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter text-black dark:text-white mt-2 leading-none break-all">
                            {totalBalance.toLocaleString('id-ID')}
                        </p>
                    </div>
                </div>

                {/* Income & Expense */}
                <div className="md:col-span-4 flex flex-col">
                    <div className="flex-1 p-6 md:p-8 border-b border-black/10 dark:border-white/10 flex flex-col justify-between hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10 transition-colors">
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">INCOME (30D)</span>
                            <ArrowDownRight size={16} strokeWidth={1.5} className="text-emerald-600 dark:text-emerald-500" />
                        </div>
                        <div className="mt-8 text-right">
                            <p className="text-2xl md:text-3xl font-semibold tracking-tight text-emerald-600 dark:text-emerald-500 truncate">
                                {totalIncome.toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>
                    <div className="flex-1 p-6 md:p-8 flex flex-col justify-between hover:bg-rose-50/30 dark:hover:bg-rose-950/10 transition-colors">
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">EXPENSE (30D)</span>
                            <ArrowUpRight size={16} strokeWidth={1.5} className="text-rose-600 dark:text-rose-500" />
                        </div>
                        <div className="mt-8 text-right">
                            <p className="text-2xl md:text-3xl font-semibold tracking-tight text-rose-600 dark:text-rose-500 truncate">
                                {totalExpense.toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Riwayat Transaksi Editorial */}
            <div className="pt-8">
                <div className="flex items-center justify-between mb-8 border-b border-black/10 dark:border-white/10 pb-4">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">RECENT LEDGER</span>
                    <Link href="/dashboard/transactions" className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        VIEW ARCHIVE →
                    </Link>
                </div>
                
                <div>
                    {recentTransactions.length === 0 ? (
                        <div className="py-24 flex flex-col items-center justify-center text-center border border-dashed border-black/20 dark:border-white/20">
                            <Activity size={24} strokeWidth={1} className="mb-4 opacity-30 text-blue-600" />
                            <p className="text-xs uppercase tracking-widest font-semibold text-zinc-500">NO RECORDS FOUND</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-black/10 dark:divide-white/10 border-t border-b border-black/10 dark:border-white/10">
                            {recentTransactions.map((tx: any) => {
                                const isIncome = tx.category?.type === 'INCOME'
                                return (
                                    <div key={tx.id} className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-black/5 dark:hover:bg-white/5 px-4 -mx-4 transition-colors relative group">
                                        
                                        <div className="flex items-center gap-6 md:w-1/3">
                                            {isIncome ? (
                                                <ArrowDownRight size={16} strokeWidth={1.5} className="text-emerald-600" />
                                            ) : (
                                                <ArrowUpRight size={16} strokeWidth={1.5} className="text-rose-600" />
                                            )}
                                            <p className="text-sm font-bold uppercase tracking-widest text-black dark:text-white truncate">
                                                {tx.title}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-8 md:w-1/3 justify-between md:justify-start text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                                            <span className="w-24 truncate flex items-center gap-2">
                                                {tx.category?.color && (
                                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tx.category.color }} />
                                                )}
                                                {tx.category?.name || 'UNCATEGORIZED'}
                                            </span>
                                            <span className="w-24 truncate text-right md:text-left">{tx.wallet.name}</span>
                                        </div>

                                        <div className="flex items-center justify-between md:w-1/3 md:justify-end text-sm font-bold tracking-wider">
                                            <span className="text-[10px] text-zinc-400 md:hidden">AMOUNT</span>
                                            <div className="flex items-center gap-4">
                                                <span className={isIncome ? 'text-emerald-600 dark:text-emerald-500' : 'text-black dark:text-white'}>
                                                    {isIncome ? '+' : '-'} {tx.amount.toLocaleString('id-ID')}
                                                </span>
                                                <form action={deleteTransaction.bind(null, tx.id)}>
                                                    <button type="submit" title="Delete Transaction" className="opacity-0 group-hover:opacity-100 text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-600 transition-all text-[8px] px-2 py-1 font-bold">
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
            </div>

        </div>
    )
}

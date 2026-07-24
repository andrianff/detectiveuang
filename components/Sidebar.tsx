'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Wallet, LogOut, Home, ArrowRightLeft, PieChart, Sparkles, CreditCard, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'

const menuItems = [
    { name: 'Ringkasan', path: '/dashboard', icon: Home },
    { name: 'Riwayat', path: '/dashboard/transactions', icon: ArrowRightLeft },
    { name: 'Anggaran', path: '/dashboard/budget', icon: PieChart },
    { name: 'Pengaturan', path: '/dashboard/settings', icon: Tag },
    { name: 'AI Advisor', path: '/dashboard/ai', icon: Sparkles },
]

export default function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-64 border-r border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-[#0A0A0A] h-screen sticky top-0 hidden md:flex flex-col">
            
            {/* Logo Area */}
            <div className="p-8 mb-4">
                <div className="flex items-center gap-3 text-blue-600 dark:text-blue-500">
                    <Wallet size={24} strokeWidth={1.5} />
                    <h2 className="text-xl font-bold tracking-tight text-black dark:text-white">
                        DetectiveUang
                    </h2>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                <div className="px-4 mb-4">
                    <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em]">Menu Utama</span>
                </div>
                {menuItems.map((item) => {
                    const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path))
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center gap-4 px-4 py-3 text-xs font-semibold transition-colors uppercase tracking-wider ${
                                isActive
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-zinc-500 dark:text-zinc-500 hover:text-black dark:hover:text-white'
                            }`}
                        >
                            <div className="w-4 flex justify-center">
                                {isActive && <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full" />}
                            </div>
                            <span>{item.name}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Logout */}
            <div className="p-8 border-t border-black/10 dark:border-white/10">
                <form action="/login" method="GET">
                    <button className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-black dark:hover:text-white transition-colors w-full">
                        <LogOut size={16} strokeWidth={1.5} />
                        <span>Keluar</span>
                    </button>
                </form>
            </div>
        </aside>
    )
}

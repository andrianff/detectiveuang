'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ArrowRightLeft, PieChart, Sparkles, Plus } from 'lucide-react'

export default function MobileNav() {
    const pathname = usePathname()

    const navItems = [
        { name: 'Ringkasan', path: '/dashboard', icon: Home },
        { name: 'Riwayat', path: '/dashboard/transactions', icon: ArrowRightLeft },
        { name: 'Tambah', path: '/dashboard/transactions/new', icon: Plus, isAction: true },
        { name: 'Anggaran', path: '/dashboard/budget', icon: PieChart },
        { name: 'Advisor', path: '/dashboard/ai', icon: Sparkles },
    ]

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FAFAFA] dark:bg-[#0A0A0A] border-t border-black/10 dark:border-white/10 pb-safe">
            <nav className="flex justify-around items-center px-4 pt-4 pb-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path))
                    const Icon = item.icon

                    if (item.isAction) {
                        return (
                            <Link key={item.path} href={item.path} className="flex flex-col items-center justify-center w-14 group">
                                <div className="flex items-center justify-center w-10 h-10 border border-blue-600 rounded-none bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-600 transition-colors">
                                    <Icon size={18} strokeWidth={1.5} />
                                </div>
                            </Link>
                        )
                    }

                    return (
                        <Link key={item.path} href={item.path} className="flex flex-col items-center gap-2 w-14">
                            <Icon size={20} strokeWidth={isActive ? 1.5 : 1} className={isActive ? "text-blue-600 dark:text-blue-400" : "text-zinc-400"} />
                            <span className={`text-[9px] uppercase tracking-widest font-semibold ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400'}`}>
                                {item.name}
                            </span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}

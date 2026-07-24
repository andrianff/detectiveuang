import { getWallets, createWallet, deleteWallet } from '@/features/wallet/actions'
import { getCategories, createCategory, deleteCategory } from '@/features/category/actions'
import { Input } from '@/components/ui/input'
import { Tag, CreditCard, Plus } from 'lucide-react'

export default async function SettingsPage() {
    const wallets = await getWallets()
    const categories = await getCategories()

    const incomeCategories = categories.filter(c => c.type === 'INCOME')
    const expenseCategories = categories.filter(c => c.type === 'EXPENSE')

    return (
        <div className="space-y-12 pb-24 md:pb-8">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-[#FAFAFA]/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-black/10 dark:border-white/10 -mt-6 pt-6 -mx-6 px-6 pb-6 mb-8 md:mb-0 md:static md:bg-transparent md:mt-0 md:pt-0 md:mx-0 md:px-0 md:pb-8">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-2 md:mb-4">SYSTEM SETTINGS</p>
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-black dark:text-white">
                        DATA MASTER
                    </h1>
                </div>
            </div>

            {/* WALLETS SECTION */}
            <section className="space-y-8">
                <div className="flex items-center gap-4 border-b border-black/10 dark:border-white/10 pb-4">
                    <CreditCard className="text-blue-600 dark:text-blue-500" size={20} strokeWidth={1.5} />
                    <h2 className="text-xl font-bold tracking-tight uppercase text-black dark:text-white">WALLETS & ACCOUNTS</h2>
                </div>

                <div className="grid md:grid-cols-12 gap-8 md:gap-12">
                    {/* Add Wallet Form */}
                    <div className="md:col-span-4">
                        <div className="border border-black/10 dark:border-white/10 p-6 bg-white/50 dark:bg-black/50">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-6">REGISTER NEW WALLET</p>
                            <form action={createWallet} className="space-y-6">
                                <div>
                                    <Input name="name" placeholder="E.G. BANK BCA" required className="rounded-none border-0 border-b border-black/20 dark:border-white/20 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-blue-600 shadow-none font-bold tracking-widest uppercase text-sm" />
                                </div>
                                <div>
                                    <Input name="balance" type="number" placeholder="STARTING BALANCE (IDR)" required className="rounded-none border-0 border-b border-black/20 dark:border-white/20 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-blue-600 shadow-none font-bold tracking-widest uppercase text-sm" />
                                </div>
                                <div className="flex items-center gap-4 pt-2">
                                    <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">COLOR</label>
                                    <Input name="color" type="color" className="h-8 w-16 p-0 border-0 bg-transparent cursor-pointer" defaultValue="#2563eb" />
                                </div>
                                <button type="submit" className="w-full border border-blue-600 py-3 text-xs tracking-[0.2em] font-bold uppercase bg-transparent text-blue-600 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center gap-2">
                                    <Plus size={14} /> ADD WALLET
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Wallets List */}
                    <div className="md:col-span-8 grid sm:grid-cols-2 gap-4">
                        {wallets.length === 0 ? (
                            <div className="col-span-2 p-8 border border-black/10 dark:border-white/10 text-center">
                                <p className="text-xs uppercase tracking-widest font-semibold text-zinc-500">NO WALLETS REGISTERED</p>
                            </div>
                        ) : (
                            wallets.map((wallet: any) => (
                                <div key={wallet.id} className="border border-black/10 dark:border-white/10 p-6 flex flex-col justify-between group hover:bg-black/5 dark:hover:bg-white/5 transition-colors relative overflow-hidden">
                                    <div className="absolute top-0 left-0 bottom-0 w-1" style={{ backgroundColor: wallet.color || '#2563eb' }} />
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-sm font-bold uppercase tracking-widest">{wallet.name}</h3>
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 mt-1">CURRENT BALANCE</p>
                                        </div>
                                        <form action={deleteWallet.bind(null, wallet.id)}>
                                            <button type="submit" title="Delete Wallet" className="opacity-0 group-hover:opacity-100 text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-600 transition-all text-[8px] px-2 py-1 font-bold">
                                                [ X ]
                                            </button>
                                        </form>
                                    </div>
                                    <div className="mt-6 flex items-baseline gap-2">
                                        <span className="text-xs font-semibold tracking-widest text-zinc-400">IDR</span>
                                        <span className="text-2xl font-bold tracking-tighter">
                                            {wallet.balance.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* CATEGORIES SECTION */}
            <section className="space-y-8 pt-8">
                <div className="flex items-center gap-4 border-b border-black/10 dark:border-white/10 pb-4">
                    <Tag className="text-blue-600 dark:text-blue-500" size={20} strokeWidth={1.5} />
                    <h2 className="text-xl font-bold tracking-tight uppercase text-black dark:text-white">TRANSACTION CATEGORIES</h2>
                </div>

                <div className="grid md:grid-cols-12 gap-8 md:gap-12">
                    {/* Add Category Form */}
                    <div className="md:col-span-4">
                        <div className="border border-black/10 dark:border-white/10 p-6 bg-white/50 dark:bg-black/50">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-6">CREATE NEW CATEGORY</p>
                            <form action={createCategory} className="space-y-6">
                                <div>
                                    <Input name="name" placeholder="E.G. GROCERIES" required className="rounded-none border-0 border-b border-black/20 dark:border-white/20 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-blue-600 shadow-none font-bold tracking-widest uppercase text-sm" />
                                </div>
                                <div>
                                    <select name="type" required className="w-full rounded-none border-0 border-b border-black/20 dark:border-white/20 bg-transparent px-0 py-2 focus-visible:ring-0 focus-visible:border-blue-600 shadow-none font-bold tracking-widest uppercase text-sm cursor-pointer outline-none">
                                        <option value="EXPENSE">EXPENSE (PENGELUARAN)</option>
                                        <option value="INCOME">INCOME (PEMASUKAN)</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-4 pt-2">
                                    <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">COLOR</label>
                                    <Input name="color" type="color" className="h-8 w-16 p-0 border-0 bg-transparent cursor-pointer" defaultValue="#f43f5e" />
                                </div>
                                <button type="submit" className="w-full border border-blue-600 py-3 text-xs tracking-[0.2em] font-bold uppercase bg-transparent text-blue-600 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center gap-2">
                                    <Plus size={14} /> ADD CATEGORY
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Categories List */}
                    <div className="md:col-span-8">
                        <div className="grid sm:grid-cols-2 gap-8">
                            
                            {/* EXPENSE CATEGORIES */}
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-600 mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-rose-600 rounded-full" /> EXPENSE (PENGELUARAN)
                                </p>
                                <div className="space-y-2 border-l border-black/10 dark:border-white/10 pl-4">
                                    {expenseCategories.length === 0 ? (
                                        <p className="text-xs uppercase tracking-widest font-semibold text-zinc-500 py-2">NO CATEGORIES</p>
                                    ) : (
                                        expenseCategories.map((c: any) => (
                                            <div key={c.id} className="flex items-center justify-between py-2 group">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-2 h-2 rounded-full opacity-50 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: c.color || '#f43f5e' }} />
                                                    <span className="text-sm font-bold uppercase tracking-widest">{c.name}</span>
                                                </div>
                                                {c.name !== 'INITIAL BALANCE' && (
                                                    <form action={deleteCategory.bind(null, c.id)}>
                                                        <button type="submit" title="Delete Category" className="opacity-0 group-hover:opacity-100 text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-600 transition-all text-[8px] px-2 py-1 font-bold">
                                                            [ X ]
                                                        </button>
                                                    </form>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* INCOME CATEGORIES */}
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-600 mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" /> INCOME (PEMASUKAN)
                                </p>
                                <div className="space-y-2 border-l border-black/10 dark:border-white/10 pl-4">
                                    {incomeCategories.length === 0 ? (
                                        <p className="text-xs uppercase tracking-widest font-semibold text-zinc-500 py-2">NO CATEGORIES</p>
                                    ) : (
                                        incomeCategories.map((c: any) => (
                                            <div key={c.id} className="flex items-center justify-between py-2 group">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-2 h-2 rounded-full opacity-50 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: c.color || '#10b981' }} />
                                                    <span className="text-sm font-bold uppercase tracking-widest">{c.name}</span>
                                                </div>
                                                {c.name !== 'INITIAL BALANCE' && (
                                                    <form action={deleteCategory.bind(null, c.id)}>
                                                        <button type="submit" title="Delete Category" className="opacity-0 group-hover:opacity-100 text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-600 transition-all text-[8px] px-2 py-1 font-bold">
                                                            [ X ]
                                                        </button>
                                                    </form>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

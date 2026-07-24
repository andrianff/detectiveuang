import { getCategories } from '@/features/category/actions'
import { createAllocationPocket } from '@/features/budget/actions'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewPocketPage() {
    const categories = await getCategories()
    const expenseCategories = categories.filter(c => c.type === 'EXPENSE')

    return (
        <div className="max-w-4xl mx-auto pb-24 md:pb-8">

            {/* Header */}
            <div className="sticky top-0 z-40 bg-[#FAFAFA]/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md flex items-center gap-6 border-b border-black/10 dark:border-white/10 -mt-6 pt-6 -mx-6 px-6 pb-4 mb-8 md:mb-12 md:static md:bg-transparent md:mt-0 md:pt-0 md:mx-0 md:px-0 md:pb-8">
                <Link href="/dashboard/budget" className="p-3 border border-black/10 dark:border-white/10 hover:border-blue-600 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-colors bg-[#FAFAFA] dark:bg-[#0A0A0A]">
                    <ArrowLeft size={20} strokeWidth={1.5} />
                </Link>
                <div>
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-500 uppercase">NEW POCKET</h1>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mt-1 md:mt-2">DEFINE SMART ALLOCATION</p>
                </div>
            </div>

            <form action={createAllocationPocket} className="space-y-0 divide-y divide-black/10 dark:divide-white/10 border-t border-b border-black/10 dark:border-white/10">
                
                {/* Pocket Name */}
                <div className="flex flex-col md:flex-row md:items-center py-8 md:py-12">
                    <label className="w-full md:w-1/4 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-4 md:mb-0">POCKET NAME</label>
                    <div className="w-full md:w-3/4">
                        <Input
                            name="name"
                            type="text"
                            placeholder="E.G. LIVING EXPENSES"
                            required
                            className="text-2xl md:text-4xl font-bold h-auto py-0 rounded-none bg-transparent border-0 focus-visible:ring-0 shadow-none px-0 tracking-tighter placeholder:text-black/10 dark:placeholder:text-white/10 text-black dark:text-white uppercase"
                        />
                    </div>
                </div>

                {/* Percentage */}
                <div className="flex flex-col md:flex-row md:items-center py-8 md:py-12">
                    <div className="w-full md:w-1/4 mb-4 md:mb-0">
                        <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 block mb-2">ALLOCATION %</label>
                        <p className="text-[10px] text-zinc-400 max-w-[200px]">Percentage of total monthly income to allocate to this pocket.</p>
                    </div>
                    <div className="w-full md:w-3/4 flex items-baseline gap-4">
                        <Input
                            name="percentage"
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            placeholder="50"
                            required
                            className="text-6xl md:text-8xl font-bold w-32 md:w-48 h-auto py-0 rounded-none bg-transparent border-0 border-b-2 border-black/20 dark:border-white/20 focus-visible:border-blue-600 dark:focus-visible:border-blue-500 focus-visible:ring-0 shadow-none px-0 tracking-tighter placeholder:text-black/10 dark:placeholder:text-white/10 text-blue-600 dark:text-blue-500"
                        />
                        <span className="text-4xl md:text-6xl font-bold text-zinc-300 dark:text-zinc-700">%</span>
                    </div>
                </div>

                {/* Categories Link */}
                <div className="flex flex-col md:flex-row py-8 md:py-12">
                    <div className="w-full md:w-1/4 mb-4 md:mb-0 pt-4">
                        <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 block mb-2">LINKED CATEGORIES</label>
                        <p className="text-[10px] text-zinc-400 max-w-[200px]">Select expense categories that will draw from this pocket limit.</p>
                    </div>
                    <div className="w-full md:w-3/4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {expenseCategories.length === 0 ? (
                                <p className="text-sm font-semibold text-zinc-500">NO EXPENSE CATEGORIES FOUND</p>
                            ) : (
                                expenseCategories.map(category => (
                                    <label key={category.id} className="flex items-center gap-4 p-4 border border-black/10 dark:border-white/10 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors has-[:checked]:border-blue-600 dark:has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50/50 dark:has-[:checked]:bg-blue-950/20">
                                        <input type="checkbox" name="categoryIds" value={category.id} className="w-4 h-4 rounded-none text-blue-600 border-black/20 dark:border-white/20 focus:ring-blue-600" />
                                        <span className="text-xs font-bold uppercase tracking-widest">{category.name}</span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="pt-12 pb-12 border-b-0 border-t-0">
                    <button type="submit" className="w-full border border-blue-600 py-6 text-sm tracking-[0.2em] font-bold uppercase bg-blue-600 text-white hover:bg-transparent hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        CREATE POCKET
                    </button>
                </div>

            </form>
        </div>
    )
}

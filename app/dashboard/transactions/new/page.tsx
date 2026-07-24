import { getWallets } from '@/features/wallet/actions'
import { getCategories } from '@/features/category/actions'
import { createTransaction } from '@/features/transaction/actions'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewTransactionPage() {
    const wallets = await getWallets()
    const categories = await getCategories()

    return (
        <div className="max-w-4xl mx-auto pb-24 md:pb-8">

            {/* Header */}
            <div className="sticky top-0 z-40 bg-[#FAFAFA]/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md flex items-center gap-6 border-b border-black/10 dark:border-white/10 -mt-6 pt-6 -mx-6 px-6 pb-4 mb-8 md:mb-12 md:static md:bg-transparent md:mt-0 md:pt-0 md:mx-0 md:px-0 md:pb-8">
                <Link href="/dashboard" className="p-3 border border-black/10 dark:border-white/10 hover:border-blue-600 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-colors bg-[#FAFAFA] dark:bg-[#0A0A0A]">
                    <ArrowLeft size={20} strokeWidth={1.5} />
                </Link>
                <div>
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-500 uppercase">NEW RECORD</h1>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mt-1 md:mt-2">INPUT TRANSACTION DETAILS</p>
                </div>
            </div>

            <form action={createTransaction} className="space-y-0 divide-y divide-black/10 dark:divide-white/10 border-t border-b border-black/10 dark:border-white/10">
                
                {/* Nominal */}
                <div className="flex flex-col md:flex-row md:items-center py-12 md:py-16">
                    <label className="w-full md:w-1/4 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-4 md:mb-0">AMOUNT (IDR)</label>
                    <div className="w-full md:w-3/4">
                        <Input
                            name="amount"
                            type="number"
                            placeholder="0"
                            required
                            className="text-6xl md:text-8xl font-bold h-auto py-0 rounded-none bg-transparent border-0 focus-visible:ring-0 shadow-none px-0 tracking-tighter placeholder:text-black/10 dark:placeholder:text-white/10 text-blue-600 dark:text-blue-500"
                        />
                    </div>
                </div>



                {/* Dompet */}
                <div className="flex flex-col md:flex-row md:items-center py-8">
                    <label className="w-full md:w-1/4 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-4 md:mb-0">WALLET</label>
                    <div className="w-full md:w-3/4">
                        <select name="walletId" required className="flex w-full items-center justify-between border-0 bg-transparent py-2 text-sm md:text-base font-semibold uppercase tracking-widest focus:outline-none focus:text-blue-600 dark:focus:text-blue-500 rounded-none cursor-pointer px-0">
                            <option value="" className="text-zinc-500">SELECT SOURCE...</option>
                            {wallets.map(w => <option key={w.id} value={w.id}>{w.name} (Rp {w.balance.toLocaleString('id-ID')})</option>)}
                        </select>
                    </div>
                </div>

                {/* Kategori */}
                <div className="flex flex-col md:flex-row md:items-center py-8">
                    <label className="w-full md:w-1/4 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-4 md:mb-0">CATEGORY</label>
                    <div className="w-full md:w-3/4">
                        <select name="categoryId" required className="flex w-full items-center justify-between border-0 bg-transparent py-2 text-sm md:text-base font-semibold uppercase tracking-widest focus:outline-none focus:text-blue-600 dark:focus:text-blue-500 rounded-none cursor-pointer px-0">
                            <option value="" className="text-zinc-500">SELECT CATEGORY...</option>
                            <optgroup label="EXPENSE">
                                {categories.filter(c => c.type === 'EXPENSE').map(c => <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>)}
                            </optgroup>
                            <optgroup label="INCOME">
                                {categories.filter(c => c.type === 'INCOME').map(c => <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>)}
                            </optgroup>
                        </select>
                    </div>
                </div>

                {/* Judul */}
                <div className="flex flex-col md:flex-row md:items-center py-8">
                    <label className="w-full md:w-1/4 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-4 md:mb-0">TITLE</label>
                    <div className="w-full md:w-3/4">
                        <Input name="title" required placeholder="E.G. COFFEE" className="rounded-none border-0 bg-transparent px-0 py-2 h-auto text-sm md:text-base font-bold uppercase tracking-widest focus-visible:ring-0 focus-visible:text-blue-600 dark:focus-visible:text-blue-500 shadow-none placeholder:text-zinc-300" />
                    </div>
                </div>

                {/* Catatan */}
                <div className="flex flex-col md:flex-row md:items-center py-8">
                    <label className="w-full md:w-1/4 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-4 md:mb-0">NOTES</label>
                    <div className="w-full md:w-3/4">
                        <Input name="note" placeholder="OPTIONAL DETAILS..." className="rounded-none border-0 bg-transparent px-0 py-2 h-auto text-sm md:text-base font-bold uppercase tracking-widest focus-visible:ring-0 focus-visible:text-blue-600 dark:focus-visible:text-blue-500 shadow-none placeholder:text-zinc-300" />
                    </div>
                </div>

                {/* Tanggal */}
                <div className="flex flex-col md:flex-row md:items-center py-8">
                    <label className="w-full md:w-1/4 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-4 md:mb-0">DATE</label>
                    <div className="w-full md:w-3/4">
                        <Input name="date" type="datetime-local" className="rounded-none border-0 bg-transparent px-0 py-2 h-auto text-sm md:text-base font-bold uppercase tracking-widest focus-visible:ring-0 focus-visible:text-blue-600 dark:focus-visible:text-blue-500 shadow-none" />
                    </div>
                </div>

                <div className="pt-12 pb-12 border-b-0 border-t-0">
                    <button type="submit" className="w-full border border-blue-600 py-6 text-sm tracking-[0.2em] font-bold uppercase bg-blue-600 text-white hover:bg-transparent hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        SUBMIT RECORD
                    </button>
                </div>

            </form>
        </div>
    )
}

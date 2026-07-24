'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/utils/supabase/server'
import prisma from '@/lib/prisma'

export async function createTransaction(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Anda harus login terlebih dahulu')

    const amount = parseFloat(formData.get('amount') as string)
    const walletId = formData.get('walletId') as string
    const categoryId = formData.get('categoryId') as string
    const title = formData.get('title') as string
    const note = formData.get('note') as string

    // Mengambil tanggal (jika dikosongkan, pakai tanggal hari ini)
    const dateRaw = formData.get('date') as string
    const transactionDate = dateRaw ? new Date(dateRaw) : new Date()

    // 0. Ambil kategori dari database untuk memastikan validitas tipenya (INCOME/EXPENSE)
    const category = await prisma.category.findUnique({
        where: { id: categoryId, userId: user.id }
    })
    if (!category) throw new Error('Kategori tidak valid')

    const actualType = category.type

    // Kita gunakan Prisma $transaction agar jika salah satu gagal, semuanya dibatalkan (sangat aman)
    await prisma.$transaction(async (tx: any) => {
        // 1. Catat riwayat transaksi
        await tx.transaction.create({
            data: {
                title,
                amount,
                walletId,
                categoryId,
                note,
                transactionDate,
            }
        })

        // 2. Update saldo di Dompet (Wallet) secara otomatis bersumber dari TIPE KATEGORI (bulletproof)
        if (actualType === 'INCOME') {
            await tx.wallet.update({
                where: { id: walletId },
                data: { balance: { increment: amount } }
            })
        } else if (actualType === 'EXPENSE') {
            await tx.wallet.update({
                where: { id: walletId },
                data: { balance: { decrement: amount } }
            })
        }
    })

    // Setelah sukses menyimpan, refresh data dan kembalikan ke halaman awal
    revalidatePath('/dashboard', 'layout')
    redirect('/dashboard')
}

export async function deleteTransaction(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Anda harus login terlebih dahulu')

    // 0. Cari transaksi yang akan dihapus beserta tipe kategorinya
    const transaction = await prisma.transaction.findUnique({
        where: { id },
        include: { category: true }
    })
    
    if (!transaction) throw new Error('Transaksi tidak ditemukan')

    // Pastikan dompetnya milik user yang login
    const wallet = await prisma.wallet.findUnique({ where: { id: transaction.walletId, userId: user.id } })
    if (!wallet) throw new Error('Akses ditolak')

    // Reverse (Kembalikan) saldonya
    const actualType = transaction.category?.type

    await prisma.$transaction(async (tx) => {
        // 1. Hapus transaksi
        await tx.transaction.delete({
            where: { id }
        })

        // 2. Reverse math pada dompet
        if (actualType === 'INCOME') {
            await tx.wallet.update({
                where: { id: transaction.walletId },
                data: { balance: { decrement: transaction.amount } } // Hapus income = kurangi uang
            })
        } else if (actualType === 'EXPENSE') {
            await tx.wallet.update({
                where: { id: transaction.walletId },
                data: { balance: { increment: transaction.amount } } // Hapus pengeluaran = refund uang
            })
        }
    })

    revalidatePath('/dashboard', 'layout')
}

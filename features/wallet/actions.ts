'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/utils/supabase/server'
import prisma from '@/lib/prisma'

// 1. Fungsi untuk mengambil semua dompet milik user
export async function getWallets() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // Tarik data dari database (diurutkan dari yang terbaru)
    const wallets = await prisma.wallet.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
    })

    return wallets
}

// 2. Fungsi untuk membuat dompet baru
export async function createWallet(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Anda harus login terlebih dahulu')

    const name = formData.get('name') as string
    const initialBalance = parseFloat(formData.get('balance') as string) || 0
    const color = formData.get('color') as string

    // Gunakan Prisma Transaction agar aman
    await prisma.$transaction(async (tx) => {
        // 1. Buat Dompet dengan saldo 0 terlebih dahulu
        const wallet = await tx.wallet.create({
            data: {
                name,
                balance: 0,
                color,
                userId: user.id,
            }
        })

        // 2. Jika ada saldo awal, buatkan kategori khusus dan transaksi
        if (initialBalance > 0) {
            // Cari kategori "INITIAL BALANCE" atau buat baru
            let initCategory = await tx.category.findFirst({
                where: { userId: user.id, name: 'INITIAL BALANCE', type: 'INCOME' }
            })

            if (!initCategory) {
                initCategory = await tx.category.create({
                    data: {
                        userId: user.id,
                        name: 'INITIAL BALANCE',
                        type: 'INCOME',
                        color: '#10b981' // Emerald
                    }
                })
            }

            // Buat transaksi pemasukan awal
            await tx.transaction.create({
                data: {
                    walletId: wallet.id,
                    categoryId: initCategory.id,
                    title: 'INITIAL WALLET SETUP',
                    amount: initialBalance,
                    transactionDate: new Date(),
                }
            })

            // Update saldo dompet
            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { increment: initialBalance } }
            })
        }
    })

    revalidatePath('/dashboard/settings')
    redirect('/dashboard/settings')
}

// 3. Fungsi untuk menghapus dompet
export async function deleteWallet(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // Karena di schema.prisma Transaction -> Wallet memakai onDelete: Cascade, 
    // semua transaksi di dompet ini akan ikut terhapus otomatis!
    await prisma.wallet.delete({
        where: {
            id,
            userId: user.id
        }
    })

    revalidatePath('/dashboard/settings')
    revalidatePath('/dashboard')
}

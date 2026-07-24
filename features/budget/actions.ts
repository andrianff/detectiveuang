'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/utils/supabase/server'
import prisma from '@/lib/prisma'

// 1. Dapatkan Total Pendapatan Bulan Ini (untuk dasar perhitungan persentase)
export async function getCurrentMonthIncome() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) redirect('/login')

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    const incomeTransactions = await prisma.transaction.findMany({
        where: {
            wallet: { userId: user.id },
            category: { type: 'INCOME' },
            transactionDate: {
                gte: startOfMonth,
                lte: endOfMonth
            }
        },
        select: { amount: true }
    })

    return incomeTransactions.reduce((acc, curr) => acc + curr.amount, 0)
}

// 2. Dapatkan Kantong Alokasi beserta pemakaiannya
export async function getAllocationPockets() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) redirect('/login')

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    // Dapatkan data kantong dan kategorinya
    const pockets = await prisma.allocationPocket.findMany({
        where: { userId: user.id },
        include: {
            categories: true
        }
    })

    // Hitung pengeluaran untuk setiap kantong di bulan ini
    const pocketsWithSpent = await Promise.all(pockets.map(async (pocket) => {
        const categoryIds = pocket.categories.map(c => c.id)
        
        const expenses = await prisma.transaction.findMany({
            where: {
                categoryId: { in: categoryIds },
                transactionDate: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            },
            select: { amount: true }
        })

        const spent = expenses.reduce((acc, curr) => acc + curr.amount, 0)
        return { ...pocket, spent }
    }))

    return pocketsWithSpent
}

// 3. Buat Kantong Alokasi Baru
export async function createAllocationPocket(formData: FormData) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) redirect('/login')

    const name = formData.get('name') as string
    const percentage = parseFloat(formData.get('percentage') as string)
    
    // categoryIds dari select multiple / checkbox
    const categoryIds = formData.getAll('categoryIds') as string[]

    const pocket = await prisma.allocationPocket.create({
        data: {
            userId: user.id,
            name,
            percentage,
        }
    })

    // Assign kategori ke kantong ini
    if (categoryIds.length > 0) {
        await prisma.category.updateMany({
            where: {
                id: { in: categoryIds },
                userId: user.id
            },
            data: {
                allocationPocketId: pocket.id
            }
        })
    }

    revalidatePath('/dashboard/budget')
    redirect('/dashboard/budget')
}

// 4. Hapus Kantong Alokasi
export async function deleteAllocationPocket(id: string) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) redirect('/login')

    await prisma.allocationPocket.delete({
        where: {
            id,
            userId: user.id
        }
    })

    revalidatePath('/dashboard/budget')
}

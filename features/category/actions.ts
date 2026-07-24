'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/utils/supabase/server'
import prisma from '@/lib/prisma'

// 1. Mengambil semua kategori milik user
export async function getCategories() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const categories = await prisma.category.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
    })

    return categories
}

// 2. Menyimpan kategori baru
export async function createCategory(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Anda harus login terlebih dahulu')

    const name = formData.get('name') as string
    const type = formData.get('type') as string // "INCOME" atau "EXPENSE"
    const color = formData.get('color') as string

    await prisma.category.create({
        data: {
            name,
            type, // Menyimpan jenis kategori (Pemasukan/Pengeluaran)
            color,
            userId: user.id,
        }
    })

    revalidatePath('/dashboard/settings')
    redirect('/dashboard/settings')
}

// 3. Menghapus kategori
export async function deleteCategory(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    await prisma.category.delete({
        where: {
            id,
            userId: user.id
        }
    })

    revalidatePath('/dashboard/settings')
    revalidatePath('/dashboard')
}

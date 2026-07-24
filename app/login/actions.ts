'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/utils/supabase/server'
import prisma from '@/lib/prisma'

export async function login(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
        redirect('/login?message=Email atau password salah')
    }

    // FIX #3: Upsert user ke Prisma hanya terjadi saat login, BUKAN di setiap page load
    if (data.user) {
        await prisma.user.upsert({
            where: { id: data.user.id },
            update: {
                email: data.user.email!,
                name: data.user.user_metadata?.name || 'User',
            },
            create: {
                id: data.user.id,
                email: data.user.email!,
                name: data.user.user_metadata?.name || 'User',
            },
        })
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()
    const email = (formData.get('email') as string).trim()
    const password = formData.get('password') as string
    const name = formData.get('name') as string

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { name }
        }
    })

    if (error) {
        console.error("Supabase Signup Error:", error.message)
        redirect(`/login?message=${error.message}`)
    }

    // Upsert user ke Prisma saat signup juga
    if (data.user) {
        await prisma.user.upsert({
            where: { id: data.user.id },
            update: { email: data.user.email!, name },
            create: { id: data.user.id, email: data.user.email!, name },
        })
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

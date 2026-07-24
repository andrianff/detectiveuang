'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
        // Jika gagal, kembalikan ke halaman login dengan pesan error
        redirect('/login?message=Email atau password salah')
    }

    // Jika sukses, bersihkan cache dan arahkan ke dashboard
    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()
    const email = (formData.get('email') as string).trim()
    const password = formData.get('password') as string
    const name = formData.get('name') as string

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { name }
        }
    })

    if (error) {
        // Tampilkan error asli di terminal VS Code
        console.error("Supabase Signup Error:", error.message)

        // Tampilkan error asli di layar browser
        redirect(`/login?message=${error.message}`)
    }

    // Secara default Supabase mengirim email konfirmasi. 
    // redirect('/login?message=Berhasil! Silakan cek email Anda untuk verifikasi.')
    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

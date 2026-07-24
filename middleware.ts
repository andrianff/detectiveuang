import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
    // Buat response kosong yang akan dilanjutkan
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Memanggil getUser() akan me-refresh token auth jika expired
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // (Nanti kita bisa menambahkan logika di sini: misalnya jika user belum login 
    // tapi mencoba akses /dashboard, kita arahkan / redirect ke /login)

    return supabaseResponse
}

// Konfigurasi agar middleware berjalan di semua halaman KECUALI file statis/gambar
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}

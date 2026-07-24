import { redirect } from 'next/navigation'
import { createClient } from '@/lib/utils/supabase/server'
import Sidebar from '@/components/Sidebar'
import MobileNav from '@/components/MobileNav'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/login')
    }

    // FIX #3: Hapus upsert dari sini - sudah dipindahkan ke login/signup action
    // sehingga query database tidak lagi dijalankan di setiap navigasi halaman

    return (
        <div className="flex min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] text-zinc-900 dark:text-zinc-50 relative selection:bg-blue-600 selection:text-white dark:selection:bg-blue-500 dark:selection:text-black">
            <Sidebar />

            <main className="flex-1 w-full min-w-0">
                <div className="max-w-6xl mx-auto w-full p-6 md:p-12 pb-32 md:pb-12">
                    {children}
                </div>
            </main>

            <MobileNav />
        </div>
    )
}

import { login, signup } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

// Next.js 15 menangani searchParams secara asynchronous
export default async function LoginPage(props: { searchParams: Promise<{ message: string }> }) {
    const searchParams = await props.searchParams;

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
            <Card className="w-full max-w-md shadow-xl border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-xl">
                <form>
                    <CardHeader className="space-y-2 text-center">
                        <CardTitle className="text-3xl font-bold tracking-tight">DETECTIVEUANG</CardTitle>
                        <CardDescription>
                            Masuk atau daftar untuk mengelola keuangan Anda.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {searchParams?.message && (
                            <div className="p-3 text-sm text-center text-red-500 bg-red-100/50 dark:bg-red-900/20 rounded-lg">
                                {searchParams.message}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="name">Nama Lengkap (Khusus Daftar)</label>
                            <Input id="name" name="name" placeholder="John Doe" className="rounded-lg" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="email">Email</label>
                            <Input id="email" name="email" type="email" placeholder="nama@email.com" required className="rounded-lg" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="password">Password</label>
                            <Input id="password" name="password" type="password" required className="rounded-lg" />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3">
                        <Button type="submit" formAction={login} className="w-full rounded-lg" size="lg">
                            Masuk
                        </Button>
                        <Button type="submit" formAction={signup} variant="outline" className="w-full rounded-lg" size="lg">
                            Daftar Baru
                        </Button>

                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}

'use server'

import { createClient } from '@/lib/utils/supabase/server'
import prisma from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'

export type ChatMessage = {
    role: 'user' | 'model' | 'system'
    content: string
}

export async function chatWithAdvisor(history: ChatMessage[], newMessage: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } })

    // Dapatkan data 30 hari terakhir untuk konteks
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const transactions = await prisma.transaction.findMany({
        where: {
            wallet: { userId: user.id },
            transactionDate: { gte: thirtyDaysAgo }
        },
        include: { category: true, wallet: true },
        orderBy: { transactionDate: 'desc' }
    })

    const wallets = await prisma.wallet.findMany({
        where: { userId: user.id }
    })
    const totalBalance = wallets.reduce((sum: number, w: any) => sum + w.balance, 0)

    let totalIncome = 0
    let totalExpense = 0
    const expensesByCategory: Record<string, number> = {}

    transactions.forEach(tx => {
        if (tx.category?.type === 'INCOME') totalIncome += tx.amount
        if (tx.category?.type === 'EXPENSE') {
            totalExpense += tx.amount
            const catName = tx.category.name || 'Lainnya'
            expensesByCategory[catName] = (expensesByCategory[catName] || 0) + tx.amount
        }
    })

    const systemPrompt = `
Anda adalah "Detective Uang", penasihat keuangan pribadi yang tegas, profesional, dan bergaya "brutalist".
Jawablah pertanyaan user dengan langsung, tanpa basa-basi. Jika pengeluaran mereka buruk, tegur mereka. Jika baik, berikan apresiasi dingin.
Jangan pernah memberikan salam berulang jika sudah dalam percakapan.

Data keuangan user 30 hari terakhir sebagai konteks Anda (jangan diulangi kecuali relevan dengan pertanyaan):
- Nama User: ${dbUser?.name || 'Kawan'}
- Total Saldo Semua Dompet: Rp ${totalBalance.toLocaleString('id-ID')}
- Pemasukan 30 hari terakhir: Rp ${totalIncome.toLocaleString('id-ID')}
- Pengeluaran 30 hari terakhir: Rp ${totalExpense.toLocaleString('id-ID')}
- Rincian Kategori Pengeluaran:
${Object.entries(expensesByCategory).map(([k, v]) => `  * ${k}: Rp ${v.toLocaleString('id-ID')}`).join('\n')}
`

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
        return "ERROR: Kunci API Gemini belum dikonfigurasi di file .env. Tambahkan GEMINI_API_KEY."
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ 
            model: "gemini-flash-latest",
            systemInstruction: systemPrompt 
        })
        
        // Konversi history ke format yang dipahami Gemini
        const formattedHistory = history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }))

        // Memulai sesi chat dengan history
        const chat = model.startChat({
            history: formattedHistory,
        })

        const result = await chat.sendMessage(newMessage)
        return result.response.text()

    } catch (error: any) {
        console.error("AI Error:", error)
        return "TERJADI KESALAHAN PADA SISTEM ANALISIS: " + (error.message || "API KEY TIDAK VALID ATAU JARINGAN BERMASALAH.")
    }
}

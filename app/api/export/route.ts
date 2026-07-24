import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/utils/supabase/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const timeframe = searchParams.get('timeframe') || 'all'
    const categoryId = searchParams.get('category') || 'all'

    // Build Where Clause identical to the one in Transactions page
    let dateFilter: any = undefined
    if (timeframe === '7days') {
        const d = new Date(); d.setDate(d.getDate() - 7); dateFilter = { gte: d }
    } else if (timeframe === '30days') {
        const d = new Date(); d.setDate(d.getDate() - 30); dateFilter = { gte: d }
    } else if (timeframe === 'thisMonth') {
        const d = new Date(); const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1); dateFilter = { gte: startOfMonth }
    }

    const whereClause: any = {
        wallet: { userId: user.id },
        ...(dateFilter ? { transactionDate: dateFilter } : {}),
        ...(categoryId !== 'all' ? { categoryId } : {})
    }

    const transactions = await prisma.transaction.findMany({
        where: whereClause,
        orderBy: { transactionDate: 'desc' },
        include: { category: true, wallet: true }
    })

    // Generate CSV Content
    // CSV Header
    let csvContent = "TANGGAL,TIPE,KATEGORI,DOMPET,JUDUL,CATATAN,NOMINAL\n"

    transactions.forEach((tx: any) => {
        const date = new Date(tx.transactionDate).toISOString().split('T')[0]
        const type = tx.category?.type || 'UNCATEGORIZED'
        const category = tx.category?.name || 'UNCATEGORIZED'
        const wallet = tx.wallet.name
        // Escape quotes and wrap in quotes for safe CSV parsing
        const title = `"${tx.title.replace(/"/g, '""')}"`
        const note = tx.note ? `"${tx.note.replace(/"/g, '""')}"` : '""'
        const amount = tx.amount

        csvContent += `${date},${type},"${category}","${wallet}",${title},${note},${amount}\n`
    })

    // Prepare Response with CSV headers
    return new NextResponse(csvContent, {
        status: 200,
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="detectiveuang-report-${new Date().getTime()}.csv"`
        }
    })
}

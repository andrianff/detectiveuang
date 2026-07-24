'use client'

import { useState, useRef, useEffect } from 'react'
import { chatWithAdvisor, ChatMessage } from '@/features/ai/actions'
import { Sparkles, BrainCircuit, Activity, ArrowRight, CornerDownRight } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function AIAdvisorPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const chatEndRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, loading])

    const handleSend = async () => {
        if (!input.trim()) return

        const userMsg = input.trim()
        setInput('')
        setError(null)
        
        const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userMsg }]
        setMessages(newMessages)
        setLoading(true)

        try {
            // Kita kirim history percakapan sejauh ini
            const aiResponse = await chatWithAdvisor(newMessages, userMsg)
            setMessages([...newMessages, { role: 'model', content: aiResponse }])
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan sistem.')
            // Hapus pesan user terakhir jika gagal agar bisa diulang
            setMessages(messages) 
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-2rem)] max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex-none bg-[#FAFAFA]/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-black/10 dark:border-white/10 -mt-6 pt-6 -mx-6 px-6 pb-6 mb-4 md:mb-0 md:static md:bg-transparent md:mt-0 md:pt-0 md:mx-0 md:px-0 md:pb-6">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-2 md:mb-4">DETECTIVE AI</p>
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-black dark:text-white flex items-center gap-4">
                        FINANCIAL ADVISOR <BrainCircuit className="w-8 h-8 md:w-12 md:h-12 text-blue-600" />
                    </h1>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/50 p-4 md:p-8 flex flex-col gap-6 scroll-smooth">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center px-4">
                        <Sparkles className="w-16 h-16 text-blue-600 mb-6 opacity-20" />
                        <h2 className="text-xl font-bold tracking-tight uppercase">SYSTEM READY</h2>
                        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mt-2 max-w-md">
                            I AM READY TO SCAN YOUR LAST 30 DAYS OF TRANSACTIONS. WHAT DO YOU WANT TO KNOW ABOUT YOUR FINANCES?
                        </p>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${msg.role === 'user' ? 'text-emerald-600' : 'text-blue-600'}`}>
                                    {msg.role === 'user' ? 'YOU' : 'DETECTIVE UANG'}
                                </span>
                            </div>
                            <div className={`p-4 md:p-6 max-w-[90%] md:max-w-[80%] ${
                                msg.role === 'user' 
                                    ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-600/30' 
                                    : 'bg-[#FAFAFA] dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10'
                            }`}>
                                <div className="text-sm font-semibold tracking-wide leading-relaxed prose prose-sm dark:prose-invert prose-zinc max-w-none prose-p:my-1 prose-ul:my-2 prose-li:my-0.5">
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ))
                )}
                
                {loading && (
                    <div className="flex flex-col items-start">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">DETECTIVE UANG</span>
                        </div>
                        <div className="p-4 md:p-6 bg-[#FAFAFA] dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10">
                            <Activity size={16} className="text-blue-600 animate-pulse" />
                        </div>
                    </div>
                )}
                
                {error && (
                    <div className="p-4 border border-rose-600 bg-rose-50/50 text-rose-600 text-xs font-bold uppercase">
                        {error}
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex-none pt-4">
                <div className="relative flex items-center">
                    <textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="ASK ABOUT YOUR BUDGET, EXPENSES, OR FINANCIAL ADVICE..."
                        className="w-full min-h-[60px] max-h-[120px] bg-transparent border border-black/20 dark:border-white/20 p-4 pr-16 text-sm font-bold tracking-wide uppercase resize-none focus:outline-none focus:border-blue-600 transition-colors"
                        disabled={loading}
                    />
                    <button 
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="absolute right-4 p-2 bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                    >
                        <ArrowRight size={16} strokeWidth={2} />
                    </button>
                </div>
                <p className="text-[8px] font-bold tracking-widest uppercase text-zinc-400 mt-2 text-center md:text-left">
                    PRESS ENTER TO SEND. SHIFT+ENTER FOR NEW LINE. CHAT HISTORY IS TEMPORARY.
                </p>
            </div>
        </div>
    )
}

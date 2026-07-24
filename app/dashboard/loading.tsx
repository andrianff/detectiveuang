export default function DashboardLoading() {
    return (
        <div className="w-full h-[60vh] flex flex-col items-center justify-center space-y-8 animate-pulse">
            <div className="relative">
                {/* Lingkaran Loading Brutalist */}
                <div className="w-24 h-24 border-4 border-black/10 dark:border-white/10 rounded-full" />
                <div className="w-24 h-24 border-4 border-blue-600 dark:border-blue-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0" />
                
                {/* Kotak Putih/Hitam di tengah untuk efek kontras */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-black dark:bg-white" />
            </div>

            <div className="text-center space-y-2">
                <p className="text-sm md:text-base font-bold tracking-[0.3em] uppercase text-black dark:text-white">
                    FETCHING CLASSIFIED DATA
                </p>
                <p className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">
                    ESTABLISHING SECURE CONNECTION...
                </p>
            </div>
        </div>
    )
}

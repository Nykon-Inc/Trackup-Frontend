export const Loading = ({ count = 4 }: { count?: number }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
            {Array.from({ length: count }, (_, i) => (
                <div key={i} className="h-45 w-full bg-slate-100 animate-pulse rounded-xl" />
            ))}
        </div>
    )
}
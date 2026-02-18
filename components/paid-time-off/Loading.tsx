export const Loading = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-45 w-full bg-slate-100 animate-pulse rounded-xl" />
            ))}
        </div>
    )
}
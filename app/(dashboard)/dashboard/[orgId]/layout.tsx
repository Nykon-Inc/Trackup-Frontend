import React from 'react'

export default function layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-w-0 w-full flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto">
                {children}
            </div>
        </div>
    )
}

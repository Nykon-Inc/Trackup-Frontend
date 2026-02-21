import React from 'react'

export default function layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-w-0 w-full">{children}</div>
    )
}

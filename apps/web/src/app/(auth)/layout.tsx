import React from 'react'

export default function AuthLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            {children}
            <div className="bg-muted relative hidden lg:block">
                <img
                    src="/placeholder.svg"
                    alt="Image"
                    className="absolute inset-0 h-full w-full object-cover"
                />
            </div>
        </div>
    )
}

"use client"

import Link from "next/link"
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "./UI/Button"
import { ThemeToggle } from "./ThemeToggle"

export function Navbar() {
    const { data: session } = useSession()

    return (
        <header className="fixed top-0 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
            <div className="container flex h-14 max-w-screen-2xl items-center mx-auto px-4">
                <div className="mr-4 flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <span className="hidden font-bold sm:inline-block">
                            iLogitron Forms
                        </span>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        <Link href="/dashboard" className="transition-colors hover:text-foreground/80 text-foreground/60">
                            Dashboard
                        </Link>
                    </nav>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                    </div>
                    <nav className="flex items-center gap-2">
                        <ThemeToggle />
                        {session?.user ? (
                            <div className="flex items-center gap-2">
                                <span className="text-sm hidden sm:inline-block">{session.user.name || session.user.email}</span>
                                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                                    Sign Out
                                </Button>
                            </div>
                        ) : (
                            <Button variant="default" size="sm" onClick={() => signIn()}>
                                Sign In
                            </Button>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    )
}

"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "sonner";
import { Session } from "next-auth";

export function Providers({ children, session }: { children: React.ReactNode, session?: Session | null }) {
    return (
        <SessionProvider session={session}>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                {children}
                <Toaster position="bottom-right" />
            </ThemeProvider>
        </SessionProvider>
    );
}

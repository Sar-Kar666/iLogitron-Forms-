import type { Metadata } from "next";
import { Roboto } from "next/font/google"; // Fixed: Was imported but not used? No it is used.
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "iLogitron Forms",
  description: "Create and share forms easily",
};

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${roboto.variable} antialiased min-h-screen bg-background font-sans text-foreground`}
      >
        <Providers session={session}>
          <Navbar />
          <main className="pt-16">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}

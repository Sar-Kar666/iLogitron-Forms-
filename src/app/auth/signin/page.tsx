"use client"

import * as React from "react"
import { signIn } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/UI/Button"
import { Input } from "@/components/UI/Input"

export default function SignInPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
    const [isLoading, setIsLoading] = React.useState<boolean>(false)

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault()
        setIsLoading(true)

        const target = event.target as typeof event.target & {
            email: { value: string }
            password: { value: string }
        }

        const email = target.email.value
        const password = target.password.value

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
                callbackUrl,
            })

            if (result?.ok) {
                router.push(callbackUrl)
            } else {
                console.error("Login failed")
                // In a real app, show toast or error message
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container relative h-[800px] flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-zinc-900" />
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-6 w-6"
                    >
                        <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                    </svg>
                    iLogitron Forms
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;This library has saved me countless hours of work and
                            helped me deliver stunning designs to my clients faster than
                            ever before.&rdquo;
                        </p>
                        <footer className="text-sm">Sofia Davis</footer>
                    </blockquote>
                </div>
            </div>
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Sign in/up
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your email below to enter your account
                        </p>
                    </div>
                    <div className="grid gap-6">
                        <form onSubmit={onSubmit}>
                            <div className="grid gap-2">
                                <div className="grid gap-1">
                                    <Input
                                        id="email"
                                        placeholder="name@example.com"
                                        type="email"
                                        autoCapitalize="none"
                                        autoComplete="email"
                                        autoCorrect="off"
                                        disabled={isLoading}
                                    />
                                    <Input
                                        id="password"
                                        placeholder="Password"
                                        type="password"
                                        autoCapitalize="none"
                                        autoComplete="current-password"
                                        disabled={isLoading}
                                        className="mt-2"
                                    />
                                </div>
                                <Button disabled={isLoading}>
                                    {isLoading && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Sign In with Email
                                </Button>
                            </div>
                        </form>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or continue with
                                </span>
                            </div>
                        </div>
                        <Button variant="outline" type="button" disabled={isLoading} onClick={() => signIn("google", { callbackUrl })}>
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                                    <path
                                        fill="currentColor"
                                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 7.373-2.36 1.147-1.227 1.787-3.04 1.787-4.84 0-.427-.053-.747-.08-1.04h-9.067z"
                                    />
                                </svg>
                            )}
                            Google
                        </Button>
                    </div>
                    <p className="px-8 text-center text-sm text-muted-foreground">
                        By clicking continue, you agree to our{" "}
                        <a
                            href="/terms"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                            href="/privacy"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Privacy Policy
                        </a>
                        .
                    </p>
                </div>
            </div>
        </div>
    )
}

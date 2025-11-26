"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token") || "";

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setError("Invalid or missing token.");
                toast.error("Invalid or missing token.");
                return;
            }

            setIsLoading(true);
            try {
                await authClient.verifyEmail({ query: { token } });
                toast.success("Email verified successfully! Redirecting to login...");
                setMessage("Email verified! Redirecting...");
                setTimeout(() => router.push("/login"), 2000);
            } catch (err: any) {
                setError(err.message || "Email verification failed.");
                toast.error(err.message || "Email verification failed.");
            } finally {
                setIsLoading(false);
            }
        };

        verify();
    }, [token, router]);

    return (
        <div className="flex flex-col gap-4 p-6 md:p-10">
            <div className="flex justify-center gap-2 md:justify-start">
                <a href="/" className="flex items-center gap-2 font-medium">
                    <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                        {/* Your icon here */}
                    </div>
                    Debt Snowball.
                </a>
            </div>
            <div className="flex flex-1 items-center justify-center">
                <div className="w-full max-w-xs md:max-w-md">
                    <FieldGroup className={cn("flex flex-col items-center gap-4 text-center")}>
                        <h1 className="text-2xl font-bold">Verify Email</h1>
                        {isLoading && <p>Verifying...</p>}
                        {message && <p className="text-green-500">{message}</p>}
                        {error && <p className="text-red-500">{error}</p>}
                        {!isLoading && !message && error && (
                            <Button onClick={() => router.push("/login")}>Back to Login</Button>
                        )}
                    </FieldGroup>
                </div>
            </div>
        </div>
    );
}

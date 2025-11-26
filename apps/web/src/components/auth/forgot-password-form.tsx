"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

interface ForgotPasswordFormProps extends React.ComponentProps<"form"> { }

export function ForgotPasswordForm({ className, ...props }: ForgotPasswordFormProps) {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await authClient.requestPasswordReset({ email });
            toast.success("Check your email for the password reset link.");
        } catch (err: any) {
            toast.error(err.message || "Error sending reset email");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">Forgot your password?</h1>
                    <p className="text-muted-foreground text-sm">
                        Enter your email to receive a password reset link.
                    </p>
                    {message && <p className="text-green-500 mt-2">{message}</p>}
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                </div>

                <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </Field>

                <Field>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Sending..." : "Send Reset Link"}
                    </Button>
                </Field>

                <FieldDescription className="text-center mt-2">
                    Remembered your password? <a href="/login" className="underline underline-offset-4">Log in</a>
                </FieldDescription>
            </FieldGroup>
        </form>
    );
}

"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

interface SignUpFormProps extends React.ComponentProps<"form"> { }

export function SignUpForm({ className, ...props }: SignUpFormProps) {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { error: signUpError } = await authClient.signUp.email(
                { email, password, name },
                {
                    onError: () => {
                        toast.error(signUpError?.message || "Error signing up");
                    },
                    onSuccess: () => {
                        toast.success("Account created! Redirecting...");
                        setTimeout(() => router.push("/dashboard"), 1500);
                    },
                }
            );
        } catch (err: any) {
            toast.error(err.message || "Error signing up");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form
            className={cn("flex flex-col gap-6", className)}
            onSubmit={handleSubmit}
            {...props}
        >
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">Create an account</h1>
                    <p className="text-muted-foreground text-sm">
                        Enter your details below to sign up
                    </p>
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                </div>

                <Field>
                    <FieldLabel htmlFor="name">Full Name</FieldLabel>
                    <Input
                        id="name"
                        type="text"
                        placeholder="Your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </Field>

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
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </Field>

                <Field>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Signing up..." : "Sign up"}
                    </Button>
                </Field>

                <Field>
                    <FieldDescription className="text-center mt-2">
                        Already have an account?{" "}
                        <a href="/login" className="underline underline-offset-4">
                            Log in
                        </a>
                    </FieldDescription>
                </Field>
            </FieldGroup>
        </form>
    );
}

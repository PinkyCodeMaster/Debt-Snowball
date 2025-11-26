// import { sendOrganizationInvitation } from "@/lib/emails/organization-invitation";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI, organization } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import * as schema from "@/db/schema/user";
import { betterAuth } from "better-auth";
import { expo } from "@better-auth/expo";
import { db } from "@/db";


export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        autoSignIn: false,
        sendResetPassword: async ({ user, url, token }, request) => {
            // await sendEmail({
            //     to: user.email,
            //     subject: "Reset your password",
            //     text: `Click the link to reset your password: ${url}`,
            // });
            console.log(`Send password reset email to ${user.email} with link: http://localhost:3000/reset-password?token=${token}`);
        },
        onPasswordReset: async ({ user }, request) => {
            // your logic here
            console.log(`Password for user ${user.email} has been reset.`);
        },
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url, token }, request) => {
            console.log(`Send email verification to ${user.email} with link: http://localhost:3000/verify-email?token=${token}`);
            // await sendEmail({
            //     to: user.email,
            //     subject: "Verify your email address",
            //     text: `Click the link to verify your email: ${url}`,
            // });
        },
    },
    plugins: [
        expo(),
        organization({
            requireEmailVerificationOnInvitation: true, // optional
            async sendInvitationEmail(data) {
                const inviteLink = `http://localhost:3000/accept-invitation/${data.id}`;
                // send your email with inviteLink, data.email, etc.
                console.log(`Send invitation email to ${data.email} with link: ${inviteLink}`);
                // await sendOrganizationInvitation({
                //     email: data.email,
                //     inviterName: data.inviter.user.name,
                //     organizationName: data.organization.name,
                //     inviteLink,
                // });
            },
        }),
        openAPI(),
        nextCookies()
    ],
    trustedOrigins: [
        "http://localhost:3000",        // Trust localhost on port 3000
        "http://localhost:9000",        // Trust localhost on port 9000
        "myapp://",
        // Development mode - Expo's exp:// scheme with local IP ranges
        ...(process.env.NODE_ENV === "development" ? [
            "exp://*/*",                 // Trust all Expo development URLs
            "exp://10.0.0.*:*/*",        // Trust 10.0.0.x IP range
            "exp://192.168.*.*:*/*",     // Trust 192.168.x.x IP range
            "exp://172.*.*.*:*/*",       // Trust 172.x.x.x IP range
            "exp://localhost:*/*"        // Trust localhost
        ] : [])
    ],
});
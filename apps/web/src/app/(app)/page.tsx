// apps/web/src/app/(app)/page.tsx
import env from "@/env";
import { redirect } from "next/navigation";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export default function Home() {
  if (env.ENVIRONMENT === "development") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <Card className="p-16">
        <CardContent>
          <CardTitle className="text-6xl text-center">Coming Soon</CardTitle>
        </CardContent>
      </Card>
    </div>
  );
}

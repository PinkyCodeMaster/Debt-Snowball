// apps/web/src/app/(tabs)/layout.tsx
import { ReactNode } from "react";
import Link from "next/link";
import { Target, TrendingUp, PoundSterling, House } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TabsLayoutProps {
    children: ReactNode;
}

export default function TabsLayout({ children }: TabsLayoutProps) {
    return (
        <div className="flex flex-col h-screen">
            <div className="flex-1 overflow-auto">{children}</div>
            <Tabs defaultValue="baby-steps" className="border-t">
                <TabsList>
                    <TabsTrigger value="baby-steps" asChild>
                        <Link href="/baby-steps">
                            <Target className="w-5 h-5 mr-1" /> Baby Steps
                        </Link>
                    </TabsTrigger>
                    <TabsTrigger value="debt-snowball" asChild>
                        <Link href="/debt-snowball">
                            <TrendingUp className="w-5 h-5 mr-1" /> Debt Snowball
                        </Link>
                    </TabsTrigger>
                    <TabsTrigger value="income" asChild>
                        <Link href="/income">
                            <PoundSterling className="w-5 h-5 mr-1" /> Income
                        </Link>
                    </TabsTrigger>
                    <TabsTrigger value="budget" asChild>
                        <Link href="/budget">
                            <House className="w-5 h-5 mr-1" /> Budget
                        </Link>
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    );
}

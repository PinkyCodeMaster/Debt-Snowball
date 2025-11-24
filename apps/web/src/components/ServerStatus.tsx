"use client";

import { useEffect, useState } from "react";
import env from "@/env";

interface ServerData {
    status: string;
    uptime: number;
    timestamp: number;
}

export default function ServerStatus() {
    const [online, setOnline] = useState<boolean | null>(null);
    const [serverData, setServerData] = useState<ServerData | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        async function checkHealth() {
            try {
                const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/health`, { cache: "no-store" });
                if (!res.ok) throw new Error("Server error");
                const data = await res.json();
                setServerData(data);
                setOnline(true);
            } catch {
                setOnline(false);
                setServerData(null);
            }
        }

        checkHealth();
        const interval = setInterval(checkHealth, 5000); 

        return () => clearInterval(interval);
    }, []);

    const indicator = online === null
        ? "bg-gray-400"
        : online
            ? "bg-green-500"
            : "bg-red-500";

    const text = online
        ? "Online"
        : online === false
            ? "Offline"
            : "Checking...";

    const formatUptime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${hours}h ${minutes}m ${secs}s`;
    };

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString();
    };

    return (
        <div className="fixed bottom-4 left-4 z-50">
            <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2 rounded-full bg-black/80 px-4 py-2 text-sm text-white shadow-lg backdrop-blur hover:bg-black/90 transition-colors cursor-pointer"
            >
                <span className={`h-3 w-3 rounded-full ${indicator}`}></span>
                <span>Server: {text}</span>
            </button>

            {showDetails && serverData && online && (
                <div className="absolute bottom-full left-0 mb-2 bg-black/90 text-white text-xs rounded-lg p-3 shadow-lg backdrop-blur whitespace-nowrap">
                    <div>Uptime: {formatUptime(serverData.uptime)}</div>
                    <div>Status: {serverData.status}</div>
                    <div>Last Check: {formatTime(serverData.timestamp)}</div>
                </div>
            )}
        </div>
    );
}

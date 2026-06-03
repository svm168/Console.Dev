"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/components/providers/socket-provider";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Phone, Video, PhoneOff } from "lucide-react";

export const CallNotification = () => {
    const { socket } = useSocket();
    const { user } = useUser();
    const router = useRouter();
    const [call, setCall] = useState<any>(null);

    useEffect(() => {
        if(!socket || !user) return;
        
        const callKey = `user:${user.id}:call`;

        socket.on(callKey, (data: any) => {
            setCall(data);
            setTimeout(() => setCall(null), 30000); 
        });

        return () => {
            socket.off(callKey);
        }
    }, [socket, user]);

    if(!call) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 bg-white dark:bg-[#1E1F22] p-4 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col gap-y-4 animate-in slide-in-from-bottom-8">
            <div className="flex items-center gap-x-4 pr-6">
                <img src={call.callerImageUrl} alt="Caller" className="w-12 h-12 rounded-full animate-pulse shadow-md" />
                <div>
                    <p className="font-bold text-zinc-700 dark:text-zinc-200">{call.callerName}</p>
                    <p className="text-xs font-semibold text-zinc-500 flex items-center gap-x-1 mt-1">
                        {call.type === "video" ? <Video className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                        Incoming {call.type} call...
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-x-2">
                <button onClick={() => setCall(null)} className="flex-1 bg-rose-500 hover:bg-rose-600 transition text-white p-2 rounded-md flex justify-center items-center shadow-sm cursor-pointer">
                    <PhoneOff className="w-4 h-4" />
                </button>
                <button onClick={() => { router.push(call.url); setCall(null); }} className="flex-1 bg-emerald-500 hover:bg-emerald-600 transition text-white p-2 rounded-md flex justify-center items-center shadow-sm cursor-pointer">
                    {call.type === "video" ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                </button>
            </div>
        </div>
    )
}
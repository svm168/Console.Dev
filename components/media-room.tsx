"use client";

import { useEffect, useState } from "react";
import { LiveKitRoom, VideoConference, useRemoteParticipants, useRoomContext } from "@livekit/components-react";
import "@livekit/components-styles";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";

interface MediaRoomProps {
    chatId: string;
    video: boolean;
    audio: boolean;
}

function SyncLeave() {
    const remoteParticipants = useRemoteParticipants();
    const room = useRoomContext();
    const [hasJoined, setHasJoined] = useState(false);

    useEffect(() => {
        if(remoteParticipants.length > 0) setHasJoined(true);

        if(hasJoined && remoteParticipants.length === 0) room.disconnect();
    }, [remoteParticipants, hasJoined, room]);

    return null;
}

export const MediaRoom = ({chatId, video, audio}: MediaRoomProps) => {
    const { user } = useUser()
    const [token, setToken] = useState("")

    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if(!user) return;

        let name = "Anonymous";
        if (user.firstName && user.lastName) name = `${user.firstName} ${user.lastName}`;
        else if (user.firstName) name = user.firstName;
        else if (user.emailAddresses.length > 0) name = user.emailAddresses[0].emailAddress.split("@")[0];

        (async () => {
            try {
                const url = `/api/livekit?room=${chatId}&username=${encodeURIComponent(name)}&identity=${user.id}`;
                const res = await fetch(url)
                const data = await res.json()
                setToken(data.token)
            } catch (error) {
                console.log(error)
            }
        })()
    }, [user?.firstName, user?.lastName, user?.id, chatId])

    if(token === ""){
        return (
            <div className="flex flex-col flex-1 justify-center items-center">
                <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading...</p>
            </div>
        )
    }

    return (
        <div className={cn("h-[calc(100vh-27px)]", !video && "audio-only-room")}>
            <LiveKitRoom data-lk-theme="default" serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} token={token} connect={true} video={false} audio={false}
                onDisconnected={() => {
                    if(pathname?.includes("/conversations/")) router.push(pathname);
                }}
            >
                <VideoConference />
                {pathname?.includes("/conversations/") && <SyncLeave />}
            </LiveKitRoom>
        </div>
    )
}
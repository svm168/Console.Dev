"use client";

import { useEffect, useState } from "react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

interface MediaRoomProps {
    chatId: string;
    video: boolean;
    audio: boolean;
}

export const MediaRoom = ({chatId, video, audio}: MediaRoomProps) => {
    const { user } = useUser()
    const [token, setToken] = useState("")

    useEffect(() => {
        if(!user) return;

        let name = "Anonymous";
        if (user.firstName && user.lastName) name = `${user.firstName} ${user.lastName}`;
        else if (user.firstName) name = user.firstName;
        else if (user.emailAddresses.length > 0) name = user.emailAddresses[0].emailAddress.split("@")[0];

        const identity = user.id;

        (async () => {
            try {
                const res = await fetch(`/api/livekit?room=${chatId}&username=${name}&identity=${identity}`)
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
        <div className="h-[calc(100vh-27px)]">
        <LiveKitRoom data-lk-theme="default" serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} token={token} connect={true} video={video} audio={audio}>
            <VideoConference />
        </LiveKitRoom>
        </div>
    )
}
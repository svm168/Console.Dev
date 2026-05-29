"use client";

import { cn } from "@/lib/utils";
import { Channel, ChannelType, MemberRole, Server } from "@prisma/client";
import { Edit, Hash, Lock, Mic, Trash, Video, type LucideIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { ActionTooltip } from "@/components/action-tooltip";
import { ModalType, useModal } from "@/hooks/use-modal-store";
import { useEffect, useState } from "react";

interface ServerChannelProps {
    channel: Channel;
    server: Server;
    role?: MemberRole;
}

const iconMap: Record<ChannelType, LucideIcon> = {
    [ChannelType.TEXT]: Hash,
    [ChannelType.AUDIO]: Mic,
    [ChannelType.VIDEO]: Video,
}

export const ServerChannel = ({channel, server, role}: ServerChannelProps) => {
    const params = useParams()
    const router = useRouter()
    const { onOpen } = useModal()

    const Icon = iconMap[channel.type]

    const onClick = () => {
        router.push(`/servers/${params?.serverId}/channels/${channel.id}`)
    }

    const onAction = (event: React.MouseEvent, action: ModalType) => {
        event.stopPropagation()
        onOpen(action, { channel, server })
    }

    const [visible, setVisible] = useState(true)
    useEffect(() => {
        const handler = (event: Event) => {
            try {
                const id = (event as CustomEvent).detail
                if(id === channel.id) setVisible(false)
            } catch (error) {
                console.log(error)
            }
        }

        window.addEventListener("channel-deleted", handler as EventListener)

        return () => window.removeEventListener("channel-deleted", handler as EventListener)
    }, [channel.id])
    if(!visible) return null

    return (
        <button onClick={onClick} className={cn("group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1", params?.channelId === channel.id && "bg-zinc-700/20 dark:bg-zinc-700")} >
            <Icon className="shrink-0 w-5 h-5 text-zinc-500 dark:text-zinc-400" />
            <p className={cn("line-clamp-1 font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition", params?.channelId === channel.id && "text-primary dark:text-zinc-200 dark:group-hover:text-white")}>{channel.name}</p>
            {channel.name !== "general" && role !== MemberRole.GUEST && (
                <div className="ml-auto flex items-center gap-x-2">
                    <ActionTooltip label="Edit" >
                        <Edit onClick={(event) => onAction(event, "editChannel")} className="opacity-0 group-hover:opacity-100 w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition" />
                    </ActionTooltip>
                    <ActionTooltip label="Delete" >
                        <Trash onClick={(event) => onAction(event, "deleteChannel")} className="opacity-0 group-hover:opacity-100 w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition" />
                    </ActionTooltip>
                </div>
            )}
            {channel.name === "general" && (
                <Lock className="ml-auto w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            )}
        </button>
    )
}
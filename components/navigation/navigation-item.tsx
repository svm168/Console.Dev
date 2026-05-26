"use client";

import { useParams, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { ActionTooltip } from "@/components/action-tooltip";

interface NavigationItemProps {
    id: string;
    imageUrl: string;
    name: string;
}

export const NavigationItem = ({ id, imageUrl, name}: NavigationItemProps) => {
    const params = useParams();
    const router = useRouter();

    const onClick = () => {
        router.push(`/servers/${id}`)
    }

    return (
        <ActionTooltip side="right" align="center" label={name}>
            <button onClick={onClick} className="group relative flex items-center">
                <div className={cn(
                    "absolute left-0 bg-primary rounded-r-full transition-all w-1",
                    params?.serverId !== id && "group-hover:h-5",
                    params?.serverId === id ? "h-9": "h-2",
                )} />
                <div className={cn(
                    "relative group flex mx-3 h-10 w-10 rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden",
                    params?.serverId === id && "bg-primary/10 text-primary rounded-[16px]"
                )}>
                    <img src={imageUrl} alt="Channel" className="w-full h-full object-cover text-xs"/>
                </div>
            </button>
        </ActionTooltip>
    )
}
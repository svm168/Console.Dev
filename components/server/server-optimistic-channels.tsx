"use client";

import { ChannelType, MemberRole } from "@prisma/client";
import { useOptimisticChannels } from "@/hooks/use-optimistic-channels";
import { ServerChannel } from "./server-channel";

interface Props {
    channelType: ChannelType;
    server: any;
    role?: MemberRole;
    existingIds: string[];
}

export const ServerOptimisticChannels = ({ channelType, server, role, existingIds }: Props) => {
    const { pendingCreates, pendingDeletes } = useOptimisticChannels();
    
    const creates = Object.values(pendingCreates).filter(
        c => c.type === channelType && !existingIds.includes(c.id) && !pendingDeletes[c.id]
    );

    return (
        <>
            {creates.map(channel => (
                <ServerChannel key={(channel as any)._tempId || channel.id} channel={channel as any} server={server} role={role} />
            ))}
        </>
    )
}
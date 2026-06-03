"use client";

import { Channel, ChannelType, MemberRole, Server } from "@prisma/client";
import { ServerChannel } from "./server-channel";
import { ServerSection } from "./server-section";
import { useOptimisticChannels } from "@/hooks/use-optimistic-channels";

interface Props {
    serverChannels: Channel[];
    channelType: ChannelType;
    server: Server;
    role?: MemberRole;
    label: string;
}

export const ServerChannelSection = ({ serverChannels, channelType, server, role, label }: Props) => {
    const { pendingCreates, pendingEdits, pendingDeletes } = useOptimisticChannels();

    let activeChannels = serverChannels.filter(c => !pendingDeletes[c.id]);
    activeChannels = activeChannels.map(c => ({ ...c, ...pendingEdits[c.id] }));

    const serverChannelIds = new Set(serverChannels.map(c => c.id));
    const creates = Object.values(pendingCreates).filter((c: any) => c.type === channelType && !serverChannelIds.has(c.id) && !pendingDeletes[c.id]);

    const allChannels = [...activeChannels, ...creates] as Channel[];

    if(allChannels.length === 0) return null;

    return (
        <div className="mb-2">
            <ServerSection sectionType="channels" channelType={channelType} role={role} label={label} />
            {allChannels.map((channel) => (
                <ServerChannel key={(channel as any)._tempId || channel.id} channel={channel} server={server} role={role} />
            ))}
        </div>
    );
};
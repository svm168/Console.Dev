"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import qs from "query-string";
import { useOptimisticChannels } from "@/hooks/use-optimistic-channels";
import { useParams } from "next/navigation";

export const DeleteChannelModal = () => {
    const { isOpen, onClose, type, data } = useModal();
    const router = useRouter();
    const params = useParams()

    const isModalOpen = isOpen && type === "deleteChannel"
    const { server, channel } = data

    const onClick = async () => {
        try {
            const store = useOptimisticChannels.getState();
            let targetId = channel?.id;

            if(targetId?.startsWith("temp_")){
                const swapped = Object.values(store.pendingCreates).find((c: any) => c._tempId === targetId);
                if(swapped && !swapped.id.startsWith("temp_")) targetId = swapped.id;
            }
            
            store.addDelete(targetId);
            onClose();

            if(params?.channelId === targetId || params?.channelId === channel?.id){
                const generalChannel = server?.channels?.find((c: any) => c.name === "general");
                
                if(generalChannel) router.push(`/servers/${server?.id}/channels/${generalChannel.id}`);
                else router.push(`/servers/${server?.id}`);
            }

            if(targetId?.startsWith("temp_")) return;

            const url = qs.stringifyUrl({ url: `/api/channels/${targetId}`, query: { serverId: server?.id } });
            
            axios.delete(url).then(() => {
                router.refresh();
            }).catch(console.log);
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white text-black p-0 overflow-hidden" onOpenAutoFocus={(event) => event.preventDefault()}>
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">Delete Channel!</DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        Are you sure you want to delete this channel? <br />
                        <span className="text-indigo-500 font-semibold"># {channel?.name}</span> will be permanently deleted.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="bg-gray-100 px-6 py-4">
                    <div className="flex items-center justify-between w-full">
                        <Button onClick={onClose} variant="ghost">Cancel</Button>
                        <Button onClick={onClick} variant="primary">Confirm</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
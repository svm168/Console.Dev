"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";
import { Button } from "@/components/ui/button";
import axios from "axios";
import qs from "query-string";
import { useQueryClient } from "@tanstack/react-query";

export const DeleteMessageModal = () => {
    const { isOpen, onClose, type, data } = useModal();
    const queryClient = useQueryClient()

    const isModalOpen = isOpen && type === "deleteMessage"
    const { apiUrl, query, queryKey, id } = data

    const onClick = async () => {
        if(!queryKey || !id) return;

        const previousMessages = queryClient.getQueryData([queryKey]) as any;

        let currentMessageId = id;
        let isCurrentlyOptimistic = id?.startsWith("temp_");

        if(previousMessages?.pages){
            for(const page of previousMessages.pages){
                const found = page.items.find((i: any) => i.id === id || i._tempId === id);
                if(found){
                    currentMessageId = found.id;
                    isCurrentlyOptimistic = found.id.startsWith("temp_");
                    break;
                }
            }
        }

        try {
            onClose();

            queryClient.setQueryData([queryKey], (oldData: any) => {
                if(!oldData || !oldData.pages || oldData.pages.length === 0) return oldData;
                
                return {
                    ...oldData,
                    pages: oldData.pages.map((page: any) => ({
                        ...page,
                        items: page.items.map((item: any) => {
                            if (item.id === currentMessageId) {
                                return {
                                    ...item,
                                    fileUrl: null,
                                    content: "This message has been deleted.",
                                    deleted: true,
                                }
                            }
                            return item;
                        })
                    }))
                };
            });

            if(isCurrentlyOptimistic) return;

            const finalApiUrl = apiUrl?.replace(id, currentMessageId);
            const url = qs.stringifyUrl({ url: finalApiUrl || "", query });

            await axios.delete(url);

        } catch (error) {
            queryClient.setQueryData([queryKey], previousMessages);
            console.log(error);
        }
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white text-black p-0 overflow-hidden" onOpenAutoFocus={(event) => event.preventDefault()}>
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">Delete Message</DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        Are you sure you want to delete this message? <br /> The message will be permanently deleted.
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
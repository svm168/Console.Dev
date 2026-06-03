"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useServerAction } from "@/hooks/use-server-action";

export const DeleteServerModal = () => {
    const { isOpen, onClose, type, data } = useModal();
    const router = useRouter();
    const { setServerLoading } = useServerAction();

    const isModalOpen = isOpen && type === "deleteServer"
    const { server } = data

    const onClick = async () => {
        try {
            setServerLoading(true);
            onClose();
            router.push("/");

            axios.delete(`/api/servers/${server?.id}`).then(() => {
                router.refresh();
            }).catch((error) => {
                console.log(error);
            }).finally(() => {
                setServerLoading(false);
            });
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white text-black p-0 overflow-hidden" onOpenAutoFocus={(event) => event.preventDefault()}>
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">Delete Server!</DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        Are you sure you want to delete this server? <br />
                        <span className="text-indigo-500 font-semibold">{server?.name}</span> will be permanently deleted.
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
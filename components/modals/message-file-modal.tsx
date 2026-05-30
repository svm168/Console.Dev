"use client";

import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";

import axios from "axios"
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";

import qs from "query-string";

const formSchema = z.object({
    fileUrl: z.string().min(1, {
        message: "Attachment is required."
    })
});

export const MessageFileModal = () => {
    const { isOpen, onClose, type, data } = useModal()
    const router = useRouter();
    const { apiUrl, query } = data;

    const isModalOpen = isOpen && type === "messageFile"

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fileUrl: "",
        }
    });

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const url = qs.stringifyUrl({
                url: apiUrl || "",
                query,
            })
            await axios.post(url, {
                ...values,
                content: values.fileUrl,
            });

            form.reset();
            router.refresh();
            handleClose();
        } catch (error) {
            console.log(error)
        }
    };

    const handleClose = () => {
        form.reset()
        onClose()
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">Add an Attachment!</DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">Send a file as message.</DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="space-y-8 px-6">
                        <div className="flex flex-col items-center justify-center text-center">
                            <Field className="w-full flex flex-col items-center justify-center">
                                <Controller control={form.control} name="fileUrl" render={({ field }) => (
                                    <FileUpload endpoint="messageFile" value={field.value} onChange={field.onChange} />
                                )}/>
                            </Field>
                        </div>
                    </div>
                    
                    <DialogFooter className="px-6 py-4">
                        <Button variant="primary" disabled={isLoading}>Send</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
"use client";

import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import axios from "axios"
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import { ChannelType } from "@prisma/client";

import qs from "query-string";
import { useEffect } from "react";

const formSchema = z.object({
    name: z.string().min(1, {
        message: "Channel name is required."
    }).refine(
        name => name !== "general", {
            message: "Channel name can not be 'general'"
        }
    ),
    type: z.enum(ChannelType)
});

export const EditChannelModal = () => {
    const { isOpen, onClose, type, data } = useModal();
    const router = useRouter();

    const isModalOpen = isOpen && type === "editChannel"

    const { channel, server } = data

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            type: channel?.type || ChannelType.TEXT,
        }
    });

    useEffect(() => {
        if(channel){
            form.setValue("name", channel.name)
            form.setValue("type", channel.type)
        }
    }, [channel, form])

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const url = qs.stringifyUrl({
                url: `/api/channels/${channel?.id}`,
                query: {
                    serverId: server?.id
                }
            })

            await axios.patch(url, values);

            form.reset();
            router.refresh();
            onClose();
        } catch (error) {
            console.log(error)
        }
    };

    const handleClose = () => {
        form.reset();
        onClose();      // from destructuring of useModal() hook.
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">Edit Channel!</DialogTitle>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="space-y-8 px-6">
                        {/* Channel Name Field */}
                        <Field>
                            <FieldLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                                Channel Name
                            </FieldLabel>
                            
                            <div className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0 rounded-lg">
                            <Input 
                                disabled={isLoading}
                                placeholder="Enter channel name"
                                {...form.register("name")}
                            />
                            </div>
                            
                            {form.formState.errors.name && (
                                <p className="text-[0.8rem] font-medium text-destructive mt-2">
                                    {form.formState.errors.name.message}
                                </p>
                            )}
                        </Field>

                        {/* Channel Type Field */}
                        <Controller control={form.control} name="type" render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Channel Type</FieldLabel>
                                <Select disabled={isLoading} onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger id={field.name} aria-invalid={fieldState.invalid} className="bg-zinc-300/50! border-0 focus:ring-0 text-black ring-offset-0 focus:ring-offset-0 capitalize outline-none">
                                        <SelectValue placeholder="Select a Channel Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.values(ChannelType).map((type) => (
                                            <SelectItem key={type} value={type} className="capitalize">{type.toLowerCase()}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                            </Field>
                        )}/>
                    </div>
                    
                    <DialogFooter className="px-6 py-4">
                        <Button variant="primary" disabled={isLoading}>Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
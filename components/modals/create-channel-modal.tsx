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
import { useParams, useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import { ChannelType } from "@prisma/client";
import qs from "query-string";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useOptimisticChannels } from "@/hooks/use-optimistic-channels";

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

export const CreateChannelModal = () => {
    const { isOpen, onClose, type, data } = useModal();
    const router = useRouter();
    const params = useParams();

    const isModalOpen = isOpen && type === "createChannel"

    const { channelType } = data

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            type: channelType || ChannelType.TEXT,
        }
    });

    useEffect(() => {
        if(channelType) form.setValue("type", channelType)
        else form.setValue("type", ChannelType.TEXT)
    }, [channelType, form])

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const tempId = `temp_${uuidv4()}`;
            const tempChannel = {
                id: tempId,
                _tempId: tempId,
                name: values.name,
                type: values.type, 
                serverId: params?.serverId as string,
                profileId: "temp-profile", 
                createdAt: new Date(),
                updatedAt: new Date()
            };
    
            useOptimisticChannels.getState().addCreate(tempChannel as any);
            form.reset();
            onClose();
    
            const url = qs.stringifyUrl({ url: "/api/channels", query: { serverId: params?.serverId } });
            axios.post(url, { ...values, tempId }).then((res) => {
                const returnedData = res.data;
                
                const realChannel = returnedData.channels?.sort(
                    (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )[0];
                
                const store = useOptimisticChannels.getState();
                const pendingEdit = store.pendingEdits[tempId];
                const isDeleted = store.pendingDeletes[tempId];

                if(realChannel && realChannel.id){
                    store.swapId(tempId, realChannel.id);

                    if(isDeleted) axios.delete(`/api/channels/${realChannel.id}?serverId=${params?.serverId}`).catch(console.log);
                    else if(pendingEdit) axios.patch(`/api/channels/${realChannel.id}?serverId=${params?.serverId}`, pendingEdit).catch(console.log);
                }
    
                router.refresh();
            }).catch(console.log);
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
                    <DialogTitle className="text-2xl text-center font-bold">Create Channel!</DialogTitle>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="space-y-8 px-6">
                        {/* Channel Name Field */}
                        <Field>
                            <FieldLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                                Channel Name
                            </FieldLabel>
                            
                            <div className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0 rounded-lg">
                            <Input placeholder="Enter channel name" {...form.register("name")}/>
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
                                <Select onValueChange={field.onChange} value={field.value}>
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
                        <Button variant="primary">Create</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
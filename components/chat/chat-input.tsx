"use client";

import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import axios from "axios";
import qs from "query-string";
import { useModal } from "@/hooks/use-modal-store";
import { EmojiPicker } from "@/components/emoji-picker";
import { useQueryClient } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@clerk/nextjs";

interface ChatInputProps {
    apiUrl: string;
    query: Record<string, any>;
    name: string;
    type: "conversation" | "channel";
    member?: any;
}

const formSchema = z.object({
    content: z.string().min(1)
})

export const ChatInput = ({apiUrl, query, name, type, member}: ChatInputProps) => {
    const { onOpen } = useModal()
    const queryClient = useQueryClient()
    const { user } = useUser()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: "",
        }
    })

    const isLoading = form.formState.isSubmitting

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const url = qs.stringifyUrl({
                url: apiUrl,
                query,
            })

            const tempId = `temp_${uuidv4()}`
            const chatId = query.channelId || query.conversationId
            const queryKey = `chat:${chatId}`

            const optimisticMessage = {
                id: tempId,
                _tempId: tempId,
                isOptimistic: true,
                _originalContent: values.content,
                content: values.content,
                fileUrl: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                channelId: query.channelId,
                memberId: member?.id || "temp-id",
                deleted: false,
                member: {
                    id: member?.id || "temp-id",
                    role: member?.role,
                    profile: {
                        id: user?.id,
                        name: user?.firstName ? `${user?.firstName} ${user?.lastName || ""}`.trim() : "User",
                        imageUrl: user?.imageUrl,
                        email: user?.emailAddresses?.[0]?.emailAddress
                    }
                }
            }

            queryClient.setQueryData([queryKey], (oldData: any) => {
                if (!oldData || !oldData.pages || oldData.pages.length === 0) {
                    return { pages: [{ items: [optimisticMessage] }] }
                }
                const newData = [...oldData.pages]
                newData[0] = {
                    ...newData[0],
                    items: [optimisticMessage, ...newData[0].items],
                }
                return { ...oldData, pages: newData }
            })

            form.reset()

            axios.post(url, { ...values, tempId })
                .then((response) => {
                    const realMessage = response.data;
                    const currentCache = queryClient.getQueryData([queryKey]) as any;
                    let tempMsgState = null;

                    // Check if the user edited or deleted it while it was in flight
                    if (currentCache?.pages) {
                        for (const page of currentCache.pages) {
                            const found = page.items.find((item: any) => item.id === tempId);
                            if (found) { tempMsgState = found; break; }
                        }
                    }

                    // SWAP FIRST: Immediately replace the temp ID with the real ID, 
                    // but preserve the user's optimistic modifications so the UI doesn't flicker.
                    queryClient.setQueryData([queryKey], (oldData: any) => {
                        if (!oldData || !oldData.pages || oldData.pages.length === 0) return oldData;
                        const newData = [...oldData.pages];

                        newData[0] = {
                            ...newData[0],
                            items: [...newData[0].items]
                        }

                        const socketIndex = newData[0].items.findIndex((item: any) => item.id === realMessage.id);
                        const tempIndex = newData[0].items.findIndex((item: any) => item.id === tempId);

                        if (socketIndex !== -1&& tempIndex !== -1) {
                            newData[0].items[socketIndex] = {
                                ...newData[0].items[socketIndex],
                                content: tempMsgState ? tempMsgState.content : realMessage.content,
                                deleted: tempMsgState ? tempMsgState.deleted : realMessage.deleted,
                                fileUrl: tempMsgState ? tempMsgState.fileUrl : realMessage.fileUrl,
                                _pendingEdits: 0,
                                _tempId: tempId,
                            };

                            newData[0].items.splice(tempIndex, 1);
                        }
                        else if(tempIndex !== -1){
                            newData[0].items[tempIndex] = {
                                ...realMessage,
                                content: tempMsgState ? tempMsgState.content : realMessage.content,
                                deleted: tempMsgState ? tempMsgState.deleted : realMessage.deleted,
                                fileUrl: tempMsgState ? tempMsgState.fileUrl : realMessage.fileUrl,
                                _pendingEdits: 0,
                                _tempId: tempId,
                            };
                        }
                        return { ...oldData, pages: newData };
                    });

                    // FLUSH LATER: Fire the deferred requests using the REAL database ID
                    const baseSocketUrl = apiUrl.replace("/api/", "/api/socket/");
                    if (tempMsgState) {
                        if (tempMsgState.deleted) {
                            const deleteUrl = qs.stringifyUrl({ url: `${baseSocketUrl}/${realMessage.id}`, query });
                            axios.delete(deleteUrl).catch(console.log);
                        } else if (tempMsgState.content !== values.content) {
                            const editUrl = qs.stringifyUrl({ url: `${baseSocketUrl}/${realMessage.id}`, query });
                            axios.patch(editUrl, { content: tempMsgState.content }).catch(console.log);
                        }
                    }
                })
                .catch((error) => console.log(error));
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Controller control={form.control} name="content" render={({ field }) => (
                <Field>
                    <div className="relative p-4 pb-6">
                        <button type="button" onClick={() => onOpen("messageFile", {apiUrl, query})} className="absolute top-7 left-8 h-6 w-6 bg-zinc-500 dark:bg-zinc-400 hover:bg-zinc-600 dark:hover:bg-zinc-300 transition rounded-full p-1 flex items-center justify-center">
                            <Plus className="text-white dark:text-[#313338]" />
                        </button>
                        <Input disabled={isLoading} placeholder={`Message ${type === "conversation" ? name : "#" + name}`} {...field} className="px-14 py-6 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200" />
                        <div className="absolute top-7 right-8">
                            <EmojiPicker onChange={(emoji: string) => field.onChange(`${field.value}${emoji}`)} />
                        </div>
                    </div>
                </Field>
            )}/>
        </form>
    )
}
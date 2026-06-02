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

            const tempId = uuidv4()
            const chatId = query.channelId || query.conversationId
            const queryKey = `chat:${chatId}`

            const optimisticMessage = {
                id: tempId,
                content: values.content,
                fileUrl: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                channelId: query.channelId,
                memberId: "temp-id",
                deleted: false,
                member: {
                    id: "temp-id",
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
                    
                    queryClient.setQueryData([queryKey], (oldData: any) => {
                        if (!oldData || !oldData.pages || oldData.pages.length === 0) return oldData;

                        const newData = [...oldData.pages];
                        const tempIndex = newData[0].items.findIndex((item: any) => item.id === tempId);

                        if (tempIndex !== -1) {
                            newData[0].items[tempIndex] = realMessage;
                        }

                        return { ...oldData, pages: newData };
                    });
                })
                .catch((error) => {
                    console.log(error)
                })
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
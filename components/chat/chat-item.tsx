"use client";

import { Member, MemberRole, Profile } from "@prisma/client";
import { UserAvatar } from "@/components/user-avatar";
import { ActionTooltip } from "@/components/action-tooltip";
import { Edit, FileIcon, ShieldAlert, ShieldCheck, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import * as z from "zod";
import axios from "axios";
import qs from "query-string";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field } from "../ui/field";
import { Controller } from "react-hook-form";
import { useModal } from "@/hooks/use-modal-store";

interface ChatItemProps {
    id: string;
    content: string;
    member: Member & {
        profile: Profile;
    };
    timestamp: string;
    fileUrl: string | null;
    deleted: boolean;
    currentMember: Member;
    isUpdated: boolean;
    socketUrl: string;
    socketQuery: Record<string, string>;
}

const roleIconMap = {
    "GUEST": null,
    "MODERATOR": <ShieldCheck className="w-4 h-4 ml-2 text-indigo-500" />,
    "ADMIN": <ShieldAlert className="w-4 h-4 ml-2 text-rose-500" />,
}

const formSchema = z.object({
    content: z.string().min(1)
})

export const ChatItem = ({id, content, member, timestamp, fileUrl, deleted, currentMember, isUpdated, socketUrl, socketQuery }: ChatItemProps) => {
    const [isEditting, setIsEditting] = useState(false)
    const { onOpen } = useModal()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: content
        }
    })

    useEffect(() => {
        const handleKeyDown = (event: any) => {
            if(event.key === "Escape" || event.keyCode === 27){
                setIsEditting(false)
            }
        }

        window.addEventListener("keydown", handleKeyDown)

        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [])

    useEffect(() => {
        form.reset({
            content: content
        })
    }, [content])

    const isAdmin = currentMember.role === MemberRole.ADMIN
    const isModerator = currentMember.role === MemberRole.MODERATOR
    const isOwner = currentMember.id === member.id
    const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner)
    const canEditMessage = !deleted && isOwner && !fileUrl

    const isPdf = fileUrl?.toLowerCase().endsWith(".pdf") || fileUrl?.toLowerCase().includes("ext=pdf")
    const isImage = !isPdf && fileUrl

    const isLoading = form.formState.isSubmitting

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const url = qs.stringifyUrl({
                url: `${socketUrl}/${id}`,
                query: socketQuery
            })

            await axios.patch(url, values)

            form.reset()
            setIsEditting(false)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
            <div className="group flex gap-x-2 items-start w-full">
                <div className="cursor-pointer hover:drop-shadow-md transition">
                    <UserAvatar src={member.profile.imageUrl} />
                </div>
                <div className="flex flex-col w-full">
                    <div className="flex items-center gap-x-2">
                        <div className="flex items-center">
                            <p className="font-semibold text-sm hover:underline cursor-pointer">{member.profile.name}</p>
                            <ActionTooltip label={member.role} >
                                {roleIconMap[member.role]}
                            </ActionTooltip>
                        </div>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">{timestamp}</span>
                    </div>
                    {isImage && (
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="relative aspect-square rounded-md mt-2 overflow-hidden border flex items-center bg-secondary h-48 w-48">
                            <img src={fileUrl} alt={content} className="object-cover w-full h-full" />
                        </a>
                    )}
                    {isPdf && (
                        <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
                            <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400 shrink-0" />
                            <a href={fileUrl || undefined} target="_blank" rel="noopener noreferrer" className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline break-all">PDF File</a>
                        </div>
                    )}
                    {!fileUrl && !isEditting && (
                        <p className={cn("text-sm text-zinc-600 dark:text-zinc-300", deleted && "italic text-zinc-500 dark:text-zinc-400 text-xs mt-1")}>
                            {content}
                            {isUpdated && !deleted && (
                                <span className="text-[10px] mx-2 text-zinc-500 dark:text-zinc-400 ">(edited)</span>
                            )}
                        </p>
                    )}
                    {!fileUrl && isEditting && (
                        <>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center w-full gap-x-2 pt-2">
                                <Controller control={form.control} name="content" render={({ field }) => (
                                    <Field className="flex-1">
                                        <div className="relative w-full">
                                            <Input {...field} disabled={isLoading} placeholder="Edited message" className="p-2 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200" />
                                        </div>
                                    </Field>
                                )}/>
                                <Button disabled={isLoading} size="sm" variant="primary">Save</Button>
                            </form>
                            <span className="text-[10px] mt-1 text-zinc-400">Press Esc to cancel, Enter to save.</span>
                        </>
                    )}
                </div>
            </div>
            {canDeleteMessage && (
                <div className="hidden group-hover:flex! items-center gap-x-2 absolute p-1 -top-2 right-5 bg-white dark:bg-zinc-800 border rounded-sm">
                    {canEditMessage && (
                        <ActionTooltip label="Edit">
                            <Edit onClick={() => setIsEditting(true)} className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition" />
                        </ActionTooltip>
                    )}
                    <ActionTooltip label="Delete">
                        <Trash onClick={() => onOpen("deleteMessage", {apiUrl: `${socketUrl}/${id}`, query: socketQuery})} className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition" />
                    </ActionTooltip>
                </div>
            )}
        </div>
    )
}
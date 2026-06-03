"use client";

import { Member, MemberRole, Profile } from "@prisma/client";
import { UserAvatar } from "@/components/user-avatar";
import { ActionTooltip } from "@/components/action-tooltip";
import { Edit, ShieldAlert, ShieldCheck, Trash, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import * as z from "zod";
import axios from "axios";
import qs from "query-string";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field } from "../ui/field";
import { Controller } from "react-hook-form";
import { useModal } from "@/hooks/use-modal-store";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { useMediaPreview } from "@/hooks/use-media-preview";
import { Play } from "lucide-react";

interface ChatItemProps {
    id: string;
    content: string;
    member: Member & {
        profile: Profile;
    };
    timestamp: string;
    fileUrl: string;
    deleted: boolean;
    currentMember: Member;
    isUpdated: boolean;
    socketUrl: string;
    socketQuery: Record<string, string>;
    queryKey: string;
}

const roleIconMap = {
    "GUEST": null,
    "MODERATOR": <ShieldCheck className="w-4 h-4 ml-2 text-indigo-500" />,
    "ADMIN": <ShieldAlert className="w-4 h-4 ml-2 text-rose-500" />,
}

const formSchema = z.object({
    content: z.string().min(1)
})

export const ChatItem = ({id, content, member, timestamp, fileUrl, deleted, currentMember, isUpdated, socketUrl, socketQuery, queryKey }: ChatItemProps) => {
    const [isEditting, setIsEditting] = useState(false)
    const { onOpen } = useModal()
    const queryClient = useQueryClient()
    const [isExpanded, setIsExpanded] = useState(false);

    const { onOpen: onPreviewOpen } = useMediaPreview();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: content
        }
    })

    useEffect(() => {
        const handleKeyDown = (event: any) => {
            if(event.key === "Escape" || event.keyCode === 27) setIsEditting(false)
        }

        window.addEventListener("keydown", handleKeyDown)

        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [])

    useEffect(() => {
        form.reset({ content: content })
    }, [content])

    const isAdmin = currentMember.role === MemberRole.ADMIN
    const isModerator = currentMember.role === MemberRole.MODERATOR
    const isOwner = currentMember.id === member.id
    const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner)
    const canEditMessage = !deleted && isOwner && !fileUrl

    const lowerUrl = fileUrl?.toLowerCase() || "";
    const isPdf = lowerUrl.includes(".pdf") || lowerUrl.includes("ext=pdf");
    const isVoiceMemo = lowerUrl.includes("voice-memo.webm"); 
    const isAudio = isVoiceMemo || lowerUrl.includes(".mp3") || lowerUrl.includes(".wav") || lowerUrl.includes(".m4a");
    const isVideo = !isAudio && (lowerUrl.includes(".mp4") || lowerUrl.includes(".webm") || lowerUrl.includes(".ogg") || lowerUrl.includes(".mov"));
    const isImage = !isPdf && !isVideo && !isAudio && fileUrl;

    const isLoading = form.formState.isSubmitting

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const previousMessages = queryClient.getQueryData([queryKey]) as any;

        let currentMessageId = id
        let isCurrentlyOptimistic = id.startsWith("temp_");
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
            const url = qs.stringifyUrl({
                url: `${socketUrl}/${currentMessageId}`,
                query: socketQuery
            });

            queryClient.setQueryData([queryKey], (oldData: any) => {
                if(!oldData || !oldData.pages || oldData.pages.length === 0) return oldData;

                return {
                    ...oldData,
                    pages: oldData.pages.map((page: any) => ({
                        ...page,
                        items: page.items.map((item: any) => {
                            if(item.id === currentMessageId){
                                return {
                                    ...item,
                                    content: values.content,
                                    updatedAt: new Date().toISOString(), 
                                    _pendingEdits: (item._pendingEdits || 0) + 1 
                                }
                            }
                            return item;
                        })
                    }))
                };
            });

            form.reset();
            setIsEditting(false);

            if(isCurrentlyOptimistic) return;

            await axios.patch(url, values);

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
                                    _pendingEdits: Math.max((item._pendingEdits || 1) - 1, 0)
                                }
                            }
                            return item;
                        })
                    }))
                };
            });

        } catch (error) {
            queryClient.setQueryData([queryKey], previousMessages);
            console.log(error);
        }
    }

    const params = useParams()
    const router = useRouter()
    
    const onMemberClick = async () => {
        if(member.id === currentMember.id) return
        
        router.push(`/servers/${params?.serverId}/conversations/${member.id}`)
    }

    const MAX_LINES = 10;
    const MAX_LENGTH = 1000;
    const lines = content.split('\n');
    const isLongMessage = lines.length > MAX_LINES || content.length > MAX_LENGTH;

    let displayContent = content;
    if(isLongMessage && !isExpanded && !deleted){
        if (content.length > MAX_LENGTH) displayContent = content.slice(0, MAX_LENGTH) + "...";
        else displayContent = lines.slice(0, MAX_LINES).join('\n') + "...";
    }

    const formatTextWithLinks = (text: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);

        return parts.map((part, i) => {
            if(part.match(urlRegex)){
                return (
                    <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline hover:text-indigo-600 font-medium transition">
                        {part}
                    </a>
                );
            }

            return part;
        });
    };

    return (
        <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
            <div className="group flex gap-x-2 items-start w-full">
                <div onClick={onMemberClick} className="cursor-pointer hover:drop-shadow-md transition">
                    <UserAvatar src={member.profile.imageUrl} />
                </div>
                <div className="flex flex-col w-[90%]">
                    <div className="flex items-center gap-x-2">
                        <div className="flex items-center">
                            <p onClick={onMemberClick} className="font-semibold text-sm hover:underline cursor-pointer">{member.profile.name}</p>
                            <ActionTooltip label={member.role} >
                                {roleIconMap[member.role]}
                            </ActionTooltip>
                        </div>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">{timestamp}</span>
                    </div>
                    {isImage && (
                        <button onClick={() => onPreviewOpen(fileUrl, "image")} className="relative aspect-square rounded-md mt-2 overflow-hidden border flex items-center bg-secondary h-48 w-48 group/img cursor-zoom-in text-left">
                            <img src={fileUrl} alt={content} className="object-cover w-full h-full transition group-hover/img:scale-105" />
                        </button>
                    )}
                    {isPdf && (
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="relative flex flex-col mt-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 overflow-hidden w-64 group hover:shadow-md transition">
                            <div className="relative h-36 w-full overflow-hidden bg-white pointer-events-none select-none">
                                <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} className="absolute top-0 left-0 w-[200%] h-[200%] transform scale-50 origin-top-left pointer-events-none" tabIndex={-1}/>
                                <div className="absolute inset-0 bg-linear-to-t from-zinc-100 dark:from-zinc-900 via-transparent to-transparent" />
                            </div>

                            <div className="flex items-center p-3 gap-x-3 bg-zinc-100 dark:bg-zinc-900 z-10 border-t border-zinc-200 dark:border-zinc-800">
                                <div className="p-2 bg-rose-500/10 rounded-lg shrink-0">
                                    <FileText className="h-6 w-6 text-rose-500" />
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 group-hover:text-indigo-500 transition line-clamp-1">
                                        {fileUrl?.split('/').pop() || "Document.pdf"}
                                    </span>
                                    <span className="text-[10px] text-zinc-500 uppercase mt-0.5 font-bold tracking-wider">PDF Document</span>
                                </div>
                            </div>
                        </a>
                    )}
                    {isVideo && (
                        <button onClick={() => onPreviewOpen(fileUrl, "video")} className="relative aspect-video rounded-md mt-2 overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-black h-48 w-64 group/vid cursor-pointer shadow-sm">
                            <video src={fileUrl} className="object-cover h-full w-full opacity-70 group-hover/vid:opacity-90 transition" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-black/50 p-3 rounded-full backdrop-blur-sm group-hover/vid:scale-110 transition">
                                    <Play className="h-6 w-6 text-white fill-white" />
                                </div>
                            </div>
                        </button>
                    )}
                    {isAudio && (
                        <div className="relative mt-2 p-2 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-fit shadow-sm flex items-center">
                            <audio controls src={fileUrl} className="h-10 w-64 outline-none rounded-full" />
                        </div>
                    )}
                    {!fileUrl && !isEditting && (
                        <div className="flex flex-col w-full max-w-full">
                            <p className={cn("text-sm text-zinc-600 dark:text-zinc-300", "whitespace-pre-wrap wrap-break-word", deleted && "italic text-zinc-500 dark:text-zinc-400 text-xs mt-1")}>
                                {formatTextWithLinks(displayContent)}
                                {isUpdated && !deleted && ( <span className="text-[10px] mx-2 text-zinc-500 dark:text-zinc-400 ">(edited)</span> )}
                            </p>
                            {isLongMessage && !deleted && (
                                <button onClick={() => setIsExpanded(!isExpanded)} className="text-primary hover:underline text-xs font-semibold mt-1 w-fit cursor-pointer">
                                    {isExpanded ? "Show less" : "Show more"}
                                </button>
                            )}
                        </div>
                    )}
                    {!fileUrl && isEditting && (
                        <>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end w-full gap-x-2 pt-2">
                                <Controller control={form.control} name="content" render={({ field }) => (
                                    <Field className="flex-1">
                                        <div className="relative w-full">
                                            <Textarea {...field} disabled={isLoading} placeholder="Edited message" className="p-2 resize-none max-h-44 overflow-y-auto bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                                                onKeyDown={(event) => {
                                                    if(event.key === "Enter" && !event.shiftKey){
                                                        event.preventDefault();
                                                        form.handleSubmit(onSubmit)();
                                                    }
                                                }}
                                            />
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
                        <Trash onClick={() => onOpen("deleteMessage", {apiUrl: `${socketUrl}/${id}`, query: socketQuery, queryKey: queryKey, id: id})} className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition" />
                    </ActionTooltip>
                </div>
            )}
        </div>
    )
}
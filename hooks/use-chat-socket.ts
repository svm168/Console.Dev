import { useSocket } from "@/components/providers/socket-provider"
import { Member, Message, Profile } from "@prisma/client"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"

type ChatSocketProps = {
    addKey: string,
    updateKey: string,
    queryKey: string,
}

type MessageWithMemberWithProfile = Message & {
    member: Member & {
        profile: Profile
    },
    tempId?: string 
}

export const useChatSocket = ({addKey, updateKey, queryKey}: ChatSocketProps) => {
    const { socket } = useSocket()
    const queryClient = useQueryClient()

    useEffect(() => {
        if(!socket) return

        socket.on(updateKey, (message: MessageWithMemberWithProfile) => {
            queryClient.setQueryData([queryKey], (oldData: any) => {
                if(!oldData || !oldData.pages || oldData.pages.length === 0) return oldData

                const newData = oldData.pages.map((page: any) => {
                    return {
                        ...page,
                        items: page.items.map((item: any) => {
                            if(item.id === message.id) {
                                if(item.deleted && !message.deleted) return item; 
                                
                                if(item._pendingEdits > 0) return item; 
                                
                                return message; 
                            }
                            return item
                        })
                    }
                })

                return {
                    ...oldData,
                    pages: newData,
                }
            })
        })

        socket.on(addKey, (message: MessageWithMemberWithProfile) => {
            queryClient.setQueryData([queryKey], (oldData: any) => {
                if(!oldData || !oldData.pages || oldData.pages.length === 0){
                    return {
                        pages: [ {items: [message]} ]
                    }
                }

                const newData = [...oldData.pages]

                const alreadyExists = newData[0].items.find((item: any) => item.id === message.id)
                if(alreadyExists) return oldData;

                const isHandledByHttp = newData[0].items.some( (item: any) => item.id.startsWith("temp_") && item.member.id === message.member.id && (item._originalContent === message.content || item.content === message.content) );

                if (isHandledByHttp) return oldData;

                newData[0] = {
                    ...newData[0],
                    items: [message, ...newData[0].items],
                }

                return {
                    ...oldData,
                    pages: newData,
                }
            })
        })

        return () => {
            socket.off(addKey)
            socket.off(updateKey)
        }
    },[queryClient, addKey, queryKey, socket, updateKey])
}
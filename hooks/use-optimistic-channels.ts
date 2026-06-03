import { Channel } from "@prisma/client";
import { create } from "zustand";

interface OptimisticChannelsStore {
    pendingCreates: Record<string, Channel>;
    pendingEdits: Record<string, Partial<Channel>>;
    pendingDeletes: Record<string, boolean>;

    addCreate: (channel: Channel) => void;
    addEdit: (id: any, data: Partial<Channel>) => void;
    addDelete: (id: any) => void;
    swapId: (tempId: string, realId: string) => void;
}

export const useOptimisticChannels = create<OptimisticChannelsStore>((set) => ({
    pendingCreates: {},
    pendingEdits: {},
    pendingDeletes: {},

    addCreate: (channel) => set((state) => ({ pendingCreates: { ...state.pendingCreates, [channel.id]: channel } })),
    addEdit: (id, data) => set((state) => ({ pendingEdits: { ...state.pendingEdits, [id]: { ...state.pendingEdits[id], ...data } } })),
    addDelete: (id) => set((state) => ({ pendingDeletes: { ...state.pendingDeletes, [id]: true } })),
    
    swapId: (tempId, realId) => set((state) => {
        const creates = { ...state.pendingCreates };
        if(creates[tempId]) { creates[realId] = { ...creates[tempId], id: realId }; delete creates[tempId]; }
        
        const edits = { ...state.pendingEdits };
        if(edits[tempId]) { edits[realId] = edits[tempId]; delete edits[tempId]; }

        const deletes = { ...state.pendingDeletes };
        if(deletes[tempId]) { deletes[realId] = deletes[tempId]; delete deletes[tempId]; }

        return { pendingCreates: creates, pendingEdits: edits, pendingDeletes: deletes };
    })
}));
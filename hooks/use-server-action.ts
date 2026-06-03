import { create } from "zustand";

interface ServerActionStore {
    isServerLoading: boolean;
    setServerLoading: (loading: boolean) => void;
}

export const useServerAction = create<ServerActionStore>((set) => ({
    isServerLoading: false,
    setServerLoading: (loading) => set({ isServerLoading: loading }),
}));
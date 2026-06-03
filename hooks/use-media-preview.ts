import { create } from "zustand";

type PreviewType = "image" | "video";

interface MediaPreviewStore {
    isOpen: boolean;
    url: string;
    type: PreviewType;
    onOpen: (url: string, type?: PreviewType) => void;
    onClose: () => void;
}

export const useMediaPreview = create<MediaPreviewStore>((set) => ({
    isOpen: false,
    url: "",
    type: "image",
    onOpen: (url, type = "image") => set({ isOpen: true, url, type }),
    onClose: () => set({ isOpen: false, url: "" }),
}));
import { Loader2 } from "lucide-react";

export default function ServerLayoutLoading() {
    return (
        <div className="h-full flex">
            <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0 bg-[#F2F3F5] dark:bg-[#2B2D31]">
                <div className="w-full h-12 border-b-2 border-neutral-200 dark:border-neutral-800 flex items-center px-3" />
                <div className="flex flex-col gap-y-2 mt-4 px-3">
                    <div className="h-8 w-full bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse" />
                    <div className="h-8 w-full bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse" />
                    <div className="h-8 w-full bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse" />
                </div>
            </div>

            <main className="h-full w-full md:pl-60 flex flex-col items-center justify-center bg-white dark:bg-[#313338]">
                <Loader2 className="h-10 w-10 text-zinc-500 animate-spin my-4" />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading server...</p>
            </main>
        </div>
    );
}
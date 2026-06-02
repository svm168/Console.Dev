import { Loader2 } from "lucide-react";

export default function ConversationLoading() {
    return (
        <div className="bg-white dark:bg-[#313338] flex flex-col h-full w-full items-center justify-center">
            <Loader2 className="h-10 w-10 text-zinc-500 animate-spin my-4" />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Loading conversation...
            </p>
        </div>
    );
}
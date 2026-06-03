"use client";

import { X, FileText } from "lucide-react";
import { UploadDropzone } from "@/lib/uploadthing";
import "@uploadthing/react/styles.css";

interface FileUploadProps {
    onChange: (url?: string) => void;
    value: string
    endpoint: "messageFile" | "serverImage"
}

export const FileUpload = ({ onChange, value, endpoint}: FileUploadProps) => {

    const isServerImage = endpoint === "serverImage";
    
    const lowerUrl = value?.toLowerCase() || "";
    const isVoiceMemo = lowerUrl.includes("voice-memo.webm");
    const isAudio = isVoiceMemo || lowerUrl.includes(".mp3") || lowerUrl.includes(".wav") || lowerUrl.includes(".m4a");
    const isVideo = !isAudio && (lowerUrl.includes(".mp4") || lowerUrl.includes(".webm") || lowerUrl.includes(".ogg") || lowerUrl.includes(".mov"));
    const isPdf = lowerUrl.includes(".pdf") || lowerUrl.includes("ext=pdf");

    const isImage = value && !isPdf && !isVideo && !isAudio;

    if(value && (isVideo || isAudio)){
        return (
            <div className="relative flex items-center justify-center mt-2">
                <div className="relative flex flex-col rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 overflow-hidden w-64 shadow-sm p-4">
                    {isVideo ? (
                        <video src={value} controls className="w-full rounded-md max-h-32 object-cover" />
                    ) : (
                        <audio src={value} controls className="w-full" />
                    )}
                    <p className="text-xs text-zinc-500 text-center mt-2 font-medium">Ready to send</p>
                </div>
                <button onClick={() => onChange("")} className="bg-rose-500 hover:bg-rose-600 transition text-white p-1 rounded-full absolute -top-2 -right-2 shadow-sm z-20 cursor-pointer" type="button">
                    <X className="h-4 w-4"/>
                </button>
            </div>
        )
    }
    
    if(value && isPdf){
        return (
            <div className="relative flex items-center justify-center mt-2">
                <div className="relative flex flex-col rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 overflow-hidden w-64 shadow-sm">
                    <div className="relative h-36 w-full overflow-hidden bg-white pointer-events-none select-none">
                        <iframe src={`${value}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} className="absolute top-0 left-0 w-[200%] h-[200%] transform scale-50 origin-top-left pointer-events-none" tabIndex={-1} />
                        <div className="absolute inset-0 bg-linear-to-t from-zinc-100 dark:from-zinc-900 via-transparent to-transparent" />
                    </div>

                    <div className="flex items-center p-3 gap-x-3 bg-zinc-100 dark:bg-zinc-900 z-10 border-t border-zinc-200 dark:border-zinc-800">
                        <div className="p-2 bg-rose-500/10 rounded-lg shrink-0">
                            <FileText className="h-6 w-6 text-rose-500" />
                        </div>
                        <div className="flex flex-col overflow-hidden text-left">
                            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 line-clamp-1">
                                {value.split('/').pop() || "Document.pdf"}
                            </span>
                            <span className="text-[10px] text-zinc-500 uppercase mt-0.5 font-bold tracking-wider">PDF Document</span>
                        </div>
                    </div>
                </div>

                <button onClick={() => onChange("")} className="bg-rose-500 hover:bg-rose-600 transition text-white p-1 rounded-full absolute -top-2 -right-2 shadow-sm z-20 cursor-pointer" type="button">
                    <X className="h-4 w-4"/>
                </button>
            </div>
        )
    }

    if(isImage){
        return (
            <div className="flex w-full justify-center">
                <div className={`relative ${isServerImage ? "h-20 w-20" : "h-48 w-48"}`}>
                    <img src={value} alt="Upload Preview" className={`object-cover h-full w-full ${isServerImage ? "rounded-full" : "rounded-md"}`} sizes={isServerImage ? "80px" : "192px"} />
                    <button onClick={() => onChange("")} className="bg-rose-500 text-white p-1 rounded-full absolute -top-2 -right-2 shadow-sm z-10" type="button">
                        <X className="h-4 w-4"/>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <UploadDropzone endpoint={endpoint}
            onClientUploadComplete={(res) => {
                const fileUrl = res?.[0]?.ufsUrl || res?.[0]?.ufsUrl;
                const fileName = res?.[0]?.name;

                if(fileName) onChange(`${fileUrl}?fallback=${fileName}`);
                else onChange(fileUrl || "");
            }}
            onUploadError={(error: Error) => {
                console.log(error);
            }
        }/>
    )
}
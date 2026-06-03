"use client";

import { FileIcon, X } from "lucide-react";
import { UploadDropzone } from "@/lib/uploadthing";
import "@uploadthing/react/styles.css";

interface FileUploadProps {
    onChange: (url?: string) => void;
    value: string
    endpoint: "messageFile" | "serverImage"
}

export const FileUpload = ({ onChange, value, endpoint}: FileUploadProps) => {
    const isPdf = value?.toLowerCase().endsWith(".pdf") || value?.toLowerCase().includes("ext=pdf")

    const isServerImage = endpoint === "serverImage";
    
    if(value && !isPdf){
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

    if(value && isPdf){
        return (
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
                <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400 shrink-0" />
                <a href={value} target="_blank" rel="noopener noreferrer" className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline break-all">{value}</a>
                <button onClick={() => onChange("")} className="bg-rose-500 text-white p-1 rounded-full absolute -top-2 -right-2 shadow-sm" type="button">
                    <X className="h-4 w-4"/>
                </button>
            </div>
        )
    }

    return (
        <UploadDropzone 
            endpoint={endpoint}
            onClientUploadComplete={(res) => {
                const fileUrl = res?.[0]?.ufsUrl || res?.[0]?.ufsUrl;
                const fileName = res?.[0]?.name;

                if(fileName?.toLowerCase().endsWith(".pdf")) onChange(`${fileUrl}?ext=pdf`)
                else onChange(fileUrl)
            }}
            onUploadError={(error: Error) => {
                console.log(error);
            }
        }/>
    )
}
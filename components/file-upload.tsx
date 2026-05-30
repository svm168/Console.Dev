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
    
    if(value && !isPdf){
        return (
            <div className="flex w-full justify-center">
                
                <div className="relative h-20 w-20">
                    <img 
                        src={value} 
                        alt="Server Avatar" 
                        className="h-full w-full rounded-full object-cover" 
                        sizes="80px"
                    />
                    <button onClick={() => onChange("")} className="bg-rose-500 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm" type="button">
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
                <a href={value} target="_blank" rel="noopener noreferrer" className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline break-all">
                    {value}
                </a>
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
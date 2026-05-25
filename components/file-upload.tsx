"use client";

import { X } from "lucide-react";
import Image from "next/image";

import { UploadDropzone } from "@/lib/uploadthing";
import "@uploadthing/react/styles.css";

interface FileUploadProps {
    onChange: (url?: string) => void;
    value: string
    endpoint: "messageFile" | "serverImage"
}

export const FileUpload = ({ onChange, value, endpoint}: FileUploadProps) => {
    const fileType = value?.split(".").pop()
    
    if (value && fileType !== "pdf") {
        return (
            // 1. The outer "shield" div that absorbs the forceful stretching from the parent
            <div className="flex w-full justify-center">
                
                {/* 2. Your exact 80x80 container, safely protected from stretching */}
                <div className="relative h-20 w-20">
                    <Image 
                        fill 
                        src={value} 
                        alt="Upload" 
                        // 3. Make sure object-cover is here so the image doesn't squish!
                        className="rounded-full object-cover" 
                        sizes="80px"
                    />
                    <button 
                        onClick={() => onChange("")} 
                        className="bg-rose-500 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm" 
                        type="button"
                    >
                        <X className="h-4 w-4"/>
                    </button>
                </div>
                
            </div>
        );
    }

    return (
        <UploadDropzone 
            endpoint={endpoint}
            onClientUploadComplete={(res) => {
                onChange(res?.[0]?.ufsUrl);
            }}
            onUploadError={(error: Error) => {
                console.log(error);
            }}
        />
    )
}
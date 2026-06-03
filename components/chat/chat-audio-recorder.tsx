"use client";

import { useState, useRef } from "react";
import { Mic, X, Loader2, Send } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import axios from "axios";
import qs from "query-string";

interface ChatAudioRecorderProps {
    apiUrl: string;
    query: Record<string, any>;
}

export const ChatAudioRecorder = ({ apiUrl, query }: ChatAudioRecorderProps) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [time, setTime] = useState(0);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    
    const { startUpload } = useUploadThing("messageFile");

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if(event.data.size > 0) chunksRef.current.push(event.data);
            };

            mediaRecorder.start();
            setIsRecording(true);
            setTime(0);
            
            timerRef.current = setInterval(() => {
                setTime((prev) => prev + 1);
            }, 1000);

        } catch (error) {
            console.error("Microphone access denied", error);
        }
    };

    const stopRecording = (cancel: boolean = false) => {
        if(!mediaRecorderRef.current) return;

        mediaRecorderRef.current.onstop = async () => {
            clearInterval(timerRef.current!);
            setIsRecording(false);
            setTime(0);

            mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());

            if(!cancel) await uploadAndSendAudio();
        };

        mediaRecorderRef.current.stop();
    };

    const uploadAndSendAudio = async () => {
        setIsUploading(true);
        try {
            const blob = new Blob(chunksRef.current, { type: "audio/webm" });
            const file = new File([blob], "voice-memo.webm", { type: "audio/webm" });

            const res = await startUpload([file]);
            
            if(res && (res[0]?.ufsUrl || res[0]?.ufsUrl)){
                const fileUrl = res[0]?.ufsUrl || res[0]?.ufsUrl;
                const finalUrl = `${fileUrl}?fallback=voice-memo.webm`;
                
                const url = qs.stringifyUrl({ url: apiUrl, query });
                await axios.post(url, {
                    content: finalUrl,
                    fileUrl: finalUrl
                });
            }
        } catch (error) {
            console.error("Failed to send audio", error);
        } finally {
            setIsUploading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if(isUploading){
        return (
            <div className="h-10 w-10 flex items-center justify-center bg-zinc-200 dark:bg-zinc-800 rounded-full">
                <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
            </div>
        );
    }

    if(isRecording){
        return (
            <div className="flex items-center gap-x-2 bg-rose-500/10 text-rose-500 px-4 py-2 rounded-full h-11 border border-rose-500/20">
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold w-8 text-center">{formatTime(time)}</span>
                
                <button onClick={() => stopRecording(true)} className="hover:bg-rose-500/20 p-1.5 rounded-full transition ml-1" title="Cancel">
                    <X className="h-4 w-4" />
                </button>
                <button onClick={() => stopRecording(false)} className="bg-rose-500 hover:bg-rose-600 text-white p-1.5 rounded-full transition" title="Send">
                    <Send className="h-4 w-4 pl-0.5" />
                </button>
            </div>
        );
    }

    return (
        <button onClick={startRecording} type="button" className="h-11 w-11 flex items-center justify-center bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition rounded-full cursor-pointer group">
            <Mic className="h-5 w-5 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
        </button>
    );
};
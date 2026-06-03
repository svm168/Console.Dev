"use client";

import { useMediaPreview } from "@/hooks/use-media-preview";
import { cn } from "@/lib/utils";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export const MediaPreview = () => {
    const { isOpen, url, type, onClose } = useMediaPreview();
    const pathname = usePathname();
    const [scale, setScale] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);
    const touchStartDistRef = useRef<number>(0);
    const startScaleRef = useRef<number>(1);

    useEffect(() => {
        onClose();
    }, [pathname, onClose]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if(event.key === "Escape") onClose();
        };
        if(isOpen) window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        setScale(1);
    }, [url, isOpen]);

    useEffect(() => {
        const container = containerRef.current;
        if(!container || !isOpen || type !== "image") return;

        const handleWheel = (event: WheelEvent) => {
            if(event.ctrlKey){
                event.preventDefault();
                const zoomFactor = 0.015;
                setScale((prev) => {
                    const nextScale = prev - event.deltaY * zoomFactor;
                    return Math.min(Math.max(nextScale, 1), 4);
                });
            }
        };

        container.addEventListener("wheel", handleWheel, { passive: false });
        return () => container.removeEventListener("wheel", handleWheel);
    }, [isOpen, type]);

    if(!isOpen || !url) return null;

    const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.5, 4));
    const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.5, 1));
    const handleResetZoom = () => setScale(1);

    const getTouchDistance = (touches: React.TouchEvent) => {
        if (touches.touches.length < 2) return 0;
        const dx = touches.touches[0].clientX - touches.touches[1].clientX;
        const dy = touches.touches[0].clientY - touches.touches[1].clientY;
        return Math.hypot(dx, dy);
    };

    const handleTouchStart = (event: React.TouchEvent) => {
        if(event.touches.length === 2 && type === "image"){
            touchStartDistRef.current = getTouchDistance(event);
            startScaleRef.current = scale;
        }
    };

    const handleTouchMove = (event: React.TouchEvent) => {
        if(event.touches.length === 2 && type === "image" && touchStartDistRef.current > 0){
            event.preventDefault();
            const currentDist = getTouchDistance(event);
            const ratio = currentDist / touchStartDistRef.current;
            
            setScale(() => {
                const nextScale = startScaleRef.current * ratio;
                return Math.min(Math.max(nextScale, 1), 4);
            });
        }
    };

    const handleTouchEnd = () => {
        touchStartDistRef.current = 0;
    };

    return (
        <div className="absolute inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-6 select-none animate-in fade-in duration-200">
            <div className="absolute top-4 right-4 flex items-center gap-x-2 z-50">
                {type === "image" && (
                    <>
                        {scale > 1 && (
                            <button onClick={handleResetZoom} title="Reset Zoom" className="text-zinc-400 hover:text-white transition p-2 bg-zinc-900/60 hover:bg-zinc-900 rounded-full cursor-pointer">
                                <RotateCcw className="h-5 w-5" />
                            </button>
                        )}
                        <button onClick={handleZoomOut} disabled={scale <= 1} className="text-zinc-400 hover:text-white disabled:opacity-40 transition p-2 bg-zinc-900/60 hover:bg-zinc-900 rounded-full cursor-pointer">
                            <ZoomOut className="h-5 w-5" />
                        </button>
                        <button onClick={handleZoomIn} disabled={scale >= 4} className="text-zinc-400 hover:text-white disabled:opacity-40 transition p-2 bg-zinc-900/60 hover:bg-zinc-900 rounded-full cursor-pointer">
                            <ZoomIn className="h-5 w-5" />
                        </button>
                    </>
                )}
                <button onClick={onClose} className="text-zinc-400 hover:text-white transition p-2 bg-zinc-900/60 hover:bg-zinc-900 rounded-full cursor-pointer">
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div ref={containerRef} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
                className={cn(
                    "w-full h-full flex items-center justify-center p-4 max-h-[92%] transition-all duration-75",
                    scale > 1 ? "overflow-auto cursor-grab active:cursor-grabbing" : "overflow-hidden"
                )}
            >
                {type === "image" ? (
                    <img src={url} alt="Preview Window" style={{ transform: `scale(${scale})` }} className="object-contain max-w-full max-h-full transition-transform duration-100 ease-out select-none rounded-sm shadow-2xl origin-center" draggable={false}/>
                ) : (
                    <video src={url} controls autoPlay className="max-w-full max-h-full object-contain rounded-md shadow-2xl"/>
                )}
            </div>

            {type === "image" && scale > 1 && (
                <div className="absolute bottom-4 bg-zinc-900/80 text-zinc-300 px-3 py-1 text-xs rounded-full pointer-events-none backdrop-blur-sm shadow-md">
                    {Math.round(scale * 100)}%
                </div>
            )}
        </div>
    );
};
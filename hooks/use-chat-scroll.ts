import { useEffect, useState, useRef } from "react";

type ChatScrollProps = {
    chatRef: React.RefObject<HTMLDivElement | null>;
    bottomRef: React.RefObject<HTMLDivElement | null>;
    shouldLoadMore: boolean;
    loadMore: () => void;
    count: number;
}

export const useChatScroll = ({chatRef, bottomRef, shouldLoadMore, loadMore, count}: ChatScrollProps) => {
    const [hasInitialized, setHasInitialized] = useState(false);
    
    const prevScrollHeightRef = useRef(0);
    const isScrolledToBottomRef = useRef(true);

    useEffect(() => {
        const topDiv = chatRef?.current;

        const handleScroll = () => {
            if (!topDiv) return;

            const scrollTop = Math.round(topDiv.scrollTop);

            if(scrollTop <= 1 && shouldLoadMore){
                prevScrollHeightRef.current = topDiv.scrollHeight;
                loadMore();
            }

            const distanceFromBottom = topDiv.scrollHeight - topDiv.scrollTop - topDiv.clientHeight;
            isScrolledToBottomRef.current = distanceFromBottom <= 150; 
        }

        topDiv?.addEventListener("scroll", handleScroll);
        return () => topDiv?.removeEventListener("scroll", handleScroll);
    }, [shouldLoadMore, loadMore, chatRef]);

    useEffect(() => {
        const bottomDiv = bottomRef?.current;
        const topDiv = chatRef?.current;
        
        if(!topDiv) return;

        if(prevScrollHeightRef.current > 0){
            const scrollDiff = topDiv.scrollHeight - prevScrollHeightRef.current;
            
            if(scrollDiff > 0) topDiv.scrollTop += scrollDiff;
            prevScrollHeightRef.current = 0;
        } 
        else{
            const shouldAutoScroll = () => {
                if(!hasInitialized && bottomDiv){
                    setHasInitialized(true);
                    return true;
                }

                return isScrolledToBottomRef.current;
            }

            if(shouldAutoScroll()){
                setTimeout(() => {
                    bottomRef.current?.scrollIntoView({behavior: "smooth"})
                }, 100);
            }
        }
    }, [bottomRef, chatRef, count, hasInitialized]);
}
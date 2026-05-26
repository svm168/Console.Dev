"use client";

import { Plus } from "lucide-react";
import { ActionTooltip } from "@/components/action-tooltip";
import { useModal } from "@/hooks/use-modal-store";

export const NavigationAction = () => {
  const { onOpen } = useModal();
  return (
    <div>
      <button onClick={() => onOpen("createServer")} className="flex items-center">
        <ActionTooltip side="right" align="center" label="Add a server">
          <div className="group flex mx-3 my-2 h-10 w-10 rounded-[24px] hover:rounded-[16px] transition-all overflow-hidden items-center justify-center bg-[#E7E7E7] dark:bg-[#0f408f] dark:hover:bg-emerald-500 cursor-pointer">
            <Plus className="hover:text-black dark:group-hover:text-white transition text-emerald-500" size={20} />
          </div>
        </ActionTooltip>  
      </button>
    </div>
  );
};
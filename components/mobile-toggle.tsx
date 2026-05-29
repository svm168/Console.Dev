import { Menu } from "lucide-react"

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { buttonVariants } from "@/components/ui/button" 
import { NavigationSidebar } from "@/components/navigation/navigation-sidebar"
import { ServerSidebar } from "@/components/server/server-sidebar"
import { cn } from "@/lib/utils" 

export const MobileToggle = ({ serverId }: { serverId: string }) => {
    return (
        <Sheet>
            <SheetTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "md:hidden")}>
                <Menu />
            </SheetTrigger>
            
            <SheetContent side="left" className="p-0 flex flex-row gap-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="w-18 h-full">
                    <NavigationSidebar />
                </div>
                <ServerSidebar serverId={serverId} />
            </SheetContent>
        </Sheet>
    )
}
import { currentProfile } from "@/lib/current-profile"
import { redirect } from "next/navigation";

import { UserButton } from "@clerk/nextjs";

import { db } from "@/lib/db";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModeToggle } from "@/components/mode-toggle";

import { NavigationAction } from "./navigation-action";
import { NavigationItem } from "./navigation-item";

export const NavigationSidebar = async () => {
    const profile = await currentProfile();
    if(!profile) return redirect("/")

    const servers = await db.server.findMany({
        where: {
            members: {
                some: {
                    profileId: profile.id
                }
            }
        }
    })

    return (
        <div className="space-y-2 flex flex-col items-center h-full text-primary w-full bg-[#CFCFCF] dark:bg-[#063074]">
            <NavigationAction />
            <Separator className="h-0.5! bg-zinc-300 rounded-full! w-10!"/>
            <div/>
            <ScrollArea className="flex-1 w-full">
                {servers.map((server) => (
                    <div key={server.id} className="mb-4">
                        <NavigationItem id={server.id} name={server.name} imageUrl={server.imageUrl}/>
                    </div>
                ))}
            </ScrollArea>
            <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
                <ModeToggle />
                <UserButton 
                    appearance={{
                        elements: {
                            avatarBox: "h-10! w-10!"
                        }
                    }}
                />
            </div>
        </div>
    )
}
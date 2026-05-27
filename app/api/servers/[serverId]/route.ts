import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db";
import { NextResponse } from "next/server"

export async function PATCH(req: Request, { params }: { params: Promise<{ serverId: string}>}) {
    try {
        const profile = await currentProfile();
        if(!profile) return new NextResponse("Unauthorized", { status: 401 })

        const { name, imageUrl } = await req.json()

        const { serverId } = await params
        if(!serverId) return null

        const server = await db.server.update({
            where: {
                id: serverId,
                profileId: profile.id,
            },
            data: {
                name,
                imageUrl,
            },
        })

        return NextResponse.json(server)
    } catch (error) {
        console.log("[SERVER_ID_PATCH]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
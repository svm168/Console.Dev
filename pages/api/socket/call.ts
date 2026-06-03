import { NextApiRequest } from "next";
import { NextApiResponseServerIo } from "@/types";
import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponseServerIo) {
    if(req.method !== "POST") return res.status(405).end();
    
    try {
        const profile = await currentProfilePages(req);
        if(!profile) return res.status(401).json({ error: "Unauthorized" });

        const { memberId, type } = req.body;

        const targetMember = await db.member.findUnique({
            where: { id: memberId },
            include: { profile: true }
        });
        if(!targetMember) return res.status(404).json({ error: "Member not found" });

        const callerMember = await db.member.findFirst({
            where: {
                profileId: profile.id,
                serverId: targetMember.serverId
            }
        });
        if(!callerMember) return res.status(403).json({ error: "Caller not in server" });

        const receiverUrl = `/servers/${targetMember.serverId}/conversations/${callerMember.id}?${type}=true`;

        const callKey = `user:${targetMember.profile.userId}:call`;
        res?.socket?.server?.io?.emit(callKey, {
            callerName: profile.name,
            callerImageUrl: profile.imageUrl,
            type, 
            url: receiverUrl   
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.log("CALL_API_ERROR", error);
        return res.status(500).json({ error: "Internal Error" });
    }
}
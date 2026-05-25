import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const initialProfile = async () => {
    const user = await currentUser();

    // Don't redirect here, return null. This returned null will be used elsewhere(wherever initialProfile is called) to redirect
    if (!user) return null;

    const profile = await db.profile.findUnique({
        where: {
            userId: user.id
        }
    });

    if (profile) return profile;

    const newProfile = await db.profile.create({
        data: {
            userId: user.id,
            name: `${user.firstName ?? "User"} ${user.lastName ?? ""}`.trim(),
            imageUrl: user.imageUrl,
            email: user.emailAddresses[0].emailAddress
        }
    });

    return newProfile;
}
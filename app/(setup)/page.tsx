import { initialProfile } from "@/lib/initial-profile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

const SetupPage = async () => {
    const profile = await initialProfile();

    // If no profile/user was found, safely redirect from the page level
    if (!profile) {
        return redirect('/sign-in');
    }

    const server = await db.server.findFirst({
        where: {
            members: {
                some: {
                    profileId: profile.id
                }
            }
        }
    });

    if (server) {
        return redirect(`/servers/${server.id}`);
    }

    return <div>Create a Server</div>
}

export default SetupPage;
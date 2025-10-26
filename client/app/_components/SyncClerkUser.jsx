"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

const SyncClerkUser = () => {
  const { isSignedIn, user } = useUser();

  useEffect(() => {

    if (isSignedIn && user) {
      const syncUser = async () => {
        const data = {
          clerkUserID: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          username: user.username || user.firstName || "Anonymous",
          firstName: user.firstName,
          lastName: user.lastName,
          provider: user.externalAccounts?.[0]?.provider || "clerk",
          ipAddress: user.lastActiveDevice?.ipAddress || "",
          createdAt: user.createdAt,
        };

        try {
          const res = await fetch("http://localhost:1337/api/sync-clerk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });


          const result = await res.json();
          console.log("✅ Synced user to Strapi:", result);
        } catch (err) {
          console.error("❌ Sync failed:", err);
        }
      };

      syncUser();
    }
  }, [isSignedIn, user]);

  return null;
}
export default SyncClerkUser;
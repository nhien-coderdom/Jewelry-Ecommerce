"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function SyncClerkUser() {
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    if (isSignedIn && user) {
      const syncUser = async () => {
        const data = {
          clerkUserID: user.id, // trùng với field ở Strapi
          email: user.primaryEmailAddress?.emailAddress,
          username: user.username || user.firstName || "Anonymous",
        };

        try {
          const res = await fetch("http://localhost:1337/api/users/sync-clerk", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
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

  return null; // Component này không hiển thị gì, chỉ chạy sync
}

"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

/**
 * Custom hook to automatically sync Clerk user to Strapi database
 * Call this in your layout or any protected page
 */
export function useAutoSyncUser() {
  const { user, isLoaded } = useUser();
  const syncedRef = useRef(false);

  useEffect(() => {
    // Only sync once per session
    if (isLoaded && user && !syncedRef.current) {
      syncedRef.current = true;

      fetch('/api/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            console.log('✅ User auto-synced to Strapi:', data.message);
          } else {
            console.warn('⚠️ User sync failed:', data.error);
          }
        })
        .catch(err => console.error('❌ Auto-sync error:', err));
    }
  }, [isLoaded, user]);

  return { synced: syncedRef.current };
}

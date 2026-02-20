/**
 * Backend Wake-Up Utility
 * Silently wakes up the Render backend (which sleeps after inactivity).
 * No console output — all logging removed.
 */

import {BASE_URL} from "./apiEndpoints.js";

export const wakeUpBackend = async () => {
    try {
        await fetch(`${BASE_URL}/health`, {
            method: "GET",
            signal: AbortSignal.timeout(30000),
        });
    } catch {
        // Silently ignore — app will retry on actual API calls
    }
};

export const initializeBackend = () => {
    // Fire and forget — don't block app startup, don't log anything
    wakeUpBackend().catch(() => {});
};
/**
 * Backend Wake-Up Utility
 * Wakes up the backend server on Render (which sleeps after 50s of inactivity)
 * and logs connection status to console
 */

import {API_ENDPOINTS, BASE_URL} from "./apiEndpoints.js";

/**
 * Wakes up the backend server and checks connection status
 * @returns {Promise<boolean>} - Returns true if backend is awake and responsive
 */
export const wakeUpBackend = async () => {
    const startTime = Date.now();

    console.log('🔄 Attempting to wake up backend server...');
    console.log(`📍 Backend URL: ${BASE_URL}`);

    try {
        // Make request to health endpoint
        const response = await fetch(`${BASE_URL}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            // Timeout after 30 seconds
            signal: AbortSignal.timeout(30000),
        });

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        if (response.ok) {
            const data = await response.text();
            console.log('✅ Backend is CONNECTED');
            console.log(`📊 Response time: ${responseTime}ms`);
            console.log(`💬 Backend message: "${data}"`);
            console.log(`🌐 Backend URL: ${BASE_URL}`);

            // Log if backend was sleeping (slow response)
            if (responseTime > 5000) {
                console.log('⏰ Backend was sleeping - took a while to wake up');
            } else {
                console.log('⚡ Backend was already awake');
            }

            return true;
        } else {
            console.error('❌ Backend responded but with error status');
            console.error(`📊 Status: ${response.status} ${response.statusText}`);
            console.error(`⏱️ Response time: ${responseTime}ms`);
            return false;
        }
    } catch (error) {
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        console.error('❌ Backend is NOT CONNECTED');
        console.error(`⏱️ Attempt duration: ${responseTime}ms`);

        if (error.name === 'TimeoutError') {
            console.error('⏰ Connection timeout - backend may be sleeping or unavailable');
            console.error('💡 Render free tier can take 30-60 seconds to wake up');
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.error('🌐 Network error - check if backend URL is correct');
            console.error(`📍 Trying to connect to: ${BASE_URL}`);
        } else {
            console.error(`🔴 Error: ${error.message}`);
        }

        return false;
    }
};

/**
 * Initializes backend connection on app startup
 * Non-blocking - app continues to load while backend wakes up
 */
export const initializeBackend = () => {
    console.log('🚀 Initializing backend connection...');
    console.log('─'.repeat(60));

    // Don't await - let it run in background
    wakeUpBackend()
        .then((isConnected) => {
            console.log('─'.repeat(60));
            if (isConnected) {
                console.log('✅ Backend initialization complete - Ready to use!');
            } else {
                console.log('⚠️ Backend initialization failed - App will retry on API calls');
                console.log('💡 You can still browse the frontend');
            }
            console.log('─'.repeat(60));
        })
        .catch((error) => {
            console.error('❌ Unexpected error during backend initialization:', error);
            console.log('─'.repeat(60));
        });
};

/**
 * Checks backend health status (can be called anytime)
 * @returns {Promise<{isConnected: boolean, responseTime: number, message: string}>}
 */
export const checkBackendHealth = async () => {
    const startTime = Date.now();

    try {
        const response = await fetch(`${BASE_URL}/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(10000),
        });

        const responseTime = Date.now() - startTime;
        const data = await response.text();

        return {
            isConnected: response.ok,
            responseTime,
            message: data,
            status: response.status,
        };
    } catch (error) {
        return {
            isConnected: false,
            responseTime: Date.now() - startTime,
            message: error.message,
            status: 0,
        };
    }
};
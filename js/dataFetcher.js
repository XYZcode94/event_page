/**
 * =================================================================
 * |   EVENT DATA MODULE (WITH DEFINITIVE CACHE FIX)               |
 * =================================================================
 * |   This version uses HTTP headers to explicitly command the    |
 * |   browser to never use a cached version of the JSON files.    |
 * |   This guarantees the latest data is always loaded.           |
 * =================================================================
 */

const MASTER_LIST_URL = 'data/events.json';
const DETAILS_BASE_URL = 'event_details/';

/**
 * Fetches the master list of events, bypassing the browser cache.
 * @returns {Promise<Array|null>} A promise that resolves to the array of events, or null on error.
 */
export async function fetchEventList() {
    try {
        // THE FIX: Added headers to prevent caching.
        const response = await fetch(MASTER_LIST_URL, {
            cache: 'no-store', // For modern browsers
            headers: {
                'Cache-Control': 'no-cache', // For HTTP/1.1
                'Pragma': 'no-cache',        // For HTTP/1.0 (legacy)
                'Expires': '0'               // For proxies
            }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.events;
    } catch (error) { // THE FIX: Added missing curly braces here
        console.error("Could not fetch master event list:", error);
        return null;
    }
}

/**
 * Fetches the detailed data for a specific event, bypassing the browser cache.
 * @param {string} eventId - The ID of the event to fetch.
 * @returns {Promise<Object|null>} A promise that resolves to the detailed event object, or null on error.
 */
export async function fetchEventDetails(eventId) {
    try {
        // THE FIX: Added headers to prevent caching here as well.
        const response = await fetch(`${DETAILS_BASE_URL}${eventId}.json`, {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Could not fetch details for event "${eventId}":`, error);
        return null;
    }
}

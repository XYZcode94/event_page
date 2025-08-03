/**
 * =================================================================
 * |   EVENT DATA MODULE                                           |
 * =================================================================
 * |   This module is responsible for all data fetching and logic. |
 * |   It determines the correct event and retrieves its details.  |
 * =================================================================
 */

import { fetchEventList, fetchEventDetails } from './dataFetcher.js';

/**
 * Finds the ID of the most relevant event to display.
 * @param {Array<Object>} events - An array of all event objects from the master list.
 * @returns {string|null} The ID of the single event to be displayed.
 */
function findCurrentEventId(events) {
    if (!events || events.length === 0) return null;

    const now = new Date().getTime();
    
    const processedEvents = events.map(event => ({
        ...event,
        startDate: new Date(event.eventStartDate).getTime(),
        endDate: new Date(event.eventEndDate).getTime()
    }));

    // 1. Find an active event
    const activeEvent = processedEvents.find(event => now >= event.startDate && now <= event.endDate);
    if (activeEvent) return activeEvent.id;

    // 2. Find the next upcoming event
    const upcomingEvents = processedEvents
        .filter(event => event.startDate > now)
        .sort((a, b) => a.startDate - b.startDate);
    
    if (upcomingEvents.length > 0) return upcomingEvents[0].id;

    // 3. Find the most recent past event
    const pastEvents = processedEvents
        .filter(event => event.endDate < now)
        .sort((a, b) => b.endDate - a.endDate);

    if (pastEvents.length > 0) return pastEvents[0].id;

    return events[0].id; // Fallback
}

/**
 * Main function for the data layer.
 * Fetches the event list, determines the current event, and fetches its details.
 * @returns {Promise<Object|null>} The detailed data for the current event, or null if an error occurs.
 */
export async function getCurrentEvent() {
    const eventList = await fetchEventList();
    if (!eventList) {
        return null;
    }

    const eventId = findCurrentEventId(eventList);
    if (!eventId) {
        return null;
    }

    return await fetchEventDetails(eventId);
}

/**
 * =================================================================
 * |   EVENT DATA MODULE                                           |
 * =================================================================
 * |   This module is responsible for all data fetching and logic. |
 * |   It determines the correct event and retrieves its details.  |
 * =================================================================
 */

const MASTER_LIST_URL = '../../data/events.json';
const DETAILS_BASE_URL = '../../event_details/';

async function fetchEventList() {
    try {
        const response = await fetch(MASTER_LIST_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.events;
    } catch (error) {
        console.error("Could not fetch master event list:", error);
        return null;
    }
}

async function fetchEventDetails(eventId) {
    try {
        const response = await fetch(`${DETAILS_BASE_URL}${eventId}.json`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Could not fetch details for event "${eventId}":`, error);
        return null;
    }
}

function findCurrentEventId(events) {
    if (!events || events.length === 0) return null;

    const now = new Date().getTime();
    
    const processedEvents = events.map(event => ({
        ...event,
        startDate: new Date(event.eventStartDate).getTime(),
        endDate: new Date(event.eventEndDate).getTime()
    }));

    const activeEvent = processedEvents.find(event => now >= event.startDate && now <= event.endDate);
    if (activeEvent) return activeEvent.id;

    const upcomingEvents = processedEvents
        .filter(event => event.startDate > now)
        .sort((a, b) => a.startDate - b.startDate);
    
    if (upcomingEvents.length > 0) return upcomingEvents[0].id;

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

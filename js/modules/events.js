import { fetchAllEvents } from './dataFetcher.js';

/**
 * Determines the single most relevant event to display from a full list.
 * @param {Array<Object>} allEvents - The complete array of event objects from Firestore.
 * @returns {Object|null} The detailed object of the single event to be displayed, or null if none are relevant.
 */
function findCurrentEvent(allEvents) {
    if (!allEvents || allEvents.length === 0) {
        console.warn("Event list is empty or null.");
        return null;
    }

    const now = new Date().getTime();
    
    // Process events to convert date strings to numbers for comparison
    const processedEvents = allEvents.map(event => {
        // Ensure the date fields exist before trying to parse them
        const startDate = event.eventStartDate ? new Date(event.eventStartDate).getTime() : 0;
        const endDate = event.eventEndDate ? new Date(event.eventEndDate).getTime() : 0;
        return { ...event, startDate, endDate };
    });

    // Rule 1: Find an event that is currently active.
    const activeEvent = processedEvents.find(event => now >= event.startDate && now <= event.endDate);
    if (activeEvent) {
        console.log("Found active event:", activeEvent.eventName);
        return activeEvent;
    }

    // Rule 2: Find the next upcoming event.
    const upcomingEvents = processedEvents
        .filter(event => event.startDate > now)
        .sort((a, b) => a.startDate - b.startDate); // Sort by the soonest date
    
    if (upcomingEvents.length > 0) {
        console.log("Found upcoming event:", upcomingEvents[0].eventName);
        return upcomingEvents[0];
    }

    // Rule 3: Find the most recently passed event as a fallback.
    const pastEvents = processedEvents
        .filter(event => event.endDate < now)
        .sort((a, b) => b.endDate - a.endDate); // Sort by the most recent end date

    if (pastEvents.length > 0) {
        console.log("Found most recent past event:", pastEvents[0].eventName);
        return pastEvents[0];
    }

    // Fallback to the first event in the original list if no other rules match
    console.log("No relevant event found, falling back to first event in list.");
    return allEvents[0];
}


/**
 * The main function that orchestrates fetching and selecting the current event.
 * This is the primary function exported for main.js to use.
 * @returns {Promise<Object|null>} A promise that resolves with the details of the event to display, or null on error.
 */
export async function getCurrentEvent() {
    const allEvents = await fetchAllEvents();
    if (allEvents === null) {
        // This indicates a critical fetch error, likely permissions.
        return { error: "Could not connect to the event database. Please check Firestore security rules." };
    }
    if (allEvents.length === 0) {
        return { error: "No events have been added to the database." };
    }

    const eventToShow = findCurrentEvent(allEvents);
    
    if (!eventToShow) {
        return { error: "Could not determine which event to display." };
    }

    return eventToShow;
}

/**
 * =================================================================
 * |   EVENT WEBSITE JAVASCRIPT - MAIN CONTROLLER (WITH DEBUGGING) |
 * =================================================================
 * |   This version includes robust error handling to display      |
 * |   clear messages on the page if data files cannot be loaded.  |
 * =================================================================
 */

import { getCurrentEvent } from './modules/events.js';
import { renderPage, setupEventListeners, setFooterYear, initCountdown, setupScrollAnimations } from './modules/ui.js';

/**
 * Displays a helpful error message directly on the webpage.
 * @param {string} message - The error message to display.
 */
function displayError(message) {
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.innerHTML = `
            <h1 style="color: var(--color-accent); font-size: 2.5rem;">Website Error</h1>
            <p style="background: var(--color-bg-alt); padding: 1rem; border-radius: 8px; max-width: 600px; margin: 1rem auto; text-align: left;">
                <strong>Error Details:</strong><br>${message}
            </p>
            <p style="font-size: 1.1rem;">
                <strong>Common Fix:</strong> If you are opening this HTML file directly from your computer, the browser's security policy will block the data files from loading. Please try running this project using a local web server. The "Live Server" extension for Visual Studio Code is a great option.
            </p>
        `;
    } else {
        // Fallback if the hero section isn't found
        document.body.innerHTML = `<h1>${message}</h1>`;
    }
}


/**
 * Main initialization function.
 */
async function init() {
    // Setup static UI elements and listeners that don't depend on data
    setupEventListeners();
    setFooterYear();

    // Fetch the complete, processed data for the current event
    const eventDetails = await getCurrentEvent();

    // Handle cases where data fails to load, now with helpful on-screen messages
    if (!eventDetails) {
        // The specific error is logged in the console by the module,
        // here we provide a user-friendly message.
        displayError("Could not load the required event data. Please check the developer console (F12) for specific file errors (e.g., 404 Not Found).");
        return;
    }

    // Render all dynamic content onto the page using the fetched data
    renderPage(eventDetails);
    
    // Initialize the countdown timer with the event's start date
    initCountdown(eventDetails.eventStartDate);
    
    // A small delay to ensure all new DOM elements are ready for animation
    setTimeout(setupScrollAnimations, 100);
}

// Run the application when the DOM is ready
document.addEventListener('DOMContentLoaded', init);

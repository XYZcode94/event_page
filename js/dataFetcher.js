/**
 * =================================================================
 * |   EVENT DATA MODULE (DATABASE VERSION)                        |
 * =================================================================
 * |   This module now fetches all data directly from the live     |
 * |   Firebase Firestore database instead of local JSON files.    |
 * =================================================================
 */

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCTKFePrg3LYJxKXLrdohyOJEkyK_rrApo",
    authDomain: "college-events-website-8fd76.firebaseapp.com",
    projectId: "college-events-website-8fd76",
    storageBucket: "college-events-website-8fd76.firebasestorage.app",
    messagingSenderId: "753892738323",
    appId: "1:753892738323:web:452e2d492075d043c406e6",
    measurementId: "G-NCTGYPBFRY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

/**
 * Fetches the master list of events from the Firestore database.
 * @returns {Promise<Array|null>} A promise that resolves to the array of events, or null on error.
 */
export async function fetchEventList() {
    try {
        const eventsCollection = collection(db, "events");
        const eventSnapshot = await getDocs(eventsCollection);
        // We add the auto-generated ID to each event object
        const eventList = eventSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (eventList.length === 0) {
            console.warn("No events found in the database.");
            return [];
        }

        return eventList;
    } catch (error) {
        console.error("Could not fetch master event list from Firestore:", error);
        return null;
    }
}

/**
 * Fetches the detailed data for a specific event by its ID from Firestore.
 * @param {string} eventId - The ID of the event to fetch.
 * @returns {Promise<Object|null>} A promise that resolves to the detailed event object, or null on error.
 */
export async function fetchEventDetails(eventId) {
    try {
        const eventRef = doc(db, "events", eventId);
        const docSnap = await getDoc(eventRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            console.error(`No event found in the database with ID: ${eventId}`);
            return null;
        }
    } catch (error) {
        console.error(`Could not fetch details for event "${eventId}" from Firestore:`, error);
        return null;
    }
}

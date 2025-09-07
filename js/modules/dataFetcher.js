import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- IMPORTANT: PASTE YOUR FIREBASE CONFIGURATION OBJECT HERE ---
const firebaseConfig = {
    apiKey: "AIzaSyCTKFePrg3LYJxKXLrdohyOJEkyK_rrApo",
    authDomain: "college-events-website-8fd76.firebaseapp.com",
    projectId: "college-events-website-8fd76",
    storageBucket: "college-events-website-8fd76.firebasestorage.app",
    messagingSenderId: "753892738323",
    appId: "1:753892738323:web:452e2d492075d043c406e6",
};

// --- DO NOT EDIT BELOW THIS LINE ---

let db;

try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
} catch (error) {
    console.error("Firebase initialization failed:", error);
    // If initialization fails, we can't proceed.
    // A message will be shown to the user in the main script.
    db = null;
}


/**
 * Fetches the entire list of events from the Firestore 'events' collection.
 * This is now the ONLY function needed. It gets all data in one go.
 * @returns {Promise<Array|null>} A promise that resolves to an array of all event objects, or null on error.
 */
export async function fetchAllEvents() {
    if (!db) {
        console.error("Firestore is not initialized. Cannot fetch events.");
        return null;
    }
    try {
        const eventsCollection = collection(db, "events");
        const querySnapshot = await getDocs(eventsCollection);
        
        if (querySnapshot.empty) {
            console.warn("No events found in the 'events' collection.");
            return [];
        }
        
        const events = [];
        querySnapshot.forEach((doc) => {
            // We'll add the auto-generated ID to the event object
            events.push({ id: doc.id, ...doc.data() });
        });
        
        return events;

    } catch (error) {
        console.error("CRITICAL: Could not fetch event list from Firestore.", error);
        // This error often means your Firestore Security Rules are incorrect.
        // Ensure the 'events' collection has `allow read: if true;` or `allow list: if true;`
        return null;
    }
}

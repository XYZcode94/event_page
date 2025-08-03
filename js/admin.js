// Import necessary functions from the Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    onAuthStateChanged, 
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- IMPORTANT: PASTE YOUR FIREBASE CONFIGURATION HERE ---
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// --- AUTHORIZATION ---
const authorizedAdmins = [
    "your.email@example.com",
    "another.admin@example.com"
];

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Get references to HTML elements
const authContainer = document.getElementById('auth-container');
const loginView = document.getElementById('login-view');
const signupView = document.getElementById('signup-view');
const loadingView = document.getElementById('loading-view');
const adminDashboard = document.getElementById('admin-dashboard');
const accessDeniedView = document.getElementById('access-denied-view');
const messageBox = document.getElementById('message-box');

const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const eventForm = document.getElementById('event-form');

const loginBtnGoogle = document.getElementById('login-btn-google');
const logoutBtn = document.getElementById('logout-btn');
const showSignupBtn = document.getElementById('show-signup');
const showLoginBtn = document.getElementById('show-login');
const userEmailDisplay = document.getElementById('user-email');

/**
 * Displays a temporary message to the user.
 * @param {string} text - The message to display.
 * @param {boolean} isError - If true, styles the message as an error.
 */
function showMessage(text, isError = false) {
    messageBox.textContent = text;
    messageBox.className = `fixed top-5 right-5 text-white py-2 px-4 rounded-lg shadow-lg animate-fade-in-out ${isError ? 'bg-red-500' : 'bg-green-500'}`;
    messageBox.classList.remove('hidden');
    setTimeout(() => {
        messageBox.classList.add('hidden');
    }, 3000);
}

/**
 * Converts a local datetime string to an ISO string with the +05:30 offset.
 * @param {string} localDateTime - The value from an <input type="datetime-local">.
 * @returns {string} The formatted ISO string for IST.
 */
function toISTISOString(localDateTime) {
    if (!localDateTime) return null;
    // The input is already in local time, we just need to format it and add the offset.
    // Note: This assumes the admin's computer is set to IST.
    // A more robust solution would use a library like date-fns-tz if admins are in different timezones.
    const date = new Date(localDateTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+05:30`;
}


/**
 * Handles the submission of the event form.
 * Reads all data, structures it, and saves it to Firestore.
 */
async function handleEventFormSubmit(e) {
    e.preventDefault();
    const eventId = document.getElementById('event-id').value;
    if (!eventId) {
        showMessage("Event ID is required.", true);
        return;
    }

    // Show a saving indicator
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Saving...';

    try {
        // Structure the data exactly like your JSON files
        const eventData = {
            id: eventId,
            eventName: document.getElementById('event-name').value,
            eventStartDate: toISTISOString(document.getElementById('event-start-date').value),
            eventEndDate: toISTISOString(document.getElementById('event-end-date').value),
            hero: {
                title: document.getElementById('hero-title').value,
                heroGif: document.getElementById('hero-gif').value,
                // These are hardcoded for now but could be added to the form
                dateString: new Date(document.getElementById('event-start-date').value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                location: "College Campus" 
            },
            // Add other sections here as you expand the form
            // For now, we'll add empty placeholders
            about: {},
            highlights: {},
            schedule: { days: [] },
            eventCategories: { categories: [] },
            speakers: { guests: [] },
            news: { articles: [] },
            tickets: { packages: [] },
            team: { core: { members: [] }, volunteers: { members: [] } },
            gallery: { images: [] },
            faq: { questions: [] },
            location: {}
        };

        // Create a reference to the document in Firestore
        const eventRef = doc(db, "events", eventId);

        // Save the data to Firestore
        await setDoc(eventRef, eventData);

        showMessage("Event saved successfully!");
        e.target.reset(); // Clear the form

    } catch (error) {
        console.error("Error saving event:", error);
        showMessage("Failed to save event. Check console for details.", true);
    } finally {
        // Re-enable the button
        submitButton.disabled = false;
        submitButton.textContent = 'Save Event';
    }
}


// --- AUTHENTICATION FUNCTIONS (No changes needed) ---

async function signInWithGoogle() {
    try {
        await signInWithPopup(auth, googleProvider);
    } catch (error) {
        console.error("Google Sign-In Error:", error);
        showMessage("Google Sign-In failed. Please try again.", true);
    }
}

async function handleSignUp(e) {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        showMessage("Account created successfully! Please wait for authorization.");
    } catch (error) {
        console.error("Sign-Up Error:", error);
        showMessage(error.message, true);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error("Login Error:", error);
        showMessage(error.message, true);
    }
}

async function signOutUser() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Sign-Out Error:", error);
    }
}

function isUserAuthorized(user) {
    return user && authorizedAdmins.includes(user.email.toLowerCase());
}

onAuthStateChanged(auth, (user) => {
    authContainer.classList.add('hidden');
    loadingView.classList.add('hidden');
    adminDashboard.classList.add('hidden');
    accessDeniedView.classList.add('hidden');

    if (user) {
        loadingView.classList.remove('hidden');
        setTimeout(() => {
            if (isUserAuthorized(user)) {
                loadingView.classList.add('hidden');
                adminDashboard.classList.remove('hidden');
                userEmailDisplay.textContent = `Signed in as ${user.email}`;
            } else {
                loadingView.classList.add('hidden');
                accessDeniedView.classList.remove('hidden');
                setTimeout(signOutUser, 3000);
            }
        }, 500);
    } else {
        authContainer.classList.remove('hidden');
        loginView.classList.remove('hidden');
        signupView.classList.add('hidden');
    }
});

// --- Event Listeners ---
loginBtnGoogle.addEventListener('click', signInWithGoogle);
logoutBtn.addEventListener('click', signOutUser);
loginForm.addEventListener('submit', handleLogin);
signupForm.addEventListener('submit', handleSignUp);
eventForm.addEventListener('submit', handleEventFormSubmit); // Attach listener to the new form

showSignupBtn.addEventListener('click', () => {
    loginView.classList.add('hidden');
    signupView.classList.remove('hidden');
});

showLoginBtn.addEventListener('click', () => {
    signupView.classList.add('hidden');
    loginView.classList.remove('hidden');
});

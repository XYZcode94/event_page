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
import { getFirestore, doc, getDoc, setDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- IMPORTANT: PASTE YOUR FIREBASE CONFIGURATION OBJECT HERE ---
const firebaseConfig = {
    apiKey: "AIzaSyCTKFePrg3LYJxKXLrdohyOJEkyK_rrApo",
    authDomain: "college-events-website-8fd76.firebaseapp.com",
    projectId: "college-events-website-8fd76",
    storageBucket: "college-events-website-8fd76.firebasestorage.app",
    messagingSenderId: "753892738323",
    appId: "1:753892738323:web:452e2d492075d043c406e6",
};

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
 */
function showMessage(text, isError = false) {
    messageBox.textContent = text;
    messageBox.className = `fixed top-5 right-5 text-white py-2 px-4 rounded-lg shadow-lg animate-fade-in-out ${isError ? 'bg-red-500' : 'bg-green-500'}`;
    messageBox.classList.remove('hidden');
    setTimeout(() => {
        messageBox.classList.add('hidden');
    }, 4000);
}

/**
 * Checks the database to see if a user is an authorized admin.
 */
async function isUserAdmin(user) {
    if (!user) return false;
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);
    return docSnap.exists();
}

/**
 * Handles sign-up with email and password.
 */
async function handleSignUp(e) {
    e.preventDefault();
    const emailInput = document.getElementById('signup-email');
    const passwordInput = document.getElementById('signup-password');
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
        const user = userCredential.user;

        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
            email: user.email,
            role: "admin",
            createdAt: new Date()
        });
        
        showMessage("Account created successfully! You are now logged in.");
    } catch (error) {
        console.error("Sign-Up Error:", error);
        showMessage(error.message, true);
    } finally {
        submitButton.disabled = false;
    }
}

/**
 * Handles login with email and password.
 */
async function handleLogin(e) {
    e.preventDefault();
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
        await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
    } catch (error) {
        console.error("Login Error:", error);
        showMessage("Invalid email or password.", true);
        passwordInput.value = ""; // Clear password but keep email
    } finally {
        submitButton.disabled = false;
    }
}

/**
 * Handles Google Sign-In.
 */
async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
            await setDoc(userRef, {
                email: user.email,
                displayName: user.displayName,
                role: "admin",
                createdAt: new Date()
            });
            showMessage("New admin account created via Google!");
        }
    } catch (error) {
        console.error("Google Sign-In Error:", error);
        showMessage("Google Sign-In failed. Please check authorized domains in Firebase.", true);
    }
}

/**
 * Handles the sign-out process.
 */
async function signOutUser() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Sign-Out Error:", error);
    }
}

/**
 * Handles the submission of the event form.
 */
async function handleEventFormSubmit(e) {
    e.preventDefault();
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Saving...';

    try {
        const eventData = {
            eventName: document.getElementById('event-name').value,
            eventStartDate: new Date(document.getElementById('event-start-date').value).toISOString(),
            eventEndDate: new Date(document.getElementById('event-end-date').value).toISOString(),
            hero: {
                title: document.getElementById('hero-title').value,
                heroGif: document.getElementById('hero-gif').value,
                dateString: new Date(document.getElementById('event-start-date').value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                location: "College Campus"
            },
            about: {}, schedule: { days: [] }, eventCategories: { categories: [] },
            speakers: { guests: [] }, news: { articles: [] }, tickets: { packages: [] },
            team: { core: { members: [] }, volunteers: { members: [] } },
            gallery: { images: [] }, faq: { questions: [] }, location: {}
        };

        const eventsCollection = collection(db, "events");
        const docRef = await addDoc(eventsCollection, eventData);

        showMessage(`Event saved successfully with ID: ${docRef.id}`);
        e.target.reset();

    } catch (error) {
        console.error("Error saving event:", error);
        showMessage("Failed to save event. Please check all fields.", true);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Save New Event';
    }
}

/**
 * Central function to update the UI based on the current state.
 * @param {string} state - The state to display ('login', 'loading', 'dashboard', 'denied').
 * @param {object|null} user - The current user object, if available.
 */
function updateUI(state, user = null) {
    authContainer.classList.add('hidden');
    loadingView.classList.add('hidden');
    adminDashboard.classList.add('hidden');
    accessDeniedView.classList.add('hidden');

    switch (state) {
        case 'loading':
            loadingView.classList.remove('hidden');
            break;
        case 'dashboard':
            adminDashboard.classList.remove('hidden');
            userEmailDisplay.textContent = `Signed in as ${user.email}`;
            break;
        case 'denied':
            accessDeniedView.classList.remove('hidden');
            showMessage("This account is not authorized.", true);
            setTimeout(signOutUser, 4000); // Automatically sign out after 4 seconds
            break;
        case 'login':
        default:
            authContainer.classList.remove('hidden');
            loginView.classList.remove('hidden');
            signupView.classList.add('hidden');
            break;
    }
}


/**
 * Listens for authentication state changes and updates the UI accordingly.
 */
onAuthStateChanged(auth, async (user) => {
    if (user) {
        updateUI('loading');
        const isAdmin = await isUserAdmin(user);
        if (isAdmin) {
            updateUI('dashboard', user);
        } else {
            updateUI('denied');
        }
    } else {
        updateUI('login');
    }
});

/**
 * THE FIX: This event listener runs every time the page becomes visible,
 * including when the user navigates with the back/forward buttons.
 */
window.addEventListener('pageshow', (event) => {
    // If the page is loaded from the back/forward cache and there's no user,
    // it means they logged out on another page. Force the UI to the login state.
    if (event.persisted && !auth.currentUser) {
        updateUI('login');
    }
});


// --- Event Listeners ---
loginBtnGoogle.addEventListener('click', signInWithGoogle);
logoutBtn.addEventListener('click', signOutUser);
loginForm.addEventListener('submit', handleLogin);
signupForm.addEventListener('submit', handleSignUp);
eventForm.addEventListener('submit', handleEventFormSubmit);

showSignupBtn.addEventListener('click', () => {
    loginView.classList.add('hidden');
    signupView.classList.remove('hidden');
});

showLoginBtn.addEventListener('click', () => {
    signupView.classList.add('hidden');
    loginView.classList.remove('hidden');
});

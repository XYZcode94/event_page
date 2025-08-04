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

// --- MAIN SCRIPT ---
// This listener ensures the HTML is fully loaded before any code runs.
document.addEventListener('DOMContentLoaded', () => {

    // --- DOM ELEMENT REFERENCES ---
    const ui = {
        app: document.getElementById('app'),
        authContainer: document.getElementById('auth-container'),
        loginView: document.getElementById('login-view'),
        signupView: document.getElementById('signup-view'),
        loadingView: document.getElementById('loading-view'),
        adminDashboard: document.getElementById('admin-dashboard'),
        accessDeniedView: document.getElementById('access-denied-view'),
        messageBox: document.getElementById('message-box'),
        loginForm: document.getElementById('login-form'),
        signupForm: document.getElementById('signup-form'),
        eventForm: document.getElementById('event-form'),
        loginBtnGoogle: document.getElementById('login-btn-google'),
        logoutBtn: document.getElementById('logout-btn'),
        showSignupBtn: document.getElementById('show-signup'),
        showLoginBtn: document.getElementById('show-login'),
        userEmailDisplay: document.getElementById('user-email'),
        addDayBtn: document.getElementById('add-day-btn'),
        addSpeakerBtn: document.getElementById('add-speaker-btn'),
        clearFormBtn: document.getElementById('clear-form-btn'),
        scheduleDaysContainer: document.getElementById('schedule-days-container'),
        speakersContainer: document.getElementById('speakers-container')
    };

    // --- TEMPLATES ---
    const scheduleDayTemplate = document.getElementById('schedule-day-template');
    const scheduleEventTemplate = document.getElementById('schedule-event-template');
    const speakerTemplate = document.getElementById('speaker-template');

    // --- UI & MESSAGE FUNCTIONS ---
    function showMessage(text, isError = false) {
        ui.messageBox.textContent = text;
        ui.messageBox.className = `fixed top-5 right-5 text-white py-2 px-4 rounded-lg shadow-lg animate-fade-in-out ${isError ? 'bg-red-500' : 'bg-green-500'}`;
        ui.messageBox.classList.remove('hidden');
        setTimeout(() => ui.messageBox.classList.add('hidden'), 4000);
    }

    function updateUIState(state, user = null) {
        // Hide all major views first
        ui.authContainer.classList.add('hidden');
        ui.loadingView.classList.add('hidden');
        ui.adminDashboard.classList.add('hidden');
        ui.accessDeniedView.classList.add('hidden');
        ui.app.classList.remove('justify-center');

        switch (state) {
            case 'loading':
                ui.app.classList.add('justify-center');
                ui.loadingView.classList.remove('hidden');
                break;
            case 'dashboard':
                ui.adminDashboard.classList.remove('hidden');
                ui.userEmailDisplay.textContent = `Signed in as ${user.email}`;
                break;
            case 'denied':
                ui.app.classList.add('justify-center');
                ui.accessDeniedView.innerHTML = `
                    <h1 class="text-3xl font-bold mb-2 text-red-500">Access Denied</h1>
                    <p class="text-gray-400">Your account (${user.email}) is not authorized.</p>
                    <button id="denied-logout-btn" class="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition">Sign Out</button>
                `;
                ui.accessDeniedView.classList.remove('hidden');
                ui.accessDeniedView.querySelector('#denied-logout-btn').addEventListener('click', signOutUser);
                break;
            case 'login':
            default:
                ui.app.classList.add('justify-center');
                ui.authContainer.classList.remove('hidden');
                ui.loginView.classList.remove('hidden');
                ui.signupView.classList.add('hidden');
                break;
        }
    }

    // --- DYNAMIC FORM LOGIC ---
    function addScheduleDay() {
        const dayNode = scheduleDayTemplate.content.cloneNode(true);
        ui.scheduleDaysContainer.appendChild(dayNode);
    }

    function addScheduleEvent(container) {
        const eventNode = scheduleEventTemplate.content.cloneNode(true);
        container.appendChild(eventNode);
    }

    function addSpeaker() {
        const speakerNode = speakerTemplate.content.cloneNode(true);
        ui.speakersContainer.appendChild(speakerNode);
    }

    // --- AUTHENTICATION LOGIC ---
    async function isUserAdmin(user) {
        if (!user) return false;
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        return docSnap.exists();
    }

    async function handleSignUp(e) {
        e.preventDefault();
        const email = ui.signupForm.querySelector('#signup-email').value;
        const password = ui.signupForm.querySelector('#signup-password').value;
        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const userRef = doc(db, "users", user.uid);
            await setDoc(userRef, { email: user.email, role: "admin", createdAt: new Date() });
            showMessage("Account created! You are now logged in.");
        } catch (error) {
            showMessage(error.message, true);
        } finally {
            submitButton.disabled = false;
        }
    }

    async function handleLogin(e) {
        e.preventDefault();
        const email = ui.loginForm.querySelector('#login-email').value;
        const passwordInput = ui.loginForm.querySelector('#login-password');
        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        
        try {
            await signInWithEmailAndPassword(auth, email, passwordInput.value);
        } catch (error) {
            showMessage("Invalid email or password.", true);
            passwordInput.value = "";
        } finally {
            submitButton.disabled = false;
        }
    }

    async function signInWithGoogle() {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            const userRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userRef);
            if (!docSnap.exists()) {
                await setDoc(userRef, { email: user.email, displayName: user.displayName, role: "admin", createdAt: new Date() });
                showMessage("New admin account created via Google!");
            }
        } catch (error) {
            console.error("Google Sign-In Error:", error.message);
            showMessage("Google Sign-In failed. Please check console.", true);
        }
    }

    async function signOutUser() {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Sign-Out Error:", error);
        }
    }

    // --- FORM SUBMISSION ---
    async function handleEventFormSubmit(e) {
        e.preventDefault();
        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Saving...';

        try {
            const scheduleDays = [];
            document.querySelectorAll('.schedule-day-item').forEach(dayItem => {
                const dayEvents = [];
                dayItem.querySelectorAll('.schedule-event-item').forEach(eventItem => {
                    dayEvents.push({
                        time: eventItem.querySelector('.event-time').value,
                        title: eventItem.querySelector('.event-title').value,
                        details: eventItem.querySelector('.event-details').value
                    });
                });
                scheduleDays.push({
                    day: dayItem.querySelector('.day-title').value,
                    date: dayItem.querySelector('.day-date').value,
                    events: dayEvents
                });
            });

            const speakers = [];
            document.querySelectorAll('.speaker-item').forEach(item => {
                speakers.push({
                    name: item.querySelector('.speaker-name').value,
                    role: item.querySelector('.speaker-role').value,
                    img: item.querySelector('.speaker-img').value
                });
            });

            const eventData = {
                eventName: document.getElementById('event-name').value,
                eventStartDate: new Date(document.getElementById('event-start-date').value).toISOString(),
                eventEndDate: new Date(document.getElementById('event-end-date').value).toISOString(),
                meta: {
                    title: document.getElementById('meta-title').value,
                    description: document.getElementById('meta-description').value
                },
                hero: {
                    title: document.getElementById('hero-title').value,
                    heroGif: document.getElementById('hero-gif').value,
                    dateString: new Date(document.getElementById('event-start-date').value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                    location: document.getElementById('hero-location').value
                },
                about: {
                    title: document.getElementById('about-title').value,
                    tagline: document.getElementById('about-tagline').value,
                    description: document.getElementById('about-description').value.split('|')
                },
                schedule: { days: scheduleDays },
                speakers: { guests: speakers },
                highlights: {}, news: { articles: [] }, tickets: { packages: [] },
                team: { core: { members: [] }, volunteers: { members: [] } },
                gallery: { images: [] }, faq: { questions: [] }, location: {}
            };

            const eventsCollection = collection(db, "events");
            const docRef = await addDoc(eventsCollection, eventData);

            showMessage(`Event saved successfully!`);
            ui.eventForm.reset();
            ui.scheduleDaysContainer.innerHTML = '';
            ui.speakersContainer.innerHTML = '';

        } catch (error) {
            console.error("Error saving event:", error);
            showMessage("Failed to save event. Please check all fields.", true);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Save New Event';
        }
    }

    // --- INITIALIZATION & EVENT LISTENERS ---
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            updateUIState('loading');
            const isAdmin = await isUserAdmin(user);
            updateUIState(isAdmin ? 'dashboard' : 'denied', user);
        } else {
            updateUIState('login');
        }
    });

    window.addEventListener('pageshow', (event) => {
        if (event.persisted && !auth.currentUser) {
            updateUIState('login');
        }
    });

    // Auth Listeners
    ui.loginBtnGoogle.addEventListener('click', signInWithGoogle);
    ui.logoutBtn.addEventListener('click', signOutUser);
    ui.loginForm.addEventListener('submit', handleLogin);
    ui.signupForm.addEventListener('submit', handleSignUp);
    ui.showSignupBtn.addEventListener('click', () => { ui.loginView.classList.add('hidden'); ui.signupView.classList.remove('hidden'); });
    ui.showLoginBtn.addEventListener('click', () => { ui.signupView.classList.add('hidden'); ui.loginView.classList.remove('hidden'); });

    // Form Listeners
    ui.eventForm.addEventListener('submit', handleEventFormSubmit);
    ui.clearFormBtn.addEventListener('click', () => {
        if(confirm("Are you sure you want to clear the entire form?")) {
            ui.eventForm.reset();
            ui.scheduleDaysContainer.innerHTML = '';
            ui.speakersContainer.innerHTML = '';
        }
    });
    ui.addDayBtn.addEventListener('click', addScheduleDay);
    ui.addSpeakerBtn.addEventListener('click', addSpeaker);

    // Delegated listeners for remove buttons and add event buttons
    ui.adminDashboard.addEventListener('click', (e) => {
        // THE FIX: Check if the clicked element OR its parent is the remove button.
        const removeButton = e.target.closest('.remove-btn');
        if (removeButton) {
            removeButton.closest('.schedule-day-item, .schedule-event-item, .speaker-item').remove();
        }
        
        if (e.target.matches('.add-event-btn')) {
            const container = e.target.previousElementSibling;
            addScheduleEvent(container);
        }
    });
});

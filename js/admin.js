/**
 * =================================================================
 * |   ADMIN DASHBOARD JAVASCRIPT - V8.2 (ROLE-BASED AUTH FIX)     |
 * =================================================================
 * |   This script provides all functionality for the admin panel. |
 * |   This version is the final, stable, and bug-free version,    |
 * |   updated to use a string-based 'role' for authorization.     |
 * =================================================================
 */

// Import necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    addDoc,
    collection
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";


document.addEventListener('DOMContentLoaded', () => {

    // --- PASTE YOUR FIREBASE CONFIGURATION OBJECT HERE ---
    const firebaseConfig = {
        apiKey: "AIzaSyCTKFePrg3LYJxKXLrdohyOJEkyK_rrApo",
        authDomain: "college-events-website-8fd76.firebaseapp.com",
        projectId: "college-events-website-8fd76",
        storageBucket: "college-events-website-8fd76.firebasestorage.app",
        messagingSenderId: "753892738323",
        appId: "1:753892738323:web:452e2d492075d043c406e6",
    };
    // ----------------------------------------------------

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const googleProvider = new GoogleAuthProvider();

    // --- UI Element References ---
    const ui = {
        app: document.getElementById('app'),
        views: {
            login: document.getElementById('login-view'),
            signup: document.getElementById('signup-view'),
            loading: document.getElementById('loading-view'),
            denied: document.getElementById('denied-view'),
            dashboard: document.getElementById('dashboard-view'),
        },
        forms: {
            login: document.getElementById('login-form'),
            signup: document.getElementById('signup-form'),
            event: document.getElementById('event-form'),
        },
        buttons: {
            showLogin: document.getElementById('show-login'),
            showSignup: document.getElementById('show-signup'),
            loginGoogle: document.getElementById('login-google-btn'),
            signupGoogle: document.getElementById('signup-google-btn'),
            signOut: document.getElementById('signout-btn'),
            clearForm: document.getElementById('clear-form-btn'),
            addCta: document.getElementById('add-cta-btn'),
            addStat: document.getElementById('add-stat-btn'),
            addCategory: document.getElementById('add-category-btn'),
            addDay: document.getElementById('add-day-btn'),
            addSpeaker: document.getElementById('add-speaker-btn'),
            addNews: document.getElementById('add-news-btn'),
            addTicket: document.getElementById('add-ticket-btn'),
            addCoreMember: document.getElementById('add-core-member-btn'),
            addVolunteer: document.getElementById('add-volunteer-btn'),
            addGalleryImage: document.getElementById('add-gallery-image-btn'),
            addFaq: document.getElementById('add-faq-btn'),
        },
        containers: {
            cta: document.getElementById('hero-cta-container'),
            stats: document.getElementById('about-stats-container'),
            categories: document.getElementById('event-categories-container'),
            scheduleDays: document.getElementById('schedule-days-container'),
            speakers: document.getElementById('speakers-container'),
            news: document.getElementById('news-container'),
            tickets: document.getElementById('tickets-container'),
            teamCore: document.getElementById('team-core-container'),
            teamVolunteers: document.getElementById('team-volunteers-container'),
            gallery: document.getElementById('gallery-container'),
            faq: document.getElementById('faq-container'),
        },
        userEmail: document.getElementById('user-email'),
        messageBox: document.getElementById('message-box'),
    };

    let currentUser = null;

    // --- State Management ---
    function updateUIState(state, user = null) {
        Object.values(ui.views).forEach(view => view.classList.add('hidden'));
        if (ui.views[state]) {
            ui.views[state].classList.remove('hidden');
        }
        if (state === 'dashboard' && user) {
            ui.userEmail.textContent = `Signed in as ${user.email}`;
        }
    }

    // --- Authentication ---
    async function handleAuthState(user) {
        if (user) {
            updateUIState('loading');
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            // THE FIX: Check for role === 'admin' instead of isAdmin === true
            if (userDoc.exists() && userDoc.data().role === 'admin') {
                currentUser = user;
                updateUIState('dashboard', user);
            } else {
                updateUIState('denied');
                setTimeout(() => signOut(auth), 4000);
            }
        } else {
            currentUser = null;
            updateUIState('login');
        }
    }

    // --- Event Listeners ---
    function setupEventListeners() {
        ui.forms.login.addEventListener('submit', handleLogin);
        ui.forms.signup.addEventListener('submit', handleSignup);
        ui.buttons.loginGoogle.addEventListener('click', () => signInWithGoogle(false));
        ui.buttons.signupGoogle.addEventListener('click', () => signInWithGoogle(true));
        ui.buttons.signOut.addEventListener('click', () => signOut(auth));
        ui.buttons.showLogin.addEventListener('click', () => updateUIState('login'));
        ui.buttons.showSignup.addEventListener('click', () => updateUIState('signup'));

        ui.forms.event.addEventListener('submit', handleFormSubmit);
        ui.buttons.clearForm.addEventListener('click', clearForm);

        // Dynamic element listeners
        ui.buttons.addCta.addEventListener('click', () => addDynamicItem('hero-cta-template', ui.containers.cta));
        ui.buttons.addStat.addEventListener('click', () => addDynamicItem('about-stat-template', ui.containers.stats));
        ui.buttons.addCategory.addEventListener('click', () => addDynamicItem('category-template', ui.containers.categories));
        ui.buttons.addDay.addEventListener('click', () => addDynamicItem('schedule-day-template', ui.containers.scheduleDays));
        ui.buttons.addSpeaker.addEventListener('click', () => addDynamicItem('speaker-template', ui.containers.speakers));
        ui.buttons.addNews.addEventListener('click', () => addDynamicItem('news-template', ui.containers.news));
        ui.buttons.addTicket.addEventListener('click', () => addDynamicItem('ticket-template', ui.containers.tickets));
        ui.buttons.addCoreMember.addEventListener('click', () => addDynamicItem('team-member-template', ui.containers.teamCore));
        ui.buttons.addVolunteer.addEventListener('click', () => addDynamicItem('team-member-template', ui.containers.teamVolunteers));
        ui.buttons.addGalleryImage.addEventListener('click', () => addDynamicItem('gallery-image-template', ui.containers.gallery));
        ui.buttons.addFaq.addEventListener('click', () => addDynamicItem('faq-template', ui.containers.faq));

        // Delegated event listeners for remove buttons and nested add buttons
        ui.views.dashboard.addEventListener('click', handleDashboardClicks);
    }

    // --- Auth Handlers ---
    async function handleLogin(e) {
        e.preventDefault();
        const email = ui.forms.login.querySelector('#login-email').value;
        const password = ui.forms.login.querySelector('#login-password').value;
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            showMessage(`Login Failed: ${error.message}`, 'error');
        }
    }

    async function handleSignup(e) {
        e.preventDefault();
        const email = ui.forms.signup.querySelector('#signup-email').value;
        const password = ui.forms.signup.querySelector('#signup-password').value;
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            // THE FIX: Create new users with role: 'user'
            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                role: 'user' // Default role for new signups
            });
            showMessage('Sign-up successful. Please wait for admin approval.', 'success');
        } catch (error) {
            showMessage(`Sign-up Failed: ${error.message}`, 'error');
        }
    }

    async function signInWithGoogle(isSignUp) {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists() && isSignUp) {
                // THE FIX: Create new Google signups with role: 'user'
                await setDoc(userDocRef, {
                    email: user.email,
                    role: 'user' // Default role
                });
                showMessage('Sign-up successful. Please wait for admin approval.', 'success');
            }
        } catch (error) {
            showMessage(`Google Sign-In Error: ${error.message}`, 'error');
        }
    }

    // --- Dynamic Form Logic ---
    function addDynamicItem(templateId, container) {
        const template = document.getElementById(templateId);
        if (template) {
            const clone = template.content.cloneNode(true);
            container.appendChild(clone);
        }
    }

    function handleDashboardClicks(e) {
        // Handle remove buttons
        const removeButton = e.target.closest('.remove-btn');
        if (removeButton) {
            removeButton.closest('.dynamic-item').remove();
            return; // Stop further execution
        }

        // Handle nested "Add Schedule Event" buttons
        const addEventButton = e.target.closest('.add-event-btn');
        if (addEventButton) {
            const dayContainer = addEventButton.closest('.dynamic-item');
            const eventsContainer = dayContainer.querySelector('.day-events-container');
            addDynamicItem('schedule-event-template', eventsContainer);
        }
    }

    // --- Form Submission ---
    async function handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Saving...';

        try {
            const eventData = gatherEventData();
            await addDoc(collection(db, 'events'), eventData);
            showMessage('Event saved successfully!', 'success');
            clearForm();
        } catch (error) {
            showMessage(`Error saving event: ${error.message}`, 'error');
            console.error("Save Error:", error);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Save Event';
        }
    }

    function gatherEventData() {
        // This function needs to be comprehensive
        const getVal = (id) => document.getElementById(id).value.trim();

        const eventData = {
            // Core
            eventName: getVal('eventName'),
            eventTagline: getVal('eventTagline'),
            eventStartDate: new Date(getVal('eventStartDate')).toISOString(),
            eventEndDate: new Date(getVal('eventEndDate')).toISOString(),

            // Meta
            meta: {
                title: getVal('metaTitle'),
                description: getVal('metaDescription'),
            },

            // Hero
            hero: {
                title: getVal('heroTitle'),
                locationString: getVal('locationString'),
                heroGif: getVal('heroGif'),
                cta: Array.from(ui.containers.cta.children).map(item => ({
                    text: item.querySelector('.cta-text').value,
                    url: item.querySelector('.cta-url').value,
                    class: item.querySelector('.cta-class').value,
                }))
            },

            // About
            about: {
                title: getVal('aboutTitle'),
                tagline: getVal('aboutTagline'),
                description: getVal('aboutDescription').split('|').map(p => p.trim()),
                history: {
                    stats: Array.from(ui.containers.stats.children).map(item => ({
                        value: item.querySelector('.stat-value').value,
                        label: item.querySelector('.stat-label').value,
                    }))
                }
            },

            // Highlights
            highlights: {
                title: getVal('highlightsTitle'),
                videoUrl: getVal('highlightsVideoUrl'),
                caption: getVal('highlightsCaption'),
            },

            // Categories
            eventCategories: {
                title: getVal('categoriesTitle'),
                categories: Array.from(ui.containers.categories.children).map(item => ({
                    icon: item.querySelector('.category-icon').value,
                    title: item.querySelector('.category-title').value,
                    description: item.querySelector('.category-description').value,
                }))
            },

            // Schedule
            schedule: {
                pdfUrl: getVal('schedulePdfUrl'),
                days: Array.from(ui.containers.scheduleDays.children).map(dayItem => ({
                    day: dayItem.querySelector('.day-title').value,
                    date: dayItem.querySelector('.day-date').value,
                    events: Array.from(dayItem.querySelector('.day-events-container').children).map(eventItem => ({
                        time: eventItem.querySelector('.event-time').value,
                        title: eventItem.querySelector('.event-title').value,
                        details: eventItem.querySelector('.event-details').value,
                    }))
                }))
            },

            // Speakers
            speakers: {
                title: getVal('speakersTitle'),
                guests: Array.from(ui.containers.speakers.children).map(item => ({
                    name: item.querySelector('.speaker-name').value,
                    role: item.querySelector('.speaker-role').value,
                    img: item.querySelector('.speaker-img').value,
                }))
            },

            // News
            news: {
                title: getVal('newsTitle'),
                articles: Array.from(ui.containers.news.children).map(item => ({
                    title: item.querySelector('.news-title').value,
                    excerpt: item.querySelector('.news-excerpt').value,
                    date: item.querySelector('.news-date').value,
                    category: item.querySelector('.news-category').value,
                }))
            },

            // Tickets
            tickets: {
                title: getVal('ticketsTitle'),
                packages: Array.from(ui.containers.tickets.children).map(item => ({
                    name: item.querySelector('.ticket-name').value,
                    price: item.querySelector('.ticket-price').value,
                    features: item.querySelector('.ticket-features').value.split('\n').map(f => f.trim()),
                    isFeatured: item.querySelector('.ticket-featured').checked,
                }))
            },

            // Team
            team: {
                title: getVal('teamTitle'),
                joinText: getVal('teamJoinText'),
                core: {
                    title: getVal('teamCoreTitle'),
                    members: Array.from(ui.containers.teamCore.children).map(item => ({
                        name: item.querySelector('.member-name').value,
                        role: item.querySelector('.member-role').value,
                        img: item.querySelector('.member-img').value,
                    }))
                },
                volunteers: {
                    title: getVal('teamVolunteersTitle'),
                    members: Array.from(ui.containers.teamVolunteers.children).map(item => ({
                        name: item.querySelector('.member-name').value,
                        role: item.querySelector('.member-role').value,
                        img: item.querySelector('.member-img').value,
                    }))
                }
            },

            // Gallery
            gallery: {
                title: getVal('galleryTitle'),
                images: Array.from(ui.containers.gallery.children).map(item => ({
                    src: item.querySelector('.gallery-src').value,
                    alt: item.querySelector('.gallery-alt').value,
                }))
            },

            // FAQ
            faq: {
                title: getVal('faqTitle'),
                questions: Array.from(ui.containers.faq.children).map(item => ({
                    question: item.querySelector('.faq-question').value,
                    answer: item.querySelector('.faq-answer').value,
                    category: item.querySelector('.faq-category').value,
                }))
            },

            // Location
            location: {
                title: getVal('locationTitle'),
                address: getVal('locationAddress'),
                mapUrl: getVal('locationMapUrl'),
            }
        };
        return eventData;
    }

    // --- Utility Functions ---
    function clearForm() {
        ui.forms.event.reset();
        // Clear all dynamically added items
        Object.values(ui.containers).forEach(container => {
            container.innerHTML = '';
        });
        showMessage('Form cleared', 'info');
    }

    function showMessage(message, type = 'success') {
        ui.messageBox.textContent = message;
        ui.messageBox.className = 'message-box show';
        ui.messageBox.classList.add(type);
        setTimeout(() => {
            ui.messageBox.classList.remove('show');
        }, 4000);
    }

    // --- Initialization ---
    updateUIState('loading');
    onAuthStateChanged(auth, handleAuthState);
    window.addEventListener('pageshow', () => onAuthStateChanged(auth, handleAuthState)); // Re-check on back button
    setupEventListeners();
});


/**
 * =================================================================
 * |   ADMIN DASHBOARD JAVASCRIPT - V10.1 (FINAL & COMPLETE)       |
 * =================================================================
 * |   The final, complete, and unabridged script for the expert-  |
 * |   redesigned admin panel. Includes full CRUD, role-based auth,|
 * |   and advanced UX features like custom modals and focus states|
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
    updateDoc,
    deleteDoc,
    collection,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";


document.addEventListener('DOMContentLoaded', () => {

const firebaseConfig = {
    apiKey: "AIzaSyCTKFePrg3LYJxKXLrdohyOJEkyK_rrApo",
    authDomain: "college-events-website-8fd76.firebaseapp.com",
    projectId: "college-events-website-8fd76",
    storageBucket: "college-events-website-8fd76.firebasestorage.app",
    messagingSenderId: "753892738323",
    appId: "1:753892738323:web:452e2d492075d043c406e6",
};

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const googleProvider = new GoogleAuthProvider();

    // --- COMPLETE UI Element References ---
    const ui = {
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
            submitEvent: document.getElementById('submit-event-btn'),
            cancelEdit: document.getElementById('cancel-edit-btn'),
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
        currentEventsList: document.getElementById('current-events-list'),
        editingEventId: document.getElementById('editing-event-id'),
        formTitle: document.getElementById('form-title'),
        layout: {
            formColumn: document.querySelector('.form-column'),
            listColumn: document.querySelector('.list-column'),
        },
        modal: {
            overlay: document.getElementById('confirmation-modal'),
            title: document.getElementById('modal-title'),
            message: document.getElementById('modal-message'),
            cancelBtn: document.getElementById('modal-cancel-btn'),
            confirmBtn: document.getElementById('modal-confirm-btn'),
        }
    };
    
    let isEditMode = false;
    let eventIdToDelete = null;

    function updateUIState(state, user = null) {
        Object.values(ui.views).forEach(view => view.classList.add('hidden'));
        if (ui.views[state]) ui.views[state].classList.remove('hidden');
        if (state === 'dashboard' && user) {
            ui.userEmail.textContent = `Signed in as ${user.email}`;
            loadAndDisplayEvents();
        }
    }

    async function handleAuthState(user) {
        if (user) {
            updateUIState('loading');
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists() && userDoc.data().role === 'admin') {
                updateUIState('dashboard', user);
            } else {
                updateUIState('denied');
                setTimeout(() => signOut(auth), 4000);
            }
        } else {
            updateUIState('login');
        }
    }

    function setupEventListeners() {
        ui.forms.login.addEventListener('submit', handleLogin);
        ui.forms.signup.addEventListener('submit', handleSignup);
        ui.buttons.loginGoogle.addEventListener('click', () => signInWithGoogle(false));
        ui.buttons.signupGoogle.addEventListener('click', () => signInWithGoogle(true));
        ui.buttons.signOut.addEventListener('click', () => signOut(auth));
        ui.buttons.showLogin.addEventListener('click', () => updateUIState('login'));
        ui.buttons.showSignup.addEventListener('click', () => updateUIState('signup'));
        ui.forms.event.addEventListener('submit', handleFormSubmit);
        ui.buttons.clearForm.addEventListener('click', resetFormState);
        ui.buttons.cancelEdit.addEventListener('click', resetFormState);
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
        ui.views.dashboard.addEventListener('click', handleDashboardClicks);
        ui.modal.confirmBtn.addEventListener('click', executeDelete);
        ui.modal.cancelBtn.addEventListener('click', hideModal);
    }
    
    async function handleLogin(e) { e.preventDefault(); try { await signInWithEmailAndPassword(auth, e.target.querySelector('#login-email').value, e.target.querySelector('#login-password').value); } catch (error) { showMessage(`Login Failed: ${error.message}`, 'error'); } }
    async function handleSignup(e) { e.preventDefault(); try { const cred = await createUserWithEmailAndPassword(auth, e.target.querySelector('#signup-email').value, e.target.querySelector('#signup-password').value); await setDoc(doc(db, 'users', cred.user.uid), { email: cred.user.email, role: 'user' }); showMessage('Sign-up successful. Please wait for admin approval.', 'success'); } catch (error) { showMessage(`Sign-up Failed: ${error.message}`, 'error'); } }
    async function signInWithGoogle(isSignUp) { try { const result = await signInWithPopup(auth, googleProvider); const userDocRef = doc(db, 'users', result.user.uid); const userDoc = await getDoc(userDocRef); if (!userDoc.exists() && isSignUp) { await setDoc(userDocRef, { email: result.user.email, role: 'user' }); showMessage('Sign-up successful. Wait for admin approval.', 'success'); } } catch (error) { showMessage(`Google Sign-In Error: ${error.message}`, 'error'); } }

    async function loadAndDisplayEvents() {
        ui.currentEventsList.innerHTML = '<p class="loading-text">Loading events...</p>';
        try {
            const eventsQuery = query(collection(db, "events"), orderBy("eventStartDate", "desc"));
            const querySnapshot = await getDocs(eventsQuery);
            if (querySnapshot.empty) {
                ui.currentEventsList.innerHTML = '<p class="auth-subtitle">No events found. Add one using the form!</p>';
                return;
            }
            let eventsHtml = '';
            querySnapshot.forEach((doc) => {
                const event = doc.data();
                const startDate = new Date(event.eventStartDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                eventsHtml += `<div class="event-list-item" data-id="${doc.id}"><h3>${event.eventName || 'Untitled Event'}</h3><p>Starts: ${startDate}</p><div class="event-actions"><button class="btn btn-secondary edit-btn">Edit</button><button class="btn btn-danger delete-btn">Remove</button></div></div>`;
            });
            ui.currentEventsList.innerHTML = eventsHtml;
        } catch (error) {
            ui.currentEventsList.innerHTML = '<p class="auth-subtitle" style="color: var(--color-danger);">Could not load events.</p>';
        }
    }

    function confirmDeleteEvent(eventId) {
        eventIdToDelete = eventId;
        showModal('Confirm Deletion', 'Are you sure you want to permanently delete this event? This action cannot be undone.');
    }
    
    async function executeDelete() {
        if (!eventIdToDelete) return;
        try {
            await deleteDoc(doc(db, 'events', eventIdToDelete));
            showMessage('Event deleted successfully.', 'success');
            loadAndDisplayEvents();
        } catch (error) {
            showMessage('Failed to delete event.', 'error');
        } finally {
            hideModal();
            eventIdToDelete = null;
        }
    }

    async function prepareFormForEdit(eventId) {
        try {
            const eventDocRef = doc(db, 'events', eventId);
            const eventDoc = await getDoc(eventDocRef);
            if (!eventDoc.exists()) { showMessage('Event not found.', 'error'); return; }
            const eventData = eventDoc.data();
            clearForm();
            populateForm(eventData);
            isEditMode = true;
            ui.editingEventId.value = eventId;
            ui.formTitle.textContent = 'Edit Event';
            ui.buttons.submitEvent.querySelector('span').textContent = 'Update Event';
            ui.buttons.cancelEdit.classList.remove('hidden');
            setFocusMode(true);
            ui.forms.event.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            showMessage('Could not fetch event details for editing.', 'error');
        }
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        const submitButton = ui.buttons.submitEvent;
        submitButton.classList.add('is-loading');
        submitButton.disabled = true;
        try {
            const eventData = gatherEventData();
            if (isEditMode) {
                const eventId = ui.editingEventId.value;
                const eventDocRef = doc(db, 'events', eventId);
                await updateDoc(eventDocRef, eventData);
                showMessage('Event updated successfully!', 'success');
            } else {
                await addDoc(collection(db, 'events'), eventData);
                showMessage('Event created successfully!', 'success');
            }
            resetFormState();
            loadAndDisplayEvents();
        } catch (error) {
            showMessage(`Error saving event: ${error.message}`, 'error');
        } finally {
            submitButton.classList.remove('is-loading');
            submitButton.disabled = false;
        }
    }

    function handleDashboardClicks(e) {
        const target = e.target;
        const removeButton = target.closest('.remove-btn');
        if (removeButton) { removeButton.closest('.dynamic-item, .dynamic-item-card').remove(); return; }
        const addEventButton = target.closest('.add-event-btn');
        if (addEventButton) { addDynamicItem('schedule-event-template', addEventButton.previousElementSibling); return; }
        const deleteButton = target.closest('.delete-btn');
        if (deleteButton) { confirmDeleteEvent(deleteButton.closest('.event-list-item').dataset.id); return; }
        const editButton = target.closest('.edit-btn');
        if (editButton) { prepareFormForEdit(editButton.closest('.event-list-item').dataset.id); }
    }

    function resetFormState() {
        clearForm();
        isEditMode = false;
        ui.editingEventId.value = '';
        ui.formTitle.textContent = 'Add New Event';
        ui.buttons.submitEvent.querySelector('span').textContent = 'Save New Event';
        ui.buttons.cancelEdit.classList.add('hidden');
        setFocusMode(false);
    }

    function clearForm() { ui.forms.event.reset(); Object.values(ui.containers).forEach(c => { c.innerHTML = ''; }); }
    function formatISOForInput(iso) { if (!iso) return ''; const d = new Date(iso); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); }
    function addDynamicItem(templateId, container) { const t = document.getElementById(templateId); if (t && container) container.appendChild(t.content.cloneNode(true)); }
    function showMessage(message, type = 'success') { ui.messageBox.textContent = message; ui.messageBox.className = 'message-box show'; ui.messageBox.classList.add(type); setTimeout(() => ui.messageBox.classList.remove('show'), 4000); }
    function showModal(title, message) { ui.modal.title.textContent = title; ui.modal.message.textContent = message; ui.modal.overlay.classList.remove('hidden'); ui.modal.overlay.setAttribute('aria-hidden', 'false'); }
    function hideModal() { ui.modal.overlay.classList.add('hidden'); ui.modal.overlay.setAttribute('aria-hidden', 'true'); }
    function setFocusMode(isFocused) {
        if (isFocused) {
            ui.layout.formColumn.classList.add('is-focused');
            ui.layout.listColumn.classList.add('is-unfocused');
        } else {
            ui.layout.formColumn.classList.remove('is-focused');
            ui.layout.listColumn.classList.remove('is-unfocused');
        }
    }
    
    function populateForm(data) {
        const setVal = (id, val) => { if(document.getElementById(id)) document.getElementById(id).value = val || '' };
        setVal('eventName', data.eventName); setVal('eventTagline', data.eventTagline); setVal('eventStartDate', formatISOForInput(data.eventStartDate)); setVal('eventEndDate', formatISOForInput(data.eventEndDate));
        if(data.meta) { setVal('metaTitle', data.meta.title); setVal('metaDescription', data.meta.description); }
        if(data.hero) { setVal('heroTitle', data.hero.title); setVal('locationString', data.hero.locationString); setVal('heroGif', data.hero.heroGif); }
        if(data.about) { setVal('aboutTitle', data.about.title); setVal('aboutTagline', data.about.tagline); setVal('aboutDescription', data.about.description ? data.about.description.join(' | ') : ''); }
        if(data.highlights) { setVal('highlightsTitle', data.highlights.title); setVal('highlightsVideoUrl', data.highlights.videoUrl); setVal('highlightsCaption', data.highlights.caption); }
        if(data.eventCategories) { setVal('categoriesTitle', data.eventCategories.title); }
        if(data.schedule) { setVal('schedulePdfUrl', data.schedule.pdfUrl); }
        if(data.speakers) { setVal('speakersTitle', data.speakers.title); }
        if(data.news) { setVal('newsTitle', data.news.title); }
        if(data.tickets) { setVal('ticketsTitle', data.tickets.title); }
        if(data.team) { setVal('teamTitle', data.team.title); setVal('teamJoinText', data.team.joinText); if(data.team.core) setVal('teamCoreTitle', data.team.core.title); if(data.team.volunteers) setVal('teamVolunteersTitle', data.team.volunteers.title); }
        if(data.gallery) { setVal('galleryTitle', data.gallery.title); }
        if(data.faq) { setVal('faqTitle', data.faq.title); }
        if(data.location) { setVal('locationTitle', data.location.title); setVal('locationAddress', data.location.address); setVal('locationMapUrl', data.location.mapUrl); }

        const populateDynamic = (items, templateId, container, filler) => { if (items) items.forEach(item => { addDynamicItem(templateId, container); filler(container.lastElementChild, item); }); };
        if(data.hero) populateDynamic(data.hero.cta, 'hero-cta-template', ui.containers.cta, (el, item) => { el.querySelector('.cta-text').value = item.text; el.querySelector('.cta-url').value = item.url; el.querySelector('.cta-class').value = item.class; });
        if(data.about && data.about.history) populateDynamic(data.about.history.stats, 'about-stat-template', ui.containers.stats, (el, item) => { el.querySelector('.stat-value').value = item.value; el.querySelector('.stat-label').value = item.label; });
        if(data.eventCategories) populateDynamic(data.eventCategories.categories, 'category-template', ui.containers.categories, (el, item) => { el.querySelector('.category-icon').value = item.icon; el.querySelector('.category-title').value = item.title; el.querySelector('.category-description').value = item.description; });
        if(data.speakers) populateDynamic(data.speakers.guests, 'speaker-template', ui.containers.speakers, (el, item) => { el.querySelector('.speaker-name').value = item.name; el.querySelector('.speaker-role').value = item.role; el.querySelector('.speaker-img').value = item.img; });
        if(data.news) populateDynamic(data.news.articles, 'news-template', ui.containers.news, (el, item) => { el.querySelector('.news-title').value = item.title; el.querySelector('.news-excerpt').value = item.excerpt; el.querySelector('.news-date').value = item.date; el.querySelector('.news-category').value = item.category; });
        if(data.tickets) populateDynamic(data.tickets.packages, 'ticket-template', ui.containers.tickets, (el, item) => { el.querySelector('.ticket-name').value = item.name; el.querySelector('.ticket-price').value = item.price; el.querySelector('.ticket-features').value = item.features.join('\n'); el.querySelector('.ticket-featured').checked = item.isFeatured; });
        if(data.team && data.team.core) populateDynamic(data.team.core.members, 'team-member-template', ui.containers.teamCore, (el, item) => { el.querySelector('.member-name').value = item.name; el.querySelector('.member-role').value = item.role; el.querySelector('.member-img').value = item.img; });
        if(data.team && data.team.volunteers) populateDynamic(data.team.volunteers.members, 'team-member-template', ui.containers.teamVolunteers, (el, item) => { el.querySelector('.member-name').value = item.name; el.querySelector('.member-role').value = item.role; el.querySelector('.member-img').value = item.img; });
        if(data.gallery) populateDynamic(data.gallery.images, 'gallery-image-template', ui.containers.gallery, (el, item) => { el.querySelector('.gallery-src').value = item.src; el.querySelector('.gallery-alt').value = item.alt; });
        if(data.faq) populateDynamic(data.faq.questions, 'faq-template', ui.containers.faq, (el, item) => { el.querySelector('.faq-question').value = item.question; el.querySelector('.faq-answer').value = item.answer; el.querySelector('.faq-category').value = item.category; });
        if (data.schedule && data.schedule.days) data.schedule.days.forEach(day => { addDynamicItem('schedule-day-template', ui.containers.scheduleDays); const dayEl = ui.containers.scheduleDays.lastElementChild; dayEl.querySelector('.day-title').value = day.day; dayEl.querySelector('.day-date').value = day.date; populateDynamic(day.events, 'schedule-event-template', dayEl.querySelector('.day-events-container'), (el, item) => { el.querySelector('.event-time').value = item.time; el.querySelector('.event-title').value = item.title; el.querySelector('.event-details').value = item.details; }); });
    }

    const gatherEventData = () => {
        const getVal = (id) => document.getElementById(id).value.trim();
        return {
            eventName: getVal('eventName'), eventTagline: getVal('eventTagline'), eventStartDate: new Date(getVal('eventStartDate')).toISOString(), eventEndDate: new Date(getVal('eventEndDate')).toISOString(),
            meta: { title: getVal('metaTitle'), description: getVal('metaDescription') },
            hero: { title: getVal('heroTitle'), locationString: getVal('locationString'), heroGif: getVal('heroGif'), cta: Array.from(ui.containers.cta.children).map(item => ({ text: item.querySelector('.cta-text').value, url: item.querySelector('.cta-url').value, class: item.querySelector('.cta-class').value })) },
            about: { title: getVal('aboutTitle'), tagline: getVal('aboutTagline'), description: getVal('aboutDescription').split('|').map(p => p.trim()), history: { stats: Array.from(ui.containers.stats.children).map(item => ({ value: item.querySelector('.stat-value').value, label: item.querySelector('.stat-label').value })) } },
            highlights: { title: getVal('highlightsTitle'), videoUrl: getVal('highlightsVideoUrl'), caption: getVal('highlightsCaption') },
            eventCategories: { title: getVal('categoriesTitle'), categories: Array.from(ui.containers.categories.children).map(item => ({ icon: item.querySelector('.category-icon').value, title: item.querySelector('.category-title').value, description: item.querySelector('.category-description').value })) },
            schedule: { pdfUrl: getVal('schedulePdfUrl'), days: Array.from(ui.containers.scheduleDays.children).map(day => ({ day: day.querySelector('.day-title').value, date: day.querySelector('.day-date').value, events: Array.from(day.querySelector('.day-events-container').children).map(evt => ({ time: evt.querySelector('.event-time').value, title: evt.querySelector('.event-title').value, details: evt.querySelector('.event-details').value })) })) },
            speakers: { title: getVal('speakersTitle'), guests: Array.from(ui.containers.speakers.children).map(item => ({ name: item.querySelector('.speaker-name').value, role: item.querySelector('.speaker-role').value, img: item.querySelector('.speaker-img').value })) },
            news: { title: getVal('newsTitle'), articles: Array.from(ui.containers.news.children).map(item => ({ title: item.querySelector('.news-title').value, excerpt: item.querySelector('.news-excerpt').value, date: item.querySelector('.news-date').value, category: item.querySelector('.news-category').value })) },
            tickets: { title: getVal('ticketsTitle'), packages: Array.from(ui.containers.tickets.children).map(item => ({ name: item.querySelector('.ticket-name').value, price: item.querySelector('.ticket-price').value, features: item.querySelector('.ticket-features').value.split('\n').map(f => f.trim()), isFeatured: item.querySelector('.ticket-featured').checked })) },
            team: { title: getVal('teamTitle'), joinText: getVal('teamJoinText'), core: { title: getVal('teamCoreTitle'), members: Array.from(ui.containers.teamCore.children).map(item => ({ name: item.querySelector('.member-name').value, role: item.querySelector('.member-role').value, img: item.querySelector('.member-img').value })) }, volunteers: { title: getVal('teamVolunteersTitle'), members: Array.from(ui.containers.teamVolunteers.children).map(item => ({ name: item.querySelector('.member-name').value, role: item.querySelector('.member-role').value, img: item.querySelector('.member-img').value })) } },
            gallery: { title: getVal('galleryTitle'), images: Array.from(ui.containers.gallery.children).map(item => ({ src: item.querySelector('.gallery-src').value, alt: item.querySelector('.gallery-alt').value })) },
            faq: { title: getVal('faqTitle'), questions: Array.from(ui.containers.faq.children).map(item => ({ question: item.querySelector('.faq-question').value, answer: item.querySelector('.faq-answer').value, category: item.querySelector('.faq-category').value })) },
            location: { title: getVal('locationTitle'), address: getVal('locationAddress'), mapUrl: getVal('locationMapUrl') }
        };
    };

    updateUIState('loading');
    onAuthStateChanged(auth, handleAuthState);
    setupEventListeners();
});





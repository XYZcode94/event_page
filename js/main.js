/**
 * =================================================================
 * |   EVENT WEBSITE JAVASCRIPT - DYNAMIC CONTENT & INTERACTIONS   |
 * =================================================================
 * |   This script fetches data from a JSON file to populate all   |
 * |   sections of the website and handles all user interactions.  |
 * =================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    const DATA_URL = 'data/data.json'; // Adjust path if needed

    /**
     * Fetches data from the specified URL.
     * @returns {Promise<Object|null>} A promise that resolves to the JSON data object, or null on error.
     */
    async function fetchData() {
        try {
            const response = await fetch(DATA_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Could not fetch event data:", error);
            return null;
        }
    }

    /**
     * Renders the speaker cards into the grid.
     * @param {Array<Object>} speakers - The array of speaker objects.
     */
    function renderSpeakers(speakers) {
        const container = document.querySelector('[data-populate="speakers"]');
        if (!container || !speakers) return;

        container.innerHTML = speakers.map(speaker => `
            <li class="speaker-card animate-on-scroll">
                <img src="${speaker.img}" alt="${speaker.name}">
                <h3>${speaker.name}</h3>
                <p>${speaker.role}</p>
            </li>
        `).join('');
    }

    /**
     * Renders the schedule tabs and panels.
     * @param {Array<Object>} scheduleDays - The array of schedule day objects.
     */
    function renderSchedule(scheduleDays) {
        const tabsContainer = document.querySelector('.schedule-tabs');
        if (!tabsContainer || !scheduleDays) return;

        // Clear existing static content
        tabsContainer.innerHTML = '';
        // Clear and remove static panels
        document.querySelectorAll('.schedule-day').forEach(panel => panel.remove());

        scheduleDays.forEach((day, index) => {
            // Create and append tab
            const tab = document.createElement('button');
            tab.setAttribute('role', 'tab');
            tab.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
            tab.id = `day${index + 1}-tab`;
            tab.setAttribute('aria-controls', `day${index + 1}-panel`);
            tab.textContent = `${day.day} (${day.date})`;
            tabsContainer.appendChild(tab);

            // Create and append panel
            const panel = document.createElement('div');
            panel.id = `day${index + 1}-panel`;
            panel.setAttribute('role', 'tabpanel');
            panel.setAttribute('aria-labelledby', `day${index + 1}-tab`);
            panel.classList.add('schedule-day');
            if (index !== 0) {
                panel.hidden = true;
            } else {
                panel.classList.add('is-active');
            }
            
            const eventList = day.events.map(event => `
                <li>
                    <time datetime="${event.time}">${event.time}</time>
                    <div>
                        <h3>${event.title}</h3>
                        <p>${event.details}</p>
                    </div>
                </li>
            `).join('');

            panel.innerHTML = `<ul class="schedule-list">${eventList}</ul>`;
            tabsContainer.insertAdjacentElement('afterend', panel);
        });
    }

    /**
     * Renders the news articles.
     * @param {Array<Object>} newsItems - The array of news objects.
     */
    function renderNews(newsItems) {
        const container = document.querySelector('[data-populate="news"]');
        if (!container || !newsItems) return;

        container.innerHTML = newsItems.map(item => `
            <article class="news-card animate-on-scroll">
                <h3>${item.title}</h3>
                <p>${item.excerpt}</p>
                <footer>
                    <time datetime="${item.date}">${new Date(item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
                    <span class="news-category-badge">${item.category}</span>
                </footer>
            </article>
        `).join('');
    }

    /**
     * Renders the ticket cards.
     * @param {Array<Object>} tickets - The array of ticket objects.
     */
    function renderTickets(tickets) {
        const container = document.querySelector('[data-populate="tickets"]');
        if (!container || !tickets) return;

        container.innerHTML = tickets.map(ticket => `
            <div class="ticket-card ${ticket.isFeatured ? 'featured' : ''} animate-on-scroll">
                ${ticket.isFeatured ? '<div class="ticket-badge">Most Popular</div>' : ''}
                <h3>${ticket.name}</h3>
                <p class="ticket-price">${ticket.price}</p>
                <ul>
                    ${ticket.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
                <a href="#" class="btn ${ticket.isFeatured ? 'btn-accent' : 'btn-secondary'}">Buy Now</a>
            </div>
        `).join('');
    }
    
    /**
     * Renders the team members into their respective grids.
     * @param {Object} team - The team object with 'core' and 'volunteers' arrays.
     */
    function renderTeam(team) {
        const coreContainer = document.querySelector('[data-populate="team-core"]');
        const volunteersContainer = document.querySelector('[data-populate="team-volunteers"]');

        if (coreContainer && team.core) {
            coreContainer.innerHTML = team.core.map(member => `
                <li class="team-card animate-on-scroll">
                    <img src="${member.img}" alt="${member.name}">
                    <h3>${member.name}</h3>
                    <p>${member.role}</p>
                </li>
            `).join('');
        }

        if (volunteersContainer && team.volunteers) {
            volunteersContainer.innerHTML = team.volunteers.map(member => `
                <li class="team-card animate-on-scroll">
                    <img src="${member.img}" alt="${member.name}">
                    <h3>${member.name}</h3>
                    <p>${member.role}</p>
                </li>
            `).join('');
        }
    }

    /**
     * Renders the gallery images.
     * @param {Array<Object>} images - The array of gallery image objects.
     */
    function renderGallery(images) {
        const container = document.querySelector('[data-populate="gallery"]');
        if (!container || !images) return;

        container.innerHTML = images.map(image => `
            <li class="animate-on-scroll">
                <img src="${image.src}" alt="${image.alt}">
            </li>
        `).join('');
    }

    /**
     * Renders the FAQ items into their respective accordions.
     * @param {Array<Object>} faqs - The array of FAQ objects.
     */
    function renderFaqs(faqs) {
        const ticketsContainer = document.querySelector('[data-accordion="tickets"]');
        const eventsContainer = document.querySelector('[data-accordion="events"]');
        
        if (!faqs) return;

        const ticketsHtml = faqs.filter(faq => faq.category === 'tickets').map(faq => `
            <details class="animate-on-scroll">
                <summary>${faq.question}</summary>
                <p>${faq.answer}</p>
            </details>
        `).join('');

        const eventsHtml = faqs.filter(faq => faq.category === 'events').map(faq => `
            <details class="animate-on-scroll">
                <summary>${faq.question}</summary>
                <p>${faq.answer}</p>
            </details>
        `).join('');

        if (ticketsContainer) ticketsContainer.innerHTML = ticketsHtml;
        if (eventsContainer) eventsContainer.innerHTML = eventsHtml;
    }

    /**
     * Initializes and updates the countdown timer.
     * @param {string} targetDateString - The event date in ISO format.
     */
    function initCountdown(targetDateString) {
        const countdownContainer = document.getElementById('countdown');
        if (!countdownContainer) return;
        
        const targetDate = new Date(targetDateString).getTime();

        function updateTimer() {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                countdownContainer.innerHTML = "<p>The event has started!</p>";
                if (interval) clearInterval(interval);
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            countdownContainer.querySelector('.countdown-segment:nth-child(1) .countdown-value').textContent = days;
            countdownContainer.querySelector('.countdown-segment:nth-child(2) .countdown-value').textContent = hours;
            countdownContainer.querySelector('.countdown-segment:nth-child(3) .countdown-value').textContent = minutes;
            countdownContainer.querySelector('.countdown-segment:nth-child(4) .countdown-value').textContent = seconds;
        }

        updateTimer(); // THE FIX: Run the timer immediately on load
        const interval = setInterval(updateTimer, 1000);
    }

    /**
     * Sets up all event listeners for interactive components.
     */
    function setupEventListeners() {
        // Mobile Navigation
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('is-open');
                const isExpanded = navMenu.classList.contains('is-open');
                navToggle.setAttribute('aria-expanded', isExpanded);
            });
        }

        // Schedule Tabs (delegated event listener)
        const scheduleContainer = document.querySelector('.schedule');
        if (scheduleContainer) {
            scheduleContainer.addEventListener('click', (e) => {
                if (e.target.matches('.schedule-tabs [role="tab"]')) {
                    const tabs = scheduleContainer.querySelectorAll('.schedule-tabs [role="tab"]');
                    const panels = scheduleContainer.querySelectorAll('.schedule-day[role="tabpanel"]');
                    
                    tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
                    panels.forEach(p => p.hidden = true);

                    const clickedTab = e.target;
                    clickedTab.setAttribute('aria-selected', 'true');

                    const panelId = clickedTab.getAttribute('aria-controls');
                    const correspondingPanel = document.getElementById(panelId);
                    if (correspondingPanel) {
                        correspondingPanel.hidden = false;
                    }
                }
            });
        }
    }

    /**
     * Sets up the Intersection Observer for scroll animations.
     */
    function setupScrollAnimations() {
        // This selector now targets only elements that have the class, which is added dynamically or is in the static HTML
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        animatedElements.forEach(el => observer.observe(el));
    }

    /**
     * Sets the footer year dynamically.
     */
    function setFooterYear() {
        const footerYear = document.getElementById('footer-year');
        if (footerYear) {
            footerYear.textContent = new Date().getFullYear();
        }
    }

    /**
     * Main initialization function.
     */
    async function init() {
        // Setup static interactions first
        setupEventListeners();
        setFooterYear();

        // Fetch data and render dynamic content
        const data = await fetchData();
        if (!data) {
            console.error("Initialization failed: No data loaded. The page will use static content.");
            // Still setup animations for any static content that has the class
            document.querySelectorAll('.hero-title, .hero-meta, .hero-cta, .countdown').forEach(el => el.classList.add('animate-on-scroll'));
            setupScrollAnimations();
            return;
        }

        // Render all dynamic content
        renderSpeakers(data.speakers);
        renderSchedule(data.schedule);
        renderNews(data.news);
        renderTickets(data.tickets);
        renderTeam(data.team);
        renderGallery(data.gallery);
        renderFaqs(data.faq);

        // Initialize components that depend on data
        initCountdown(data.eventDate);

        // Setup animations AFTER all dynamic content has been rendered
        setupScrollAnimations();
    }

    init();
});

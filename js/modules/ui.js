/**
 * =================================================================
 * |   UI MODULE                                                   |
 * =================================================================
 * |   This module handles all DOM manipulation, rendering,        |
 * |   animations, and event listeners for the user interface.     |
 * |   Updated to handle dynamic hero backgrounds.                 |
 * =================================================================
 */

// --- RENDER FUNCTIONS ---

export function renderPage(eventDetails) {
    renderHero(eventDetails.hero, eventDetails.heroGif); // Pass the GIF URL
    renderDownloadLink(eventDetails.schedulePdfUrl);
    renderSpeakers(eventDetails.speakers);
    renderSchedule(eventDetails.schedule);
    renderNews(eventDetails.news);
    renderTickets(eventDetails.tickets);
    renderTeam(eventDetails.team);
    renderGallery(eventDetails.gallery);
    renderFaqs(eventDetails.faq);
}

function renderHero(heroData, heroGif) {
    const titleEl = document.querySelector('.hero-title');
    const dateEl = document.querySelector('.hero-date');
    const locationEl = document.querySelector('.hero-location');
    const heroBgEl = document.querySelector('.hero-bg');

    if (titleEl && heroData.title) titleEl.textContent = heroData.title;
    if (dateEl && heroData.dateString) dateEl.innerHTML = `<i class="fa-solid fa-calendar-days"></i> ${heroData.dateString}`;
    if (locationEl && heroData.location) locationEl.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${heroData.location}`;

    // Dynamically set the background
    if (heroBgEl && heroGif) {
        heroBgEl.style.backgroundImage = `url('${heroGif}')`;
        heroBgEl.classList.add('has-gif'); // Add a class to disable ken-burns
    } else if (heroBgEl) {
        // Fallback to default static image if no GIF is provided
        heroBgEl.style.backgroundImage = `url("https://placehold.co/1920x1080/0F0F0F/111111?text=+")`;
        heroBgEl.classList.remove('has-gif');
    }
}


function renderDownloadLink(pdfUrl) {
    const downloadLink = document.querySelector('.schedule-download a');
    if (downloadLink && pdfUrl) {
        downloadLink.href = pdfUrl;
        downloadLink.parentElement.hidden = false;
    } else if (downloadLink) {
        downloadLink.parentElement.hidden = true;
    }
}

function renderSpeakers(speakers) {
    const section = document.querySelector('#speakers');
    const container = section?.querySelector('[data-populate="speakers"]');
    if (!container || !speakers || speakers.length === 0) {
        if (section) section.hidden = true;
        return;
    }
    section.hidden = false;
    container.innerHTML = speakers.map(speaker => `
        <li class="speaker-card animate-on-scroll"><img src="${speaker.img}" alt="${speaker.name}"><h3>${speaker.name}</h3><p>${speaker.role}</p></li>
    `).join('');
}

function renderSchedule(scheduleDays) {
    const section = document.querySelector('#schedule');
    const tabsContainer = section?.querySelector('.schedule-tabs');
    if (!tabsContainer || !scheduleDays || scheduleDays.length === 0) {
        if (section) section.hidden = true;
        return;
    }
    section.hidden = false;
    tabsContainer.innerHTML = '';
    section.querySelectorAll('.schedule-day').forEach(panel => panel.remove());

    scheduleDays.forEach((day, index) => {
        const tab = document.createElement('button');
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
        tab.id = `day${index + 1}-tab`;
        tab.setAttribute('aria-controls', `day${index + 1}-panel`);
        tab.textContent = `${day.day} (${day.date})`;
        tabsContainer.appendChild(tab);

        const panel = document.createElement('div');
        panel.id = `day${index + 1}-panel`;
        panel.setAttribute('role', 'tabpanel');
        panel.classList.add('schedule-day');
        panel.hidden = index !== 0;
        if(index === 0) panel.classList.add('is-active');
        
        const eventList = day.events.map(event => `
            <li><time datetime="${event.time}">${event.time}</time><div><h3>${event.title}</h3><p>${event.details}</p></div></li>
        `).join('');
        panel.innerHTML = `<ul class="schedule-list">${eventList}</ul>`;
        tabsContainer.insertAdjacentElement('afterend', panel);
    });
}

function renderNews(newsItems) {
    const section = document.querySelector('#news');
    const container = section?.querySelector('[data-populate="news"]');
    if (!container || !newsItems || newsItems.length === 0) {
        if (section) section.hidden = true;
        return;
    }
    section.hidden = false;
    container.innerHTML = newsItems.map(item => `
        <article class="news-card animate-on-scroll">
            <h3>${item.title}</h3><p>${item.excerpt}</p>
            <footer><time datetime="${item.date}">${new Date(item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time><span class="news-category-badge">${item.category}</span></footer>
        </article>
    `).join('');
}

function renderTickets(tickets) {
    const section = document.querySelector('#tickets');
    const container = section?.querySelector('[data-populate="tickets"]');
    if (!container || !tickets || tickets.length === 0) {
        if (section) section.hidden = true;
        return;
    }
    section.hidden = false;
    container.innerHTML = tickets.map(ticket => `
        <div class="ticket-card ${ticket.isFeatured ? 'featured' : ''} animate-on-scroll">
            ${ticket.isFeatured ? '<div class="ticket-badge">Most Popular</div>' : ''}
            <h3>${ticket.name}</h3><p class="ticket-price">${ticket.price}</p>
            <ul>${ticket.features.map(feature => `<li>${feature}</li>`).join('')}</ul>
            <a href="#" class="btn ${ticket.isFeatured ? 'btn-accent' : 'btn-secondary'}">Buy Now</a>
        </div>
    `).join('');
}

function renderTeam(team) {
    const section = document.querySelector('#team');
    const coreContainer = section?.querySelector('[data-populate="team-core"]');
    const volunteersContainer = section?.querySelector('[data-populate="team-volunteers"]');

    if (!team || (!team.core?.length && !team.volunteers?.length)) {
        if (section) section.hidden = true;
        return;
    }
    section.hidden = false;

    const coreHeading = coreContainer?.previousElementSibling;
    if (coreContainer && team.core && team.core.length > 0) {
        if(coreHeading) coreHeading.hidden = false;
        coreContainer.hidden = false;
        coreContainer.innerHTML = team.core.map(member => `
            <li class="team-card animate-on-scroll"><img src="${member.img}" alt="${member.name}"><h3>${member.name}</h3><p>${member.role}</p></li>
        `).join('');
    } else if (coreContainer) {
        if(coreHeading) coreHeading.hidden = true;
        coreContainer.hidden = true;
    }

    const volunteersHeading = volunteersContainer?.previousElementSibling;
    if (volunteersContainer && team.volunteers && team.volunteers.length > 0) {
        if(volunteersHeading) volunteersHeading.hidden = false;
        volunteersContainer.hidden = false;
        volunteersContainer.innerHTML = team.volunteers.map(member => `
            <li class="team-card animate-on-scroll"><img src="${member.img}" alt="${member.name}"><h3>${member.name}</h3><p>${member.role}</p></li>
        `).join('');
    } else if(volunteersContainer) {
        if(volunteersHeading) volunteersHeading.hidden = true;
        volunteersContainer.hidden = true;
    }
}

function renderGallery(images) {
    const section = document.querySelector('#gallery');
    const container = section?.querySelector('[data-populate="gallery"]');
    if (!container || !images || images.length === 0) {
        if (section) section.hidden = true;
        return;
    }
    section.hidden = false;
    container.innerHTML = images.map(image => `
        <li class="animate-on-scroll"><img src="${image.src}" alt="${image.alt}"></li>
    `).join('');
}

function renderFaqs(faqs) {
    const section = document.querySelector('#faq');
    const container = section?.querySelector('.faq-groups');
    if (!container || !faqs || faqs.length === 0) {
        if (section) section.hidden = true;
        return;
    }
    section.hidden = false;
    container.innerHTML = faqs.map(faq => `
        <details class="animate-on-scroll"><summary>${faq.question}</summary><p>${faq.answer}</p></details>
    `).join('');
}

// --- UI INTERACTIONS & ANIMATIONS ---

export function initCountdown(targetDateString) {
    const countdownContainer = document.getElementById('countdown');
    if (!countdownContainer) return;
    
    const targetDate = new Date(targetDateString).getTime();
    let interval;

    function updateTimer() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            countdownContainer.innerHTML = "<p>This event has started!</p>";
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

    updateTimer();
    interval = setInterval(updateTimer, 1000);
}

export function setupEventListeners() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('is-open');
            const isExpanded = navMenu.classList.contains('is-open');
            navToggle.setAttribute('aria-expanded', isExpanded);
        });
    }
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
                if (correspondingPanel) correspondingPanel.hidden = false;
            }
        });
    }
}

export function setupScrollAnimations() {
    const animatedElements = document.querySelectorAll('.section-header, .about-grid, .video-embed-wrapper, .schedule-tabs, .event-category-card, .speaker-card, .news-card, .ticket-card, .team-card, .gallery-grid li, .faq-groups, .contact-grid, .hero-title, .hero-meta, .hero-cta, .countdown');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    animatedElements.forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
}

export function setFooterYear() {
    const footerYear = document.getElementById('footer-year');
    if (footerYear) footerYear.textContent = new Date().getFullYear();
}

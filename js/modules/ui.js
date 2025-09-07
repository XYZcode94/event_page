/**
 * =================================================================
 * |   UI MODULE - V5.0 (FULL DYNAMIC RENDERING)                   |
 * =================================================================
 * |   This module handles all DOM manipulation, rendering,        |
 * |   animations, and user interactions for the public site.      |
 * |   It's designed to render every detail from the new,          |
 * |   comprehensive event JSON structure.                         |
 * =================================================================
 */

// --- Main Page Rendering Orchestrator ---
export function renderPage(event) {
    // This is the master function that calls all other rendering functions
    // in the correct order.
    try {
        renderMeta(event.meta);
        renderHero(event.hero);
        renderAbout(event.about);
        renderHighlights(event.highlights);
        renderSchedule(event.schedule);
        renderEventCategories(event.eventCategories);
        renderSpeakers(event.speakers);
        renderNews(event.news);
        renderTickets(event.tickets);
        renderTeam(event.team);
        renderGallery(event.gallery);
        renderFaq(event.faq);
        renderLocation(event.location);

        // A small delay to ensure all new DOM elements from the data
        // are ready before we try to animate them.
        setTimeout(setupScrollAnimations, 100);

    } catch (error) {
        console.error("A critical error occurred during page rendering:", error);
        showFatalError("There was a problem building the page from the event data.");
    }
}

// --- Individual Section Renderers ---

function renderMeta(meta) {
    if (!meta) return;
    document.title = meta.title || 'College Events';
    const descriptionTag = document.querySelector('meta[name="description"]');
    if (descriptionTag) descriptionTag.setAttribute('content', meta.description || '');
}

function renderHero(hero) {
    const heroSection = document.getElementById('home');
    if (!heroSection || !hero) return;

    const titleEl = heroSection.querySelector('.hero-title');
    const dateEl = heroSection.querySelector('.hero-date');
    const locationEl = heroSection.querySelector('.hero-location');
    const ctaContainer = heroSection.querySelector('.hero-cta');
    const bgEl = heroSection.querySelector('.hero-bg');

    if (titleEl) titleEl.textContent = hero.title || '';
    if (dateEl) dateEl.innerHTML = hero.dateString ? `<i class="fa-solid fa-calendar-days"></i> ${hero.dateString}` : '';
    if (locationEl) locationEl.innerHTML = hero.locationString ? `<i class="fa-solid fa-location-dot"></i> ${hero.locationString}` : '';

    // Render CTA buttons
    if (ctaContainer && hero.cta && hero.cta.length > 0) {
        ctaContainer.innerHTML = hero.cta.map(btn =>
            `<a href="${btn.url}" class="btn ${btn.class || 'btn-secondary'}">${btn.text}</a>`
        ).join('');
    } else if (ctaContainer) {
        ctaContainer.innerHTML = ''; // Clear if no CTAs
    }

    // Render background GIF
    if (bgEl && hero.heroGif) {
        bgEl.style.backgroundImage = `url('${hero.heroGif}')`;
        bgEl.classList.add('has-gif');
    } else if (bgEl) {
        bgEl.style.backgroundImage = ''; // Use default from CSS
        bgEl.classList.remove('has-gif');
    }
}

function renderAbout(about) {
    const section = document.getElementById('about');
    if (!section || !about) {
        if(section) section.hidden = true;
        return;
    }
    section.hidden = false;

    section.querySelector('[data-populate="about-title"]').textContent = about.title || '';
    section.querySelector('[data-populate="about-tagline"]').textContent = about.tagline || '';
    
    const descContainer = section.querySelector('[data-populate="about-description"]');
    if (descContainer && about.description) {
        descContainer.innerHTML = about.description.map(p => `<p>${p}</p>`).join('');
    }

    if (about.history) {
        section.querySelector('[data-populate="about-history-title"]').textContent = about.history.title || '';
        const statsContainer = section.querySelector('[data-populate="about-stats"]');
        if (statsContainer && about.history.stats) {
            statsContainer.innerHTML = about.history.stats.map(stat =>
                `<li><strong>${stat.value}</strong> ${stat.label}</li>`
            ).join('');
        }
    }
}

function renderHighlights(highlights) {
    const section = document.getElementById('video');
     if (!section || !highlights || !highlights.videoUrl) {
        if(section) section.hidden = true;
        return;
    }
    section.hidden = false;

    section.querySelector('[data-populate="highlights-title"]').textContent = highlights.title || '';
    section.querySelector('[data-populate="highlights-caption"]').textContent = highlights.caption || '';
    
    const videoContainer = section.querySelector('[data-populate="highlights-video"]');
    if(videoContainer) {
        videoContainer.innerHTML = `<iframe class="video-embed" src="${highlights.videoUrl}" title="Event Promo Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    }
}

function renderSchedule(schedule) {
    const section = document.getElementById('schedule');
    if (!section || !schedule || !schedule.days || schedule.days.length === 0) {
        if (section) section.hidden = true;
        return;
    }
    section.hidden = false;

    const tabsContainer = section.querySelector('.schedule-tabs');
    // Clear any existing panels from previous renders
    section.querySelectorAll('.schedule-day').forEach(p => p.remove());

    tabsContainer.innerHTML = schedule.days.map((day, index) => `
        <button role="tab" aria-selected="${index === 0}" aria-controls="day${index + 1}-panel" id="day${index + 1}-tab">${day.day} (${day.date})</button>
    `).join('');

    schedule.days.forEach((day, index) => {
        const panel = document.createElement('div');
        panel.id = `day${index + 1}-panel`;
        panel.className = 'schedule-day';
        if (index === 0) panel.classList.add('is-active');
        panel.hidden = index !== 0;
        panel.setAttribute('role', 'tabpanel');
        
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
        tabsContainer.after(panel);
    });
    
    const downloadContainer = section.querySelector('.schedule-download');
    if (downloadContainer && schedule.pdfUrl) {
        downloadContainer.innerHTML = `<a href="${schedule.pdfUrl}" download class="btn btn-outline">Download Full Agenda (PDF)</a>`;
        downloadContainer.hidden = false;
    } else if (downloadContainer) {
        downloadContainer.hidden = true;
    }
}

function renderEventCategories(categoriesData) {
    const section = document.getElementById('events');
    if (!section || !categoriesData || !categoriesData.categories || categoriesData.categories.length === 0) {
        if (section) section.hidden = true;
        return;
    }
    section.hidden = false;

    section.querySelector('[data-populate="categories-title"]').textContent = categoriesData.title || '';
    const container = section.querySelector('[data-populate="event-categories"]');
    container.innerHTML = categoriesData.categories.map(cat => `
        <li class="event-category-card">
            <span class="event-icon"><i class="${cat.icon}"></i></span>
            <h3>${cat.title}</h3>
            <p>${cat.description}</p>
        </li>
    `).join('');
}


function renderSpeakers(speakersData) {
    const section = document.getElementById('speakers');
    if (!section || !speakersData || !speakersData.guests || speakersData.guests.length === 0) {
        if (section) section.hidden = true;
        return;
    }
    section.hidden = false;
    
    const sectionHeader = section.querySelector('.section-header h2');
    if (sectionHeader && speakersData.title) {
        sectionHeader.textContent = speakersData.title;
    }
    
    const container = section.querySelector('[data-populate="speakers"]');
    container.innerHTML = speakersData.guests.map(speaker => `
        <li class="speaker-card">
            <img src="${speaker.img}" alt="${speaker.name}">
            <h3>${speaker.name}</h3>
            <p>${speaker.role}</p>
        </li>
    `).join('');
}

function renderNews(newsData) {
     const section = document.getElementById('news');
    if (!section || !newsData || !newsData.articles || newsData.articles.length === 0) {
        if (section) section.hidden = true;
        return;
    }
    section.hidden = false;

    const container = section.querySelector('[data-populate="news"]');
    container.innerHTML = newsData.articles.map(item => `
        <article class="news-card">
            <h3>${item.title}</h3>
            <p>${item.excerpt}</p>
            <footer>
                <time datetime="${item.date}">${new Date(item.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
                <span class="news-category-badge">${item.category}</span>
            </footer>
        </article>
    `).join('');
}


function renderTickets(ticketsData) {
    const section = document.getElementById('tickets');
    if (!section || !ticketsData || !ticketsData.packages || ticketsData.packages.length === 0) {
        if (section) section.hidden = true;
        return;
    }
    section.hidden = false;

    const container = section.querySelector('[data-populate="tickets"]');
    container.innerHTML = ticketsData.packages.map(ticket => `
        <div class="ticket-card ${ticket.isFeatured ? 'featured' : ''}">
            ${ticket.isFeatured ? '<div class="ticket-badge">Most Popular</div>' : ''}
            <h3>${ticket.name}</h3>
            <p class="ticket-price">${ticket.price}</p>
            <ul>${ticket.features.map(feature => `<li>${feature}</li>`).join('')}</ul>
            <a href="#" class="btn ${ticket.isFeatured ? 'btn-accent' : 'btn-secondary'}">Buy Now</a>
        </div>
    `).join('');
}

function renderTeam(teamData) {
    const section = document.getElementById('team');
     if (!section || !teamData) {
        if(section) section.hidden = true;
        return;
    }
    section.hidden = false;

    const renderMembers = (members) => members.map(member => `
        <li class="team-card">
            <img src="${member.img}" alt="${member.name}">
            <h3>${member.name}</h3>
            <p>${member.role}</p>
        </li>
    `).join('');

    const coreContainer = section.querySelector('[data-populate="team-core"]');
    const coreTitle = section.querySelector('[data-populate="team-core-title"]');
    if (coreContainer && teamData.core && teamData.core.members && teamData.core.members.length > 0) {
        coreTitle.textContent = teamData.core.title || 'Core Committee';
        coreTitle.hidden = false;
        coreContainer.innerHTML = renderMembers(teamData.core.members);
        coreContainer.hidden = false;
    } else {
        if(coreTitle) coreTitle.hidden = true;
        if(coreContainer) coreContainer.hidden = true;
    }

    const volunteersContainer = section.querySelector('[data-populate="team-volunteers"]');
    const volunteersTitle = section.querySelector('[data-populate="team-volunteers-title"]');
    if (volunteersContainer && teamData.volunteers && teamData.volunteers.members && teamData.volunteers.members.length > 0) {
        volunteersTitle.textContent = teamData.volunteers.title || 'Volunteers';
        volunteersTitle.hidden = false;
        volunteersContainer.innerHTML = renderMembers(teamData.volunteers.members);
        volunteersContainer.hidden = false;
    } else {
         if(volunteersTitle) volunteersTitle.hidden = true;
         if(volunteersContainer) volunteersContainer.hidden = true;
    }
    
    const joinContainer = section.querySelector('.team-join');
    if(joinContainer && teamData.joinText) {
        joinContainer.innerHTML = `${teamData.joinText} <a href="#contact">Join our team</a>.`;
        joinContainer.hidden = false;
    } else if (joinContainer) {
        joinContainer.hidden = true;
    }
}

function renderGallery(galleryData) {
    const section = document.getElementById('gallery');
    if (!section || !galleryData || !galleryData.images || galleryData.images.length === 0) {
        if (section) section.hidden = true;
        return;
    }
    section.hidden = false;

    const container = section.querySelector('[data-populate="gallery"]');
    container.innerHTML = galleryData.images.map(image => `
        <li><img src="${image.src}" alt="${image.alt}"></li>
    `).join('');
}

function renderFaq(faqData) {
    const section = document.getElementById('faq');
    if (!section || !faqData || !faqData.questions || faqData.questions.length === 0) {
        if (section) section.hidden = true;
        return;
    }
    section.hidden = false;

    const container = section.querySelector('[data-populate="faq"]');
    container.innerHTML = faqData.questions.map(faq => `
        <details>
            <summary>${faq.question}</summary>
            <p>${faq.answer}</p>
        </details>
    `).join('');
}

function renderLocation(locationData) {
    const section = document.getElementById('contact');
    if (!section || !locationData) return;

    section.querySelector('[data-populate="location-title"]').textContent = locationData.title || '';
    section.querySelector('[data-populate="location-address"]').innerHTML = locationData.address || '';
    
    const mapContainer = section.querySelector('[data-populate="location-map"]');
    if (mapContainer && locationData.mapUrl) {
        mapContainer.innerHTML = `<iframe class="contact-map" src="${locationData.mapUrl}" loading="lazy"></iframe>`;
    }
}


// --- UI Interactions & Utilities ---

export function setupEventListeners() {
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

export function setupScrollAnimations() {
    const animatedElements = document.querySelectorAll('.section-header, .about-grid, .video-embed-wrapper, .schedule-tabs, .event-category-card, .speaker-card, .news-card, .ticket-card, .team-card, .gallery-grid li, .faq-groups, .contact-grid, .hero-title, .hero-meta, .hero-cta, .countdown');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    animatedElements.forEach(el => {
        if (!el.classList.contains('animate-on-scroll')) {
            el.classList.add('animate-on-scroll');
        }
        observer.observe(el);
    });
}

export function setFooterYear() {
    const footerYear = document.getElementById('footer-year');
    if (footerYear) {
        footerYear.textContent = new Date().getFullYear();
    }
}

export function showFatalError(message) {
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.innerHTML = `<h1 class="hero-title" style="color: var(--color-accent);">${message}</h1>`;
    }
}

export function initCountdown(targetDateString) {
    const countdownContainer = document.getElementById('countdown');
    if (!countdownContainer || !targetDateString) {
        if(countdownContainer) countdownContainer.hidden = true;
        return;
    };
    countdownContainer.hidden = false;
    // Ensure the countdown container has the right structure
    countdownContainer.innerHTML = `
        <div class="countdown-segment"><span class="countdown-value">0</span><span class="countdown-label">Days</span></div>
        <div class="countdown-segment"><span class="countdown-value">0</span><span class="countdown-label">Hours</span></div>
        <div class="countdown-segment"><span class="countdown-value">0</span><span class="countdown-label">Minutes</span></div>
        <div class="countdown-segment"><span class="countdown-value">0</span><span class="countdown-label">Seconds</span></div>
    `;

    const targetDate = new Date(targetDateString).getTime();
    let interval;

    function updateTimer() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            countdownContainer.innerHTML = `<p class="event-live-message">This Event is Live!</p>`;
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

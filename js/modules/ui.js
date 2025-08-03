/**
 * =================================================================
 * |   UI MODULE - FULL DYNAMIC RENDERING                          |
 * =================================================================
 * |   This module handles all DOM manipulation, rendering,        |
 * |   animations, and event listeners for the user interface.     |
 * |   It now renders every section dynamically from the JSON data.|
 * =================================================================
 */

// --- MASTER RENDER FUNCTION ---
export function renderPage(data) {
    // Hide all sections initially to prevent flash of empty content
    document.querySelectorAll('.section').forEach(sec => sec.hidden = true);

    renderMeta(data.meta);
    renderHero(data.hero);
    renderAbout(data.about);
    renderHighlights(data.highlights);
    renderSchedule(data.schedule);
    renderEventCategories(data.eventCategories);
    renderSpeakers(data.speakers);
    renderNews(data.news);
    renderTickets(data.tickets);
    renderTeam(data.team);
    renderGallery(data.gallery);
    renderFaqs(data.faq);
    renderLocation(data.location);
}

// --- INDIVIDUAL RENDER FUNCTIONS ---

function renderMeta(meta) {
    if (!meta) return;
    document.title = meta.title || "College Events";
    document.querySelector('meta[name="description"]').setAttribute('content', meta.description || "");
    document.querySelector('meta[property="og:title"]').setAttribute('content', meta.title || "");
    document.querySelector('meta[property="og:description"]').setAttribute('content', meta.description || "");
}

function renderHero(hero) {
    if (!hero) return;
    const section = document.querySelector('#home');
    if (section) section.hidden = false;

    document.querySelector('.hero-title').textContent = hero.title || '';
    document.querySelector('.hero-date').innerHTML = `<i class="fa-solid fa-calendar-days"></i> ${hero.dateString || ''}`;
    document.querySelector('.hero-location').innerHTML = `<i class="fa-solid fa-location-dot"></i> ${hero.location || ''}`;

    const ctaContainer = document.querySelector('.hero-cta');
    if (ctaContainer && hero.cta?.length) {
        ctaContainer.innerHTML = hero.cta.map(btn => `<a href="${btn.url}" class="btn ${btn.class}">${btn.text}</a>`).join('');
    } else if (ctaContainer) {
        ctaContainer.innerHTML = '';
    }

    const heroBgEl = document.querySelector('.hero-bg');
    if (heroBgEl && hero.heroGif) {
        heroBgEl.style.backgroundImage = `url('${hero.heroGif}')`;
        heroBgEl.classList.add('has-gif');
    } else if (heroBgEl) {
        heroBgEl.style.backgroundImage = `url("https://placehold.co/1920x1080/0F0F0F/111111?text=+")`;
        heroBgEl.classList.remove('has-gif');
    }
}

function renderAbout(about) {
    const section = document.querySelector('#about');
    if (!section || !about) { if (section) section.hidden = true; return; }
    section.hidden = false;

    document.querySelector('[data-populate="about-title"]').textContent = about.title || '';
    document.querySelector('[data-populate="about-tagline"]').textContent = about.tagline || '';
    document.querySelector('[data-populate="about-description"]').innerHTML = about.description.map(p => `<p>${p}</p>`).join('');
    document.querySelector('[data-populate="about-history-title"]').textContent = about.history.title || '';
    document.querySelector('[data-populate="about-stats"]').innerHTML = about.history.stats.map(stat => `<li><strong>${stat.value}</strong> ${stat.label}</li>`).join('');
}

function renderHighlights(highlights) {
    const section = document.querySelector('#video');
    if (!section || !highlights || !highlights.videoUrl) { if (section) section.hidden = true; return; }
    section.hidden = false;

    document.querySelector('[data-populate="highlights-title"]').textContent = highlights.title || '';
    document.querySelector('[data-populate="highlights-video"]').innerHTML = `<iframe class="video-embed" src="${highlights.videoUrl}" title="Event Promo Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    document.querySelector('[data-populate="highlights-caption"]').textContent = highlights.caption || '';
}

function renderSchedule(schedule) {
    const section = document.querySelector('#schedule');
    if (!section || !schedule || !schedule.days?.length) { if (section) section.hidden = true; return; }
    section.hidden = false;

    const tabsContainer = section.querySelector('.schedule-tabs');
    tabsContainer.innerHTML = '';
    section.querySelectorAll('.schedule-day').forEach(panel => panel.remove());

    schedule.days.forEach((day, index) => {
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
        if (index === 0) panel.classList.add('is-active');

        const eventList = day.events.map(event => `<li><time>${event.time}</time><div><h3>${event.title}</h3><p>${event.details}</p></div></li>`).join('');
        panel.innerHTML = `<ul class="schedule-list">${eventList}</ul>`;
        tabsContainer.insertAdjacentElement('afterend', panel);
    });

    const downloadContainer = section.querySelector('.schedule-download');
    if (downloadContainer && schedule.pdfUrl) {
        downloadContainer.innerHTML = `<a href="${schedule.pdfUrl}" download class="btn btn-outline">Download Full Agenda (PDF)</a>`;
        downloadContainer.hidden = false;
    } else if (downloadContainer) {
        downloadContainer.hidden = true;
    }
}

function renderEventCategories(eventCat) {
    const section = document.querySelector('#events');
    if (!section || !eventCat || !eventCat.categories?.length) { if (section) section.hidden = true; return; }
    section.hidden = false;

    document.querySelector('[data-populate="categories-title"]').textContent = eventCat.title || '';
    document.querySelector('[data-populate="event-categories"]').innerHTML = eventCat.categories.map(cat => `
        <li class="event-category-card"><span class="event-icon"><i class="${cat.icon}"></i></span><h3>${cat.title}</h3><p>${cat.description}</p></li>
    `).join('');
}

function renderSpeakers(speakers) {
    const section = document.querySelector('#speakers');
    if (!section || !speakers || !speakers.guests?.length) { if (section) section.hidden = true; return; }
    section.hidden = false;

    section.querySelector('.section-header h2').textContent = speakers.title || 'Speakers & Guests';
    section.querySelector('[data-populate="speakers"]').innerHTML = speakers.guests.map(speaker => `
        <li class="speaker-card animate-on-scroll"><img src="${speaker.img}" alt="${speaker.name}"><h3>${speaker.name}</h3><p>${speaker.role}</p></li>
    `).join('');
}

function renderNews(news) {
    const section = document.querySelector('#news');
    if (!section || !news || !news.articles?.length) { if (section) section.hidden = true; return; }
    section.hidden = false;

    section.querySelector('.section-header h2').textContent = news.title || 'News & Announcements';
    section.querySelector('[data-populate="news"]').innerHTML = news.articles.map(item => `
        <article class="news-card animate-on-scroll">
            <h3>${item.title}</h3><p>${item.excerpt}</p>
            <footer><time datetime="${item.date}">${new Date(item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time><span class="news-category-badge">${item.category}</span></footer>
        </article>
    `).join('');
}

function renderTickets(tickets) {
    const section = document.querySelector('#tickets');
    if (!section || !tickets || !tickets.packages?.length) { if (section) section.hidden = true; return; }
    section.hidden = false;

    section.querySelector('.section-header h2').textContent = tickets.title || 'Get Your Tickets';
    section.querySelector('[data-populate="tickets"]').innerHTML = tickets.packages.map(ticket => `
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
    if (!section || !team) { if (section) section.hidden = true; return; }
    section.hidden = false;

    section.querySelector('.section-header h2').textContent = team.title || 'Meet the Team';

    const coreTitle = document.querySelector('[data-populate="team-core-title"]');
    const coreContainer = document.querySelector('[data-populate="team-core"]');
    if (coreTitle && coreContainer && team.core?.members.length) {
        coreTitle.textContent = team.core.title;
        coreTitle.hidden = false;
        coreContainer.innerHTML = team.core.members.map(member => `<li class="team-card animate-on-scroll"><img src="${member.img}" alt="${member.name}"><h3>${member.name}</h3><p>${member.role}</p></li>`).join('');
    } else if (coreTitle) {
        coreTitle.hidden = true;
    }

    const volTitle = document.querySelector('[data-populate="team-volunteers-title"]');
    const volContainer = document.querySelector('[data-populate="team-volunteers"]');
    if (volTitle && volContainer && team.volunteers?.members.length) {
        volTitle.textContent = team.volunteers.title;
        volTitle.hidden = false;
        volContainer.innerHTML = team.volunteers.members.map(member => `<li class="team-card animate-on-scroll"><img src="${member.img}" alt="${member.name}"><h3>${member.name}</h3><p>${member.role}</p></li>`).join('');
    } else if (volTitle) {
        volTitle.hidden = true;
    }

    const joinText = section.querySelector('.team-join');
    if (joinText && team.joinText) {
        joinText.innerHTML = team.joinText;
    }
}

function renderGallery(gallery) {
    const section = document.querySelector('#gallery');
    if (!section || !gallery || !gallery.images?.length) { if (section) section.hidden = true; return; }
    section.hidden = false;

    section.querySelector('.section-header h2').textContent = gallery.title || 'Photo Gallery';
    section.querySelector('[data-populate="gallery"]').innerHTML = gallery.images.map(image => `
        <li class="animate-on-scroll"><img src="${image.src}" alt="${image.alt}"></li>
    `).join('');
}

function renderFaqs(faq) {
    const section = document.querySelector('#faq');
    if (!section || !faq || !faq.questions?.length) { if (section) section.hidden = true; return; }
    section.hidden = false;

    section.querySelector('.section-header h2').textContent = faq.title || 'Frequently Asked Questions';
    section.querySelector('[data-populate="faq"]').innerHTML = faq.questions.map(q => `
        <details class="animate-on-scroll"><summary>${q.question}</summary><p>${q.answer}</p></details>
    `).join('');
}

function renderLocation(location) {
    const section = document.querySelector('#contact');
    if (!section || !location) return;

    document.querySelector('[data-populate="location-title"]').textContent = location.title || 'Event Location';
    document.querySelector('[data-populate="location-address"]').innerHTML = location.address || '';
    document.querySelector('[data-populate="location-map"]').innerHTML = `<iframe class="contact-map" src="${location.mapUrl}" loading="lazy"></iframe>`;
}


// --- UI INTERACTIONS & ANIMATIONS ---

export function initCountdown(targetDateString) {
    const countdownContainer = document.getElementById('countdown');
    if (!countdownContainer || !targetDateString) {
        if (countdownContainer) countdownContainer.innerHTML = '';
        return;
    };

    // Ensure countdown HTML is present
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
    // ... (Event listeners remain the same)
}

export function setupScrollAnimations() {
    // ... (Scroll animation logic remains the same)
}

export function setFooterYear() {
    const footerYear = document.getElementById('footer-year');
    if (footerYear) footerYear.textContent = new Date().getFullYear();
}

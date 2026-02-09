/**
 * =================================================================
 * |   UI MODULE - V5.5 (WITH VIDEO CONTROLS)                      |
 * =================================================================
 * |   ✔ Added controls to highlight videos                        |
 * |   ✔ Videos start muted but user can unmute                    |
 * |   ✔ Play/pause, volume, fullscreen controls                   |
 * |   ✔ Better user experience                                    |
 * =================================================================
 */

"use strict";

/* ================================================================
   MAIN PAGE RENDER ORCHESTRATOR
================================================================ */
export function renderPage(event) {
    try {
        if (!event) throw new Error("Event data missing");

        console.log("🎬 Starting page render with event:", event);

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

        setTimeout(setupScrollAnimations, 150);
    } catch (err) {
        console.error("❌ Render error:", err);
        showFatalError("There was a problem rendering this event.");
    }
}

/* ================================================================
   META
================================================================ */
function renderMeta(meta) {
    if (!meta) return;
    document.title = meta.title || "College Events";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", meta.description || "");
}

/* ================================================================
   HERO (WITH VIDEO BACKGROUND - NO CONTROLS)
================================================================ */
function renderHero(hero) {
    const section = document.getElementById("home");
    if (!section || !hero) return;

    const title = section.querySelector(".hero-title");
    const dateEl = section.querySelector(".hero-date");
    const locationEl = section.querySelector(".hero-location");
    const cta = section.querySelector(".hero-cta");

    const video = document.getElementById("hero-video");
    const source = video ? video.querySelector("source") : null;

    if (title) title.textContent = hero.title || "";

    if (dateEl && hero.eventStartDate) {
        const d = new Date(hero.eventStartDate);
        if (!isNaN(d)) {
            dateEl.innerHTML = `<i class="fa-solid fa-calendar-days"></i> ${d.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric"
            })}`;
        }
    }

    if (locationEl) {
        locationEl.innerHTML = hero.locationString
            ? `<i class="fa-solid fa-location-dot"></i> ${hero.locationString}`
            : "";
    }

    if (cta && Array.isArray(hero.cta)) {
        cta.innerHTML = hero.cta.map(btn =>
            `<a href="${btn.url || "#"}" class="btn ${btn.class || "btn-secondary"}">${btn.text}</a>`
        ).join("");
    }

    // Hero video should NOT have controls (background video)
    if (video && source && hero.heroVideoUrl) {
        source.src = hero.heroVideoUrl;

        video.muted = true;
        video.autoplay = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = "auto";
        video.controls = false; // No controls for hero background video

        video.setAttribute("muted", "");
        video.setAttribute("playsinline", "");

        video.load();
        video.style.display = "block";
        video.style.visibility = "visible";

        video.play().catch(() => {
            console.warn("Hero video autoplay prevented by browser");
        });
    } else if (video) {
        video.style.display = "none";
    }
}

/* ================================================================
   ABOUT
================================================================ */
function renderAbout(about) {
    const section = document.getElementById("about");
    if (!section || !about) {
        if (section) section.hidden = true;
        return;
    }
    section.hidden = false;

    const titleEl = section.querySelector('[data-populate="about-title"]');
    const taglineEl = section.querySelector('[data-populate="about-tagline"]');
    const descEl = section.querySelector('[data-populate="about-description"]');

    if (titleEl) titleEl.textContent = about.title || "";
    if (taglineEl) taglineEl.textContent = about.tagline || "";

    if (descEl && Array.isArray(about.description)) {
        descEl.innerHTML = about.description.map(p => `<p>${p}</p>`).join("");
    }

    // Stats rendering (if exists)
    if (about.history && about.history.stats) {
        const statsContainer = section.querySelector('[data-populate="about-stats"]');
        if (statsContainer) {
            statsContainer.innerHTML = about.history.stats.map(stat =>
                `<li><strong>${stat.value}</strong> ${stat.label}</li>`
            ).join('');
        }
    }
}

/* ================================================================
   HIGHLIGHTS (WITH VIDEO CONTROLS)
================================================================ */
function renderHighlights(highlights) {
    console.log("🎥 renderHighlights called with:", highlights);

    // Try multiple possible section IDs
    let section = document.getElementById("highlights");
    if (!section) {
        console.warn("⚠️ #highlights not found, trying #video");
        section = document.getElementById("video");
    }
    if (!section) {
        console.warn("⚠️ #video not found, trying .highlights selector");
        section = document.querySelector(".highlights");
    }

    if (!section) {
        console.error("❌ Could not find highlights section with any selector!");
        return;
    }

    console.log("✅ Found highlights section:", section);

    // Try multiple possible grid container IDs
    let grid = section.querySelector("#highlights-grid");
    if (!grid) {
        console.warn("⚠️ #highlights-grid not found, trying .highlights-grid");
        grid = section.querySelector(".highlights-grid");
    }
    if (!grid) {
        console.warn("⚠️ .highlights-grid not found, trying [data-populate='highlights-video']");
        grid = section.querySelector("[data-populate='highlights-video']");
    }

    if (!grid) {
        console.error("❌ Could not find grid container! Creating one...");
        grid = document.createElement("div");
        grid.id = "highlights-grid";
        grid.className = "highlights-grid";
        section.appendChild(grid);
        console.log("✅ Created new grid container");
    }

    console.log("✅ Found grid container:", grid);

    // Validate highlights data
    if (!highlights) {
        console.error("❌ No highlights data provided");
        section.hidden = true;
        return;
    }

    if (!Array.isArray(highlights.videoUrls)) {
        console.error("❌ highlights.videoUrls is not an array:", highlights.videoUrls);
        section.hidden = true;
        return;
    }

    if (highlights.videoUrls.length === 0) {
        console.error("❌ highlights.videoUrls is empty");
        section.hidden = true;
        return;
    }

    console.log(`✅ Found ${highlights.videoUrls.length} video URLs:`, highlights.videoUrls);

    section.hidden = false;

    // Update section title if provided
    const titleEl = section.querySelector('[data-populate="highlights-title"]');
    if (titleEl && highlights.title) {
        titleEl.textContent = highlights.title;
        console.log("✅ Set highlights title:", highlights.title);
    }

    // Render video grid WITH CONTROLS
const videoHTML = highlights.videoUrls.map((item, i) => {
    // Support both string and object formats
    let url = typeof item === "string" ? item : item?.url;

    if (!url || typeof url !== "string") {
        console.warn("Invalid video URL at index", i, item);
        return "";
    }

    let directUrl = url;

    // Dropbox
    if (url.includes("dropbox.com")) {
        directUrl = url
            .replace("dl=0", "raw=1")
            .replace("www.dropbox.com", "dl.dropboxusercontent.com");
    }

    // Cloudinary player
    else if (url.includes("player.cloudinary.com")) {
        const params = new URL(url).searchParams;
        const cloud = params.get("cloud_name");
        const publicId = params.get("public_id");

        if (cloud && publicId) {
            directUrl = `https://res.cloudinary.com/${cloud}/video/upload/f_auto,q_auto/${publicId}`;
        }
    }

    // Direct Cloudinary
    else if (url.includes("res.cloudinary.com")) {
        directUrl = url.replace("/upload/", "/upload/f_auto,q_auto/");
    }

    const orientation = i % 2 === 0 ? "landscape" : "portrait";

    return `
    <div class="video-card animate-on-scroll ${orientation}">
        <video
            src="${directUrl}"
            controls
            muted
            playsinline
            preload="metadata"
        ></video>
    </div>`;
}).join("");



    console.log("✅ Generated video HTML with controls, inserting into grid...");
    grid.innerHTML = videoHTML;
    console.log("✅ Grid innerHTML updated");

    // Optional: Auto-play on scroll (videos start paused, user can play)
    setTimeout(() => {
        const videos = grid.querySelectorAll("video");
        console.log(`🎬 Found ${videos.length} video elements with controls`);

        // Add click-to-play functionality
        videos.forEach((v, index) => {
            v.addEventListener('loadedmetadata', () => {
                console.log(`✅ Video ${index} loaded and ready`);
            });

            // Optional: Add play on hover
            // v.addEventListener('mouseenter', () => {
            //     if (v.paused) {
            //         v.play().catch(() => { });
            //     }
            // });
        });
    }, 100);

    console.log("✅ Highlights section render complete with controls!");
}

/* ================================================================
   SCHEDULE
================================================================ */
function renderSchedule(schedule) {
    const section = document.getElementById("schedule");
    if (!section || !schedule || !Array.isArray(schedule.days) || schedule.days.length === 0) {
        if (section) section.hidden = true;
        return;
    }
    section.hidden = false;

    const tabs = section.querySelector(".schedule-tabs");
    if (!tabs) return;

    section.querySelectorAll(".schedule-day").forEach(p => p.remove());

    tabs.innerHTML = schedule.days.map((d, i) =>
        `<button role="tab" aria-selected="${i === 0}" aria-controls="day${i + 1}-panel">${d.day} (${d.date})</button>`
    ).join("");

    schedule.days.forEach((day, i) => {
        const panel = document.createElement("div");
        panel.id = `day${i + 1}-panel`;
        panel.className = "schedule-day";
        panel.hidden = i !== 0;
        panel.setAttribute("role", "tabpanel");

        panel.innerHTML = `<ul class="schedule-list">
            ${(day.events || []).map(e => `
                <li>
                    <time>${e.time}</time>
                    <div><h3>${e.title}</h3><p>${e.details}</p></div>
                </li>`).join("")}
        </ul>`;
        tabs.after(panel);
    });

    const downloadContainer = section.querySelector('.schedule-download');
    if (downloadContainer && schedule.pdfUrl) {
        downloadContainer.innerHTML = `<a href="${schedule.pdfUrl}" download class="btn btn-outline">Download Full Schedule (PDF)</a>`;
        downloadContainer.hidden = false;
    } else if (downloadContainer) {
        downloadContainer.hidden = true;
    }
}

/* ================================================================
   EVENT CATEGORIES
================================================================ */
function renderEventCategories(data) {
    const section = document.getElementById("events");
    if (!section || !data || !Array.isArray(data.categories) || data.categories.length === 0) {
        if (section) section.hidden = true;
        return;
    }
    section.hidden = false;

    const titleEl = section.querySelector('[data-populate="categories-title"]');
    const containerEl = section.querySelector('[data-populate="event-categories"]');

    if (titleEl) titleEl.textContent = data.title || "";
    if (containerEl) {
        containerEl.innerHTML = data.categories.map(c => `
            <li class="event-category-card">
                <i class="${c.icon}"></i>
                <h3>${c.title}</h3>
                <p>${c.description}</p>
            </li>`).join("");
    }
}

/* ================================================================
   SPEAKERS
================================================================ */
function renderSpeakers(data) {
    const section = document.getElementById("speakers");
    if (!section || !data || !Array.isArray(data.guests) || data.guests.length === 0) {
        if (section) section.hidden = true;
        return;
    }
    section.hidden = false;

    const titleEl = section.querySelector('.section-header h2');
    if (titleEl && data.title) {
        titleEl.textContent = data.title;
    }

    const containerEl = section.querySelector('[data-populate="speakers"]');
    if (containerEl) {
        containerEl.innerHTML = data.guests.map(s => `
            <li class="speaker-card">
                <img src="${s.img}" alt="${s.name}">
                <h3>${s.name}</h3>
                <p>${s.role}</p>
            </li>`).join("");
    }
}

/* ================================================================
   NEWS
================================================================ */
function renderNews(data) {
    const section = document.getElementById("news");
    if (!section || !data || !Array.isArray(data.articles) || data.articles.length === 0) {
        if (section) section.hidden = true;
        return;
    }
    section.hidden = false;

    const containerEl = section.querySelector('[data-populate="news"]');
    if (containerEl) {
        containerEl.innerHTML = data.articles.map(n => `
            <article class="news-card">
                <h3>${n.title}</h3>
                <p>${n.excerpt}</p>
                <footer>
                    <time datetime="${n.date}">${new Date(n.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
                    <span class="news-category-badge">${n.category}</span>
                </footer>
            </article>`).join("");
    }
}

/* ================================================================
   TICKETS
================================================================ */
function renderTickets(data) {
    const section = document.getElementById("tickets");
    if (!section || !data || !Array.isArray(data.packages) || data.packages.length === 0) {
        if (section) section.hidden = true;
        return;
    }
    section.hidden = false;

    const containerEl = section.querySelector('[data-populate="tickets"]');
    if (containerEl) {
        containerEl.innerHTML = data.packages.map(t => `
            <div class="ticket-card ${t.isFeatured ? "featured" : ""}">
                ${t.isFeatured ? '<div class="ticket-badge">Most Popular</div>' : ''}
                <h3>${t.name}</h3>
                <p class="ticket-price">${t.price}</p>
                <ul>${(t.features || []).map(f => `<li>${f}</li>`).join("")}</ul>
                <a href="#" class="btn ${t.isFeatured ? 'btn-accent' : 'btn-secondary'}">Buy Now</a>
            </div>`).join("");
    }
}

/* ================================================================
   TEAM
================================================================ */
function renderTeam(data) {
    const section = document.getElementById("team");
    if (!section || !data) {
        if (section) section.hidden = true;
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
    if (coreContainer && data.core && data.core.members && data.core.members.length > 0) {
        if (coreTitle) coreTitle.textContent = data.core.title || 'Core Committee';
        coreContainer.innerHTML = renderMembers(data.core.members);
    }

    const volunteersContainer = section.querySelector('[data-populate="team-volunteers"]');
    const volunteersTitle = section.querySelector('[data-populate="team-volunteers-title"]');
    if (volunteersContainer && data.volunteers && data.volunteers.members && data.volunteers.members.length > 0) {
        if (volunteersTitle) volunteersTitle.textContent = data.volunteers.title || 'Volunteers';
        volunteersContainer.innerHTML = renderMembers(data.volunteers.members);
    }

    const joinContainer = section.querySelector('.team-join');
    if (joinContainer && data.joinText) {
        joinContainer.innerHTML = `${data.joinText} <a href="#contact">Join our team</a>.`;
    }
}

/* ================================================================
   GALLERY
================================================================ */
function renderGallery(data) {
    const section = document.getElementById("gallery");
    if (!section || !data || !Array.isArray(data.images) || data.images.length === 0) {
        if (section) section.hidden = true;
        return;
    }
    section.hidden = false;

    const containerEl = section.querySelector('[data-populate="gallery"]');
    if (containerEl) {
        containerEl.innerHTML = data.images.map(i => `<li><img src="${i.src}" alt="${i.alt}"></li>`).join("");
    }
}

/* ================================================================
   FAQ
================================================================ */
function renderFaq(data) {
    const section = document.getElementById("faq");
    if (!section || !data || !Array.isArray(data.questions) || data.questions.length === 0) {
        if (section) section.hidden = true;
        return;
    }
    section.hidden = false;

    const containerEl = section.querySelector('[data-populate="faq"]');
    if (containerEl) {
        containerEl.innerHTML = data.questions.map(q => `
            <details>
                <summary>${q.question}</summary>
                <p>${q.answer}</p>
            </details>`).join("");
    }
}

/* ================================================================
   LOCATION (WITH VIDEO CONTROLS)
================================================================ */
function renderLocation(data) {
    const section = document.getElementById("contact");
    if (!section || !data) return;

    const titleEl = section.querySelector('[data-populate="location-title"]');
    const addressEl = section.querySelector('[data-populate="location-address"]');

    if (titleEl) titleEl.textContent = data.title || "";
    if (addressEl) addressEl.innerHTML = data.address || "";

    const media = section.querySelector('[data-populate="location-map"]');
    if (media && data.videoUrl) {
        // Location video WITH controls
        media.innerHTML = `
        <video 
            src="${data.videoUrl}" 
            controls
            muted
            playsinline
            preload="metadata"
            class="contact-map"
        ></video>`;
    } else if (media && data.mapUrl) {
        // Fallback to iframe map
        media.innerHTML = `<iframe class="contact-map" src="${data.mapUrl}" loading="lazy"></iframe>`;
    }
}

/* ================================================================
   EVENT LISTENERS
================================================================ */
export function setupEventListeners() {
    const navToggle = document.querySelector(".nav-toggle");
    const navMenu = document.querySelector(".nav-menu");

    if (navToggle && navMenu) {
        navToggle.addEventListener("click", () => {
            navMenu.classList.toggle("is-open");
            navToggle.setAttribute("aria-expanded", navMenu.classList.contains("is-open"));
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
                if (correspondingPanel) {
                    correspondingPanel.hidden = false;
                }
            }
        });
    }
}

/* ================================================================
   SCROLL ANIMATIONS
================================================================ */
export function setupScrollAnimations() {
    if (!("IntersectionObserver" in window)) return;

    const els = document.querySelectorAll(".animate-on-scroll");
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add("is-visible");
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.1 });

    els.forEach(el => obs.observe(el));
}

/* ================================================================
   UTILITIES
================================================================ */
export function setFooterYear() {
    const y = document.getElementById("footer-year");
    if (y) y.textContent = new Date().getFullYear();
}

export function showFatalError(msg) {
    const hero = document.querySelector(".hero-content");
    if (hero) hero.innerHTML = `<h1>${msg}</h1>`;
}

export function initCountdown(dateStr) {
    const el = document.getElementById("countdown");
    if (!el || !dateStr) return;

    const target = new Date(dateStr).getTime();
    if (isNaN(target)) return;

    setInterval(() => {
        const diff = target - Date.now();
        if (diff <= 0) {
            el.textContent = "Event Live!";
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        el.innerHTML = `
            <div class="countdown-segment"><span class="countdown-value">${days}</span><span class="countdown-label">Days</span></div>
            <div class="countdown-segment"><span class="countdown-value">${hours}</span><span class="countdown-label">Hours</span></div>
            <div class="countdown-segment"><span class="countdown-value">${minutes}</span><span class="countdown-label">Minutes</span></div>
            <div class="countdown-segment"><span class="countdown-value">${seconds}</span><span class="countdown-label">Seconds</span></div>
        `;
    }, 1000);
}
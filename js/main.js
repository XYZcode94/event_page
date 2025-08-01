document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Mobile Navigation Toggle (FIXED) ---
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            // Toggle the 'is-open' class on the menu
            navMenu.classList.toggle('is-open');

            // Toggle the aria-expanded attribute for accessibility
            const isExpanded = navMenu.classList.contains('is-open');
            navToggle.setAttribute('aria-expanded', isExpanded);
        });
    }

    // --- 2. Scroll-triggered Animations ---
    // Use a more inclusive selector to grab all elements intended for animation
    const animatedElements = document.querySelectorAll('.section-header, .about-grid, .video-embed-wrapper, .schedule-tabs, .event-category-card, .speaker-card, .news-card, .ticket-card, .team-card, .gallery-grid li, .faq-groups, .contact-grid, .hero-title, .hero-meta, .hero-cta, .countdown');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optional: Stop observing after animation to save resources
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1, // Trigger when 10% of the element is visible
    });

    animatedElements.forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });

    // --- 3. Dynamic Footer Year ---
    const footerYear = document.getElementById('footer-year');
    if (footerYear) {
        footerYear.textContent = new Date().getFullYear();
    }

    // --- 4. Schedule Tabs Logic ---
    const tabs = document.querySelectorAll('.schedule-tabs [role="tab"]');
    const panels = document.querySelectorAll('.schedule-day[role="tabpanel"]');

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            // Deactivate all tabs and panels
            tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
            panels.forEach(p => p.hidden = true);

            // Activate the clicked tab
            const clickedTab = e.target;
            clickedTab.setAttribute('aria-selected', 'true');

            // Show the associated panel
            const panelId = clickedTab.getAttribute('aria-controls');
            const correspondingPanel = document.getElementById(panelId);
            if (correspondingPanel) {
                correspondingPanel.hidden = false;
            }
        });
    });

});

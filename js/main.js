/* main.js */

import { initCountdown } from './countdown.js';      // optional split
import { loadDataAndPopulate } from './data-loader.js';
import { initLightbox } from './lightbox.js';        // optional

document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initCountdown({
        targetDate: '2025-08-01T09:00:00+05:30', // ← EXAMPLE: replace with your real start
        el: '#countdown'
    });
    initScheduleTabs();
    loadDataAndPopulate('data.json');
    initSpeakerModal();
    initLightbox('[data-populate="gallery"] img');
    initContactForm();
    setFooterYear();
});


/* Mobile Nav */
function initNav() {
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.querySelector('.nav-menu');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
        menu.classList.toggle('is-open');
    });
    // close after click
    menu.addEventListener('click', e => {
        if (e.target.matches('a[href^="#"]')) {
            menu.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });
}

/* Schedule Tabs */
function initScheduleTabs() {
    const tablist = document.querySelector('.schedule-tabs');
    if (!tablist) return;
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    tabs.forEach(tab => {
        tab.addEventListener('click', () => activateTab(tab, tabs));
    });
}
function activateTab(selected, tabs) {
    tabs.forEach(tab => {
        const panelId = tab.getAttribute('aria-controls');
        const panel = document.getElementById(panelId);
        const isSel = tab === selected;
        tab.setAttribute('aria-selected', String(isSel));
        if (panel) {
            panel.hidden = !isSel;
            panel.classList.toggle('is-active', isSel);
        }
    });
}

/* Speakers modal */
function initSpeakerModal() {
    const grid = document.querySelector('[data-populate="speakers"]');
    const modal = document.getElementById('speaker-modal');
    if (!grid || !modal) return;
    grid.addEventListener('click', e => {
        const card = e.target.closest('.speaker-card');
        if (!card) return;
        modal.querySelector('#speaker-modal-img').src = card.dataset.img || '';
        modal.querySelector('#speaker-modal-name').textContent = card.dataset.name || '';
        modal.querySelector('#speaker-modal-role').textContent = card.dataset.role || '';
        modal.querySelector('#speaker-modal-bio').textContent = card.dataset.bio || '';
        modal.querySelector('#speaker-modal-social').innerHTML = card.dataset.social || '';
        modal.showModal();
    });
    modal.querySelector('[data-close-modal]').addEventListener('click', () => modal.close());
    modal.addEventListener('click', e => {
        if (e.target === modal) modal.close();
    });
}

/* Contact form (simple demo) */
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    const statusEl = form.querySelector('.form-status');
    form.addEventListener('submit', e => {
        e.preventDefault();
        statusEl.textContent = 'Sending...';
        // TODO: replace with real submit via fetch()
        setTimeout(() => {
            statusEl.textContent = 'Thanks! We will get back to you soon.';
            form.reset();
        }, 800);
    });
}

/* Footer year */
function setFooterYear() {
    const y = new Date().getFullYear();
    const el = document.getElementById('footer-year');
    if (el) el.textContent = y;
}

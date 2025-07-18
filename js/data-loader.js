export async function loadDataAndPopulate(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Fetch ${url} failed`);
        const data = await res.json();
        populateSpeakers(data.speakers || []);
        populateTickets(data.tickets || []);
        populateNews(data.news || []);
        populateTeam('team-core', data.team?.core || []);
        populateTeam('team-volunteers', data.team?.volunteers || []);
        populateGallery(data.gallery || []);
        populateFaqs(data.faq || {});
    } catch (err) {
        console.error(err);
    }
}

function populateSpeakers(items) {
    const ul = document.querySelector('[data-populate="speakers"]');
    if (!ul) return;
    ul.innerHTML = items.map(s => `
    <li class="speaker-card"
        data-name="${escapeHtml(s.name)}"
        data-role="${escapeHtml(s.role)}"
        data-bio="${escapeHtml(s.bio)}"
        data-img="${escapeHtml(s.image)}"
        data-social='${socialLinksHtml(s.social)}'>
      <img src="${escapeHtml(s.image)}" alt="${escapeHtml(s.name)}" loading="lazy" />
      <h3>${escapeHtml(s.name)}</h3>
      <p>${escapeHtml(s.role)}</p>
    </li>
  `).join('');
}

function populateTickets(items) {
    const grid = document.querySelector('[data-populate="tickets"]');
    if (!grid) return;
    grid.innerHTML = items.map(t => `
    <div class="ticket-card">
      <h3>${escapeHtml(t.name)}</h3>
      <p class="ticket-price">${escapeHtml(t.currency || '₹')}${escapeHtml(t.price)}</p>
      <p>${escapeHtml(t.desc || '')}</p>
      ${t.cta ? `<a href="${escapeHtml(t.cta)}" class="btn-accent">Buy Now</a>` : ''}
    </div>
  `).join('');
}

function populateNews(items) {
    const wrap = document.querySelector('[data-populate="news"]');
    if (!wrap) return;
    wrap.innerHTML = items.map(n => `
    <article class="news-card" data-category="${escapeHtml(n.category || '')}">
      <h3>${escapeHtml(n.title)}</h3>
      <time datetime="${escapeHtml(n.date)}">${formatDate(n.date)}</time>
      <p>${escapeHtml(n.summary || '')}</p>
      ${n.link ? `<a href="${escapeHtml(n.link)}" class="btn-secondary">Read More</a>` : ''}
    </article>
  `).join('');
}

function populateTeam(key, items) {
    const ul = document.querySelector(`[data-populate="${key}"]`);
    if (!ul) return;
    ul.innerHTML = items.map(m => `
    <li class="team-card">
      <img src="${escapeHtml(m.image)}" alt="${escapeHtml(m.name)}" loading="lazy" />
      <h4>${escapeHtml(m.name)}</h4>
      <p>${escapeHtml(m.role)}</p>
    </li>
  `).join('');
}

function populateGallery(items) {
    const ul = document.querySelector('[data-populate="gallery"]');
    if (!ul) return;
    ul.innerHTML = items.map(g => `
    <li>
      <a href="${escapeHtml(g.full)}" class="gallery-item" data-lightbox>
        <img src="${escapeHtml(g.thumb)}" alt="${escapeHtml(g.alt || 'Event photo')}" loading="lazy" />
      </a>
    </li>
  `).join('');
}

function populateFaqs(groups) {
    Object.entries(groups).forEach(([groupKey, qas]) => {
        const wrap = document.querySelector(`.accordion[data-accordion="${groupKey}"]`);
        if (!wrap) return;
        wrap.innerHTML = qas.map(q => `
      <details>
        <summary>${escapeHtml(q.q)}</summary>
        <p>${escapeHtml(q.a)}</p>
      </details>
    `).join('');
    });
}

/* helpers */
function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}
function socialLinksHtml(social) {
    if (!social) return '';
    const links = [];
    if (social.twitter) links.push(`<a href="${escapeHtml(social.twitter)}" target="_blank" rel="noopener">Twitter</a>`);
    if (social.linkedin) links.push(`<a href="${escapeHtml(social.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>`);
    if (social.website) links.push(`<a href="${escapeHtml(social.website)}" target="_blank" rel="noopener">Website</a>`);
    return links.join(' • ');
}
function escapeHtml(str = '') {
    return String(str).replace(/[&<>"']/g, s => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[s]));
}

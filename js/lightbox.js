export function initLightbox(selector = '[data-lightbox] img') {
    const links = document.querySelectorAll('[data-lightbox]');
    if (!links.length) return;

    const dlg = document.createElement('dialog');
    dlg.className = 'lightbox-dialog';
    dlg.innerHTML = `
    <button class="lightbox-close" aria-label="Close">&times;</button>
    <img alt="" />
  `;
    document.body.appendChild(dlg);

    const img = dlg.querySelector('img');
    const closeBtn = dlg.querySelector('.lightbox-close');

    links.forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            img.src = a.href;
            img.alt = a.querySelector('img')?.alt || '';
            dlg.showModal();
        });
    });
    closeBtn.addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', e => {
        if (e.target === dlg) dlg.close();
    });
}

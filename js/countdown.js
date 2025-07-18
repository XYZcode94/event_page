export function initCountdown({ targetDate, el }) {
    const container = typeof el === 'string' ? document.querySelector(el) : el;
    if (!container) return;
    const target = new Date(targetDate);
    if (isNaN(target)) {
        console.warn('Invalid countdown target date:', targetDate);
        return;
    }
    container.hidden = false;
    render();
    const interval = setInterval(render, 1000);

    function render() {
        const now = new Date();
        let diff = target - now;
        if (diff <= 0) {
            clearInterval(interval);
            container.innerHTML = `<span class="countdown-live">We're live!</span>`;
            return;
        }
        const sec = Math.floor(diff / 1000) % 60;
        const min = Math.floor(diff / (1000 * 60)) % 60;
        const hr = Math.floor(diff / (1000 * 60 * 60)) % 24;
        const day = Math.floor(diff / (1000 * 60 * 60 * 24));
        container.innerHTML = `
      ${segment(day, 'Days')}
      ${segment(hr, 'Hours')}
      ${segment(min, 'Minutes')}
      ${segment(sec, 'Seconds')}
    `;
    }
    function segment(val, label) {
        return `<div class="countdown-segment"><div class="countdown-value">${val}</div><div class="countdown-label">${label}</div></div>`;
    }
}

/* Little Bianca guestbook: shows every review from the Red Rock Rep feed as our own scrolling cards.
   If the feed fails, is slow or looks wrong, falls back to Red Rock Rep's official widget (restyled to match). */
(function () {
  var WIDGET = '917c2cc0-31c4-4634-b88d-f819b3634ae6';
  var FEED = 'https://app.redrockrep.com.au/api/widgets/' + WIDGET + '/reviews';
  var FALLBACK_CSS = "\n.title, .subtitle { display: none !important; }\n.top-sliders { padding: 4px 0 8px; }\n.sliders { gap: 22px !important; }\n.slider { width: 300px !important; min-width: 300px !important; min-height: 0 !important; margin: 8px 0 !important; background: #fffdf9 !important; border: 1px solid rgba(51,46,45,.12) !important; border-top: 2px solid #de5021 !important; border-radius: 0 !important; box-shadow: 0 10px 22px -16px rgba(51,46,45,.45) !important; }\n.slider [style*=\"background\"] { background: transparent !important; box-shadow: none !important; }\n.slider-container { box-sizing: border-box !important; background: transparent !important; padding: 24px 26px 22px !important; }\n.slider-container::before { content: \"\\201D\"; position: absolute; right: 18px; bottom: -34px; font: 400 120px/1 \"Cormorant Garamond\", Georgia, serif; color: rgba(222,80,33,.12); pointer-events: none; }\n.review-stars { margin-bottom: 10px !important; gap: 1px; }\n.review-stars svg { width: 15px !important; height: 15px !important; }\nstop[style*=\"249, 195, 32\"] { stop-color: #de5021 !important; }\nstop[style*=\"179, 180, 180\"] { stop-color: #e6dfd8 !important; }\n.review-source img { width: 18px !important; height: 18px !important; opacity: .9; }\n.emr-w-simple-list-review-time { font: 500 10.5px/1 Jost, Arial, sans-serif !important; letter-spacing: .18em !important; text-transform: uppercase; color: #8a817c !important; }\n.review-message { position: relative; margin-top: 12px; font: italic 400 18.5px/1.38 \"Cormorant Garamond\", Georgia, serif !important; color: #332e2d !important; max-height: calc(1.38em * 4) !important; -webkit-line-clamp: 4 !important; }\n.review-author { left: 26px !important; bottom: 18px !important; width: calc(100% - 52px) !important; }\n.review-author-info-wrapper { display: flex; align-items: center; gap: 11px; }\n.review-author-avatar-wrapper { flex: none; margin: 0 !important; line-height: 0; }\n.review-avatar { width: 34px !important; height: 34px !important; border-radius: 50% !important; object-fit: cover; box-shadow: 0 0 0 2px #fffdf9, 0 0 0 3px rgba(222,80,33,.35); }\n.review-author-name-wrapper span { font: 500 11.5px/1.2 Jost, Arial, sans-serif !important; letter-spacing: .14em !important; text-transform: uppercase; color: #332e2d !important; }\n.emr-verified-icon { opacity: .5; transform: scale(.85); }\n.emr-ri-root { display: none !important; }\n.slider-container > div { padding-right: 0 !important; }\n@media (max-width: 760px) {\n  .slider { width: 264px !important; min-width: 264px !important; }\n  .review-message { font-size: 17.5px !important; }\n}\n";
  var root = document.getElementById('lb-reviews');
  if (!root) return;
  var done = false;

  // Red Rock Rep's own pixel, loaded as in their embed code (it also renders the fallback widget).
  function loadPixel() {
    if (window.EMRPixel) return;
    var s = document.createElement('script');
    s.defer = true;
    s.src = 'https://cdn2.revw.me/js/pixel.js?t=' + 864e5 * Math.ceil(new Date() / 864e5);
    s.onload = function () { window.EMRPixel.init('app.redrockrep.com.au', 530); };
    document.head.appendChild(s);
  }

  function fallback() {
    if (done) return;
    done = true;
    root.className = 'lb-reviews is-fallback';
    root.innerHTML = '<emr-simple-carousel widget-id="' + WIDGET + '"></emr-simple-carousel>';
    var tries = 0, t = setInterval(function () {
      var w = root.querySelector('emr-simple-carousel');
      if (w && w.shadowRoot) {
        clearInterval(t);
        var apply = function () {
          if (w.shadowRoot.getElementById('lb-review-style')) return;
          var st = document.createElement('style');
          st.id = 'lb-review-style';
          st.textContent = FALLBACK_CSS;
          w.shadowRoot.appendChild(st);
        };
        apply();
        new MutationObserver(apply).observe(w.shadowRoot, { childList: true });
      } else if (++tries > 120) clearInterval(t);
    }, 250);
    loadPixel();
  }

  function esc(t) {
    return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }

  function ago(iso) {
    var days = Math.floor((Date.now() - new Date(iso).getTime()) / 864e5);
    if (!(days >= 0)) return '';
    if (days < 1) return 'Today';
    if (days < 2) return 'Yesterday';
    if (days < 31) return days + ' days ago';
    var months = Math.floor(days / 30.44);
    if (months < 12) return months === 1 ? 'A month ago' : months + ' months ago';
    var years = Math.floor(days / 365.25);
    return years === 1 ? 'A year ago' : years + ' years ago';
  }

  var STAR = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L10 14.9l-5.2 2.8 1-5.9L1.5 7.7l5.9-.8z"/></svg>';
  var GOOGLE = '<svg class="lb-g" viewBox="0 0 48 48" role="img" aria-label="Google review"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.9 6.1C12.4 13.7 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17z"/><path fill="#FBBC05" d="M10.5 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.6 10.7l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.6-4.2-13.5-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z"/></svg>';

  function card(r, hidden) {
    var stars = '';
    for (var i = 1; i <= 5; i++) stars += '<i class="' + (i <= r.rating ? 'on' : '') + '">' + STAR + '</i>';
    var pic = r.avatar || r.default_avatar;
    var alt = r.default_avatar ? ' data-fallback="' + esc(r.default_avatar) + '"' : '';
    return '<article class="lb-card"' + (hidden ? ' aria-hidden="true"' : '') + '>' +
      '<div class="lb-top"><span class="lb-stars" role="img" aria-label="' + r.rating + ' out of 5 stars">' + stars + '</span>' +
      (/google/i.test(r.source || '') ? GOOGLE : '') + '</div>' +
      '<time class="lb-date" datetime="' + esc(r.date) + '">' + ago(r.date) + '</time>' +
      '<p class="lb-text">' + esc(r.message) + '</p>' +
      '<p class="lb-author">' + (pic ? '<img src="' + esc(pic) + '"' + alt + ' alt="" width="34" height="34" decoding="async" referrerpolicy="no-referrer">' : '') +
      '<span>' + esc(r.author) + '</span></p></article>';
  }

  function render(list) {
    var one = list.map(function (r) { return card(r, false); }).join('');
    var two = list.map(function (r) { return card(r, true); }).join('');
    root.className = 'lb-reviews is-ready';
    root.innerHTML = '<div class="lb-track" style="--lb-dur:' + (list.length * 7) + 's">' + one + two + '</div>';
    root.querySelectorAll('img[data-fallback]').forEach(function (img) {
      img.addEventListener('error', function () {
        var f = img.getAttribute('data-fallback');
        img.removeAttribute('data-fallback');
        if (f) img.src = f;
      });
    });
  }

  var ctrl = window.AbortController ? new AbortController() : null;
  var timer = setTimeout(function () { if (ctrl) ctrl.abort(); fallback(); }, 8000);
  fetch(FEED, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ enable_review_snippet: false, show_stats: false, per_page: 25, hosted_preview: false }),
    signal: ctrl ? ctrl.signal : undefined
  }).then(function (res) {
    if (!res.ok) throw new Error('feed ' + res.status);
    return res.json();
  }).then(function (d) {
    clearTimeout(timer);
    if (done) return;
    var list = (d && Array.isArray(d.data) ? d.data : []).filter(function (r) {
      return r && !r.hidden && typeof r.message === 'string' && r.message.trim() && r.author && r.rating >= 1 && r.rating <= 5 && !isNaN(new Date(r.date));
    });
    if (list.length < 3) throw new Error('feed looks wrong');
    done = true;
    render(list);
    loadPixel();
  }).catch(function () {
    clearTimeout(timer);
    fallback();
  });
})();

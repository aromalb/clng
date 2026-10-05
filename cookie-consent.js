/*! NextGreenTech UK cookie consent — works with Google Consent Mode v2 + Google Tag Manager */
(function () {
  var KEY = 'ngt_cookie_consent';
  var d = document;

  function gtag() { (window.dataLayer = window.dataLayer || []).push(arguments); }
  function read() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } }
  function save(c) { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {} }

  function apply(c) {
    var a = c.analytics ? 'granted' : 'denied';
    var m = c.marketing ? 'granted' : 'denied';
    gtag('consent', 'update', {
      analytics_storage: a,
      ad_storage: m,
      ad_user_data: m,
      ad_personalization: m
    });
    (window.dataLayer = window.dataLayer || []).push({ event: 'cookie_consent_update' });
  }

  var css = '' +
    '.ngt-cc{position:fixed;left:16px;right:16px;bottom:16px;max-width:540px;z-index:99999;background:#0F1F19;color:#F3F1E7;padding:24px;border-radius:2px;box-shadow:0 12px 40px rgba(0,0,0,.3);font:15px/1.55 Inter,system-ui,sans-serif}' +
    '.ngt-cc h2{font-family:Fraunces,Georgia,serif;font-weight:500;font-size:20px;margin:0 0 8px;color:#F3F1E7;line-height:1.2}' +
    '.ngt-cc p{margin:0 0 16px;color:#E7E3D3;font-size:14.5px}' +
    '.ngt-cc a{color:#B9D94C}' +
    '.ngt-cc-actions{display:flex;flex-wrap:wrap;gap:10px}' +
    '.ngt-cc button{font:500 14.5px Inter,system-ui,sans-serif;padding:11px 18px;border-radius:2px;cursor:pointer;border:1px solid #F3F1E7;background:transparent;color:#F3F1E7}' +
    '.ngt-cc button.ngt-accept{background:#B9D94C;border-color:#B9D94C;color:#0F1F19}' +
    '.ngt-cc button:focus-visible{outline:2px solid #B9D94C;outline-offset:3px}' +
    '.ngt-cc-panel{display:none;margin:0 0 16px}' +
    '.ngt-cc.ngt-open .ngt-cc-panel{display:block}' +
    '.ngt-cc-row{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;padding:12px 0;border-top:1px solid rgba(243,241,231,.16)}' +
    '.ngt-cc-row b{display:block;font-size:14.5px;font-weight:600}' +
    '.ngt-cc-row span{font-size:13.5px;color:#E7E3D3}' +
    '.ngt-cc-row input{width:20px;height:20px;margin-top:2px;accent-color:#B9D94C;flex-shrink:0}' +
    '.ngt-cc-link{cursor:pointer;background:none;border:none;color:#B9D94C;padding:0;font:inherit;text-decoration:underline}';

  var box;

  function build() {
    var s = d.createElement('style');
    s.appendChild(d.createTextNode(css));
    d.head.appendChild(s);

    box = d.createElement('div');
    box.className = 'ngt-cc';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Cookie preferences');
    box.hidden = true;
    box.innerHTML =
      '<h2>Your cookie choices</h2>' +
      '<p>We use cookies to keep the site working and, with your permission, to understand how it is used so we can improve it. You can change your mind at any time. See our <a href="/privacy-policy.html">privacy policy</a>.</p>' +
      '<div class="ngt-cc-panel">' +
        '<div class="ngt-cc-row"><div><b>Necessary</b><span>Needed for the site to work. Always on.</span></div><input type="checkbox" checked disabled aria-label="Necessary cookies"></div>' +
        '<div class="ngt-cc-row"><div><b>Analytics</b><span>Helps us see which pages are useful (Google Analytics).</span></div><input type="checkbox" id="ngt-cc-analytics" aria-label="Analytics cookies"></div>' +
        '<div class="ngt-cc-row"><div><b>Marketing</b><span>Used for advertising and measuring campaigns.</span></div><input type="checkbox" id="ngt-cc-marketing" aria-label="Marketing cookies"></div>' +
      '</div>' +
      '<div class="ngt-cc-actions">' +
        '<button type="button" class="ngt-accept" data-act="accept">Accept all</button>' +
        '<button type="button" data-act="reject">Reject all</button>' +
        '<button type="button" data-act="manage">Manage</button>' +
        '<button type="button" data-act="save" style="display:none">Save choices</button>' +
      '</div>';
    d.body.appendChild(box);

    box.addEventListener('click', function (e) {
      var act = e.target && e.target.getAttribute('data-act');
      if (!act) return;
      if (act === 'accept') return choose({ analytics: true, marketing: true });
      if (act === 'reject') return choose({ analytics: false, marketing: false });
      if (act === 'manage') {
        box.classList.add('ngt-open');
        box.querySelector('[data-act="save"]').style.display = '';
        e.target.style.display = 'none';
        return;
      }
      if (act === 'save') {
        choose({
          analytics: d.getElementById('ngt-cc-analytics').checked,
          marketing: d.getElementById('ngt-cc-marketing').checked
        });
      }
    });
  }

  function choose(c) {
    c.ts = new Date().toISOString();
    save(c);
    apply(c);
    box.hidden = true;
  }

  function show() {
    var c = read() || {};
    d.getElementById('ngt-cc-analytics').checked = !!c.analytics;
    d.getElementById('ngt-cc-marketing').checked = !!c.marketing;
    box.classList.add('ngt-open');
    box.querySelector('[data-act="manage"]').style.display = 'none';
    box.querySelector('[data-act="save"]').style.display = '';
    box.hidden = false;
    box.querySelector('[data-act="save"]').focus();
  }

  function addFooterLink() {
    if (d.querySelector('footer [data-cookie-settings]')) return;
    var list = d.querySelector('footer .footer-links') || d.querySelector('footer .footer-col:last-child ul');
    var a = '<a href="#" data-cookie-settings>Cookie Settings</a>';
    if (list) {
      var li = d.createElement('li');
      li.innerHTML = a;
      list.appendChild(li);
    } else {
      var host = d.querySelector('footer .footer-bottom') || d.querySelector('footer');
      if (host) {
        var sp = d.createElement('span');
        sp.innerHTML = a;
        host.appendChild(sp);
      }
    }
  }

  function init() {
    build();
    addFooterLink();
    d.addEventListener('click', function (e) {
      var t = e.target;
      while (t && t !== d) {
        if (t.hasAttribute && t.hasAttribute('data-cookie-settings')) {
          e.preventDefault();
          show();
          return;
        }
        t = t.parentNode;
      }
    });
    var saved = read();
    if (saved) { apply(saved); } else { box.hidden = false; }
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init);
  else init();
})();

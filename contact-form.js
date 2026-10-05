/*! NextGreenTech UK — sends every .connect-form to the Vercel function at /api/contact */
(function () {
  var ENDPOINT = '/api/contact';
  var THANK_YOU = '/thank-you.html';
  var d = document;

  var css =
    '.form-status{margin:4px 0 0;font-size:14px;line-height:1.5;color:#5B6B63}' +
    '.form-status.is-error{color:#9b2c2c}' +
    '.connect-form button[disabled]{opacity:.6;cursor:wait}';

  function field(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el ? String(el.value || '').trim() : '';
  }

  function status(form) {
    var el = form.querySelector('.form-status');
    if (!el) {
      el = d.createElement('p');
      el.className = 'form-status';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      form.appendChild(el);
    }
    return el;
  }

  function buildMessage(form) {
    var message = field(form, 'message');
    var plan = field(form, 'plan');
    var subject = field(form, '_subject');

    // Pricing-card forms only collect name + email, so describe what they asked about.
    if (!message) {
      message = 'Enquiry about: ' + (plan || subject || 'general enquiry') + '\n(No message was written — the visitor used the quick "Get a free quote" form.)';
    } else if (plan) {
      message = 'Enquiry about: ' + plan + '\n\n' + message;
    }
    return message + '\n\n— Sent from: ' + location.href;
  }

  function onSubmit(e) {
    var form = e.target;
    if (!form.classList || !form.classList.contains('connect-form')) return;
    e.preventDefault();

    // Honeypot: bots fill this hidden field, people don't.
    if (field(form, '_honey')) return;

    var btn = form.querySelector('button[type="submit"]');
    var msg = status(form);
    var payload = {
      name: field(form, 'name'),
      email: field(form, 'email'),
      message: buildMessage(form)
    };

    msg.className = 'form-status';
    msg.textContent = 'Sending…';
    if (btn) btn.disabled = true;

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (body) {
          return { ok: res.ok, body: body };
        });
      })
      .then(function (r) {
        if (!r.ok) throw new Error((r.body && r.body.error) || 'Something went wrong.');
        (window.dataLayer = window.dataLayer || []).push({
          event: 'generate_lead',
          form_page: location.pathname
        });
        // Small delay so the Tag Manager event is sent before we leave the page.
        setTimeout(function () { location.href = THANK_YOU; }, 250);
      })
      .catch(function (err) {
        msg.className = 'form-status is-error';
        msg.textContent = (err && err.message ? err.message : 'Something went wrong.') +
          ' You can also email us at info@nextgreentech.co.uk.';
        if (btn) btn.disabled = false;
      });
  }

  /* ---------- Pop-up contact form (opens from any [data-open-contact] button) ---------- */
  var modalCss =
    'button.btn-primary[data-open-contact]{border:none;cursor:pointer;font-family:Inter,system-ui,sans-serif;font-size:15.5px}' +
    'dialog.ngt-modal{border:none;padding:0;background:#F3F1E7;color:#0F1F19;width:calc(100% - 32px);max-width:480px;border-radius:2px;box-shadow:0 20px 60px rgba(0,0,0,.35);font:16px/1.55 Inter,system-ui,sans-serif}' +
    'dialog.ngt-modal::backdrop{background:rgba(15,31,25,.62)}' +
    '.ngt-modal-inner{padding:32px 28px 28px;position:relative}' +
    '.ngt-modal h2{font-family:Fraunces,Georgia,serif;font-weight:500;font-size:28px;line-height:1.1;margin:0 0 8px;color:#0F1F19}' +
    '.ngt-modal p.ngt-lede{margin:0 0 20px;color:#5B6B63;font-size:15px}' +
    '.ngt-modal-close{position:absolute;top:10px;right:12px;background:none;border:none;font-size:30px;line-height:1;cursor:pointer;color:#0F1F19;padding:6px 10px}' +
    '.ngt-modal-close:focus-visible{outline:2px solid #2A4A38;outline-offset:2px}' +
    '.ngt-modal .connect-form{display:grid;gap:14px;margin:0}' +
    '.ngt-modal .connect-form label{display:block;font-size:13.5px;color:#5B6B63;margin-bottom:6px}' +
    '.ngt-modal .connect-form input,.ngt-modal .connect-form textarea{width:100%;font-family:Inter,system-ui,sans-serif;font-size:15px;padding:13px 14px;border:1px solid rgba(15,31,25,.14);background:#F3F1E7;color:#0F1F19}' +
    '.ngt-modal .connect-form textarea{min-height:110px;resize:vertical}' +
    '.ngt-modal .connect-form button[type=submit]{background:#2A4A38;color:#F3F1E7;padding:14px 26px;border:none;border-radius:2px;font:500 15.5px Inter,system-ui,sans-serif;cursor:pointer;justify-self:start}';

  var modal;

  function buildModal() {
    var s = d.createElement('style');
    s.appendChild(d.createTextNode(modalCss));
    d.head.appendChild(s);

    modal = d.createElement('dialog');
    modal.className = 'ngt-modal';
    modal.setAttribute('aria-labelledby', 'ngt-modal-title');
    modal.innerHTML =
      '<div class="ngt-modal-inner">' +
        '<button type="button" class="ngt-modal-close" aria-label="Close">&times;</button>' +
        '<h2 id="ngt-modal-title">Send us a message</h2>' +
        '<p class="ngt-lede">Tell us what you need and we will reply within one working day.</p>' +
        '<form class="connect-form" action="/api/contact" method="POST">' +
          '<input type="hidden" name="_subject" value="New enquiry from nextgreentech.co.uk">' +
          '<input type="text" name="_honey" style="display:none" tabindex="-1" autocomplete="off">' +
          '<div><label for="ngt-m-name">Name</label><input id="ngt-m-name" type="text" name="name" placeholder="Your name" autocomplete="name" required></div>' +
          '<div><label for="ngt-m-email">Email</label><input id="ngt-m-email" type="email" name="email" placeholder="you@company.co.uk" autocomplete="email" required></div>' +
          '<div><label for="ngt-m-message">Message</label><textarea id="ngt-m-message" name="message" placeholder="Tell us what you need..." required></textarea></div>' +
          '<button type="submit">Send message</button>' +
        '</form>' +
      '</div>';
    d.body.appendChild(modal);

    modal.querySelector('.ngt-modal-close').addEventListener('click', function () { modal.close(); });
    // Click on the dark backdrop closes it
    modal.addEventListener('click', function (e) { if (e.target === modal) modal.close(); });
  }

  function openModal(e) {
    var t = e.target;
    while (t && t !== d) {
      if (t.hasAttribute && t.hasAttribute('data-open-contact')) {
        e.preventDefault();
        if (!modal) buildModal();
        if (typeof modal.showModal === 'function') modal.showModal(); else modal.setAttribute('open', '');
        (window.dataLayer = window.dataLayer || []).push({ event: 'contact_popup_open', form_page: location.pathname });
        var first = modal.querySelector('input[name="name"]');
        if (first) first.focus();
        return;
      }
      t = t.parentNode;
    }
  }

  function init() {
    var s = d.createElement('style');
    s.appendChild(d.createTextNode(css));
    d.head.appendChild(s);
    d.addEventListener('submit', onSubmit);
    d.addEventListener('click', openModal);
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init);
  else init();
})();

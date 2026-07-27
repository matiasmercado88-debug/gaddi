/* =====================================================================
   GADDI — v4 · comportamiento
   Sólo lo que el CSS no puede: estado del header, panel de navegación,
   sección actual y validación del formulario.
   Los revelados son scroll-driven en CSS: acá no hay nada que decida si
   el contenido se ve o no. Si este archivo no carga, la página funciona.
   Front only: sin backend ni servicios de terceros.
   ===================================================================== */
(function () {
  'use strict';

  /* ------------------ Header: fondo marfil al dejar el hero ------------------ */
  var header = document.querySelector('[data-header]');

  if (header) {
    var queued = false;
    var sync = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
      queued = false;
    };
    window.addEventListener('scroll', function () {
      if (!queued) { queued = true; window.requestAnimationFrame(sync); }
    }, { passive: true });
    sync();
  }

  /* ---------------------------- Panel de navegación ---------------------------- */
  var toggle = document.querySelector('[data-nav-toggle]');
  var toggleText = document.querySelector('[data-nav-toggle-text]');
  var panel = document.querySelector('[data-nav-menu]');

  if (toggle && panel && header) {
    var FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea';
    var isOpen = function () { return toggle.getAttribute('aria-expanded') === 'true'; };

    var setMenu = function (open) {
      header.classList.toggle('site-header--nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      if (toggleText) { toggleText.textContent = open ? 'Cerrar' : 'Menú'; }
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) {
        var first = panel.querySelector(FOCUSABLE);
        if (first) { first.focus(); }
      }
    };

    toggle.addEventListener('click', function () { setMenu(!isOpen()); });

    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) { setMenu(false); }
    });

    document.addEventListener('keydown', function (e) {
      if (!isOpen()) { return; }

      if (e.key === 'Escape') {
        setMenu(false);
        toggle.focus();
        return;
      }

      /* Mientras está abierto, el foco no se escapa del panel. */
      if (e.key === 'Tab') {
        var items = Array.prototype.slice.call(panel.querySelectorAll(FOCUSABLE));
        items.unshift(toggle);
        var first = items[0];
        var last = items[items.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    var wide = window.matchMedia('(min-width: 961px)');
    var onWide = function (e) { if (e.matches && isOpen()) { setMenu(false); } };
    if (wide.addEventListener) { wide.addEventListener('change', onWide); }
    else if (wide.addListener) { wide.addListener(onWide); }
  }

  /* ------------ Sección actual: orientación en un scroll largo ------------ */
  var navList = document.querySelector('[data-nav-list]');

  if (navList && 'IntersectionObserver' in window) {
    var links = navList.querySelectorAll('a[href^="#"]');
    var targets = [];
    var linkFor = {};

    Array.prototype.forEach.call(links, function (link) {
      var id = link.getAttribute('href').slice(1);
      var section = document.getElementById(id);
      if (section) { targets.push(section); linkFor[id] = link; }
    });

    if (targets.length) {
      var setCurrent = function (id) {
        Array.prototype.forEach.call(links, function (link) {
          if (link === linkFor[id]) { link.setAttribute('aria-current', 'true'); }
          else { link.removeAttribute('aria-current'); }
        });
      };

      var headerH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10
      ) || 76;

      /* Actual es la sección que ocupa la banda justo debajo del header. Cuando
         ninguna la ocupa (hero, pie) se conserva la última marcada: el indicador
         no debe parpadear a vacío mientras se scrollea. */
      var spy = new IntersectionObserver(function (entries) {
        var entering = entries.filter(function (entry) { return entry.isIntersecting; });
        if (!entering.length) { return; }
        entering.sort(function (a, b) {
          return a.boundingClientRect.top - b.boundingClientRect.top;
        });
        setCurrent(entering[0].target.id);
      }, { rootMargin: '-' + (headerH + 8) + 'px 0px -68% 0px', threshold: 0 });

      targets.forEach(function (section) { spy.observe(section); });
    }
  }

  /* ------------------- Formulario de contacto (front only) ------------------- */
  var form = document.querySelector('[data-contact-form]');

  if (form) {
    /* El HTML no trae `novalidate`: si este script no carga, valida el navegador
       y el formulario sigue siendo utilizable. Recién acá tomamos el control. */
    form.setAttribute('novalidate', '');

    var status = form.querySelector('[data-form-status]');
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    var clearError = function (field) {
      if (!field) { return; }
      field.classList.remove('has-error');
      var control = field.querySelector('input, textarea, select');
      var note = field.querySelector('.field__error');
      if (control) {
        control.removeAttribute('aria-invalid');
        control.removeAttribute('aria-describedby');
      }
      if (note) { note.remove(); }
    };

    var setError = function (field, message) {
      field.classList.add('has-error');
      var control = field.querySelector('input, textarea, select');
      var note = field.querySelector('.field__error');
      if (!note) {
        note = document.createElement('span');
        note.className = 'field__error';
        note.setAttribute('role', 'alert');
        if (control && control.id) { note.id = control.id + '-error'; }
        field.appendChild(note);
      }
      note.textContent = message;
      if (control) {
        control.setAttribute('aria-invalid', 'true');
        if (note.id) { control.setAttribute('aria-describedby', note.id); }
      }
    };

    /* Devuelve el mensaje de error, o null si el campo está bien. */
    var validate = function (control) {
      var value = control.value.trim();
      if (control.hasAttribute('required') && !value) {
        return 'Completá este campo para poder responderte.';
      }
      if (control.type === 'email' && value && !emailRe.test(value)) {
        return 'Revisá el correo: falta el @ o el dominio.';
      }
      return null;
    };

    Array.prototype.forEach.call(form.querySelectorAll('input, textarea'), function (control) {
      /* Se valida al salir del campo, no en cada tecla. */
      control.addEventListener('blur', function () {
        var field = control.closest('.field');
        var message = validate(control);
        if (message) { setError(field, message); } else { clearError(field); }
      });
      control.addEventListener('input', function () {
        var field = control.closest('.field');
        if (field.classList.contains('has-error') && !validate(control)) { clearError(field); }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstInvalid = null;

      Array.prototype.forEach.call(form.querySelectorAll('.field'), function (field) {
        var control = field.querySelector('input, textarea');
        if (!control) { return; }
        clearError(field);
        var message = validate(control);
        if (message) {
          setError(field, message);
          if (!firstInvalid) { firstInvalid = control; }
        }
      });

      if (firstInvalid) {
        if (status) {
          status.hidden = false;
          status.className = 'form-status is-error';
          status.textContent = 'Faltan datos: revisá los campos marcados y volvé a intentar.';
        }
        firstInvalid.focus();
        return;
      }

      /* No hay endpoint. Decirlo, en vez de simular un envío que se pierde.
         Nunca se llama a form.reset(): lo escrito queda ahí para copiarlo. */
      if (status) {
        status.hidden = false;
        status.className = 'form-status is-pending';
        status.textContent = 'Los datos están completos, pero todavía no podemos recibir mensajes desde acá. '
          + 'Copiá lo que escribiste antes de cerrar la pestaña.';
        status.focus();
      }
    });
  }
})();

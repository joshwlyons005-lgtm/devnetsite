/* VCBN — site interactions */

/* Measure CTA label widths so the hover-expand transition uses real values */
(function () {
  document.querySelectorAll('.cta-apply').forEach(function (btn) {
    var label = btn.querySelector('.cta-apply__label');
    var def = btn.querySelector('.cta-apply__default');
    var hov = btn.querySelector('.cta-apply__hover');
    if (!label || !def || !hov) return;
    var measure = document.createElement('span');
    measure.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font:inherit;letter-spacing:inherit;pointer-events:none';
    label.appendChild(measure);
    measure.textContent = def.textContent;
    var dw = measure.offsetWidth;
    measure.textContent = hov.textContent;
    var hw = measure.offsetWidth;
    label.removeChild(measure);
    btn.style.setProperty('--cta-default-w', dw + 'px');
    btn.style.setProperty('--cta-hover-w', hw + 'px');
  });
})();

(function () {
  const header = document.getElementById('site-header');
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  function closeMobileMenu() {
    if (!toggle || !menu) return;
    menu.classList.add('hidden');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }

  function onScroll() {
    if (!header) return;
    if (window.scrollY > 12) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      const isHidden = menu.classList.toggle('hidden');
      toggle.setAttribute('aria-expanded', String(!isHidden));
      toggle.setAttribute('aria-label', isHidden ? 'Open menu' : 'Close menu');
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        closeMobileMenu();
      });
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!menu || menu.classList.contains('hidden')) return;
    var tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    closeMobileMenu();
  });

  const navSectionIds = ['about', 'how-it-works', 'why-join', 'network', 'connect', 'faq'];
  const internalNavLinks = document.querySelectorAll(
    '.site-header__link[href^="#"], .site-header__mobile-link[href^="#"]'
  );

  function clearNavCurrent() {
    internalNavLinks.forEach(function (a) {
      a.removeAttribute('aria-current');
    });
  }

  function setActiveSection(id) {
    if (!id) return;
    clearNavCurrent();
    internalNavLinks.forEach(function (a) {
      if (a.getAttribute('href') === '#' + id) {
        a.setAttribute('aria-current', 'location');
      }
    });
  }

  function applyHashOrDefault() {
    var hash = window.location.hash;
    if (hash && hash.length > 1) {
      var hid = decodeURIComponent(hash.slice(1));
      if (navSectionIds.indexOf(hid) !== -1 && document.getElementById(hid)) {
        return hid;
      }
    }
    return 'about';
  }

  var lastActiveId = null;

  if ('IntersectionObserver' in window && internalNavLinks.length) {
    var sectionElements = navSectionIds
      .map(function (id) {
        return document.getElementById(id);
      })
      .filter(Boolean);

    function syncNavFromHash() {
      var id = applyHashOrDefault();
      lastActiveId = id;
      setActiveSection(id);
    }

    var spyObserver = new IntersectionObserver(
      function (entries) {
        var intersecting = entries.filter(function (en) {
          return en.isIntersecting;
        });
        if (!intersecting.length) return;
        intersecting.sort(function (a, b) {
          return b.intersectionRatio - a.intersectionRatio;
        });
        var id = intersecting[0].target.id;
        if (id === lastActiveId) return;
        lastActiveId = id;
        setActiveSection(id);
      },
      {
        root: null,
        rootMargin: '-28% 0px -38% 0px',
        threshold: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1]
      }
    );

    sectionElements.forEach(function (sec) {
      spyObserver.observe(sec);
    });

    syncNavFromHash();
    window.addEventListener('hashchange', syncNavFromHash);
  } else {
    lastActiveId = applyHashOrDefault();
    setActiveSection(lastActiveId);
  }

  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.06 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }
})();

(function connectConsoleTilt() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('[data-about-console], [data-connect-console], [data-why-join-console]').forEach(function (root) {
    root.querySelectorAll('.connect-console__link, .about-console__cell').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--tilt-x', (y * -6).toFixed(2) + 'deg');
        el.style.setProperty('--tilt-y', (x * 8).toFixed(2) + 'deg');
      });
      el.addEventListener('mouseleave', function () {
        el.style.setProperty('--tilt-x', '0deg');
        el.style.setProperty('--tilt-y', '0deg');
      });
    });
  });
})();

(function pipelineInteractive() {
  const root = document.querySelector('[data-pipeline]');
  if (!root) return;

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stepItems = root.querySelectorAll('li[data-step]');
  const dots = root.querySelectorAll('.pipeline-interactive__dot[data-step-dot], .pipeline-runbook__tab[data-step-dot]');

  function setActive(n) {
    const s = String(Math.max(1, Math.min(3, n)));
    root.setAttribute('data-active', s);
    dots.forEach(function (btn) {
      const on = btn.getAttribute('data-step-dot') === s;
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  stepItems.forEach(function (li) {
    const step = li.getAttribute('data-step');
    if (!step) return;
    li.addEventListener('mouseenter', function () { setActive(step); });
    li.addEventListener('focusin', function () { setActive(step); });
    li.addEventListener('touchstart', function () { setActive(step); }, { passive: true });
    li.addEventListener('click', function () { setActive(step); });
  });

  dots.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const d = btn.getAttribute('data-step-dot');
      if (d) setActive(d);
    });
  });

  root.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    if (!root.contains(document.activeElement)) return;
    const cur = parseInt(root.getAttribute('data-active'), 10) || 1;
    e.preventDefault();
    if (e.key === 'ArrowRight') setActive(cur >= 3 ? 1 : cur + 1);
    else setActive(cur <= 1 ? 3 : cur - 1);
  });

  if (!reduceMotion && 'IntersectionObserver' in window) {
    let played = false;
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting || played) return;
          played = true;
          setActive(1);
          setTimeout(function () { setActive(2); }, 380);
          setTimeout(function () { setActive(3); }, 760);
          setTimeout(function () { setActive(1); }, 1140);
          io.disconnect();
        });
      },
      { threshold: 0.22, rootMargin: '0px 0px -10% 0px' }
    );
    io.observe(root);
  }
})();

(function faqAccordion() {
  const root = document.querySelector('[data-faq-console]');
  if (!root) return;
  const items = root.querySelectorAll('[data-faq-item]');
  if (!items.length) return;

  function setItemExpanded(item, expanded) {
    const btn = item.querySelector('.faq-item__summary');
    const panel = item.querySelector('.faq-item__body');
    if (!btn || !panel) return;
    btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    item.classList.toggle('faq-item--open', expanded);
    if (expanded) panel.removeAttribute('hidden');
    else panel.setAttribute('hidden', '');
  }

  items.forEach(function (item) {
    const btn = item.querySelector('.faq-item__summary');
    if (!btn) return;
    btn.addEventListener('click', function () {
      const wasOpen = btn.getAttribute('aria-expanded') === 'true';
      if (wasOpen) {
        setItemExpanded(item, false);
        return;
      }
      items.forEach(function (other) {
        setItemExpanded(other, other === item);
      });
    });
  });
})();

(function initPresenceMap() {
  const mapEl = document.getElementById('vcbn-presence-map');
  if (!mapEl || typeof L === 'undefined') return;

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const useCluster = typeof L.markerClusterGroup === 'function';

  const cities = [
    { id: 'toronto', name: 'Toronto', lat: 43.6532, lng: -79.3832 },
    { id: 'london', name: 'London', lat: 42.9849, lng: -81.2453 },
    { id: 'waterloo', name: 'Waterloo', lat: 43.4643, lng: -80.5204 },
    { id: 'guelph', name: 'Guelph', lat: 43.5448, lng: -80.2482 },
    { id: 'kingston', name: 'Kingston', lat: 44.2312, lng: -76.4860 },
    { id: 'montreal', name: 'Montr\u00e9al', lat: 45.5017, lng: -73.5673 },
    { id: 'halifax', name: 'Halifax', lat: 44.6488, lng: -63.5752 }
  ];

  const cards = document.querySelectorAll('.presence-city-pill');
  const markersById = {};
  let activeId = null;
  let clusterGroup = null;

  function cityById(id) {
    return cities.find(function (c) { return c.id === id; }) || null;
  }

  function cityPalette() {
    return { fill: '#a3e635', stroke: 'rgba(248, 250, 252, 0.9)' };
  }

  function markerStyleBase(c) {
    const p = cityPalette(c);
    return { radius: 7, fillColor: p.fill, color: p.stroke, weight: 2.5, opacity: 1, fillOpacity: 0.88 };
  }

  function markerStyleActive(c) {
    const p = cityPalette(c);
    return { radius: 11, fillColor: p.fill, color: '#f8fafc', weight: 3, opacity: 1, fillOpacity: 1 };
  }

  function setActiveCity(id) {
    activeId = id;
    cards.forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-city') === id);
    });
  }

  function clearActive() {
    activeId = null;
    cards.forEach(function (btn) { btn.classList.remove('is-active'); });
  }

  function setMarkerVisual(id, active) {
    const m = markersById[id];
    if (!m) return;
    const c = cityById(id);
    if (!c) return;
    m.setStyle(active ? markerStyleActive(c) : markerStyleBase(c));
  }

  function tooltipHtml(c) {
    return '<div class="presence-tooltip-inner presence-tooltip-inner--minimal">' +
      '<span class="presence-tooltip-inner__name">' + c.name + '</span></div>';
  }

  function hubBoundsFromCities() {
    let b = null;
    cities.forEach(function (c) {
      const ll = L.latLng(c.lat, c.lng);
      if (!b) b = L.latLngBounds(ll, ll);
      else b.extend(ll);
    });
    return b ? b.pad(0.14) : L.latLngBounds([42.6, -82.2], [45.8, -62.8]);
  }

  const hubBounds = hubBoundsFromCities();

  const map = L.map(mapEl, {
    scrollWheelZoom: false,
    zoomControl: true,
    attributionControl: true,
    maxBounds: hubBounds.pad(0.06),
    maxBoundsViscosity: 0.85
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
    minZoom: 4
  }).addTo(map);

  map.fitBounds(hubBounds, { padding: [36, 36], maxZoom: 8 });

  const minZoomAllowed = Math.max(
    5,
    Math.min(map.getBoundsZoom(hubBounds, false, L.point(28, 28)), 7)
  );
  map.setMinZoom(minZoomAllowed);
  if (map.getZoom() < minZoomAllowed) {
    map.setZoom(minZoomAllowed);
  }

  if (useCluster) {
    clusterGroup = L.markerClusterGroup({
      maxClusterRadius: 38,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      removeOutsideVisibleBounds: true,
      disableClusteringAtZoom: 9,
      zoomToBoundsOnClick: true,
      spiderLegPolylineOptions: { weight: 1.5, color: 'rgba(163, 230, 53, 0.45)', opacity: 0.9 },
      iconCreateFunction: function (cl) {
        const n = cl.getChildCount();
        return L.divIcon({
          html: '<span class="vcbn-cluster-count">' + n + '</span>',
          className: 'vcbn-marker-cluster',
          iconSize: L.point(34, 34)
        });
      }
    });
  }

  cities.forEach(function (c) {
    const m = L.circleMarker([c.lat, c.lng], markerStyleBase(c));
    m.bindTooltip(tooltipHtml(c), {
      direction: 'top', offset: [0, -10], opacity: 1, sticky: true,
      className: 'vcbn-map-tooltip vcbn-map-tooltip--minimal'
    });
    markersById[c.id] = m;
    if (useCluster) clusterGroup.addLayer(m);
    else m.addTo(map);

    m.on('mouseover', function () {
      setActiveCity(c.id);
      setMarkerVisual(c.id, true);
      m.openTooltip();
    });
    m.on('mouseout', function () {
      m.closeTooltip();
      clearActive();
      setMarkerVisual(c.id, false);
    });
    m.on('click', function () {
      setActiveCity(c.id);
      setMarkerVisual(c.id, true);
      const targetZoom = Math.max(map.getZoom(), 9);
      if (reduceMotion) map.setView([c.lat, c.lng], targetZoom);
      else map.flyTo([c.lat, c.lng], targetZoom, { duration: 0.55 });
      m.openTooltip();
    });
  });

  if (useCluster) map.addLayer(clusterGroup);

  function focusMarkerFromPill(c) {
    const m = markersById[c.id];
    if (!m) return;
    const targetZoom = Math.max(map.getZoom(), 9);
    function afterVisible() {
      setActiveCity(c.id);
      setMarkerVisual(c.id, true);
      if (reduceMotion) map.setView([c.lat, c.lng], targetZoom);
      else map.flyTo([c.lat, c.lng], targetZoom, { duration: 0.55 });
      m.openTooltip();
    }
    if (useCluster && clusterGroup) clusterGroup.zoomToShowLayer(m, afterVisible);
    else afterVisible();
  }

  cards.forEach(function (btn) {
    const id = btn.getAttribute('data-city');
    const c = cityById(id);
    if (!c) return;

    btn.addEventListener('mouseenter', function () {
      setActiveCity(id);
      setMarkerVisual(id, true);
      const m = markersById[id];
      if (m) m.openTooltip();
    });
    btn.addEventListener('mouseleave', function () {
      setMarkerVisual(id, false);
      const m = markersById[id];
      if (m) m.closeTooltip();
      if (activeId === id) clearActive();
    });
    btn.addEventListener('focus', function () {
      setActiveCity(id);
      setMarkerVisual(id, true);
    });
    btn.addEventListener('blur', function () {
      setMarkerVisual(id, false);
      clearActive();
    });
    btn.addEventListener('click', function () {
      focusMarkerFromPill(c);
    });
  });

  function resetMapToOverview() {
    clearActive();
    Object.keys(markersById).forEach(function (id) {
      setMarkerVisual(id, false);
      const m = markersById[id];
      if (m) m.closeTooltip();
    });
    const fitOpts = { padding: [36, 36], maxZoom: 8 };
    function clampZoomAfterFit() {
      if (map.getZoom() < minZoomAllowed) map.setZoom(minZoomAllowed);
    }
    if (reduceMotion) {
      map.fitBounds(hubBounds, fitOpts);
      clampZoomAfterFit();
    } else {
      map.flyToBounds(hubBounds, Object.assign({ duration: 0.55 }, fitOpts));
      map.once('moveend', clampZoomAfterFit);
    }
  }

  const ResetControl = L.Control.extend({
    options: { position: 'topleft' },
    onAdd: function () {
      const wrap = L.DomUtil.create('div', 'leaflet-bar leaflet-control presence-map-reset-control');
      const btn = L.DomUtil.create('button', 'presence-map-reset-btn', wrap);
      btn.type = 'button';
      btn.textContent = 'Reset';
      btn.setAttribute('aria-label', 'Reset map to original view');
      L.DomEvent.disableClickPropagation(wrap);
      L.DomEvent.on(btn, 'click', function (e) {
        L.DomEvent.stopPropagation(e);
        resetMapToOverview();
      });
      return wrap;
    }
  });
  map.addControl(new ResetControl());

  function invalidateMapSize() { map.invalidateSize(); }
  setTimeout(invalidateMapSize, 400);
  if ('IntersectionObserver' in window) {
    const ioMap = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) invalidateMapSize();
      });
    }, { threshold: 0.05 });
    ioMap.observe(mapEl);
  }
})();

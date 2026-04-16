/* DevNet, site interactions */

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

  const applyDropdown = document.getElementById('apply-dropdown');
  const applyTrigger = document.getElementById('apply-dropdown-trigger');
  if (applyDropdown && applyTrigger) {
    function setApplyDropdownOpen(open) {
      applyTrigger.setAttribute('aria-expanded', String(open));
    }
    applyDropdown.addEventListener('mouseenter', function () {
      setApplyDropdownOpen(true);
    });
    applyDropdown.addEventListener('mouseleave', function () {
      setApplyDropdownOpen(false);
    });
    applyDropdown.addEventListener('focusin', function () {
      setApplyDropdownOpen(true);
    });
    applyDropdown.addEventListener('focusout', function (e) {
      var next = e.relatedTarget;
      if (!next || !applyDropdown.contains(next)) {
        setApplyDropdownOpen(false);
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (!applyDropdown.contains(document.activeElement)) return;
      setApplyDropdownOpen(false);
      applyTrigger.focus();
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
  document.querySelectorAll('[data-connect-console], [data-why-join-console]').forEach(function (root) {
    root.querySelectorAll('.connect-console__link').forEach(function (el) {
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

(function aboutBootSequence() {
  const root = document.querySelector('[data-about-boot]');
  if (!root) return;

  const lines = Array.prototype.slice.call(root.querySelectorAll('[data-boot-line]'));
  const ctas = root.querySelector('[data-boot-ctas]');
  if (!lines.length) return;

  const reduceMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function revealAll() {
    lines.forEach(function (line) {
      line.classList.add('is-visible');
    });
    if (ctas) ctas.classList.add('is-visible');
    root.classList.add('is-ready');
  }

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealAll();
    return;
  }

  let started = false;

  function runSequence() {
    if (started) return;
    started = true;

    const perLineDelay = 140;
    const firstLineDelay = 180;

    lines.forEach(function (line, i) {
      setTimeout(function () {
        line.classList.add('is-visible');
      }, firstLineDelay + i * perLineDelay);
    });

    if (ctas) {
      setTimeout(function () {
        ctas.classList.add('is-visible');
      }, firstLineDelay + lines.length * perLineDelay + 100);
    }

    setTimeout(function () {
      root.classList.add('is-ready');
    }, firstLineDelay + lines.length * perLineDelay + 400);
  }

  const io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runSequence();
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -8% 0px' }
  );

  io.observe(root);

  setTimeout(function () {
    if (!started) runSequence();
  }, 900);
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

(function faqTabs() {
  const root = document.querySelector('[data-faq-tabs]');
  if (!root) return;
  const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
  const panels = Array.from(root.querySelectorAll('[role="tabpanel"]'));
  if (!tabs.length || !panels.length) return;
  const statusEl = document.querySelector('[data-faq-status]');
  const totalLabel = String(tabs.length).padStart(2, '0');

  function activate(index, focus) {
    const target = tabs[index];
    if (!target) return;
    tabs.forEach(function (tab, i) {
      const selected = i === index;
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
      tab.setAttribute('tabindex', selected ? '0' : '-1');
    });
    const activeId = target.getAttribute('aria-controls');
    panels.forEach(function (panel) {
      if (panel.id === activeId) panel.removeAttribute('hidden');
      else panel.setAttribute('hidden', '');
    });
    if (statusEl) {
      const n = String(index + 1).padStart(2, '0');
      statusEl.textContent = 'entry ' + n + ' / ' + totalLabel;
    }
    if (focus) target.focus();
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () {
      activate(i, false);
    });
    tab.addEventListener('keydown', function (e) {
      const last = tabs.length - 1;
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          activate(i === last ? 0 : i + 1, true);
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          activate(i === 0 ? last : i - 1, true);
          break;
        case 'Home':
          e.preventDefault();
          activate(0, true);
          break;
        case 'End':
          e.preventDefault();
          activate(last, true);
          break;
        default:
          break;
      }
    });
  });

  const initial = tabs.findIndex(function (tab) {
    return tab.getAttribute('aria-selected') === 'true';
  });
  activate(initial >= 0 ? initial : 0, false);
})();

(function initPresenceMap() {
  const mapEl = document.getElementById('devnet-presence-map');
  if (!mapEl || typeof L === 'undefined') return;

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const useCluster = typeof L.markerClusterGroup === 'function';

  const cities = [
    { id: 'vancouver', name: 'Vancouver', lat: 49.2827, lng: -123.1207, region: 'ca' },
    { id: 'toronto', name: 'Toronto', lat: 43.6532, lng: -79.3832, region: 'ca' },
    { id: 'london', name: 'London', lat: 42.9849, lng: -81.2453, region: 'ca' },
    { id: 'waterloo', name: 'Waterloo', lat: 43.4643, lng: -80.5204, region: 'ca' },
    { id: 'guelph', name: 'Guelph', lat: 43.5448, lng: -80.2482, region: 'ca' },
    { id: 'kingston', name: 'Kingston', lat: 44.2312, lng: -76.4860, region: 'ca' },
    { id: 'montreal', name: 'Montr\u00e9al', lat: 45.5017, lng: -73.5673, region: 'ca' },
    { id: 'halifax', name: 'Halifax', lat: 44.6488, lng: -63.5752, region: 'ca' },
    { id: 'tucson', name: 'Tucson', lat: 32.2226, lng: -110.9747, region: 'us' },
    { id: 'miami', name: 'Miami', lat: 25.7617, lng: -80.1918, region: 'us' },
    { id: 'boston', name: 'Boston', lat: 42.3601, lng: -71.0589, region: 'us' },
    { id: 'new-york-city', name: 'New York City', lat: 40.7128, lng: -74.0060, region: 'us' },
    { id: 'los-angeles', name: 'Los Angeles', lat: 34.0522, lng: -118.2437, region: 'us' }
  ];

  const cards = document.querySelectorAll('.presence-city-pill');
  const markersById = {};
  let activeId = null;
  let clusterGroup = null;
  /** Preserved across arc rebuilds (zoom / cluster changes) so hover highlight stays correct. */
  let arcHighlightRegion = null;

  function cityById(id) {
    return cities.find(function (c) { return c.id === id; }) || null;
  }

  function cityPalette(c) {
    if (c && c.region === 'us') {
      return { fill: '#4ade80', stroke: 'rgba(240, 253, 244, 0.95)' };
    }
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

  /**
   * Slight quadratic bend (north of chord), enough to read as a link, not a huge rainbow.
   * Long hops stay almost straight; bulge scales gently and is capped low.
   */
  function hubArcLatLngs(lat1, lng1, lat2, lng2, segments) {
    var dLat = lat2 - lat1;
    var dLng = lng2 - lng1;
    var chordDeg = Math.sqrt(dLat * dLat + dLng * dLng);
    var midLat = (lat1 + lat2) / 2;
    var midLng = (lng1 + lng2) / 2;
    var bulge = Math.min(0.38, Math.max(0.06, chordDeg * 0.028));
    var cLat = midLat + bulge;
    var cLng = midLng;
    var out = [];
    var i;
    var u;
    var omu;
    var lat;
    var lng;
    for (i = 0; i <= segments; i++) {
      u = i / segments;
      omu = 1 - u;
      lat = omu * omu * lat1 + 2 * omu * u * cLat + u * u * lat2;
      lng = omu * omu * lng1 + 2 * omu * u * cLng + u * u * lng2;
      out.push(L.latLng(lat, lng));
    }
    return out;
  }

  var ARC_STYLE_BASE = {
    color: '#c9a84c',
    weight: 1.2,
    opacity: 0.28,
    lineCap: 'round',
    lineJoin: 'round',
    dashArray: '6 4'
  };
  var ARC_STYLE_DIM = {
    color: '#c9a84c',
    weight: 1,
    opacity: 0.06,
    lineCap: 'round',
    lineJoin: 'round',
    dashArray: '6 4'
  };
  var ARC_STYLE_HIGH = {
    color: '#e8d48a',
    weight: 2,
    opacity: 0.85,
    lineCap: 'round',
    lineJoin: 'round',
    dashArray: null
  };
  var arcWebGroup = null;

  function applyArcHighlightToLayers() {
    if (!arcWebGroup) return;
    var region = arcHighlightRegion;
    arcWebGroup.eachLayer(function (layer) {
      if (!layer._devnetEdgeType) return;
      if (!region) {
        layer.setStyle(ARC_STYLE_BASE);
        return;
      }
      var match = layer._devnetEdgeType === region;
      if (match) layer.setStyle(ARC_STYLE_HIGH);
      else layer.setStyle(ARC_STYLE_DIM);
    });
  }

  function setArcHighlightByRegion(region) {
    arcHighlightRegion = region;
    applyArcHighlightToLayers();
  }

  function hubBoundsFromCities() {
    let b = null;
    cities.forEach(function (c) {
      const ll = L.latLng(c.lat, c.lng);
      if (!b) b = L.latLngBounds(ll, ll);
      else b.extend(ll);
    });
    return b
      ? b.pad(0.14)
      : L.latLngBounds([25.2, -124.5], [45.9, -62.5]);
  }

  const hubBounds = hubBoundsFromCities();
  const minZoomAllowed = 4;

  const map = L.map(mapEl, {
    scrollWheelZoom: true,
    zoomControl: true,
    attributionControl: true
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
    minZoom: 4
  }).addTo(map);

  map.setMinZoom(minZoomAllowed);
  map.fitBounds(hubBounds, { padding: [40, 40], maxZoom: 5 });
  if (map.getZoom() < minZoomAllowed) {
    map.setZoom(minZoomAllowed);
  }

  map.createPane('devnetArcs');
  map.getPane('devnetArcs').classList.add('leaflet-devnet-arcs-pane');
  map.getPane('devnetArcs').style.zIndex = '450';

  arcWebGroup = L.featureGroup();
  arcWebGroup.addTo(map);

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
          html: '<span class="devnet-cluster-count">' + n + '</span>',
          className: 'devnet-marker-cluster',
          iconSize: L.point(34, 34)
        });
      }
    });
  }

  cities.forEach(function (c) {
    const m = L.circleMarker([c.lat, c.lng], markerStyleBase(c));
    m.bindTooltip(tooltipHtml(c), {
      direction: 'top', offset: [0, -10], opacity: 1, sticky: true,
      className: 'devnet-map-tooltip devnet-map-tooltip--minimal'
    });
    markersById[c.id] = m;
    if (useCluster) clusterGroup.addLayer(m);
    else m.addTo(map);

    m.on('mouseover', function () {
      setActiveCity(c.id);
      setMarkerVisual(c.id, true);
      setArcHighlightByRegion(c.region);
      m.openTooltip();
    });
    m.on('mouseout', function () {
      m.closeTooltip();
      clearActive();
      setMarkerVisual(c.id, false);
      setArcHighlightByRegion(null);
    });
    m.on('click', function () {
      setActiveCity(c.id);
      setMarkerVisual(c.id, true);
      setArcHighlightByRegion(c.region);
      const targetZoom = Math.max(map.getZoom(), 9);
      if (reduceMotion) map.setView([c.lat, c.lng], targetZoom);
      else map.flyTo([c.lat, c.lng], targetZoom, { duration: 0.55 });
      m.openTooltip();
    });
  });

  if (useCluster) map.addLayer(clusterGroup);

  var arcRebuildTimer = null;

  function getMarkerDisplayParent(marker) {
    if (!useCluster || !clusterGroup) return marker;
    if (typeof clusterGroup.getVisibleParent !== 'function') return marker;
    var p = clusterGroup.getVisibleParent(marker);
    return p || marker;
  }

  function groupRegionFlavor(ids) {
    var ca = false;
    var us = false;
    var i;
    for (i = 0; i < ids.length; i++) {
      var cc = cityById(ids[i]);
      if (!cc) continue;
      if (cc.region === 'ca') ca = true;
      if (cc.region === 'us') us = true;
    }
    if (ca && !us) return 'ca';
    if (us && !ca) return 'us';
    return 'mixed';
  }

  function edgeTypeForGroupPair(idsA, idsB) {
    var f1 = groupRegionFlavor(idsA);
    var f2 = groupRegionFlavor(idsB);
    if (f1 === 'ca' && f2 === 'ca') return 'ca';
    if (f1 === 'us' && f2 === 'us') return 'us';
    return 'cross';
  }

  function sortedPairKey(a, b) {
    return a < b ? a + '|' + b : b + '|' + a;
  }

  /**
   * Canadian spine: southwest ON → Toronto → Kingston → Montréal → Halifax, plus optional
   * extra CA–CA links in CA_EXTRA_KEYS (e.g. Halifax–Kingston, Vancouver–Kingston).
   */
  var CA_BACKBONE_ADJ = {};
  (function () {
    var chain = ['london', 'waterloo', 'guelph', 'toronto', 'kingston', 'montreal', 'halifax'];
    var i;
    for (i = 0; i < chain.length - 1; i++) {
      CA_BACKBONE_ADJ[sortedPairKey(chain[i], chain[i + 1])] = true;
    }
  }());

  /** Extra Canadian links (in addition to spine segments). */
  var CA_EXTRA_KEYS = {};
  CA_EXTRA_KEYS[sortedPairKey('halifax', 'kingston')] = true;
  CA_EXTRA_KEYS[sortedPairKey('halifax', 'london')] = true;
  CA_EXTRA_KEYS[sortedPairKey('vancouver', 'kingston')] = true;
  CA_EXTRA_KEYS[sortedPairKey('vancouver', 'london')] = true;
  CA_EXTRA_KEYS[sortedPairKey('vancouver', 'montreal')] = true;

  /** CA–CA pairs drawn as a straight chord (no quadratic bend). */
  var CA_HUB_STRAIGHT_KEYS = {};
  CA_HUB_STRAIGHT_KEYS[sortedPairKey('halifax', 'london')] = true;

  /**
   * US spine: west → southwest → southeast → northeast (no full mesh).
   */
  var US_BACKBONE_ADJ = {};
  (function () {
    var chain = ['los-angeles', 'tucson', 'miami', 'new-york-city', 'boston'];
    var i;
    for (i = 0; i < chain.length - 1; i++) {
      US_BACKBONE_ADJ[sortedPairKey(chain[i], chain[i + 1])] = true;
    }
  }());

  var US_EXTRA_KEYS = {};
  US_EXTRA_KEYS[sortedPairKey('los-angeles', 'new-york-city')] = true;
  US_EXTRA_KEYS[sortedPairKey('new-york-city', 'tucson')] = true;
  US_EXTRA_KEYS[sortedPairKey('boston', 'miami')] = true;

  /** Explicit US–Canada links (not in the backbone). */
  var CROSS_US_CA_KEYS = {};
  [
    ['boston', 'montreal'],
    ['london', 'tucson'],
    ['london', 'miami'],
    ['london', 'boston'],
    ['boston', 'halifax'],
    ['boston', 'kingston'],
    ['vancouver', 'los-angeles'],
    ['los-angeles', 'london'],
    ['vancouver', 'miami'],
    ['vancouver', 'tucson'],
    ['new-york-city', 'montreal'],
    ['new-york-city', 'toronto'],
    ['new-york-city', 'kingston'],
    ['new-york-city', 'london']
  ].forEach(function (pair) {
    CROSS_US_CA_KEYS[sortedPairKey(pair[0], pair[1])] = true;
  });

  function hubArcEdgeAllowed(idA, idB) {
    var cA = cityById(idA);
    var cB = cityById(idB);
    if (!cA || !cB) return false;
    var ca = cA.region === 'ca';
    var cb = cB.region === 'ca';
    if (ca && cb) {
      var k = sortedPairKey(idA, idB);
      return !!(CA_BACKBONE_ADJ[k] || CA_EXTRA_KEYS[k]);
    }
    if (cA.region === 'us' && cB.region === 'us') {
      var kUs = sortedPairKey(idA, idB);
      return !!(US_BACKBONE_ADJ[kUs] || US_EXTRA_KEYS[kUs]);
    }
    return !!CROSS_US_CA_KEYS[sortedPairKey(idA, idB)];
  }

  function groupsAllowHubArc(ga, gb) {
    var ai;
    var bi;
    for (ai = 0; ai < ga.ids.length; ai++) {
      for (bi = 0; bi < gb.ids.length; bi++) {
        if (hubArcEdgeAllowed(ga.ids[ai], gb.ids[bi])) return true;
      }
    }
    return false;
  }

  function groupsUseStraightHubChord(ga, gb) {
    var ai;
    var bi;
    for (ai = 0; ai < ga.ids.length; ai++) {
      for (bi = 0; bi < gb.ids.length; bi++) {
        var a = ga.ids[ai];
        var b = gb.ids[bi];
        if (!hubArcEdgeAllowed(a, b)) continue;
        if (CA_HUB_STRAIGHT_KEYS[sortedPairKey(a, b)]) return true;
      }
    }
    return false;
  }

  /**
   * Canada = Ontario spine + extras; US = single west→east backbone; explicit cross-border links. At high
   * zoom each hub is its own node. When hubs share a cluster icon, collapse to one node per cluster.
   */
  function rebuildHubArcWeb() {
    if (!arcWebGroup) return;
    arcWebGroup.clearLayers();
    var seg = 16;
    var groups = {};
    cities.forEach(function (c) {
      var m = markersById[c.id];
      if (!m) return;
      var par = getMarkerDisplayParent(m);
      var sid = L.Util.stamp(par);
      if (!groups[sid]) {
        groups[sid] = { latlng: par.getLatLng(), ids: [] };
      }
      groups[sid].ids.push(c.id);
    });
    var keys = Object.keys(groups);
    var gi;
    var gj;
    for (gi = 0; gi < keys.length; gi++) {
      for (gj = gi + 1; gj < keys.length; gj++) {
        var ga = groups[keys[gi]];
        var gb = groups[keys[gj]];
        if (!groupsAllowHubArc(ga, gb)) continue;
        var la = ga.latlng;
        var lb = gb.latlng;
        var edgeType = edgeTypeForGroupPair(ga.ids, gb.ids);
        var latlngs = groupsUseStraightHubChord(ga, gb)
          ? [L.latLng(la.lat, la.lng), L.latLng(lb.lat, lb.lng)]
          : hubArcLatLngs(la.lat, la.lng, lb.lat, lb.lng, seg);
        var line = L.polyline(latlngs, Object.assign({
          pane: 'devnetArcs',
          interactive: false,
          className: 'devnet-hub-arc'
        }, ARC_STYLE_BASE));
        line._devnetEdgeType = edgeType;
        line._devnetEndpoints = [ga.ids.slice().sort().join(','), gb.ids.slice().sort().join(',')];
        arcWebGroup.addLayer(line);
      }
    }
    applyArcHighlightToLayers();
  }

  function scheduleRebuildArcWeb() {
    clearTimeout(arcRebuildTimer);
    arcRebuildTimer = setTimeout(function () {
      arcRebuildTimer = null;
      rebuildHubArcWeb();
    }, 48);
  }

  rebuildHubArcWeb();
  map.on('zoomend', scheduleRebuildArcWeb);
  map.on('moveend', scheduleRebuildArcWeb);
  if (clusterGroup) {
    clusterGroup.on('animationend', scheduleRebuildArcWeb);
    clusterGroup.on('spiderfied', scheduleRebuildArcWeb);
    clusterGroup.on('unspiderfied', scheduleRebuildArcWeb);
  }

  function focusMarkerFromPill(c) {
    const m = markersById[c.id];
    if (!m) return;
    const targetZoom = Math.max(map.getZoom(), 9);
    function afterVisible() {
      setActiveCity(c.id);
      setMarkerVisual(c.id, true);
      setArcHighlightByRegion(c.region);
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
      setArcHighlightByRegion(c.region);
      const m = markersById[id];
      if (m) m.openTooltip();
    });
    btn.addEventListener('mouseleave', function () {
      setMarkerVisual(id, false);
      setArcHighlightByRegion(null);
      const m = markersById[id];
      if (m) m.closeTooltip();
      if (activeId === id) clearActive();
    });
    btn.addEventListener('focus', function () {
      setActiveCity(id);
      setMarkerVisual(id, true);
      setArcHighlightByRegion(c.region);
    });
    btn.addEventListener('blur', function () {
      setMarkerVisual(id, false);
      setArcHighlightByRegion(null);
      clearActive();
    });
    btn.addEventListener('click', function () {
      focusMarkerFromPill(c);
    });
  });

  function resetMapToOverview() {
    setArcHighlightByRegion(null);
    clearActive();
    Object.keys(markersById).forEach(function (id) {
      setMarkerVisual(id, false);
      const m = markersById[id];
      if (m) m.closeTooltip();
    });
    const fitOpts = { padding: [40, 40], maxZoom: 5 };
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

  function invalidateMapSize() {
    map.invalidateSize();
    scheduleRebuildArcWeb();
  }
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

/* ══ HEADER — SHRINK ON SCROLL ══ */
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 50);
});

/* ══ FILTRES GALERIE ══ */
const filterBtns  = document.querySelectorAll('.filter-btn');
const galleryCards = document.querySelectorAll('.gallery-card');

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');

    const filter = btn.dataset.filter;
    galleryCards.forEach((card) => {
      const categories = card.dataset.category ? card.dataset.category.split(' ') : [];
      if (filter === 'all' || categories.includes(filter)) {
        card.classList.remove('is-hidden');
      } else {
        card.classList.add('is-hidden');
      }
    });
  });
});

/* ══ TICKER — pause au survol ══ */
const ticker      = document.querySelector('.ticker-band');
const tickerTrack = document.querySelector('.ticker-track');

if (ticker && tickerTrack) {
  ticker.addEventListener('mouseenter', () => { tickerTrack.style.animationPlayState = 'paused'; });
  ticker.addEventListener('mouseleave', () => { tickerTrack.style.animationPlayState = 'running'; });
}

/* ══ HERO STATS — alignement sur la ligne de référence ══ */
const statsSubBloc = document.querySelector('.stats-sub-bloc');
const statsReferenceRow = statsSubBloc ? statsSubBloc.querySelector('.stats-row:not(.stats-row--logos)') : null;

function syncHeroStatsAlignment() {
  if (!statsSubBloc || !statsReferenceRow) return;

  if (window.innerWidth <= 900) {
    document.documentElement.style.removeProperty('--stats-sub-bloc-width');
    return;
  }

  const referenceWidth = Math.ceil(statsReferenceRow.getBoundingClientRect().width);
  document.documentElement.style.setProperty('--stats-sub-bloc-width', `${referenceWidth}px`);
}

syncHeroStatsAlignment();
window.addEventListener('resize', syncHeroStatsAlignment);

if (document.fonts && typeof document.fonts.ready?.then === 'function') {
  document.fonts.ready.then(syncHeroStatsAlignment);
}

/* ══ CARROUSEL — carte active ══ */
const cardWraps     = Array.from(document.querySelectorAll('.phone-card-wrap'));
const dotsContainer = document.querySelector('.cards-nav__dots');
const prevBtn       = document.querySelector('.cards-nav__arrow--prev');
const nextBtn       = document.querySelector('.cards-nav__arrow--next');

let activeIndex = 1; // Netflix (centre) actif par défaut

/* Générer les dots */
dotsContainer.innerHTML = '';
cardWraps.forEach((_, i) => {
  const dot = document.createElement('span');
  dot.className = 'cards-nav__dot' + (i === activeIndex ? ' is-active' : '');
  dotsContainer.appendChild(dot);
});

function setActive(index, autoPlay = true) {
  activeIndex = (index + cardWraps.length) % cardWraps.length;
  cardWraps.forEach((wrap, i) => {
    wrap.classList.toggle('is-active',   i === activeIndex);
    wrap.classList.toggle('is-inactive', i !== activeIndex);

    const video = wrap.querySelector('.phone-card__video');
    if (video) {
      if (i === activeIndex && autoPlay) video.play();
      else if (i !== activeIndex) video.pause();
    }
  });
  dotsContainer.querySelectorAll('.cards-nav__dot').forEach((dot, i) => {
    dot.classList.toggle('is-active', i === activeIndex);
  });
}

if (prevBtn) prevBtn.addEventListener('click', () => setActive(activeIndex - 1));
if (nextBtn) nextBtn.addEventListener('click', () => setActive(activeIndex + 1));

/* ══ VIDEO CARDS — exclusivité de lecture ══ */
const allVideoEls = document.querySelectorAll('.phone-card__video');

/* Quand une vidéo démarre, stopper toutes les autres */
allVideoEls.forEach((video) => {
  video.addEventListener('play', () => {
    allVideoEls.forEach((other) => {
      if (other !== video && !other.paused) other.pause();
    });
  });
});

/* ══ VIDEO CARDS — clic carte + bouton play/pause ══ */
cardWraps.forEach((wrap, i) => {
  const video = wrap.querySelector('.phone-card__video');
  const card  = wrap.querySelector('.phone-card');
  const btn   = wrap.querySelector('.video-toggle');
  if (!video || !card || !btn) return;

  /* Icône initiale : les vidéos sans autoplay démarrent en pause */
  if (!video.autoplay) btn.classList.add('is-paused');

  /* Clic sur la carte (hors boutons) → play/pause toggle */
  card.addEventListener('click', (e) => {
    if (!e.target.closest('.video-toggle') && !e.target.closest('.sound-toggle')) {
      if (activeIndex === i) {
        if (video.paused) video.play();
        else video.pause();
      } else {
        setActive(i, true);
      }
    }
  });

  /* Bouton play/pause */
  btn.addEventListener('click', () => {
    if (activeIndex !== i) {
      setActive(i, true);
    } else {
      if (video.paused) video.play();
      else video.pause();
    }
  });

  video.addEventListener('play',  () => btn.classList.remove('is-paused'));
  video.addEventListener('pause', () => btn.classList.add('is-paused'));
});


/* ══ VIDEO CARDS — son on / off ══ */
document.querySelectorAll('.sound-toggle').forEach((btn) => {
  const card  = btn.closest('.phone-card');
  const video = card.querySelector('.phone-card__video');
  const label = btn.querySelector('.sound-label');

  btn.addEventListener('click', () => {
    if (video.muted) {
      /* Couper toutes les autres cartes */
      allVideoEls.forEach((v) => {
        v.muted = true;
        const ob = v.closest('.phone-card').querySelector('.sound-toggle');
        const ol = ob && ob.querySelector('.sound-label');
        if (ob) ob.classList.remove('is-unmuted');
        if (ol) ol.textContent = 'Son off';
      });
      /* Activer cette carte */
      video.muted = false;
      btn.classList.add('is-unmuted');
      if (label) label.textContent = 'Son on';
    } else {
      video.muted = true;
      btn.classList.remove('is-unmuted');
      if (label) label.textContent = 'Son off';
    }
  });
});

/* ══ CONTRÔLE DE VUE — densité grille ══ */
const galleryGrid     = document.querySelector('.gallery-grid');
const galleryViewBtns = document.querySelectorAll('.gallery-view-btn');

if (galleryGrid && galleryViewBtns.length) {
  function setGridView(cols) {
    galleryGrid.classList.remove('grid-view-2', 'grid-view-3', 'grid-view-4');
    galleryGrid.classList.add('grid-view-' + cols);
    galleryViewBtns.forEach((b) => {
      const active = b.dataset.cols === String(cols);
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', String(active));
    });
  }

  setGridView(2);

  galleryViewBtns.forEach((btn) => {
    btn.addEventListener('click', () => setGridView(btn.dataset.cols));
  });
}

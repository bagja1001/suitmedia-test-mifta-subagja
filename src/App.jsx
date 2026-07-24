import React, { useCallback, useEffect, useRef, useState } from 'react';

// ─── constants ────────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: '-published_at', label: 'Newest' },
  { value: 'published_at', label: 'Oldest' },
];

const PER_PAGE_OPTIONS = [10, 20, 50];

const NAV_ITEMS = [
  { label: 'Work',     href: '#' },
  { label: 'About',   href: '#' },
  { label: 'Services',href: '#' },
  { label: 'Ideas',   href: '#', key: 'ideas' },
  { label: 'Careers', href: '#' },
  { label: 'Contact', href: '#' },
];

const BANNER_IMAGE = '/banner-doodle.png';
// Two alternating fallback images for cards (like the reference photo)
const CARD_IMAGES = ['/card-1.png', '/card-2.png'];

// ─── helpers ──────────────────────────────────────────────────────────────────
function getUrlParams() {
  const p = new URLSearchParams(window.location.search);
  return {
    page:    Math.max(1, parseInt(p.get('page') || '1', 10)),
    perPage: PER_PAGE_OPTIONS.includes(Number(p.get('perPage'))) ? Number(p.get('perPage')) : 10,
    sort:    p.get('sort') === 'published_at' ? 'published_at' : '-published_at',
  };
}

function setUrlParams(page, perPage, sort) {
  const u = new URL(window.location.href);
  u.searchParams.set('page', page);
  u.searchParams.set('perPage', perPage);
  u.searchParams.set('sort', sort);
  window.history.replaceState({}, '', u.toString());
}

const API_BASE_URL = 'https://suitmedia-backend.suitdev.com';

function buildApiUrl(page, perPage, sort) {
  return `${API_BASE_URL}/api/ideas?page[number]=${page}&page[size]=${perPage}&append[]=small_image&append[]=medium_image&sort=${sort}`;
}

function formatDate(str) {
  if (!str) return '';
  return new Date(str)
    .toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    .toUpperCase();
}

// ─── Pagination pages builder ─────────────────────────────────────────────────
// Shows 5 consecutive page numbers: 1 2 3 4 5
function buildPageList(current, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  let start = Math.max(1, current - 2);
  let end = start + 4;
  if (end > total) {
    end = total;
    start = Math.max(1, end - 4);
  }
  const pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
}

// ─── IdeaCard ─────────────────────────────────────────────────────────────────
// index prop used to alternate between card-1.png and card-2.png as fallback
function IdeaCard({ item, index }) {
  const localFallback = CARD_IMAGES[index % 2]; // alternates: 0→card-1, 1→card-2

  const getApiImage = () => {
    const small  = Array.isArray(item.small_image)  ? item.small_image[0]?.url  : item.small_image?.url;
    const medium = Array.isArray(item.medium_image) ? item.medium_image[0]?.url : item.medium_image?.url;
    return small || medium || null;
  };

  const [imgSrc, setImgSrc] = useState(getApiImage() || localFallback);
  const [failed, setFailed] = useState(false);

  const handleError = () => {
    if (!failed) {
      setFailed(true);
      setImgSrc(localFallback); // fallback to alternating local image
    }
  };

  return (
    <article className="card">
      <div className="card__img-wrap">
        <img
          className="card__img"
          src={imgSrc}
          alt={item.title || 'Idea'}
          loading="lazy"
          onError={handleError}
        />
      </div>
      <div className="card__body">
        <time className="card__date" dateTime={item.published_at}>
          {formatDate(item.published_at)}
        </time>
        <h2 className="card__title">{item.title}</h2>
      </div>
    </article>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  const pages = buildPageList(page, totalPages);

  return (
    <nav className="pagination" aria-label="Page navigation">
      <button className="pag__nav" onClick={() => onPage(1)}           disabled={page === 1}           aria-label="First page">«</button>
      <button className="pag__nav" onClick={() => onPage(page - 1)}    disabled={page === 1}           aria-label="Previous page">‹</button>

      {pages.map((p, idx) =>
        p === '...'
          ? <span key={`e${idx}`} className="pag__ellipsis">…</span>
          : <button
              key={p}
              className={`pag__page${p === page ? ' pag__page--active' : ''}`}
              onClick={() => onPage(p)}
              aria-current={p === page ? 'page' : undefined}
            >{p}</button>
      )}

      <button className="pag__nav" onClick={() => onPage(page + 1)}    disabled={page === totalPages} aria-label="Next page">›</button>
      <button className="pag__nav" onClick={() => onPage(totalPages)}   disabled={page === totalPages} aria-label="Last page">»</button>
    </nav>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const init = getUrlParams();

  const [page,       setPage]       = useState(init.page);
  const [perPage,    setPerPage]    = useState(init.perPage);
  const [sort,       setSort]       = useState(init.sort);
  const [posts,      setPosts]      = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [scrollY,    setScrollY]    = useState(0);
  const [headerVis,  setHeaderVis]  = useState(true);
  const [menuOpen,   setMenuOpen]   = useState(false);

  const lastScrollRef = useRef(0);
  const bannerRef     = useRef(null);

  // ── scroll ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrollY(y);
      setHeaderVis(y <= lastScrollRef.current || y <= 80);
      lastScrollRef.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setUrlParams(page, perPage, sort);
    fetch(buildApiUrl(page, perPage, sort), {
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(json => {
        setPosts(json.data || []);
        const meta = json.meta || {};
        const total    = meta.total    || 0;
        const lastPage = meta.last_page || Math.ceil(total / perPage) || 1;
        setTotalItems(total);
        setTotalPages(lastPage);
      })
      .catch(err => { console.error(err); setPosts([]); setTotalItems(0); setTotalPages(1); })
      .finally(() => setLoading(false));
  }, [page, perPage, sort]);

  // ── parallax ──────────────────────────────────────────────────────────────
  const bannerH     = bannerRef.current?.offsetHeight || 440;
  const parallaxImg = Math.min(scrollY * 0.3, 100);
  const parallaxTxt = Math.min(scrollY * 0.15, 50);

  // ── item range ────────────────────────────────────────────────────────────
  const firstItem = totalItems === 0 ? 0 : (page - 1) * perPage + 1;
  const lastItem  = Math.min(page * perPage, totalItems);

  const onPageChange = useCallback(p => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="site">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className={`header${scrollY > 0 ? ' header--scrolled' : ''}${headerVis ? '' : ' header--hidden'}`}>
        <div className="header__inner">

          {/* Logo */}
          <a href="#" className="brand" aria-label="Suitmedia">
            <img
              src="/suitmedia-logo.png"
              alt="Suitmedia"
              className="brand__img"
              onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
            />
            {/* SVG fallback logo */}
            <span className="brand__svg" style={{ display:'none' }}>
              <svg viewBox="0 0 36 36" width="36" height="36" aria-hidden="true">
                <circle cx="18" cy="18" r="18" fill="#fff"/>
                <path d="M10 22 Q14 12 18 16 Q22 20 26 10" stroke="#FF6700" strokeWidth="3.2" fill="none" strokeLinecap="round"/>
                <path d="M10 26 Q15 18 19 21 Q23 24 27 16" stroke="#FF6700" strokeWidth="2" fill="none" strokeLinecap="round" opacity=".6"/>
              </svg>
              <span className="brand__text">suitmedia</span>
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="nav" aria-label="Main navigation">
            {NAV_ITEMS.map(item => (
              <a key={item.label} href={item.href}
                className={`nav__link${item.key === 'ideas' ? ' nav__link--active' : ''}`}>
                {item.label}
              </a>
            ))}
          </nav>

          {/* Hamburger (mobile) */}
          <button className="hamburger" onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu" aria-expanded={menuOpen}>
            <span className={`hamburger__line${menuOpen ? ' hamburger__line--open' : ''}`}/>
            <span className={`hamburger__line${menuOpen ? ' hamburger__line--open' : ''}`}/>
            <span className={`hamburger__line${menuOpen ? ' hamburger__line--open' : ''}`}/>
          </button>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {NAV_ITEMS.map(item => (
              <a key={item.label} href={item.href}
                className={`mobile-nav__link${item.key === 'ideas' ? ' mobile-nav__link--active' : ''}`}
                onClick={() => setMenuOpen(false)}>
                {item.label}
              </a>
            ))}
          </nav>
        )}
      </header>

      {/* ── Banner ────────────────────────────────────────────────────────── */}
      <section className="banner" ref={bannerRef} aria-label="Ideas banner">
        <div className="banner__bg" style={{ transform:`translateY(${parallaxImg}px)` }}>
          <img className="banner__img" src={BANNER_IMAGE} alt="" aria-hidden="true"/>
          <div className="banner__overlay"/>
        </div>
        <div className="banner__content" style={{ transform:`translateY(${parallaxTxt}px)` }}>
          <h1 className="banner__title">Ideas</h1>
          <p  className="banner__sub">Where all our great things begin</p>
        </div>
        <div className="banner__slant"/>
      </section>

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <main className="main" id="main-content">

        {/* Controls */}
        <div className="controls">
          <p className="controls__count" aria-live="polite">
            {loading ? 'Loading…' : `Showing ${firstItem} - ${lastItem} of ${totalItems}`}
          </p>

          <div className="controls__right">
            {/* Show per page */}
            <div className="controls__group">
              <span className="controls__label">Show per page:</span>
              <div className="controls__select-wrap">
                <select
                  className="controls__select"
                  id="per-page-select"
                  value={perPage}
                  onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
                  aria-label="Items per page"
                >
                  {PER_PAGE_OPTIONS.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <span className="controls__arrow">▼</span>
              </div>
            </div>

            {/* Sort by */}
            <div className="controls__group">
              <span className="controls__label">Sort by:</span>
              <div className="controls__select-wrap">
                <select
                  className="controls__select"
                  id="sort-select"
                  value={sort}
                  onChange={e => { setSort(e.target.value); setPage(1); }}
                  aria-label="Sort order"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <span className="controls__arrow">▼</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="loading" role="status">
            <div className="loading__spinner"/>
            <p>Loading ideas…</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="empty"><p>No ideas found.</p></div>
        ) : (
          <div className="grid">
            {posts.map((item, idx) => <IdeaCard key={item.id} item={item} index={idx}/>)}
          </div>
        )}

        {/* Pagination */}
        <Pagination page={page} totalPages={totalPages} onPage={onPageChange}/>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} Suitmedia. All rights reserved.</p>
      </footer>
    </div>
  );
}

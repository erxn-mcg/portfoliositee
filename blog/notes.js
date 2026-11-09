'use strict';
(() => {
  const board = document.querySelector('.board');
  const result = document.querySelector('.result');
  const search = document.querySelector('#search');
  let notes = [];
  let topic = 'All';
  document.querySelector('#year').textContent = new Date().getFullYear();

  function node(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  // Only repository-owned uploads are rendered; content is always plain text.
  function mediaPath(value, extension) {
    if (typeof value !== 'string' || !value.startsWith('/uploads/notes/')) return null;
    const url = new URL(value, location.origin);
    if (url.origin !== location.origin || !url.pathname.startsWith('/uploads/notes/')) return null;
    if (!extension.test(url.pathname) || url.search || url.hash) return null;
    // Relative resolution also lets the prepared site run below /site/ locally.
    return new URL('..' + url.pathname, location.href).href;
  }

  function formatDate(date) {
    return new Intl.DateTimeFormat('en-GB', {day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));
  }

  function empty(title, description) {
    const el = node('div', 'empty-state');
    el.append(node('h2', '', title), node('p', '', description));
    board.replaceChildren(el);
  }

  function renderBoard() {
    board.replaceChildren();
    const query = search.value.trim().toLocaleLowerCase();
    const visible = notes.filter(n => (topic === 'All' || n.topic === topic) &&
      [n.title,n.excerpt,n.body,n.topic].join(' ').toLocaleLowerCase().includes(query));
    result.textContent = visible.length + (visible.length === 1 ? ' piece' : ' pieces') + (topic === 'All' ? '' : ' in ' + topic);
    document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === topic)));
    if (!notes.length) { empty('A space for new thoughts.', 'The first note will be pinned here soon. In the meantime, there’s more to read on Substack.'); return; }
    if (!visible.length) { empty('A different thread?', 'No notes match this search. Try another topic or a shorter search.'); return; }
    visible.forEach(n => {
      const card = node('article','card');
      const pin = node('span','pin'); pin.setAttribute('aria-hidden','true');
      card.append(pin);
      const imageURL = mediaPath(n.image, /\.(?:jpe?g|png|webp|gif)$/i);
      if (imageURL) { const image = node('img','card-cover'); image.src = imageURL; image.alt = n.imageAlt || ''; image.loading = 'lazy'; card.append(image); }
      card.append(node('span','topic',n.topic), node('h2','',n.title), node('p','',n.excerpt));
      const bottom = node('div','card-bottom');
      const minutes = Math.max(1, Math.ceil((n.body || '').trim().split(/\s+/).filter(Boolean).length / 200));
      bottom.append(node('span','card-meta',(n.kind || 'Note').toUpperCase()+' · '+minutes+' MIN\n'+formatDate(n.date)));
      const link = node('a','read','↗'); link.href = '?note='+encodeURIComponent(n.slug); link.setAttribute('aria-label','Read '+n.title); bottom.append(link);
      card.append(bottom); board.append(card);
    });
  }

  function route() {
    const slug = new URLSearchParams(location.search).get('note');
    const article = document.querySelector('#reading');
    const pinboard = document.querySelector('#pinboard');
    if (!slug) { pinboard.hidden = false; article.hidden = true; return; }
    const n = notes.find(n => n.slug === slug);
    pinboard.hidden = true; article.hidden = false;
    if (!n) {
      document.querySelector('#reading-title').textContent = 'This note isn’t here.';
      document.querySelector('#reading-excerpt').textContent = 'It may have moved. Head back to the Pinboard to find another thought.';
      return;
    }
    document.title = n.title + ' · Erin Meryl McGurk';
    document.querySelector('#reading-title').textContent = n.title;
    document.querySelector('#reading-meta').textContent = n.topic+' / '+(n.kind || 'Note')+' / '+formatDate(n.date);
    document.querySelector('#reading-excerpt').textContent = n.excerpt;
    document.querySelector('#reading-body').textContent = n.body || '';
    const imageURL = mediaPath(n.image, /\.(?:jpe?g|png|webp|gif)$/i);
    const img = document.querySelector('#reading-image');
    img.hidden = !imageURL;
    if (imageURL) { img.src = imageURL; img.alt = n.imageAlt || ''; }
  }

  async function load() {
    try {
      const response = await fetch('notes.json', {cache:'no-cache'});
      if (!response.ok) throw new Error('Unable to load notes');
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Invalid notes file');
      const slugs = new Set();
      notes = data.filter(n => {
        if (!n || typeof n !== 'object' || typeof n.title !== 'string' || !n.title.trim() || typeof n.topic !== 'string' || !n.topic.trim() ||
          typeof n.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(n.slug) || slugs.has(n.slug) ||
          typeof n.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(n.date) || !Number.isFinite(Date.parse(n.date)) ||
          typeof n.excerpt !== 'string' ||
          ['body','kind','image','imageAlt'].some(key => n[key] != null && typeof n[key] !== 'string')) return false;
        if (new Date(n.date).toISOString().slice(0,10) !== n.date) return false;
        slugs.add(n.slug); return true;
      }).sort((a,b) => b.date.localeCompare(a.date));
      const filters = document.querySelector('.filters');
      for (const name of ['All',...new Set(notes.map(n => n.topic).filter(t => t !== 'All'))]) {
        const button = node('button','chip',name); button.type = 'button'; button.dataset.filter = name;
        button.addEventListener('click', () => { topic = name; renderBoard(); }); filters.append(button);
      }
      renderBoard(); route();
    } catch {
      result.textContent = '';
      empty('The board is taking a moment.', 'Please refresh to try again, or visit my writing on Substack below.');
    }
  }
  search.addEventListener('input', renderBoard);
  load();
})();

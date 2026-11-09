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

  const siteRoot = new URL('../', location.href);
  function localURL(value, directory) {
    if (typeof value !== 'string' || !value) return null;
    const url = new URL(value, siteRoot);
    if (url.origin !== location.origin || !url.pathname.startsWith(siteRoot.pathname + directory) || url.search || url.hash) return null;
    return url;
  }
  function mediaPath(value, extension) {
    const url = localURL(value, 'images/notes/');
    return url && extension.test(url.pathname) ? url.href : null;
  }
  function notePath(value) {
    const url = localURL(value, 'blog/');
    if (!url) return null;
    const filename = url.pathname.slice((siteRoot.pathname + 'blog/').length);
    return /^[a-z0-9]+(?:-[a-z0-9]+)*\/$/.test(filename) ? url.href : null;
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
      const link = node('a','read','↗'); link.href = notePath(n.url); link.setAttribute('aria-label','Read '+n.title); bottom.append(link);
      card.append(bottom); board.append(card);
    });
  }

  async function load() {
    try {
      const response = await fetch('notes.json', {cache:'no-cache'});
      if (!response.ok) throw new Error('Unable to load notes');
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Invalid notes file');
      const urls = new Set();
      notes = data.filter(n => {
        if (!n || typeof n !== 'object' || typeof n.title !== 'string' || !n.title.trim() || typeof n.topic !== 'string' || !n.topic.trim() ||
          !notePath(n.url) || urls.has(n.url) ||
          typeof n.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(n.date) || !Number.isFinite(Date.parse(n.date)) ||
          typeof n.excerpt !== 'string' ||
          ['body','kind','image','imageAlt'].some(key => n[key] != null && typeof n[key] !== 'string')) return false;
        if (new Date(n.date).toISOString().slice(0,10) !== n.date) return false;
        urls.add(n.url); return true;
      }).sort((a,b) => b.date.localeCompare(a.date));
      const filters = document.querySelector('.filters');
      for (const name of ['All',...new Set(notes.map(n => n.topic).filter(t => t !== 'All'))]) {
        const button = node('button','chip',name); button.type = 'button'; button.dataset.filter = name;
        button.addEventListener('click', () => { topic = name; renderBoard(); }); filters.append(button);
      }
      renderBoard();
    } catch {
      result.textContent = '';
      empty('The board is taking a moment.', 'Please refresh to try again, or visit my writing on Substack below.');
    }
  }
  search.addEventListener('input', renderBoard);
  load();
})();

(function () {
  'use strict';
  var groups = null;
  var available = [];
  var loadPromise = null;
  var query = '';
  var currentGroup = null;
  var modalBody = document.getElementById('modal-body');
  var docIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg>';
  var chevron = '<svg class="docs-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>';
  var backIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 5-7 7 7 7M3 12h18"/></svg>';
  function esc(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function(c) {return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function normalize(value) { return String(value).toLocaleLowerCase('ru').replace(/ё/g, 'е').trim(); }
  function categoryIcon(group) {
    var category = document.querySelector('#categories [data-category="' + group.category + '"]');
    var picture = category && category.querySelector('img');
    return picture ? '<img src="' + esc(picture.getAttribute('src')) + '" alt="">' : docIcon;
  }
  function frame(body) { return '<div class="docs-root">' + body + '</div>'; }
  function openView(title, body) {
    window.KMZDocumentUI.open('documents', title, frame(body), '', 'КМЗ №1 · Документы');
    modalBody.scrollTop = 0;
  }
  function dateKey(value) {
    var parts = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value || '');
    return parts ? parts[3] + '-' + parts[2] + '-' + parts[1] : '';
  }
  function refreshAvailable() {
    var today = new Date(Date.now() + 3 * 3600000).toISOString().slice(0, 10);
    available = groups.map(function(group) {
      var documents = group.documents.filter(function(doc) {
        var start = dateKey(doc.validFrom), end = dateKey(doc.validUntil);
        return start && start <= today && today <= end && safeFile(doc.file);
      });
      return Object.assign({}, group, {documents:documents});
    }).filter(function(group) {return group.documents.length > 0;});
  }
  function listMarkup() {
    return available.map(function(group) {
      return '<button type="button" class="docs-group" data-docs-group="' + esc(group.id) + '" aria-label="' + esc(group.title) + '">' +
        '<span class="docs-group-icon">' + categoryIcon(group) + '</span><span class="docs-group-copy"><strong>' + esc(group.title) +
        '</strong><small>' + esc(group.description) + '</small></span>' + chevron + '</button>';
    }).join('');
  }
  function filterGroups() {
    var term = normalize(query), visible = 0;
    modalBody.querySelectorAll('[data-docs-group]').forEach(function(button) {
      var group = available.find(function(g) { return g.id === button.dataset.docsGroup; });
      var searchable = normalize([group.title, group.description].concat(group.documents.map(function(doc) {
        return [doc.title, doc.products, doc.manufacturer, doc.number].join(' ');
      })).join(' '));
      button.hidden = term.split(/\s+/).some(function(word) {return searchable.indexOf(word) === -1;});
      if (!button.hidden) visible++;
    });
    document.getElementById('docs-no-results').hidden = visible > 0;
  }
  function openList(restoreFocus) {
    refreshAvailable();
    currentGroup = null;
    openView('Документы на продукцию', '<p class="docs-intro">Декларации соответствия по видам продукции.</p>' +
      '<label class="docs-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>' +
      '<input id="docs-search" type="search" placeholder="Товар, производитель или номер декларации" aria-label="Поиск документов по продукции" value="' + esc(query) + '"></label>' +
      '<div class="docs-grid">' + listMarkup() + '</div><p class="docs-no-results" id="docs-no-results" role="status" hidden>Декларации по этому запросу не найдены.</p>');
    filterGroups();
    if (restoreFocus) {
      var button = Array.from(modalBody.querySelectorAll('[data-docs-group]')).find(function(b) {return b.dataset.docsGroup === restoreFocus;});
      if (button) button.focus({preventScroll:true});
    }
  }
  function safeFile(value) {
    if (typeof value !== 'string' || !value) return null;
    try {
      var url = new URL(value, location.href);
      return url.origin === location.origin && /\.pdf$/i.test(url.pathname) ? url.href : null;
    } catch(e) { return null; }
  }
  function fileMarkup(doc) {
    var file = safeFile(doc.file);
    if (!file) return '';
    return '<article class="docs-file"><h3>' + esc(doc.title) + '</h3>' +
      (doc.products ? '<p>' + esc(doc.products) + '</p>' : '') +
      (doc.manufacturer ? '<p>Производитель: ' + esc(doc.manufacturer) + '</p>' : '') +
      (doc.number ? '<p>Декларация: ' + esc(doc.number) + '</p>' : '') +
      (doc.validUntil ? '<p>Действует по ' + esc(doc.validUntil) + '</p>' : '') +
      '<div class="docs-file-actions"><a href="' + esc(file) + '" target="_blank" rel="noopener">Открыть PDF</a>' +
      '<a href="' + esc(file) + '" download>Скачать PDF</a></div></article>';
  }
  function openGroup(id) {
    refreshAvailable();
    var group = available.find(function(g) { return g.id === id; });
    if (!group) {openList();return;}
    currentGroup = id;
    var documents = (group.documents || []).map(fileMarkup).join('');
    openView(group.title, '<button type="button" class="docs-back" data-docs-back>' + backIcon + 'Все категории</button>' +
      documents);
  }
  function loadGroups() {
    if (groups) return Promise.resolve();
    if (!loadPromise) loadPromise = fetch('./документы.json', {cache:'no-store'}).then(function(response) {
      if (!response.ok) throw new Error('DOCUMENTS_UNAVAILABLE');
      return response.json();
    }).then(function(data) {
      if (!data || !Array.isArray(data.groups)) throw new Error('DOCUMENTS_INVALID');
      groups = data.groups;
    }).catch(function(error) {loadPromise = null;throw error;});
    return loadPromise;
  }
  function openDocuments() {
    var drawer = document.getElementById('drawer');
    if (drawer && !drawer.hidden) document.getElementById('drawer-close').click();
    query = '';
    if (groups) {openList();return;}
    openView('Документы на продукцию', '<p role="status">Открываем разделы…</p>');
    loadGroups().then(function() {
      if (!document.getElementById('modal-overlay').hidden && modalBody.querySelector('.docs-root')) openList();
    }).catch(function() {
      if (!document.getElementById('modal-overlay').hidden && modalBody.querySelector('.docs-root')) openView('Документы на продукцию', '<div class="docs-empty"><h3>Не удалось открыть документы</h3><p>Попробуйте ещё раз.</p><button type="button" class="docs-back" data-docs-open>Повторить</button></div>');
    });
  }
  document.addEventListener('click', function(event) {
    var target = event.target.closest && event.target.closest('[data-docs-open],[data-docs-group],[data-docs-back]');
    if (!target) return;
    if (target.hasAttribute('data-docs-open')) openDocuments();
    else if (target.hasAttribute('data-docs-group')) openGroup(target.dataset.docsGroup);
    else openList(currentGroup);
  });
  document.addEventListener('input', function(event) {
    if (event.target.id === 'docs-search') {query = event.target.value;filterGroups();}
  });
})();

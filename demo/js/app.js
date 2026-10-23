/*
 * 카드뉴스 메이커 데모: 화면 동작(카드 목록, 편집 폼, 설정, 내보내기).
 * 작업 내용은 서버가 아니라 이 브라우저(localStorage)에만 임시 저장됩니다.
 */
(function () {
  var STORAGE_KEY = 'cardnews-demo-v1';
  var R = window.CardRender;

  var TYPE_LABEL = { text: '텍스트', expression: '표현', subscribe: '구독 유도' };

  var BG_OPTIONS = [
    ['solid', '단색'], ['gradient', '그라데이션'], ['dots', '도트 패턴'],
    ['grid', '격자 패턴'], ['rings', '원형 라인 그래픽'], ['blobs', '빛번짐 그래픽']
  ];

  var BG_FIELDS = [
    { key: 'bgKind', label: '배경', type: 'select', options: BG_OPTIONS, rerender: true },
    { key: 'color1', label: '배경색', type: 'color', half: true },
    { key: 'color2', label: '보조색', type: 'color', half: true, showIf: function (c) { return c.bgKind !== 'solid' && c.bgKind !== 'image'; } },
    { key: 'textColor', label: '글자색', type: 'color', half: true }
  ];

  var FIELDS = {
    text: [
      { key: 'variant', label: '카드 형태', type: 'select', options: [['cover', '표지 (제목 크게)'], ['body', '본문']], rerender: true },
      { key: 'kicker', label: '머리말', type: 'text' },
      { key: 'title', label: '제목', type: 'textarea', rows: 2 },
      { key: 'body', label: '본문', type: 'textarea', rows: 5 },
      { key: 'source', label: '출처 (작게 표시)', type: 'text' },
      { key: 'align', label: '정렬', type: 'select', options: [['left', '왼쪽'], ['center', '가운데']] },
      { key: 'bgKind', label: '배경', type: 'select', options: BG_OPTIONS.concat([['image', '내 이미지 업로드']]), rerender: true },
      { key: 'image', label: '배경 이미지', type: 'image', showIf: function (c) { return c.bgKind === 'image'; } },
      { key: 'overlay', label: '이미지 어둡게', type: 'range', min: 0, max: 80, showIf: function (c) { return c.bgKind === 'image'; } }
    ].concat(BG_FIELDS.slice(1)),
    expression: [
      { key: 'label', label: '라벨', type: 'text' },
      { key: 'expression', label: '영어 표현', type: 'text' },
      { key: 'meaning', label: '뜻', type: 'text' },
      { key: 'example', label: '예문 (영어)', type: 'textarea', rows: 2 },
      { key: 'exampleKo', label: '예문 해석', type: 'textarea', rows: 2 },
      { key: 'note', label: '팁 (비워두면 숨김)', type: 'textarea', rows: 2 }
    ].concat(BG_FIELDS),
    subscribe: [
      { key: 'label', label: '라벨', type: 'text' },
      { key: 'title', label: '구독 유도 문구', type: 'textarea', rows: 2 },
      { key: 'body', label: '설명', type: 'textarea', rows: 3 },
      { key: 'cta', label: '버튼 문구', type: 'text' }
    ].concat(BG_FIELDS)
  };

  var SETTINGS_FIELDS = [
    { key: 'titleFont', label: '제목 글씨체', type: 'select', options: fontOptions(['pretendard', 'gowun', 'blackhan']) },
    { key: 'bodyFont', label: '본문 글씨체', type: 'select', options: fontOptions(['pretendard', 'gowun']) },
    { key: 'ratio', label: '카드 비율', type: 'select', options: [['4:5', '4:5 세로형 (1080×1350)'], ['1:1', '1:1 정사각형 (1080×1080)']] },
    { key: 'accent', label: '포인트 색', type: 'color', half: true },
    { key: 'brand', label: '계정 이름', type: 'text', half: true },
    { key: 'pageNumbers', label: '페이지 번호 표시', type: 'checkbox' }
  ];

  function fontOptions(keys) {
    return keys.map(function (k) { return [k, R.FONTS[k].label]; });
  }

  // ---------- 상태 ----------
  var state = load();
  var selected = 0;

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function withIds(s) {
    s.cards.forEach(function (c) { if (!c.id) c.id = uid(); });
    return s;
  }

  function uid() { return 'c' + Math.random().toString(36).slice(2, 9); }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var s = JSON.parse(raw);
        if (s && Array.isArray(s.cards) && s.settings) return withIds(s);
      }
    } catch (e) { /* 저장소를 쓸 수 없으면 예시로 시작 */ }
    return withIds(clone(window.SAMPLE_STATE));
  }

  var saveTimer = null;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
      catch (e) { toast('브라우저 저장 공간이 부족해서 임시 저장을 못 했어요. 편집과 내보내기는 계속 할 수 있어요.'); }
    }, 300);
  }

  // ---------- 이미지 캐시 ----------
  var imageCache = {};
  function getImage(src) {
    if (!imageCache[src]) {
      var img = new Image();
      img.onload = function () { renderAll(); };
      img.src = src;
      imageCache[src] = img;
    }
    return imageCache[src];
  }

  // ---------- 그리기 ----------
  var preview = document.getElementById('preview');
  var scratch = document.createElement('canvas');

  function renderTo(canvas, i) {
    R.renderCard(canvas, state.cards[i], state.settings, i, state.cards.length, getImage);
  }

  function renderThumb(i) {
    var thumb = document.querySelector('[data-thumb="' + state.cards[i].id + '"]');
    if (!thumb) return;
    renderTo(scratch, i);
    var ctx = thumb.getContext('2d');
    thumb.width = 108;
    thumb.height = Math.round(108 * scratch.height / scratch.width);
    ctx.drawImage(scratch, 0, 0, thumb.width, thumb.height);
  }

  var frame = null;
  function renderCurrent() {
    if (frame) return;
    frame = requestAnimationFrame(function () {
      frame = null;
      renderTo(preview, selected);
      renderThumb(selected);
    });
  }

  function renderAll() {
    renderTo(preview, selected);
    state.cards.forEach(function (_, i) { renderThumb(i); });
  }

  // ---------- 카드 목록 ----------
  var list = document.getElementById('cardList');

  function buildList() {
    list.innerHTML = '';
    state.cards.forEach(function (card, i) {
      var li = document.createElement('li');
      li.className = 'card-item' + (i === selected ? ' is-active' : '');

      var pick = document.createElement('button');
      pick.type = 'button';
      pick.className = 'card-pick';
      pick.setAttribute('aria-label', (i + 1) + '번 카드 편집');
      var thumb = document.createElement('canvas');
      thumb.setAttribute('data-thumb', card.id);
      var meta = document.createElement('span');
      meta.className = 'card-meta';
      var type = document.createElement('span');
      type.className = 'card-type';
      type.textContent = (i + 1) + '. ' + TYPE_LABEL[card.type];
      var title = document.createElement('span');
      title.className = 'card-title';
      title.textContent = (card.expression || card.title || '').replace(/\n/g, ' ');
      meta.appendChild(type); meta.appendChild(title);
      pick.appendChild(thumb); pick.appendChild(meta);
      pick.addEventListener('click', function () { select(i); });

      var tools = document.createElement('span');
      tools.className = 'card-tools';
      [['↑', '위로', function () { move(i, -1); }, i === 0],
       ['↓', '아래로', function () { move(i, 1); }, i === state.cards.length - 1],
       ['⧉', '복제', function () { duplicate(i); }, false],
       ['✕', '삭제', function () { remove(i); }, state.cards.length === 1]].forEach(function (t) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'icon-btn';
        b.textContent = t[0];
        b.title = t[1];
        b.setAttribute('aria-label', (i + 1) + '번 카드 ' + t[1]);
        b.disabled = t[3];
        b.addEventListener('click', t[2]);
        tools.appendChild(b);
      });

      li.appendChild(pick);
      li.appendChild(tools);
      list.appendChild(li);
    });
    state.cards.forEach(function (_, i) { renderThumb(i); });
  }

  function select(i) {
    selected = i;
    buildList();
    buildEditor();
    renderTo(preview, selected);
  }

  function move(i, d) {
    var j = i + d;
    var c = state.cards.splice(i, 1)[0];
    state.cards.splice(j, 0, c);
    if (selected === i) selected = j; else if (selected === j) selected = i;
    changed(true);
  }

  function duplicate(i) {
    var c = clone(state.cards[i]);
    c.id = uid();
    state.cards.splice(i + 1, 0, c);
    selected = i + 1;
    changed(true);
  }

  function remove(i) {
    if (!confirm((i + 1) + '번 카드를 삭제할까요?')) return;
    state.cards.splice(i, 1);
    selected = Math.min(selected, state.cards.length - 1);
    changed(true);
  }

  function addCard(type) {
    var c = clone(window.CARD_DEFAULTS[type]);
    c.id = uid();
    state.cards.splice(selected + 1, 0, c);
    selected += 1;
    changed(true);
  }

  // 목록 구조가 바뀌면 목록·폼·미리보기를 모두 다시 그립니다.
  function changed(structural) {
    save();
    if (structural) { buildList(); buildEditor(); renderAll(); }
    else renderCurrent();
  }

  // ---------- 폼 ----------
  var editor = document.getElementById('editor');
  var settingsForm = document.getElementById('settings');

  function buildForm(form, fields, target, onChange) {
    form.innerHTML = '';
    fields.forEach(function (f) {
      if (f.showIf && !f.showIf(target)) return;
      var id = form.id + '-' + f.key;
      var wrapEl = document.createElement('div');
      wrapEl.className = 'field' + (f.half ? ' half' : '') + (f.type === 'checkbox' ? ' check' : '');
      var label = document.createElement('label');
      label.htmlFor = id;
      label.textContent = f.label;
      var input;

      if (f.type === 'textarea') {
        input = document.createElement('textarea');
        input.rows = f.rows || 3;
      } else if (f.type === 'select') {
        input = document.createElement('select');
        f.options.forEach(function (o) {
          var opt = document.createElement('option');
          opt.value = o[0]; opt.textContent = o[1];
          input.appendChild(opt);
        });
      } else if (f.type === 'image') {
        buildImageField(wrapEl, label, id, target, onChange);
        form.appendChild(wrapEl);
        return;
      } else {
        input = document.createElement('input');
        input.type = f.type === 'range' ? 'range' : f.type === 'color' ? 'color' : f.type === 'checkbox' ? 'checkbox' : 'text';
        if (f.type === 'range') { input.min = f.min; input.max = f.max; }
      }
      input.id = id;
      if (f.type === 'checkbox') input.checked = !!target[f.key];
      else input.value = target[f.key] == null ? '' : target[f.key];

      var evt = f.type === 'select' || f.type === 'checkbox' ? 'change' : 'input';
      input.addEventListener(evt, function () {
        target[f.key] = f.type === 'checkbox' ? input.checked : f.type === 'range' ? Number(input.value) : input.value;
        onChange(f);
      });

      if (f.type === 'checkbox') { wrapEl.appendChild(input); wrapEl.appendChild(label); }
      else { wrapEl.appendChild(label); wrapEl.appendChild(input); }
      form.appendChild(wrapEl);
    });
  }

  function buildImageField(wrapEl, label, id, card, onChange) {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.id = id;
    var note = document.createElement('p');
    note.className = 'field-note';
    note.textContent = '이미지는 서버로 올라가지 않고 이 브라우저 안에서만 쓰여요.';
    input.addEventListener('change', function () {
      var file = input.files && input.files[0];
      if (!file) return;
      shrinkImage(file, 1600, function (dataUrl) {
        card.image = dataUrl;
        onChange({ key: 'image', rerender: true });
      });
    });
    wrapEl.appendChild(label);
    wrapEl.appendChild(input);
    if (card.image) {
      var clear = document.createElement('button');
      clear.type = 'button';
      clear.className = 'link-btn';
      clear.textContent = '이미지 지우기';
      clear.addEventListener('click', function () { card.image = null; onChange({ key: 'image', rerender: true }); });
      wrapEl.appendChild(clear);
    }
    wrapEl.appendChild(note);
  }

  // 큰 사진은 브라우저 저장 공간에 들어가도록 줄여서 보관합니다.
  function shrinkImage(file, maxSide, done) {
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var s = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
        var c = document.createElement('canvas');
        c.width = Math.round(img.naturalWidth * s);
        c.height = Math.round(img.naturalHeight * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        done(c.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = function () { toast('이미지를 읽지 못했어요. 다른 파일로 시도해 주세요.'); };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function buildEditor() {
    var card = state.cards[selected];
    buildForm(editor, FIELDS[card.type], card, function (f) {
      if (f.rerender) buildEditor();
      if (f.key === 'title' || f.key === 'expression') updateListTitle();
      changed(false);
    });
    document.getElementById('editorType').textContent = (selected + 1) + '번 · ' + TYPE_LABEL[card.type] + ' 카드';
  }

  function updateListTitle() {
    var card = state.cards[selected];
    var el = list.children[selected] && list.children[selected].querySelector('.card-title');
    if (el) el.textContent = (card.expression || card.title || '').replace(/\n/g, ' ');
  }

  function buildSettings() {
    buildForm(settingsForm, SETTINGS_FIELDS, state.settings, function () {
      save();
      renderAll();
    });
  }

  // ---------- 내보내기 ----------
  function cardToBlob(i) {
    return new Promise(function (resolve, reject) {
      var c = document.createElement('canvas');
      renderTo(c, i);
      c.toBlob(function (b) { b ? resolve(b) : reject(new Error('PNG 변환 실패')); }, 'image/png');
    });
  }

  function fileName(i) {
    var n = String(i + 1).padStart(2, '0');
    return 'cardnews-' + n + '-' + state.cards[i].type + '.png';
  }

  function download(blob, name) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  function exportOne() {
    cardToBlob(selected).then(function (b) {
      download(b, fileName(selected));
      toast((selected + 1) + '번 카드를 PNG로 저장했어요.');
    }).catch(function () { toast('내보내기에 실패했어요.'); });
  }

  function exportAll() {
    var btn = document.getElementById('exportAll');
    btn.disabled = true;
    var files = [];
    state.cards.reduce(function (p, _, i) {
      return p.then(function () { return cardToBlob(i); })
        .then(function (b) { return b.arrayBuffer(); })
        .then(function (buf) { files.push({ name: fileName(i), data: new Uint8Array(buf) }); });
    }, Promise.resolve()).then(function () {
      download(window.MiniZip.makeZip(files), 'cardnews-demo.zip');
      toast('카드 ' + files.length + '장을 ZIP으로 저장했어요.');
    }).catch(function () {
      toast('내보내기에 실패했어요.');
    }).then(function () { btn.disabled = false; });
  }

  // ---------- 기타 ----------
  var toastTimer = null;
  function toast(msg) {
    var el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2600);
  }

  function fillArticle() {
    var a = window.SAMPLE_ARTICLE;
    document.getElementById('articleMeta').textContent = a.source + ' · ' + a.date;
    var en = document.getElementById('articleEn');
    var ko = document.getElementById('articleKo');
    [[en, a.titleEn, a.bodyEn], [ko, a.titleKo, a.bodyKo]].forEach(function (x) {
      var h = document.createElement('h3');
      h.textContent = x[1];
      x[0].appendChild(h);
      x[2].forEach(function (t) {
        var p = document.createElement('p');
        p.textContent = t;
        x[0].appendChild(p);
      });
    });
    document.querySelectorAll('[data-tab]').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('[data-tab]').forEach(function (t) {
          var on = t === tab;
          t.setAttribute('aria-selected', on);
          document.getElementById(t.getAttribute('data-tab')).hidden = !on;
        });
      });
    });
  }

  function bind() {
    document.querySelectorAll('[data-add]').forEach(function (b) {
      b.addEventListener('click', function () { addCard(b.getAttribute('data-add')); });
    });
    document.getElementById('exportOne').addEventListener('click', exportOne);
    document.getElementById('exportAll').addEventListener('click', exportAll);
    document.getElementById('resetBtn').addEventListener('click', function () {
      if (!confirm('지금까지 편집한 내용을 지우고 예시 카드로 되돌릴까요?')) return;
      state = withIds(clone(window.SAMPLE_STATE));
      selected = 0;
      save();
      buildSettings();
      changed(true);
      toast('예시 카드로 되돌렸어요.');
    });
  }

  // 글씨체 파일을 먼저 불러온 뒤 그려야 카드에 올바른 글씨체가 들어갑니다.
  function loadFonts() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    var specs = [];
    Object.keys(R.FONTS).forEach(function (k) {
      R.FONTS[k].weights.forEach(function (w) { specs.push(w + ' 40px "' + R.FONTS[k].family + '"'); });
    });
    var all = Promise.all(specs.map(function (s) { return document.fonts.load(s, '가A').catch(function () {}); }));
    var timeout = new Promise(function (r) { setTimeout(r, 4000); });
    return Promise.race([all, timeout]);
  }

  fillArticle();
  bind();
  buildSettings();
  loadFonts().then(function () {
    buildList();
    buildEditor();
    renderAll();
    document.body.classList.add('is-ready');
  });

  // 테스트와 디버깅용
  window.CardNewsDemo = { getState: function () { return state; }, exportAll: exportAll };
})();

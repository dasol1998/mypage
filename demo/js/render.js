/*
 * 카드 한 장을 <canvas>에 그리는 코드.
 * 미리보기, 썸네일, PNG 내보내기가 모두 같은 함수를 사용합니다.
 */
(function () {
  var W = 1080;
  var PAD = 96;

  var FONTS = {
    pretendard: { family: 'Pretendard', label: '프리텐다드', weights: [400, 700, 800] },
    gowun: { family: 'Gowun Batang', label: '고운바탕', weights: [400, 700] },
    blackhan: { family: 'Black Han Sans', label: '검은고딕', weights: [400] }
  };

  function cardHeight(settings) {
    return settings.ratio === '1:1' ? 1080 : 1350;
  }

  // 글씨체에 없는 굵기를 요청하면 가장 가까운 굵기로 바꿔줍니다.
  function font(key, weight, size) {
    var f = FONTS[key] || FONTS.pretendard;
    var w = f.weights.reduce(function (best, cur) {
      return Math.abs(cur - weight) < Math.abs(best - weight) ? cur : best;
    }, f.weights[0]);
    return w + ' ' + Math.round(size) + 'px "' + f.family + '", "Pretendard", sans-serif';
  }

  function hexToRgba(hex, alpha) {
    var h = (hex || '#000000').replace('#', '');
    if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    var n = parseInt(h, 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + alpha + ')';
  }

  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, h / 2, w / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // 띄어쓰기 단위로 줄을 나누고, 한 단어가 너무 길면 글자 단위로 자릅니다.
  function wrap(ctx, text, maxWidth) {
    var out = [];
    String(text || '').split('\n').forEach(function (para) {
      if (para.trim() === '') { out.push(''); return; }
      var line = '';
      para.split(/ +/).forEach(function (word) {
        var test = line ? line + ' ' + word : word;
        if (ctx.measureText(test).width <= maxWidth) { line = test; return; }
        if (line) out.push(line);
        if (ctx.measureText(word).width <= maxWidth) { line = word; return; }
        line = '';
        Array.from(word).forEach(function (ch) {
          if (ctx.measureText(line + ch).width > maxWidth && line) { out.push(line); line = ch; }
          else line += ch;
        });
      });
      out.push(line);
    });
    return out;
  }

  /*
   * 위에서 아래로 쌓이는 블록들을 배치합니다.
   * 전체 높이가 availH를 넘으면 글자 크기를 조금씩 줄여서 카드 안에 맞춥니다.
   */
  function layoutFlow(ctx, items, maxWidth, availH) {
    var scale = 1, result;
    for (; scale >= 0.55; scale -= 0.05) {
      result = measureFlow(ctx, items, maxWidth, scale);
      if (result.height <= availH) break;
    }
    return result;
  }

  function measureFlow(ctx, items, maxWidth, scale) {
    var height = 0;
    var blocks = items.map(function (it) {
      if (it.kind === 'space') { height += it.size * scale; return { item: it, h: it.size * scale }; }
      var size = it.size * scale;
      ctx.font = font(it.font, it.weight, size);
      var innerW = maxWidth - (it.boxPad ? it.boxPad * 2 * scale : 0);
      var lines = it.text ? wrap(ctx, it.text, innerW) : [];
      if (it.maxLines && lines.length > it.maxLines) {
        lines = lines.slice(0, it.maxLines);
        lines[lines.length - 1] = lines[lines.length - 1].replace(/.$/, '…');
      }
      var lh = size * (it.lineHeight || 1.3);
      var h = lines.length * lh;
      if (it.kind === 'pill' || it.kind === 'button') h = size + (it.padY || 0.5) * 2 * size;
      if (it.boxPad) h += it.boxPad * 2 * scale;
      if (!lines.length && it.kind !== 'rule') h = 0;
      if (it.kind === 'rule') h = it.size * scale;
      var gap = h ? (it.gapAfter || 0) * scale : 0;
      height += h + gap;
      return { item: it, lines: lines, size: size, lh: lh, h: h, gap: gap, scale: scale };
    });
    return { blocks: blocks, height: height, scale: scale };
  }

  function drawFlow(ctx, flow, x, y, maxWidth, align) {
    flow.blocks.forEach(function (b) {
      var it = b.item;
      if (it.kind === 'space') { y += b.h; return; }
      if (!b.h) return;
      if (it.kind === 'rule') {
        var rw = it.width * b.scale;
        var rx = align === 'center' ? x + (maxWidth - rw) / 2 : x;
        ctx.fillStyle = it.color;
        ctx.fillRect(rx, y, rw, b.h);
        y += b.h + b.gap;
        return;
      }
      ctx.font = font(it.font, it.weight, b.size);
      if (it.kind === 'pill' || it.kind === 'button') {
        var padX = (it.padX || 0.9) * b.size;
        var tw = ctx.measureText(b.lines.join(' ')).width;
        var pw = tw + padX * 2;
        var px = align === 'center' ? x + (maxWidth - pw) / 2 : x;
        ctx.fillStyle = it.bg;
        roundRect(ctx, px, y, pw, b.h, b.h / 2);
        ctx.fill();
        ctx.fillStyle = it.color;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        ctx.fillText(b.lines.join(' '), px + padX, y + b.h / 2 + b.size * 0.04);
        y += b.h + b.gap;
        return;
      }
      var tx = x, innerW = maxWidth;
      if (it.boxPad) {
        var bp = it.boxPad * b.scale;
        ctx.fillStyle = it.boxBg;
        roundRect(ctx, x, y, maxWidth, b.h, 24 * b.scale);
        ctx.fill();
        tx = x + bp; innerW = maxWidth - bp * 2;
        y += bp;
      }
      ctx.fillStyle = it.color;
      ctx.textBaseline = 'top';
      ctx.textAlign = align === 'center' ? 'center' : 'left';
      var lx = align === 'center' ? tx + innerW / 2 : tx;
      b.lines.forEach(function (line) {
        ctx.fillText(line, lx, y + (b.lh - b.size) / 2);
        y += b.lh;
      });
      if (it.boxPad) y += it.boxPad * b.scale;
      y += b.gap;
    });
    ctx.textAlign = 'left';
  }

  // ---------- 배경 ----------
  function drawBackground(ctx, card, H, images) {
    var c1 = card.color1, c2 = card.color2;
    ctx.fillStyle = c1;
    ctx.fillRect(0, 0, W, H);
    var g, i, j;
    switch (card.bgKind) {
      case 'gradient':
        g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, c1); g.addColorStop(1, c2);
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        break;
      case 'dots':
        ctx.fillStyle = hexToRgba(c2, 0.35);
        for (i = 36; i < W; i += 54) for (j = 36; j < H; j += 54) {
          ctx.beginPath(); ctx.arc(i, j, 4, 0, Math.PI * 2); ctx.fill();
        }
        break;
      case 'grid':
        ctx.strokeStyle = hexToRgba(c2, 0.3); ctx.lineWidth = 2;
        for (i = 0; i <= W; i += 90) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke(); }
        for (j = 0; j <= H; j += 90) { ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(W, j); ctx.stroke(); }
        break;
      case 'rings':
        ctx.lineWidth = 3;
        for (i = 1; i <= 9; i++) {
          ctx.strokeStyle = hexToRgba(c2, 0.55 - i * 0.05);
          ctx.beginPath(); ctx.arc(W * 0.92, H * 0.12, i * 95, 0, Math.PI * 2); ctx.stroke();
        }
        g = ctx.createLinearGradient(0, H * 0.4, 0, H);
        g.addColorStop(0, hexToRgba(c1, 0)); g.addColorStop(1, hexToRgba(c1, 0.9));
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        break;
      case 'blobs':
        [[0.15, 0.2, 520, 0.55], [0.9, 0.75, 620, 0.45], [0.55, 1.05, 420, 0.35]].forEach(function (b) {
          var rg = ctx.createRadialGradient(W * b[0], H * b[1], 0, W * b[0], H * b[1], b[2]);
          rg.addColorStop(0, hexToRgba(c2, b[3])); rg.addColorStop(1, hexToRgba(c2, 0));
          ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
        });
        break;
      case 'image':
        var img = card.image && images ? images(card.image) : null;
        if (img && img.complete && img.naturalWidth) {
          var s = Math.max(W / img.naturalWidth, H / img.naturalHeight);
          var iw = img.naturalWidth * s, ih = img.naturalHeight * s;
          ctx.drawImage(img, (W - iw) / 2, (H - ih) / 2, iw, ih);
        }
        var o = (card.overlay == null ? 45 : card.overlay) / 100;
        g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, 'rgba(0,0,0,' + o * 0.5 + ')'); g.addColorStop(1, 'rgba(0,0,0,' + Math.min(1, o * 1.6) + ')');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        break;
    }
  }

  function drawFooter(ctx, card, H, settings, index, total) {
    ctx.textBaseline = 'alphabetic';
    ctx.font = font('pretendard', 700, 28);
    ctx.fillStyle = hexToRgba(card.textColor, 0.75);
    ctx.textAlign = 'left';
    if (card.type !== 'subscribe') ctx.fillText(settings.brand || '', PAD, H - 64);
    if (settings.pageNumbers && total > 1) {
      ctx.textAlign = 'right';
      ctx.fillText((index + 1) + ' / ' + total, W - PAD, H - 64);
    }
    ctx.textAlign = 'left';
  }

  // ---------- 카드 종류별 배치 ----------
  function drawText(ctx, card, H, s) {
    var maxW = W - PAD * 2;
    var tf = s.titleFont, bf = s.bodyFont;
    var align = card.align === 'center' ? 'center' : 'left';
    var items, flow;
    if (card.variant === 'cover') {
      var top = [{ kind: 'pill', text: card.kicker, font: bf, weight: 700, size: 30, bg: s.accent, color: '#111111', padY: 0.55 }];
      var topFlow = measureFlow(ctx, top, maxW, 1);
      drawFlow(ctx, topFlow, PAD, PAD, maxW, align);
      items = [
        { text: card.title, font: tf, weight: 800, size: 100, lineHeight: 1.22, color: card.textColor, gapAfter: 36, maxLines: 5 },
        { kind: 'rule', size: 8, width: 96, color: s.accent, gapAfter: 36 },
        { text: card.body, font: bf, weight: 400, size: 40, lineHeight: 1.5, color: hexToRgba(card.textColor, 0.9), gapAfter: 28 },
        { text: card.source, font: bf, weight: 400, size: 26, lineHeight: 1.4, color: hexToRgba(card.textColor, 0.6) }
      ];
      var availH = H - PAD - 140 - (PAD + topFlow.height + 60);
      flow = layoutFlow(ctx, items, maxW, availH);
      drawFlow(ctx, flow, PAD, H - 140 - flow.height, maxW, align);
    } else {
      items = [
        { text: card.kicker, font: bf, weight: 700, size: 30, color: s.accent, gapAfter: 22 },
        { text: card.title, font: tf, weight: 800, size: 76, lineHeight: 1.25, color: card.textColor, gapAfter: 36, maxLines: 4 },
        { kind: 'rule', size: 8, width: 96, color: s.accent, gapAfter: 48 },
        { text: card.body, font: bf, weight: 400, size: 44, lineHeight: 1.65, color: hexToRgba(card.textColor, 0.92), gapAfter: 28 },
        { text: card.source, font: bf, weight: 400, size: 26, lineHeight: 1.4, color: hexToRgba(card.textColor, 0.6) }
      ];
      flow = layoutFlow(ctx, items, maxW, H - PAD - 150);
      drawFlow(ctx, flow, PAD, PAD + 10, maxW, align);
    }
  }

  function drawExpression(ctx, card, H, s) {
    var maxW = W - PAD * 2;
    var tf = s.titleFont, bf = s.bodyFont;
    var ink = card.textColor;
    var items = [
      { kind: 'pill', text: card.label, font: bf, weight: 700, size: 30, bg: ink, color: card.color1, gapAfter: 64 },
      { text: card.expression, font: tf, weight: 800, size: 112, lineHeight: 1.12, color: ink, gapAfter: 28, maxLines: 3 },
      { text: card.meaning, font: bf, weight: 700, size: 50, lineHeight: 1.35, color: ink, gapAfter: 52 },
      { kind: 'rule', size: 6, width: 120, color: hexToRgba(ink, 0.2), gapAfter: 52 },
      { text: card.example, font: bf, weight: 700, size: 40, lineHeight: 1.5, color: ink, gapAfter: 16 },
      { text: card.exampleKo, font: bf, weight: 400, size: 36, lineHeight: 1.5, color: hexToRgba(ink, 0.72), gapAfter: 52 },
      { text: card.note ? 'TIP  ' + card.note : '', font: bf, weight: 400, size: 32, lineHeight: 1.55, color: ink, boxPad: 36, boxBg: hexToRgba(card.color2, 0.6) }
    ];
    var availH = H - PAD - 150;
    var flow = layoutFlow(ctx, items, maxW, availH);
    drawFlow(ctx, flow, PAD, PAD + Math.max(0, (availH - flow.height) / 2), maxW, 'left');
  }

  function drawSubscribe(ctx, card, H, s) {
    var maxW = W - PAD * 2;
    var items = [
      { text: card.label, font: s.bodyFont, weight: 700, size: 30, color: s.accent, gapAfter: 36 },
      { text: card.title, font: s.titleFont, weight: 800, size: 88, lineHeight: 1.25, color: card.textColor, gapAfter: 40, maxLines: 5 },
      { text: card.body, font: s.bodyFont, weight: 400, size: 40, lineHeight: 1.6, color: hexToRgba(card.textColor, 0.85), gapAfter: 72 },
      { kind: 'button', text: card.cta, font: s.bodyFont, weight: 800, size: 44, bg: s.accent, color: '#111111', padY: 0.6, padX: 1.4, gapAfter: 36 },
      { text: s.brand, font: s.bodyFont, weight: 700, size: 34, color: hexToRgba(card.textColor, 0.8) }
    ];
    var flow = layoutFlow(ctx, items, maxW, H - PAD * 2 - 60);
    drawFlow(ctx, flow, PAD, (H - flow.height) / 2 - 10, maxW, 'center');
  }

  function renderCard(canvas, card, settings, index, total, images) {
    var H = cardHeight(settings);
    if (canvas.width !== W) canvas.width = W;
    if (canvas.height !== H) canvas.height = H;
    var ctx = canvas.getContext('2d');
    ctx.save();
    ctx.clearRect(0, 0, W, H);
    drawBackground(ctx, card, H, images);
    if (card.type === 'expression') drawExpression(ctx, card, H, settings);
    else if (card.type === 'subscribe') drawSubscribe(ctx, card, H, settings);
    else drawText(ctx, card, H, settings);
    drawFooter(ctx, card, H, settings, index, total);
    ctx.restore();
  }

  window.CardRender = {
    FONTS: FONTS,
    WIDTH: W,
    cardHeight: cardHeight,
    renderCard: renderCard
  };
})();

(() => {
  'use strict';

  const esc = value => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

  function textLines(value, x, y, limit, lineHeight, size, fill, weight = 700, spacing = 0, maxLines = 2) {
    const words = String(value || '').trim().split(/\s+/).filter(Boolean);
    const lines = [];
    let current = '';
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (current && next.length > limit) { lines.push(current); current = word; }
      else current = next;
    }
    if (current) lines.push(current);
    if (lines.length > maxLines) {
      lines.length = maxLines;
      lines[maxLines - 1] = `${lines[maxLines - 1].replace(/[.,;:]?$/, '')}…`;
    }
    return `<text x="${x}" y="${y}" fill="${fill}" font-family="Arial,Helvetica,sans-serif" font-size="${size}" font-weight="${weight}" letter-spacing="${spacing}">${lines.map((line, i) => `<tspan x="${x}" dy="${i ? lineHeight : 0}">${esc(line)}</tspan>`).join('')}</text>`;
  }

  function sampleIcon(kind, x, y, accent, pale) {
    const circle = `<circle r="58" fill="${pale}"/><circle r="58" fill="none" stroke="${accent}" stroke-opacity=".28" stroke-width="2"/>`;
    let icon;
    if (kind === 'blood') icon = '<rect x="-17" y="-39" width="34" height="13" rx="4" fill="#c84659"/><path d="M-13-25h26l-4 10v35a13 13 0 0 1-26 0v-35l-4-10h8Z" fill="#fff" stroke="#a83348" stroke-width="4" stroke-linejoin="round"/><path d="M-17 7h34v13a13 13 0 0 1-34 0V7Z" fill="#df5367"/><path d="M-10-12h7M-17 0h34" stroke="#a83348" stroke-width="3" stroke-linecap="round"/><path d="M39-23c0 7-4 11-9 11s-9-4-9-11c0-5 9-17 9-17s9 12 9 17Z" fill="#ef6172"/>';
    else if (kind === 'urine') icon = '<rect x="-29" y="-37" width="58" height="15" rx="5" fill="#187eae"/><path d="M-24-20h48l-5 58a8 8 0 0 1-8 7H-11a8 8 0 0 1-8-7l-5-58Z" fill="#fff" stroke="#176a91" stroke-width="4" stroke-linejoin="round"/><path d="M-20 9h40l-3 27a5 5 0 0 1-5 4h-24a5 5 0 0 1-5-4l-3-27Z" fill="#f4cc43"/><path d="M-15-9h30M-13 0h26" stroke="#176a91" stroke-width="3" stroke-linecap="round"/><path d="M0 28c5-7 8-11 8-15a8 8 0 0 0-16 0c0 4 3 8 8 15Z" fill="#fff2aa"/>';
    else if (kind === 'stool') icon = '<rect x="-32" y="-37" width="64" height="15" rx="5" fill="#92613c"/><path d="M-25-19h50l-5 57a8 8 0 0 1-8 7h-24a8 8 0 0 1-8-7l-5-57Z" fill="#fff" stroke="#80552f" stroke-width="4" stroke-linejoin="round"/><path d="M-21 10h42l-3 27a5 5 0 0 1-5 4h-26a5 5 0 0 1-5-4l-3-27Z" fill="#b98652"/><path d="M-15-8h30M-13 1h26" stroke="#80552f" stroke-width="3" stroke-linecap="round"/><circle cx="-7" cy="21" r="3" fill="#80552f"/><circle cx="8" cy="31" r="3" fill="#80552f"/>';
    else icon = '<path d="M-17-39h34M-12-39v22l-27 50a9 9 0 0 0 8 13h62a9 9 0 0 0 8-13L12-17v-22" fill="#fff" stroke="#287d94" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="m-30 17 60-.5 13 23h-86l13-22.5Z" fill="#54b9c3"/><path d="M-20-2h40" stroke="#287d94" stroke-width="3" stroke-linecap="round"/><circle cx="-7" cy="26" r="3" fill="#eaffff"/><circle cx="9" cy="33" r="2.5" fill="#eaffff"/>';
    return `<g transform="translate(${x} ${y})">${circle}${icon}</g>`;
  }

  function patientIcon(x, y, color) {
    return `<g transform="translate(${x} ${y})" fill="${color}"><circle cy="-12" r="10"/><circle cx="-23" cy="-5" r="7"/><circle cx="23" cy="-5" r="7"/><path d="M-28 22c0-16 9-24 28-24s28 8 28 24v3h-56z"/><path d="M-48 20c0-12 7-19 19-19 5 0 9 1 12 4-5 5-7 11-7 19h-24zM48 20c0-12-7-19-19-19-5 0-9 1-12 4 5 5 7 11 7 19h24z"/></g>`;
  }

  function buildSvg(report) {
    const width = 1536;
    const entries = Array.isArray(report.entries) ? report.entries : [];
    const rows = Math.max(1, Math.ceil(entries.length / 2));
    const rowHeight = 222;
    const rowGap = 18;
    const cardsTop = 528;
    const totalY = cardsTop + rows * (rowHeight + rowGap) - rowGap + 22;
    const obs = String(report.observations || '').trim();
    const showObs = obs && !/^(sin observaciones( agregadas)?\.?|-)$/i.test(obs);
    const obsY = totalY + 150;
    const footerY = showObs ? obsY + 112 : totalY + 166;
    const height = Math.max(1024, footerY + 52);
    const date = esc(report.date);
    const companyText = String(report.company || 'Sin especificar');
    const company = esc(companyText.length > 58 ? `${companyText.slice(0, 55)}…` : companyText);
    const employee = String(report.name || 'Por definir');
    const name = esc(employee.length > 45 ? `${employee.slice(0, 42)}…` : employee);
    const schedule = esc(report.schedule || 'Por definir');
    const palettes = {
      blood: { bg: '#fff5f8', border: '#f39ab5', band: '#fbe4ec', accent: '#d92f69', pale: '#ffe0e9' },
      urine: { bg: '#f1fbf7', border: '#78d8b3', band: '#def7ec', accent: '#169b67', pale: '#d7f6e8' },
      stool: { bg: '#fff8ef', border: '#e3bd80', band: '#f8ecd9', accent: '#a97735', pale: '#f2e3c9' },
      generic: { bg: '#f0f8ff', border: '#85caff', band: '#e0f1ff', accent: '#1769cb', pale: '#dceeff' }
    };

    let cards = '';
    entries.forEach((entry, index) => {
      const oneCard = entries.length === 1;
      const x = oneCard ? 28 : (index % 2 ? 781 : 28);
      const cardWidth = oneCard ? 1480 : 727;
      const y = cardsTop + Math.floor(index / 2) * (rowHeight + rowGap);
      const kind = entry.sample && palettes[entry.sample.icon] ? entry.sample.icon : 'generic';
      const pal = palettes[kind];
      const titleX = x + 202;
      const titleSize = oneCard ? 31 : 27;
      const titleLimit = oneCard ? 55 : 34;
      const title = textLines(entry.type, titleX, y + 74, titleLimit, 31, titleSize, '#123e78', 800);
      const countX = x + 132;
      const bandWidth = cardWidth - 56;
      const unitX = countX + (String(entry.count).length > 2 ? 118 : 86);
      cards += `<g><rect x="${x}" y="${y}" width="${cardWidth}" height="${rowHeight}" rx="24" fill="${pal.bg}" stroke="${pal.border}" stroke-width="2"/><path d="M${x+24} ${y}h${cardWidth-48}a24 24 0 0 1 24 24v3H${x}v-3a24 24 0 0 1 24-24Z" fill="${pal.accent}"/>`;
      cards += sampleIcon(kind, x + 112, y + 93, pal.accent, pal.pale);
      cards += title;
      const sampleLabelY = String(entry.type).length > titleLimit ? y + 139 : y + 117;
      cards += `<text x="${titleX}" y="${sampleLabelY}" fill="#53718e" font-family="Arial,Helvetica,sans-serif" font-size="17" font-weight="800" letter-spacing="1.2">${esc(String(entry.sample?.label || 'Muestra no especificada').toUpperCase())}</text>`;
      cards += `<rect x="${x+28}" y="${y+151}" width="${bandWidth}" height="55" rx="17" fill="${pal.band}"/><circle cx="${x+78}" cy="${y+178}" r="20" fill="${pal.pale}"/>`;
      cards += patientIcon(x + 78, y + 178, pal.accent);
      cards += `<text x="${countX}" y="${y+192}" fill="#123e78" font-family="Arial,Helvetica,sans-serif" font-size="45" font-weight="900">${esc(entry.count)}</text><text x="${unitX}" y="${y+187}" fill="#17426c" font-family="Arial,Helvetica,sans-serif" font-size="17" font-weight="900" letter-spacing="1.5">PACIENTES</text></g>`;
    });
    if (!entries.length) cards = '<rect x="28" y="528" width="1480" height="110" rx="22" fill="#f3f8fc" stroke="#cbdce9" stroke-width="2" stroke-dasharray="8 8"/><text x="768" y="592" text-anchor="middle" fill="#71879a" font-family="Arial,Helvetica,sans-serif" font-size="24" font-style="italic">No se ingresaron cantidades en esta jornada.</text>';

    const observation = showObs
      ? `<rect x="28" y="${obsY}" width="1480" height="78" rx="18" fill="#f5f9fc" stroke="#dce7ef" stroke-width="2"/><text x="58" y="${obsY+29}" fill="#648096" font-family="Arial,Helvetica,sans-serif" font-size="14" font-weight="900" letter-spacing="1.5">OBSERVACIONES</text>${textLines(obs.slice(0, 220), 58, obsY+55, 145, 20, 16, '#34536d', 600, 0, 2)}`
      : '';
    const companyWidth = Math.min(760, Math.max(270, companyText.length * 15 + 90));

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="head" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#092f66"/><stop offset=".6" stop-color="#1260a8"/><stop offset="1" stop-color="#0084b7"/></linearGradient><linearGradient id="company" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#073d73"/><stop offset="1" stop-color="#087b91"/></linearGradient><linearGradient id="total" x1="0" y1="0" x2="1" y2=".4"><stop stop-color="#e1f4ff"/><stop offset="1" stop-color="#edf9ff"/></linearGradient><linearGradient id="logo" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#25d3e3"/><stop offset="1" stop-color="#0789e6"/></linearGradient></defs><rect width="100%" height="100%" fill="#f8fbfe"/><rect x="20" y="14" width="1496" height="292" rx="28" fill="url(#head)"/><path d="M1100 14h330l-185 292H900z" fill="#fff" opacity=".045"/><path d="M1370 14h146v140l-95 152h-96l180-292Z" fill="#fff" opacity=".045"/><rect x="56" y="43" width="135" height="135" rx="31" fill="url(#logo)"/><text x="123.5" y="126" text-anchor="middle" fill="#fff" font-family="Arial,Helvetica,sans-serif" font-size="52" font-weight="900" letter-spacing="-3">RP</text><rect x="151" y="138" width="27" height="27" rx="7" fill="#d7faff" opacity=".9"/><path d="M158 145h13v14h-13zM161 142v6M168 142v6M161 150h3M167 150h2M161 155h3" fill="none" stroke="#1583bf" stroke-width="2" stroke-linecap="round"/><text x="224" y="66" fill="#68e0ef" font-family="Arial,Helvetica,sans-serif" font-size="22" font-weight="900" letter-spacing="3">REPORTE PRO · CONTROL DIARIO</text><text x="224" y="121" fill="#fff" font-family="Arial,Helvetica,sans-serif" font-size="48" font-weight="900" letter-spacing=".6">REPORTE DE JORNADA</text><text x="226" y="163" fill="#d7efff" font-family="Arial,Helvetica,sans-serif" font-size="25" font-weight="500">Pruebas de laboratorio y atenciones</text><g transform="translate(1102 92)" fill="none" stroke="#70dcf2" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><rect x="0" y="8" width="49" height="48" rx="9"/><path d="M12 1v14M37 1v14M1 22h47"/><circle cx="14" cy="32" r="2" fill="#70dcf2"/><circle cx="25" cy="32" r="2" fill="#70dcf2"/><circle cx="36" cy="32" r="2" fill="#70dcf2"/><circle cx="14" cy="43" r="2" fill="#70dcf2"/><circle cx="25" cy="43" r="2" fill="#70dcf2"/></g><path d="M1173 72v87" stroke="#63d9ed" stroke-width="3"/><text x="1202" y="91" fill="#83e2f2" font-family="Arial,Helvetica,sans-serif" font-size="18" font-weight="900" letter-spacing="2">FECHA</text><text x="1202" y="128" fill="#fff" font-family="Arial,Helvetica,sans-serif" font-size="22" font-weight="800">${date}</text><rect x="20" y="221" width="1496" height="85" rx="23" fill="url(#company)" stroke="#4cb5e1" stroke-opacity=".45" stroke-width="2"/><g transform="translate(82 240)" fill="#83dffa"><path d="M7 8 31 0l24 8v5H7zM11 16h9v25h-9zM25 16h10v25H25zM40 16h10v25H40zM5 43h49v6H5z"/><rect x="27" y="19" width="5" height="6" rx="1" fill="#12609a"/><rect x="42" y="19" width="5" height="6" rx="1" fill="#12609a"/><rect x="27" y="30" width="5" height="6" rx="1" fill="#12609a"/></g><text x="155" y="274" fill="#c8ecfa" font-family="Arial,Helvetica,sans-serif" font-size="20" font-weight="900" letter-spacing="2.5">EMPRESA</text><rect x="298" y="241" width="${companyWidth}" height="46" rx="23" fill="#0bbda9"/><circle cx="325" cy="264" r="11" fill="#fff"/><path d="m320 264 4 4 7-8" fill="none" stroke="#0bbda9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><text x="350" y="271" fill="#fff" font-family="Arial,Helvetica,sans-serif" font-size="19" font-weight="800">${company}</text><rect x="27" y="333" width="721" height="108" rx="22" fill="#eef8ff" stroke="#b9e3ff" stroke-width="2"/><circle cx="91" cy="387" r="35" fill="#d6edff"/><circle cx="91" cy="387" r="22" fill="none" stroke="#1679d4" stroke-width="5"/><path d="M91 373v15l11 7" fill="none" stroke="#1679d4" stroke-width="5" stroke-linecap="round"/><path d="M153 355v64" stroke="#1985e5" stroke-width="3"/><text x="181" y="373" fill="#307fca" font-family="Arial,Helvetica,sans-serif" font-size="16" font-weight="900" letter-spacing="1.5">HORARIO DE JORNADA</text><text x="181" y="410" fill="#123e78" font-family="Arial,Helvetica,sans-serif" font-size="25" font-weight="900">${schedule}</text><rect x="788" y="333" width="721" height="108" rx="22" fill="#f2f0ff" stroke="#d4d0ff" stroke-width="2"/><circle cx="852" cy="387" r="35" fill="#e3ddff"/><circle cx="852" cy="377" r="10" fill="#6550d8"/><path d="M834 408c0-13 6-20 18-20s18 7 18 20z" fill="#6550d8"/><path d="M914 355v64" stroke="#7963e8" stroke-width="3"/><text x="942" y="373" fill="#7865d5" font-family="Arial,Helvetica,sans-serif" font-size="16" font-weight="900" letter-spacing="1.5">RESPONSABLE</text><text x="942" y="410" fill="#123e78" font-family="Arial,Helvetica,sans-serif" font-size="25" font-weight="900">${name}</text><text x="110" y="494" fill="#123e78" font-family="Arial,Helvetica,sans-serif" font-size="22" font-weight="900" letter-spacing="2">DETALLE DE PRUEBAS</text><path d="M450 487h1058" stroke="#168fe0" stroke-width="3"/>${cards}<g><rect x="28" y="${totalY}" width="1480" height="132" rx="23" fill="url(#total)" stroke="#b8e2ff" stroke-width="2"/><path d="M28 ${totalY+22}q0-22 22-22h52l-74 72z" fill="#59c9ef" opacity=".75"/><circle cx="166" cy="${totalY+66}" r="44" fill="#cceeff"/>${patientIcon(166, totalY+66, '#096ccc')}<path d="M235 ${totalY+27}v78" stroke="#72bfe7" stroke-width="2"/><text x="269" y="${totalY+45}" fill="#447093" font-family="Arial,Helvetica,sans-serif" font-size="16" font-weight="900" letter-spacing="1.4">TOTAL DE PACIENTES ATENDIDOS</text><text x="270" y="${totalY+105}" fill="#103b73" font-family="Arial,Helvetica,sans-serif" font-size="64" font-weight="900">${esc(report.total)}</text><text x="360" y="${totalY+96}" fill="#17426c" font-family="Arial,Helvetica,sans-serif" font-size="20" font-weight="900" letter-spacing="1.2">PACIENTES</text><rect x="1190" y="${totalY+35}" width="270" height="64" rx="32" fill="#d4f4f4"/><circle cx="1230" cy="${totalY+67}" r="23" fill="#0eb9b2"/><path d="m1219 ${totalY+67} 8 8 15-17" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><text x="1270" y="${totalY+63}" fill="#099ca7" font-family="Arial,Helvetica,sans-serif" font-size="15" font-weight="900" letter-spacing=".8">JORNADA</text><text x="1270" y="${totalY+83}" fill="#099ca7" font-family="Arial,Helvetica,sans-serif" font-size="15" font-weight="900" letter-spacing=".8">COMPLETADA</text></g>${observation}<text x="768" y="${footerY+30}" text-anchor="middle" fill="#57758d" font-family="Arial,Helvetica,sans-serif" font-size="14" font-weight="700">REPORTE PRO · CONTROL DE JORNADA</text></svg>`;
  }

  function toDataUri(markup) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
  }

  async function toPngCanvas(markup, scale = 2) {
    const blob = new Blob([markup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    try {
      const image = new Image();
      image.decoding = 'async';
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error('No se pudo preparar la imagen vectorial.'));
        image.src = url;
      });
      const width = 1536;
      const height = Number(markup.match(/height="(\d+)"/)?.[1]) || 1024;
      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Este navegador no pudo crear el PNG.');
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.fillStyle = '#f8fbfe';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas;
    } finally { URL.revokeObjectURL(url); }
  }

  window.ReportRenderer = { buildSvg, toDataUri, toPngCanvas };
})();

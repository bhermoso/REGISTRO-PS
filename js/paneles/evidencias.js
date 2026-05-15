// Panel de evidencias — sube archivos a GitHub y guarda metadatos en Firebase
import {C} from '../config.js';
import {S} from '../estado.js';
import {fbGuardarEvidencia, fbLeerEvidencias, fbEliminarEvidencia, ghToken} from '../firebase.js';

const GH_REPO  = 'bhermoso/REGISTRO-APS';
const GH_BRANCH = 'main';

const TIPOS = {
  'image/': '🖼️',
  'video/': '🎬',
  'application/pdf': '📄',
  'application/vnd': '📊',
  'text/': '📝'
};

function iconoTipo(mime) {
  for (const [k, v] of Object.entries(TIPOS)) if (mime.startsWith(k)) return v;
  return '📎';
}

function fmtSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes/1024).toFixed(1) + ' KB';
  return (bytes/1048576).toFixed(1) + ' MB';
}

function fmtFecha(ts) {
  return new Date(ts).toLocaleDateString('es-ES', {day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'});
}

async function subirGitHub(archivo, recordId) {
  const token = await ghToken();
  const ts    = Date.now();
  const nombre = `${ts}_${archivo.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;
  const ruta   = `evidencias/${recordId}/${nombre}`;

  // Leer como base64
  const b64 = await new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload  = e => res(e.target.result.split(',')[1]);
    reader.onerror = rej;
    reader.readAsDataURL(archivo);
  });

  const resp = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${ruta}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type':  'application/json'
    },
    body: JSON.stringify({
      message: `evidencia: ${archivo.name} (${recordId})`,
      content: b64,
      branch:  GH_BRANCH
    })
  });

  if (!resp.ok) {
    const err = await resp.json();
    throw new Error(err.message || resp.statusText);
  }

  const data = await resp.json();
  return {
    nombre:    archivo.name,
    ruta,
    url:       data.content.html_url,
    url_raw:   data.content.download_url,
    mime:      archivo.type || 'application/octet-stream',
    size:      archivo.size,
    fecha:     ts,
    record_id: recordId
  };
}

async function eliminarGitHub(ruta, url_raw) {
  const token = await ghToken();

  // Obtener SHA del archivo
  const info = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${ruta}`, {
    headers: {'Authorization': `Bearer ${token}`}
  });
  if (!info.ok) return;
  const {sha} = await info.json();

  await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${ruta}`, {
    method: 'DELETE',
    headers: {'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json'},
    body: JSON.stringify({message: `eliminar evidencia: ${ruta}`, sha, branch: GH_BRANCH})
  });
}

// ── UI ────────────────────────────────────────────────────────────────────────

function renderEvidencias() {
  const wrap = document.getElementById('ev-wrap');
  if (!wrap) return;

  // Selector de registro
  const registros = [...new Set(S.filtrados.map(r => r[C.f.record]).filter(Boolean))].sort();
  const selVal = document.getElementById('ev-sel-record')?.value || registros[0] || '';

  wrap.innerHTML = `
    <div class="ev-toolbar">
      <div class="fg" style="min-width:260px">
        <label>Registro (record_id)</label>
        <select id="ev-sel-record" onchange="window._evCambioRecord(this.value)">
          ${registros.length
            ? registros.map(r => `<option value="${r}" ${r===selVal?'selected':''}>${r}</option>`).join('')
            : '<option value="">— carga un CSV primero —</option>'}
        </select>
      </div>
      <label class="btn btn-p ev-upload-btn" title="Seleccionar archivos">
        ＋ Añadir evidencia
        <input type="file" id="ev-file-input" multiple style="display:none"
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv">
      </label>
    </div>
    <div id="ev-drop" class="ev-drop">
      <div class="ev-drop-inner">
        <span style="font-size:2rem">📂</span>
        <p>Arrastra aquí los archivos de evidencia</p>
        <p style="font-size:.75rem;color:var(--sub)">Fotos, vídeos, PDFs, documentos, cuestionarios…</p>
      </div>
    </div>
    <div id="ev-progress" class="ev-progress" style="display:none">
      <div class="ev-progress-bar"><div id="ev-prog-fill" class="ev-prog-fill"></div></div>
      <span id="ev-prog-label" style="font-size:.75rem;color:var(--sub)"></span>
    </div>
    <div id="ev-lista"></div>
  `;

  // Drag & drop
  const drop = document.getElementById('ev-drop');
  drop.addEventListener('dragover',  e => { e.preventDefault(); drop.classList.add('ev-drop-over'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('ev-drop-over'));
  drop.addEventListener('drop', e => {
    e.preventDefault(); drop.classList.remove('ev-drop-over');
    procesarArchivos([...e.dataTransfer.files]);
  });

  // Input file
  document.getElementById('ev-file-input').addEventListener('change', function() {
    procesarArchivos([...this.files]); this.value = '';
  });

  if (selVal) cargarLista(selVal);
}

async function cargarLista(recordId) {
  const lista = document.getElementById('ev-lista');
  if (!lista) return;
  lista.innerHTML = '<p style="color:var(--sub);font-size:.8rem;padding:12px">Cargando…</p>';

  try {
    const items = await fbLeerEvidencias(recordId);
    if (!items.length) {
      lista.innerHTML = '<p style="color:var(--sub);font-size:.8rem;padding:12px 0">Sin evidencias para este registro.</p>';
      return;
    }
    lista.innerHTML = items.map(ev => `
      <div class="ev-item" id="ev-${ev._key}">
        <span class="ev-ico">${iconoTipo(ev.mime)}</span>
        <div class="ev-meta">
          <strong>${ev.nombre}</strong>
          <span>${fmtSize(ev.size)} · ${fmtFecha(ev.fecha)}</span>
        </div>
        <div class="ev-actions">
          ${ev.mime.startsWith('image/') ? `<a href="${ev.url_raw}" target="_blank" class="btn btn-s" style="font-size:.75rem">👁️ Ver</a>` : ''}
          <a href="${ev.url_raw}" download="${ev.nombre}" class="btn btn-s" style="font-size:.75rem">⬇️ Descargar</a>
          <button class="btn btn-r" style="font-size:.75rem" onclick="window._evEliminar('${recordId}','${ev._key}','${ev.ruta}')">🗑️</button>
        </div>
      </div>
    `).join('');
  } catch(e) {
    lista.innerHTML = `<p style="color:var(--coral);font-size:.8rem;padding:12px 0">Error: ${e.message}</p>`;
  }
}

async function procesarArchivos(archivos) {
  const recordId = document.getElementById('ev-sel-record')?.value;
  if (!recordId) return alert('Selecciona primero un registro.');

  const prog  = document.getElementById('ev-progress');
  const fill  = document.getElementById('ev-prog-fill');
  const label = document.getElementById('ev-prog-label');
  prog.style.display = 'block';

  for (let i = 0; i < archivos.length; i++) {
    const f = archivos[i];
    const pct = Math.round((i / archivos.length) * 100);
    fill.style.width  = pct + '%';
    label.textContent = `Subiendo ${i+1}/${archivos.length}: ${f.name}`;
    try {
      const meta = await subirGitHub(f, recordId);
      await fbGuardarEvidencia(recordId, meta);
    } catch(e) {
      console.error('Error subiendo', f.name, e);
      label.textContent = `Error en ${f.name}: ${e.message}`;
    }
  }

  fill.style.width  = '100%';
  label.textContent = `✓ ${archivos.length} archivo(s) procesado(s)`;
  setTimeout(() => { prog.style.display = 'none'; fill.style.width = '0'; }, 2000);

  cargarLista(recordId);
}

// Funciones expuestas a window
window._evCambioRecord = (v) => cargarLista(v);
window._evEliminar = async (recordId, key, ruta) => {
  if (!confirm('¿Eliminar esta evidencia?')) return;
  try {
    await eliminarGitHub(ruta);
    await fbEliminarEvidencia(recordId, key);
    document.getElementById(`ev-${key}`)?.remove();
  } catch(e) {
    alert('Error al eliminar: ' + e.message);
  }
};

export {renderEvidencias};

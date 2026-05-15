import {C} from './config.js';
import {S} from './estado.js';
import {parseFecha, fmt, setLoading} from './utils.js';
import {actualizarPanelActivo} from './render.js';

// ── Campos obligatorios mínimos para considerar el CSV válido ─────────────
const CAMPOS_REQUERIDOS = [
  C.f.fecha, C.f.tipo, C.f.distrito, C.f.profesional, C.f.participantes
];

// ── Límites de validación ─────────────────────────────────────────────────
const MAX_FILE_MB  = 20;
const MAX_REGISTROS = 50000;

/**
 * Carga y parsea un fichero CSV exportado desde REDCap.
 * Valida el fichero antes de procesarlo y muestra errores descriptivos.
 * @param {File} file - Fichero seleccionado por el usuario
 */
function cargarCSV(file){
  // Validación de fichero antes de parsear
  const errorFichero = validarFichero(file);
  if(errorFichero){ mostrarError(errorFichero); return; }

  setLoading(true);
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    encoding: 'UTF-8',
    complete(r){
      if(r.errors && r.errors.length){
        // Errores de parseo no fatales: avisar pero continuar si hay datos
        const fatales = r.errors.filter(e => e.type === 'Delimiter' || !r.data.length);
        if(fatales.length){
          setLoading(false);
          mostrarError(`Error al parsear el CSV: ${fatales[0].message}`);
          return;
        }
        console.warn('Advertencias de parseo CSV:', r.errors);
      }
      const errDatos = validarDatos(r.data, r.meta.fields || []);
      if(errDatos){ setLoading(false); mostrarError(errDatos); return; }

      S.raw = r.data;
      postCarga();
    },
    error(e){
      setLoading(false);
      mostrarError(`No se pudo leer el fichero: ${e.message}`);
    }
  });
}

/**
 * Valida que el fichero cumpla los requisitos básicos (tipo, tamaño).
 * @param {File} file
 * @returns {string|null} Mensaje de error o null si es válido
 */
function validarFichero(file){
  if(!file) return 'No se ha seleccionado ningún fichero.';
  const ext = file.name.split('.').pop().toLowerCase();
  if(ext !== 'csv') return `Formato no admitido: .${ext}. Se requiere un fichero CSV exportado desde REDCap.`;
  const mb = file.size / 1024 / 1024;
  if(mb > MAX_FILE_MB) return `El fichero es demasiado grande (${mb.toFixed(1)} MB). Máximo permitido: ${MAX_FILE_MB} MB.`;
  if(file.size === 0) return 'El fichero está vacío.';
  return null;
}

/**
 * Valida que el contenido del CSV tenga los campos y datos mínimos.
 * @param {Object[]} datos - Filas parseadas
 * @param {string[]} campos - Cabeceras detectadas
 * @returns {string|null} Mensaje de error o null si es válido
 */
function validarDatos(datos, campos){
  if(!datos.length) return 'El CSV no contiene registros.';
  if(datos.length > MAX_REGISTROS)
    return `El CSV contiene ${datos.length.toLocaleString('es-ES')} registros. El máximo soportado es ${MAX_REGISTROS.toLocaleString('es-ES')}.`;

  // Campos obligatorios presentes en la cabecera
  const faltantes = CAMPOS_REQUERIDOS.filter(c => !campos.includes(c));
  if(faltantes.length){
    return `El CSV no parece ser un export de RAPS-REDCap. `
         + `Columnas no encontradas: ${faltantes.join(', ')}. `
         + `¿Has exportado desde el instrumento correcto?`;
  }

  // Al menos el 50% de filas deben tener fecha válida
  const conFecha = datos.filter(r => parseFecha(r[C.f.fecha])).length;
  if(conFecha < datos.length * 0.5){
    return `Solo ${conFecha} de ${datos.length} registros tienen fecha válida (DD/MM/AAAA). `
         + `Revisa el formato de exportación.`;
  }

  return null;
}

/**
 * Muestra un error de carga en la zona de bienvenida o como alerta.
 * @param {string} msg
 */
function mostrarError(msg){
  const bienvenida = document.getElementById('bienvenida');
  // Si la bienvenida está visible, mostrar el error allí
  if(bienvenida && bienvenida.style.display !== 'none'){
    let errDiv = document.getElementById('carga-error');
    if(!errDiv){
      errDiv = document.createElement('div');
      errDiv.id = 'carga-error';
      errDiv.style.cssText = 'margin-top:16px;padding:12px 16px;background:#fee;border:1px solid #dc143c;border-radius:8px;color:#a00;font-size:.85rem;max-width:520px;margin-left:auto;margin-right:auto';
      bienvenida.appendChild(errDiv);
    }
    errDiv.textContent = '⚠️ ' + msg;
    errDiv.style.display = 'block';
    setTimeout(() => { if(errDiv) errDiv.style.display = 'none'; }, 8000);
  } else {
    alert('⚠️ ' + msg);
  }
  console.error('[RAPS] Error de carga:', msg);
}

function postCarga(){
  poblarSelectores();
  aplicarFiltros();
  document.getElementById('bienvenida').style.display = 'none';
  document.getElementById('controles').style.display = 'block';
  // Limpiar error previo si lo había
  const errDiv = document.getElementById('carga-error');
  if(errDiv) errDiv.style.display = 'none';
  setLoading(false);
}

function poblarSelectores(){
  ['f-tipo','f-tema','f-prog'].forEach(id =>
    document.getElementById(id).innerHTML = '<option value="">Todos</option>');
  poblarSel('f-tipo', C.tipo);
  poblarSel('f-tema', C.tema);
  poblarSel('f-prog', C.prog);

  const su = document.getElementById('sel-unidad');
  su.innerHTML = '<option value="">— Todas —</option>';
  Object.entries(C.ugranada).forEach(([k,v]) => {
    const o = document.createElement('option');
    o.value = 'g-'+k; o.textContent = v+' (Granada)'; su.appendChild(o);
  });
  Object.entries(C.umetro).forEach(([k,v]) => {
    const o = document.createElement('option');
    o.value = 'm-'+k; o.textContent = v+' (Metro)'; su.appendChild(o);
  });

  const sp = document.getElementById('sel-prof');
  sp.innerHTML = '<option value="">— Todos —</option>';
  const profs = [...new Set(S.raw.map(r => r[C.f.profesional]).filter(Boolean))].sort();
  profs.forEach(p => {
    const o = document.createElement('option');
    o.value = p; o.textContent = p; sp.appendChild(o);
  });
}

function poblarSel(id, obj){
  const el = document.getElementById(id);
  Object.entries(obj).forEach(([k,v]) => {
    const o = document.createElement('option');
    o.value = k; o.textContent = v; el.appendChild(o);
  });
}

function aplicarFiltros(){
  const desde = document.getElementById('f-desde').value;
  const hasta  = document.getElementById('f-hasta').value;
  const tipo   = document.getElementById('f-tipo').value;
  const tema   = document.getElementById('f-tema').value;
  const prog   = document.getElementById('f-prog').value;
  const zona   = document.getElementById('f-zona').value;
  const busq   = document.getElementById('busqueda-tabla').value.toLowerCase();

  S.filtrados = S.raw.filter(r => {
    if(S.nivel==='granada' && String(r[C.f.distrito])!=='0') return false;
    if(S.nivel==='metro'   && String(r[C.f.distrito])!=='1') return false;
    if(S.nivel==='unidad'  && S.unidad){
      const [pref,id] = S.unidad.split('-');
      if(pref==='g'){
        if(String(r[C.f.distrito])!=='0' || String(r[C.f.u_granada])!==id) return false;
      } else {
        if(String(r[C.f.distrito])!=='1' || String(r[C.f.u_metro])!==id) return false;
      }
    }
    if(S.nivel==='profesional' && S.prof && r[C.f.profesional]!==S.prof) return false;
    if(desde){ const f=parseFecha(r[C.f.fecha]); if(!f||f<new Date(desde)) return false; }
    if(hasta){ const f=parseFecha(r[C.f.fecha]); if(!f||f>new Date(hasta)) return false; }
    if(tipo && String(r[C.f.tipo])!==tipo)          return false;
    if(tema && String(r[C.f.tematica])!==tema)      return false;
    if(prog && String(r[C.f.programa])!==prog)      return false;
    if(zona && String(r[C.f.zona])!==zona)          return false;
    if(busq && !(r[C.f.actividad]||'').toLowerCase().includes(busq)
            && !(r[C.f.profesional]||'').toLowerCase().includes(busq)) return false;
    return true;
  });

  S.pag = 1;
  actualizarInfoBanner();
  actualizarPanelActivo();
}

function actualizarInfoBanner(){
  const nivel = {
    global:      'Distrito Granada-Metropolitano',
    granada:     'Distrito Granada',
    metro:       'Distrito Metropolitano',
    unidad:      'Unidad seleccionada',
    profesional: 'Profesional seleccionado'
  };
  document.getElementById('info-nivel').innerHTML =
    `📌 ${nivel[S.nivel]} · <strong>${fmt(S.filtrados.length)}</strong> registros`;
}

export { cargarCSV, postCarga, poblarSelectores, poblarSel, aplicarFiltros, actualizarInfoBanner };

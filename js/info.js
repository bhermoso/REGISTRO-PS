import {C} from './config.js';
import {S} from './estado.js';
import {fmt, fmtD, pct, unidadNombreCompleto} from './utils.js';

const NIVEL_LABEL = {
  global:      'Distrito Granada-Metropolitano',
  granada:     'Distrito Granada',
  metro:       'Distrito Metropolitano',
  unidad:      'Unidad seleccionada',
  profesional: 'Profesional seleccionado',
};

/**
 * Abre el panel lateral de información y recalcula los KPIs del estado actual.
 */
function abrirInfoPanel(){
  actualizarKpis();
  document.getElementById('info-panel').classList.add('open');
  document.getElementById('info-panel').setAttribute('aria-hidden','false');
  document.getElementById('info-backdrop').classList.add('open');
  document.getElementById('btn-info').setAttribute('aria-expanded','true');
  // Foco al botón de cierre para accesibilidad
  setTimeout(()=>document.getElementById('btn-info-close').focus(), 350);
}

/**
 * Cierra el panel lateral de información.
 */
function cerrarInfoPanel(){
  document.getElementById('info-panel').classList.remove('open');
  document.getElementById('info-panel').setAttribute('aria-hidden','true');
  document.getElementById('info-backdrop').classList.remove('open');
  document.getElementById('btn-info').setAttribute('aria-expanded','false');
  document.getElementById('btn-info').focus();
}

/**
 * Recalcula y renderiza los KPIs del nivel y filtros activos en el panel.
 */
function actualizarKpis(){
  const d   = S.filtrados;
  const kEl = document.getElementById('ip-kpis');
  const nEl = document.getElementById('ip-nivel-label');

  // Etiqueta de nivel activo
  if(nEl) nEl.textContent = NIVEL_LABEL[S.nivel] || '';

  if(!d || !d.length){
    if(kEl) kEl.innerHTML = '<div class="ip-kpi-empty">Sin datos cargados. Carga un CSV o usa los datos de prueba.</div>';
    return;
  }

  const act   = d.length;
  const part  = d.reduce((s,r)=>s+(parseInt(r[C.f.participantes])||0),0);
  const hom   = d.reduce((s,r)=>s+(parseInt(r[C.f.hombres])||0),0);
  const muj   = d.reduce((s,r)=>s+(parseInt(r[C.f.mujeres])||0),0);
  const hrs   = d.reduce((s,r)=>s+(parseFloat(r[C.f.horas])||0),0);
  const ses   = d.reduce((s,r)=>s+(parseInt(r[C.f.sesiones])||0),0);
  const desf  = d.filter(r=>String(r[C.f.zona])==='1').length;
  const profs = new Set(d.map(r=>r[C.f.profesional]).filter(Boolean)).size;
  const unids = new Set(d.map(r=>unidadNombreCompleto(r))).size;
  const phora = hrs>0 ? part/hrs : 0;

  const kpis = [
    { v: fmt(act),        l: 'Actividades registradas', s: `${fmt(ses)} sesiones` },
    { v: fmt(part),       l: 'Participantes totales',   s: `♂ ${fmt(hom)}  ♀ ${fmt(muj)}` },
    { v: fmtD(hrs),       l: 'Horas de actividad',      s: act>0 ? fmtD(hrs/act)+' h/actividad' : '' },
    { v: pct(desf,act),   l: 'Actividades zona desf.',  s: `${fmt(desf)} de ${fmt(act)}` },
    { v: fmt(profs),      l: 'Profesionales activos',   s: '' },
    { v: fmt(unids),      l: 'Unidades con actividad',  s: '' },
    { v: act>0 ? fmtD(part/act) : '—', l: 'Participantes / actividad', s: '' },
    { v: phora>0 ? fmtD(phora) : '—',  l: 'Participantes / hora',      s: '' },
  ];

  if(kEl){
    kEl.innerHTML = kpis.map(k=>`
      <div class="ip-kpi-card">
        <div class="kv">${k.v}</div>
        <div class="kl">${k.l}</div>
        ${k.s?`<div class="ks">${k.s}</div>`:''}
      </div>`).join('');
  }
}

/**
 * Inicializa los event listeners del panel de información.
 * Llamar una vez desde DOMContentLoaded.
 */
function initInfoPanel(){
  document.getElementById('btn-info').addEventListener('click', abrirInfoPanel);
  document.getElementById('btn-info-close').addEventListener('click', cerrarInfoPanel);
  document.getElementById('info-backdrop').addEventListener('click', cerrarInfoPanel);

  // Cerrar con Escape
  document.addEventListener('keydown', e=>{
    if(e.key==='Escape' && document.getElementById('info-panel').classList.contains('open')){
      cerrarInfoPanel();
    }
  });
}

export { initInfoPanel, actualizarKpis };

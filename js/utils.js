import {C} from './config.js';
import {S} from './estado.js';

/**
 * Convierte una cadena "DD/MM/AAAA" en objeto Date.
 * @param {string} s - Fecha en formato DD/MM/AAAA
 * @returns {Date|null} Objeto Date o null si el formato no es válido
 */
function parseFecha(s){
  if(!s) return null;
  const p = String(s).split('/');
  return p.length===3 ? new Date(p[2], p[1]-1, p[0]) : null;
}

/**
 * Formatea una fecha "DD/MM/AAAA" con localización española.
 * @param {string} s - Fecha en formato DD/MM/AAAA
 * @returns {string} Fecha formateada o '-' si es inválida
 */
function fmtFecha(s){ const f=parseFecha(s); return f?f.toLocaleDateString('es-ES'):'-'; }

/** Convierte a entero; devuelve 0 si no es un número válido. @param {*} v @returns {number} */
function n(v){ return parseInt(v)||0; }

/** Convierte a flotante; devuelve 0 si no es un número válido. @param {*} v @returns {number} */
function nf(v){ return parseFloat(v)||0; }

/**
 * Formatea un número con separadores de miles en español.
 * @param {number} v @returns {string}
 */
function fmt(v){ return Number(v).toLocaleString('es-ES'); }

/**
 * Formatea un número con 1 decimal en español.
 * @param {number} v @returns {string}
 */
function fmtD(v){ return Number(v).toLocaleString('es-ES',{minimumFractionDigits:1,maximumFractionDigits:1}); }

/**
 * Calcula porcentaje de a sobre b; devuelve '—' si b es 0.
 * @param {number} a @param {number} b @returns {string}
 */
function pct(a,b){ return b>0?((a/b)*100).toFixed(1)+'%':'—'; }

/**
 * Devuelve el color de la paleta COMPAS para el índice dado (cíclico).
 * @param {number} i @returns {string} Color CSS
 */
function colPal(i){ return C.PAL[i%C.PAL.length]; }

/**
 * Devuelve el color claro de la paleta COMPAS para el índice dado (cíclico).
 * @param {number} i @returns {string} Color CSS con opacidad
 */
function colPalL(i){ return C.PAL_L[i%C.PAL_L.length]; }

/**
 * Devuelve el nombre corto de la unidad asistencial de una fila.
 * @param {Object} row - Fila de datos REDCap
 * @returns {string}
 */
function unidadNombre(row){
  const d = String(row[C.f.distrito]);
  if(d==='0') return C.ugranada[String(row[C.f.u_granada])]||'Sin unidad';
  if(d==='1') return C.umetro[String(row[C.f.u_metro])]||'Sin unidad';
  return 'Sin unidad';
}

/**
 * Devuelve el nombre completo de la unidad con sufijo de distrito.
 * @param {Object} row - Fila de datos REDCap
 * @returns {string}
 */
function unidadNombreCompleto(row){
  const d = String(row[C.f.distrito]);
  const nombre = unidadNombre(row);
  return nombre+(d==='0'?' (Granada)':d==='1'?' (Metro)':'');
}

/**
 * Destruye un gráfico Chart.js registrado en el estado global.
 * @param {string} id - ID del canvas
 */
function destroyChart(id){
  if(S.charts[id]){ S.charts[id].destroy(); delete S.charts[id]; }
}

/**
 * Crea un gráfico Chart.js, destruyendo el anterior si existía.
 * @param {string} id - ID del canvas
 * @param {Object} cfg - Configuración Chart.js
 */
function makeChart(id,cfg){
  destroyChart(id);
  const ctx = document.getElementById(id);
  if(!ctx) return;
  S.charts[id] = new Chart(ctx,cfg);
}

/**
 * Genera el HTML de un ranking de barras proporcionales.
 * @param {Array<{k:string,v:number}>} data - Datos ordenados desc.
 * @param {function(number):string} colorFn - Función de color por índice
 * @returns {string} HTML
 */
function rankHTML(data,colorFn){
  if(!data.length) return '<p style="color:var(--sub);text-align:center;padding:16px">Sin datos</p>';
  const max = data[0].v;
  return data.map((d,i)=>`
    <div class="rank-item">
      <div class="rank-pos">${i+1}</div>
      <div class="rank-bar-wrap">
        <div class="rank-name">${d.k}</div>
        <div class="rank-bar"><div class="rank-fill" style="width:${(d.v/max*100).toFixed(1)}%;background:${colorFn(i)}"></div></div>
      </div>
      <div class="rank-val">${fmt(d.v)}</div>
    </div>`).join('');
}

/**
 * Cuenta registros agrupados por un campo, con lookup de etiquetas.
 * @param {Object[]} datos @param {string} campo @param {Object} lookup
 * @returns {Array<{k:string,v:number}>} Ordenado desc.
 */
function contarPor(datos,campo,lookup){
  const c = {};
  datos.forEach(r=>{ const k=String(r[campo]); c[k]=(c[k]||0)+1; });
  return Object.entries(c).map(([k,v])=>({k:lookup[k]||k,v})).sort((a,b)=>b.v-a.v);
}

/**
 * Suma un campo numérico agrupado por otro campo, con lookup de etiquetas.
 * @param {Object[]} datos @param {string} campo @param {Object} lookup @param {string} campoVal
 * @returns {Array<{k:string,v:number}>} Ordenado desc.
 */
function sumarPor(datos,campo,lookup,campoVal){
  const c = {};
  datos.forEach(r=>{ const k=String(r[campo]); c[k]=(c[k]||0)+nf(r[campoVal]); });
  return Object.entries(c).map(([k,v])=>({k:lookup[k]||k,v:Math.round(v)})).sort((a,b)=>b.v-a.v);
}

/**
 * Renderiza un gráfico de barras horizontal (hbar) con la paleta COMPAS.
 * @param {string} id - ID del canvas
 * @param {Array<{k:string,v:number}>} data - Datos con etiqueta y valor
 */
function hbarChart(id,data){
  makeChart(id,{
    type:'bar',
    data:{
      labels: data.map(d=>d.k),
      datasets:[{
        data: data.map(d=>d.v),
        backgroundColor: data.map((_,i)=>colPal(i)),
        borderRadius: 4
      }]
    },
    options:{
      indexAxis:'y', responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{x:{beginAtZero:true}, y:{ticks:{font:{size:10}}}}
    }
  });
}

/**
 * Calcula el índice de diversidad temática de Shannon normalizado (0–1).
 * Mayor valor indica mayor variedad de temáticas abordadas.
 * @param {Object[]} d - Array de registros filtrados
 * @returns {number} Índice entre 0 y 1
 */
function calcDiversidad(d){
  if(!d.length) return 0;
  const c = {};
  d.forEach(r=>{ const k=r[C.f.tematica]; c[k]=(c[k]||0)+1; });
  const vals = Object.values(c);
  const tot  = vals.reduce((a,b)=>a+b,0);
  const H    = -vals.reduce((s,v)=>{ const p=v/tot; return s+p*Math.log(p); },0);
  const Hmax = Math.log(Object.keys(c).length||1);
  return Hmax>0 ? H/Hmax : 0;
}

/**
 * Muestra u oculta el indicador de carga a pantalla completa.
 * @param {boolean} v - true para mostrar, false para ocultar
 */
function setLoading(v){ document.getElementById('loading').style.display=v?'flex':'none'; }

export { parseFecha, fmtFecha, n, nf, fmt, fmtD, pct, colPal, colPalL,
         unidadNombre, unidadNombreCompleto, destroyChart, makeChart,
         hbarChart, calcDiversidad, rankHTML, contarPor, sumarPor, setLoading };

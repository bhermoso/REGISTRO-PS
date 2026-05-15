import {C} from '../config.js';
import {S} from '../estado.js';
import {parseFecha, fmtFecha, n, nf, fmt, fmtD, pct,
        colPal, colPalL, unidadNombre, unidadNombreCompleto,
        destroyChart, makeChart, hbarChart, rankHTML, contarPor, sumarPor} from '../utils.js';

function renderProgramas(){
  const d=S.filtrados;
  const progs=contarPor(d,C.f.programa,C.prog).slice(0,15);
  const temas=contarPor(d,C.f.tematica,C.tema).slice(0,15);
  const tipos=contarPor(d,C.f.tipo,C.tipo).slice(0,12);

  // Tabla estadísticas por programa
  const pStat={};
  d.forEach(r=>{
    const k=C.prog[r[C.f.programa]]||'Otros';
    if(!pStat[k])pStat[k]={act:0,part:0,hrs:0};
    pStat[k].act++;pStat[k].part+=n(r[C.f.participantes]);pStat[k].hrs+=nf(r[C.f.horas]);
  });
  const pArr=Object.entries(pStat).sort((a,b)=>b[1].act-a[1].act).slice(0,15);

  document.getElementById('tabla-programas').innerHTML=`
    <table style="width:100%;font-size:.78rem">
      <thead><tr><th>Programa</th><th>Activ.</th><th>Part.</th><th>Horas</th><th>Part/h</th></tr></thead>
      <tbody>${pArr.map(([k,v])=>`<tr><td>${k}</td><td>${fmt(v.act)}</td><td>${fmt(v.part)}</td><td>${fmtD(v.hrs)}</td><td>${v.hrs>0?fmtD(v.part/v.hrs):'—'}</td></tr>`).join('')}</tbody>
    </table>`;

  setTimeout(()=>{hbarChart('ch-programas',progs);hbarChart('ch-tematicas',temas);hbarChart('ch-tipos',tipos);},0);
}

export { renderProgramas };

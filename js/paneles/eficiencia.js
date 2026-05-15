import {C} from '../config.js';
import {S} from '../estado.js';
import {parseFecha, fmtFecha, n, nf, fmt, fmtD, pct,
        colPal, colPalL, unidadNombre, unidadNombreCompleto,
        destroyChart, makeChart, hbarChart, calcDiversidad,
        rankHTML, contarPor, sumarPor} from '../utils.js';

function renderEficiencia(){
  const d=S.filtrados;
  const act=d.length;
  const part=d.reduce((s,r)=>s+n(r[C.f.participantes]),0);
  const hrs=d.reduce((s,r)=>s+nf(r[C.f.horas]),0);
  const ses=d.reduce((s,r)=>s+n(r[C.f.sesiones]),0);
  const ph=hrs>0?fmtD(part/hrs):'—';
  const pa=act>0?fmtD(part/act):'—';
  const ha=act>0?fmtD(hrs/act):'—';
  const spa=ses>0?fmtD(part/ses):'—';
  const hps=ses>0?fmtD(hrs/ses):'—';
  const div=calcDiversidad(d);

  document.getElementById('kpis-ef').innerHTML=`
    <div class="kpi"><div class="ico">⚡</div><div class="val">${ph}</div><div class="lbl">Participantes/hora</div></div>
    <div class="kpi"><div class="ico">👥</div><div class="val">${pa}</div><div class="lbl">Participantes/actividad</div></div>
    <div class="kpi"><div class="ico">⏱️</div><div class="val">${ha}</div><div class="lbl">Horas/actividad</div></div>
    <div class="kpi"><div class="ico">🎯</div><div class="val">${spa}</div><div class="lbl">Participantes/sesión</div></div>
    <div class="kpi"><div class="ico">📅</div><div class="val">${hps}</div><div class="lbl">Horas/sesión</div></div>
    <div class="kpi"><div class="ico">🌈</div><div class="val">${fmtD(div)}</div><div class="lbl">Índice diversidad temática</div><div class="sub">0–1 (mayor = más diverso)</div></div>`;

  // Por tipo de actividad
  const byTipo={};
  d.forEach(r=>{
    const k=C.tipo[r[C.f.tipo]]||'Otros';
    if(!byTipo[k])byTipo[k]={act:0,part:0,hrs:0};
    byTipo[k].act++;byTipo[k].part+=n(r[C.f.participantes]);byTipo[k].hrs+=nf(r[C.f.horas]);
  });
  const tipoEf=Object.entries(byTipo).filter(([,v])=>v.hrs>0).map(([k,v])=>({k,v:parseFloat((v.part/v.hrs).toFixed(1))})).sort((a,b)=>b.v-a.v).slice(0,10);
  const tipoHa=Object.entries(byTipo).filter(([,v])=>v.act>0).map(([k,v])=>({k,v:parseFloat((v.hrs/v.act).toFixed(1))})).sort((a,b)=>b.v-a.v).slice(0,10);
  const tipoSes=Object.entries(byTipo).filter(([,v])=>v.act>0).map(([k,v])=>({k,v:parseFloat((v.part/v.act).toFixed(0))})).sort((a,b)=>b.v-a.v).slice(0,10);

  // Por unidad — eficiencia
  const byUnid={};
  d.forEach(r=>{const u=unidadNombreCompleto(r);if(!byUnid[u])byUnid[u]={act:0,part:0,hrs:0};byUnid[u].act++;byUnid[u].part+=n(r[C.f.participantes]);byUnid[u].hrs+=nf(r[C.f.horas]);});
  const uEf=Object.entries(byUnid).filter(([,v])=>v.hrs>0).map(([k,v])=>({k,v:parseFloat((v.part/v.hrs).toFixed(1))})).sort((a,b)=>b.v-a.v).slice(0,15);

  // Por programa — horas totales
  const byProgH=Object.entries(C.prog).map(k=>{const tot=d.filter(r=>String(r[C.f.programa])===k[0]).reduce((s,r)=>s+nf(r[C.f.horas]),0);return{k:k[1],v:Math.round(tot)};}).filter(x=>x.v>0).sort((a,b)=>b.v-a.v).slice(0,10);

  document.getElementById('rank-ef-unid').innerHTML=rankHTML(uEf,colPal);
  document.getElementById('rank-ef-prog').innerHTML=rankHTML(byProgH,(i)=>C.PAL[i%6]);

  setTimeout(()=>{hbarChart('ch-ef-tipo',tipoEf);hbarChart('ch-ef-sesion',tipoSes);hbarChart('ch-ef-horas',tipoHa);},0);
}

export { renderEficiencia };

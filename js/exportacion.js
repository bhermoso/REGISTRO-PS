import {C} from './config.js';
import {S} from './estado.js';
import {fmtFecha} from './utils.js';

function expCSV(){
  if(!S.filtrados.length){alert('Sin datos para exportar.');return;}
  const csv=Papa.unparse(S.filtrados);
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));
  a.download=`RAPS_${new Date().toISOString().split('T')[0]}.csv`;a.click();
}

function expXLSX(){
  if(!S.filtrados.length){alert('Sin datos para exportar.');return;}
  const wb=XLSX.utils.book_new();
  const ws=XLSX.utils.json_to_sheet(S.filtrados);
  XLSX.utils.book_append_sheet(wb,ws,'Datos');
  XLSX.writeFile(wb,`RAPS_${new Date().toISOString().split('T')[0]}.xlsx`);
}

function expPDF(){
  const d=S.filtrados;
  if(!d.length){alert('Sin datos para exportar.');return;}
  const act=d.length,part=d.reduce((s,r)=>s+n(r[C.f.participantes]),0);
  const hrs=d.reduce((s,r)=>s+nf(r[C.f.horas]),0),ses=d.reduce((s,r)=>s+n(r[C.f.sesiones]),0);
  const hom=d.reduce((s,r)=>s+n(r[C.f.hombres]),0),muj=d.reduce((s,r)=>s+n(r[C.f.mujeres]),0);
  const profs=new Set(d.map(r=>r[C.f.profesional]).filter(Boolean)).size;
  const desf=d.filter(r=>String(r[C.f.zona])==='1').length;
  const fecha=new Date().toLocaleDateString('es-ES',{year:'numeric',month:'long',day:'numeric'});

  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>body{font-family:Arial,sans-serif;color:#334155;padding:32px}
  h1{font-size:20px;color:#0074c8;margin-bottom:4px}
  .sub{font-size:12px;color:#64748b;margin-bottom:24px}
  table{width:100%;border-collapse:collapse;margin-bottom:20px;font-size:12px}
  th{background:#f1f5f9;padding:7px 10px;text-align:left;color:#1b365d}
  td{padding:6px 10px;border-bottom:1px solid #e2e8f0}
  .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
  .kpi{border:1px solid #e2e8f0;border-left:4px solid #0074c8;border-radius:6px;padding:10px 12px}
  .kpi .v{font-size:18px;font-weight:bold;color:#1b365d}
  .kpi .l{font-size:10px;color:#64748b;text-transform:uppercase}</style></head>
  <body>
  <h1>RAPS · DGRAMET — Informe de Actuaciones</h1>
  <div class="sub">Generado el ${fecha} · ${act} registros</div>
  <div class="kpi-grid">
    <div class="kpi"><div class="v">${fmt(act)}</div><div class="l">Actividades</div></div>
    <div class="kpi"><div class="v">${fmt(part)}</div><div class="l">Participantes</div></div>
    <div class="kpi"><div class="v">${fmtD(hrs)}</div><div class="l">Horas totales</div></div>
    <div class="kpi"><div class="v">${fmt(ses)}</div><div class="l">Sesiones</div></div>
    <div class="kpi"><div class="v">${fmt(hom)}</div><div class="l">Hombres</div></div>
    <div class="kpi"><div class="v">${fmt(muj)}</div><div class="l">Mujeres</div></div>
    <div class="kpi"><div class="v">${fmt(profs)}</div><div class="l">Profesionales</div></div>
    <div class="kpi"><div class="v">${fmt(desf)}</div><div class="l">Act. zona desf.</div></div>
  </div>
  <h2 style="font-size:14px;color:#0074c8;margin-bottom:8px">Principales programas</h2>
  <table><thead><tr><th>Programa</th><th>Actividades</th><th>Participantes</th></tr></thead>
  <tbody>${contarPor(d,C.f.programa,C.prog).slice(0,10).map(x=>{const pp=d.filter(r=>C.prog[r[C.f.programa]]===x.k).reduce((s,r)=>s+n(r[C.f.participantes]),0);return`<tr><td>${x.k}</td><td>${fmt(x.v)}</td><td>${fmt(pp)}</td></tr>`;}).join('')}</tbody></table>
  <h2 style="font-size:14px;color:#0074c8;margin-bottom:8px">Principales temáticas</h2>
  <table><thead><tr><th>Temática</th><th>Actividades</th></tr></thead>
  <tbody>${contarPor(d,C.f.tematica,C.tema).slice(0,10).map(x=>`<tr><td>${x.k}</td><td>${fmt(x.v)}</td></tr>`).join('')}</tbody></table>
  </body></html>`;

  const w=window.open('','_blank');
  w.document.write(html);w.document.close();
  setTimeout(()=>w.print(),300);
}

export { expCSV, expXLSX, expPDF };

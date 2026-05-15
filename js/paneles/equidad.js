import {C} from '../config.js';
import {S} from '../estado.js';
import {parseFecha, fmtFecha, n, nf, fmt, fmtD, pct,
        colPal, colPalL, unidadNombre, unidadNombreCompleto,
        destroyChart, makeChart, hbarChart,
        rankHTML, contarPor, sumarPor} from '../utils.js';

function renderBrechas(){
  const d=S.filtrados;
  const desf=d.filter(r=>String(r[C.f.zona])==='1');
  const noDesf=d.filter(r=>String(r[C.f.zona])!=='1');
  const pDes=desf.reduce((s,r)=>s+n(r[C.f.participantes]),0);
  const pNoDes=noDesf.reduce((s,r)=>s+n(r[C.f.participantes]),0);
  const hDes=desf.reduce((s,r)=>s+nf(r[C.f.horas]),0);
  const hNoDes=noDesf.reduce((s,r)=>s+nf(r[C.f.horas]),0);
  const ef_des=hDes>0?fmtD(pDes/hDes):'—';
  const ef_no=hNoDes>0?fmtD(pNoDes/hNoDes):'—';

  document.getElementById('kpis-brechas').innerHTML=`
    <div class="kpi"><div class="ico">🏘️</div><div class="val">${fmt(desf.length)}</div><div class="lbl">Act. zona desf.</div><div class="sub">${pct(desf.length,d.length)}</div></div>
    <div class="kpi"><div class="ico">🌍</div><div class="val">${fmt(noDesf.length)}</div><div class="lbl">Act. zona no desf.</div><div class="sub">${pct(noDesf.length,d.length)}</div></div>
    <div class="kpi"><div class="ico">⚡</div><div class="val">${ef_des}</div><div class="lbl">Part./hora (desf.)</div></div>
    <div class="kpi"><div class="ico">📊</div><div class="val">${ef_no}</div><div class="lbl">Part./hora (no desf.)</div></div>`;

  // Brecha por unidad
  const uBr={};
  d.forEach(r=>{
    const u=unidadNombreCompleto(r);
    if(!uBr[u])uBr[u]={tot:0,des:0};
    uBr[u].tot++;
    if(String(r[C.f.zona])==='1')uBr[u].des++;
  });
  const uBrArr=Object.entries(uBr).filter(([,v])=>v.tot>=3).map(([k,v])=>({k,pct:Math.round(v.des/v.tot*100),des:v.des,tot:v.tot})).sort((a,b)=>b.pct-a.pct);
  document.getElementById('brecha-unidades').innerHTML=`
    <table style="width:100%;font-size:.78rem">
      <thead><tr><th>Unidad</th><th>Total act.</th><th>Zona desf.</th><th>% desf.</th><th></th></tr></thead>
      <tbody>${uBrArr.map(x=>`<tr><td>${x.k}</td><td>${x.tot}</td><td>${x.des}</td><td>${x.pct}%</td><td><div class="prog-bar" style="width:80px;display:inline-block"><div class="prog-fill" style="width:${x.pct}%"></div></div></td></tr>`).join('')}</tbody>
    </table>`;

  // Programas en zonas desfavorecidas
  const progDesf=contarPor(desf,C.f.programa,C.prog).slice(0,10);

  setTimeout(()=>{
    makeChart('ch-brechas-act',{type:'bar',data:{labels:['Zona desfavorecida','Zona no desfavorecida'],datasets:[{data:[desf.length,noDesf.length],backgroundColor:[C.PAL[4],C.PAL[2]],borderRadius:6}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}});
    makeChart('ch-brechas-part',{type:'bar',data:{labels:['Zona desfavorecida','Zona no desfavorecida'],datasets:[{data:[pDes,pNoDes],backgroundColor:[C.PAL_L[4],C.PAL_L[2]],borderColor:[C.PAL[4],C.PAL[2]],borderWidth:2,borderRadius:6}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}});
    hbarChart('ch-prog-desf',progDesf);
  },0);
}

export { renderBrechas };

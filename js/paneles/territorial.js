import {C} from '../config.js';
import {S} from '../estado.js';
import {parseFecha, fmtFecha, n, nf, fmt, fmtD, pct,
        colPal, colPalL, unidadNombre, unidadNombreCompleto,
        destroyChart, makeChart, hbarChart,
        rankHTML, contarPor, sumarPor} from '../utils.js';

function renderTerritorial(){
  const d=S.filtrados;
  const g=d.filter(r=>String(r[C.f.distrito])==='0');
  const m=d.filter(r=>String(r[C.f.distrito])==='1');

  const rankUA={};
  d.forEach(r=>{const u=unidadNombreCompleto(r);if(!rankUA[u])rankUA[u]={act:0,part:0};rankUA[u].act++;rankUA[u].part+=n(r[C.f.participantes]);});
  const ruA=Object.entries(rankUA).map(([k,v])=>({k,v:v.act})).sort((a,b)=>b.v-a.v).slice(0,15);
  const ruP=Object.entries(rankUA).map(([k,v])=>({k,v:v.part})).sort((a,b)=>b.v-a.v).slice(0,15);

  document.getElementById('rank-unid-act').innerHTML=rankHTML(ruA,colPal);
  document.getElementById('rank-unid-part').innerHTML=rankHTML(ruP,colPal);

  setTimeout(()=>{
    makeChart('ch-distritos',{type:'bar',data:{labels:['Distrito Granada','Distrito Metropolitano'],datasets:[{label:'Actividades',data:[g.length,m.length],backgroundColor:[C.PAL[0],C.PAL[1]],borderRadius:6},{label:'Participantes',data:[g.reduce((s,r)=>s+n(r[C.f.participantes]),0),m.reduce((s,r)=>s+n(r[C.f.participantes]),0)],backgroundColor:[C.PAL_L[0],C.PAL_L[1]],borderRadius:6}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}},scales:{y:{beginAtZero:true}}}});

    const gPart=g.reduce((s,r)=>s+n(r[C.f.participantes]),0);
    const mPart=m.reduce((s,r)=>s+n(r[C.f.participantes]),0);
    makeChart('ch-dist-part',{type:'doughnut',data:{labels:['Granada','Metropolitano'],datasets:[{data:[gPart,mPart],backgroundColor:[C.PAL[0],C.PAL[1]],borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}}});

    // Unidades Granada
    const uG={};g.forEach(r=>{const u=C.ugranada[String(r[C.f.u_granada])]||'Otras';uG[u]=(uG[u]||0)+1;});
    const uGArr=Object.entries(uG).map(([k,v])=>({k,v})).sort((a,b)=>b.v-a.v);
    hbarChart('ch-ugranada',uGArr);

    const uM={};m.forEach(r=>{const u=C.umetro[String(r[C.f.u_metro])]||'Otras';uM[u]=(uM[u]||0)+1;});
    const uMArr=Object.entries(uM).map(([k,v])=>({k,v})).sort((a,b)=>b.v-a.v);
    hbarChart('ch-umetro',uMArr);
  },0);
}

export { renderTerritorial };

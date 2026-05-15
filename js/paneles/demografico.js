import {C} from '../config.js';
import {S} from '../estado.js';
import {parseFecha, fmtFecha, n, nf, fmt, fmtD, pct,
        colPal, colPalL, unidadNombre, unidadNombreCompleto,
        destroyChart, makeChart, hbarChart, rankHTML, contarPor, sumarPor} from '../utils.js';

function renderDemografico(){
  const d=S.filtrados;
  const hom=d.reduce((s,r)=>s+n(r[C.f.hombres]),0);
  const muj=d.reduce((s,r)=>s+n(r[C.f.mujeres]),0);
  const tot=hom+muj;
  const desf=d.filter(r=>String(r[C.f.zona])==='1').length;
  const noDesf=d.length-desf;

  document.getElementById('kpis-demo').innerHTML=`
    <div class="kpi"><div class="ico">♂️</div><div class="val">${fmt(hom)}</div><div class="lbl">Hombres</div><div class="sub">${pct(hom,tot)}</div></div>
    <div class="kpi"><div class="ico">♀️</div><div class="val">${fmt(muj)}</div><div class="lbl">Mujeres</div><div class="sub">${pct(muj,tot)}</div></div>
    <div class="kpi"><div class="ico">🏘️</div><div class="val">${fmt(desf)}</div><div class="lbl">Act. zona desf.</div><div class="sub">${pct(desf,d.length)}</div></div>
    <div class="kpi"><div class="ico">🌍</div><div class="val">${fmt(noDesf)}</div><div class="lbl">Act. zona no desf.</div><div class="sub">${pct(noDesf,d.length)}</div></div>`;

  setTimeout(()=>{
    makeChart('ch-sexo',{type:'doughnut',data:{labels:['Hombres','Mujeres'],datasets:[{data:[hom,muj],backgroundColor:[C.PAL[0],C.PAL[4]],borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}}});

    const pob=contarPor(d,C.f.poblacion,C.poblacion).slice(0,10);
    hbarChart('ch-pob',pob);

    makeChart('ch-zona',{type:'doughnut',data:{labels:['Desfavorecida','No desfavorecida'],datasets:[{data:[desf,noDesf],backgroundColor:[C.PAL[4],C.PAL[2]],borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}}});

    const lugar=contarPor(d,C.f.lugar,C.lugar).slice(0,10);
    hbarChart('ch-lugar',lugar);

    const hor=contarPor(d,C.f.horario,C.horario);
    makeChart('ch-horario',{type:'pie',data:{labels:hor.map(x=>x.k),datasets:[{data:hor.map(x=>x.v),backgroundColor:C.PAL,borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}}});
  },0);
}

export { renderDemografico };

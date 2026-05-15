import {C} from '../config.js';
import {S} from '../estado.js';
import {parseFecha, fmtFecha, n, nf, fmt, fmtD, pct,
        colPal, colPalL, unidadNombre, unidadNombreCompleto,
        destroyChart, makeChart, hbarChart, rankHTML, contarPor, sumarPor} from '../utils.js';

function renderProfesional(){
  const d=S.filtrados;
  const byProf={};
  d.forEach(r=>{
    const p=r[C.f.profesional]||'Sin nombre';
    if(!byProf[p])byProf[p]={act:0,part:0,hrs:0};
    byProf[p].act++;byProf[p].part+=n(r[C.f.participantes]);byProf[p].hrs+=nf(r[C.f.horas]);
  });

  const rA=Object.entries(byProf).map(([k,v])=>({k,v:v.act})).sort((a,b)=>b.v-a.v).slice(0,15);
  const rP=Object.entries(byProf).map(([k,v])=>({k,v:v.part})).sort((a,b)=>b.v-a.v).slice(0,15);
  const rH=Object.entries(byProf).map(([k,v])=>({k,v:Math.round(v.hrs)})).sort((a,b)=>b.v-a.v).slice(0,15);
  const rEf=Object.entries(byProf).filter(([,v])=>v.hrs>0).map(([k,v])=>({k,v:parseFloat((v.part/v.hrs).toFixed(1))})).sort((a,b)=>b.v-a.v).slice(0,15);

  document.getElementById('rank-prof-act').innerHTML=rankHTML(rA,colPal);
  document.getElementById('rank-prof-part').innerHTML=rankHTML(rP,(i)=>C.PAL[1]);
  document.getElementById('rank-prof-horas').innerHTML=rankHTML(rH,(i)=>C.PAL[2]);
  document.getElementById('rank-prof-ef').innerHTML=rankHTML(rEf,(i)=>C.PAL[4]);

  setTimeout(()=>{
    const cat=contarPor(d,C.f.categoria,C.categoria).slice(0,10);
    hbarChart('ch-categoria',cat);

    const esp=contarPor(d.filter(r=>r[C.f.especialidad]),C.f.especialidad,C.especialidad);
    hbarChart('ch-espec',esp);

    const sx=contarPor(d,C.f.sexo_prof,{0:'Mujer',1:'Hombre'});
    makeChart('ch-sexo-prof',{type:'doughnut',data:{labels:sx.map(x=>x.k),datasets:[{data:sx.map(x=>x.v),backgroundColor:[C.PAL[4],C.PAL[0]],borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}}});
  },0);
}

export { renderProfesional };

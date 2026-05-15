import {C} from '../config.js';
import {S} from '../estado.js';
import {parseFecha, fmtFecha, n, nf, fmt, fmtD, pct,
        colPal, colPalL, unidadNombre, unidadNombreCompleto,
        destroyChart, makeChart, rankHTML, contarPor, sumarPor} from '../utils.js';

function renderTemporal(){
  const d=S.filtrados;
  const porMes={},porMesPart={};
  d.forEach(r=>{
    const f=parseFecha(r[C.f.fecha]);
    if(!f)return;
    const k=`${f.getFullYear()}-${String(f.getMonth()+1).padStart(2,'0')}`;
    porMes[k]=(porMes[k]||0)+1;
    porMesPart[k]=(porMesPart[k]||0)+n(r[C.f.participantes]);
  });
  const meses=Object.keys(porMes).sort();

  setTimeout(()=>{
    makeChart('ch-mensual',{type:'line',data:{labels:meses,datasets:[
      {label:'Actividades',data:meses.map(m=>porMes[m]),borderColor:C.PAL[0],backgroundColor:C.PAL_L[0],tension:.4,fill:true,yAxisID:'y1'},
      {label:'Participantes',data:meses.map(m=>porMesPart[m]),borderColor:C.PAL[4],backgroundColor:C.PAL_L[4],tension:.4,fill:true,yAxisID:'y2'}
    ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}},scales:{y1:{beginAtZero:true,position:'left'},y2:{beginAtZero:true,position:'right',grid:{drawOnChartArea:false}}}}});

    // Trimestral
    const tQ={Q1:0,Q2:0,Q3:0,Q4:0};
    d.forEach(r=>{const f=parseFecha(r[C.f.fecha]);if(!f)return;const q='Q'+(Math.floor(f.getMonth()/3)+1);tQ[q]++;});
    makeChart('ch-trimestre',{type:'bar',data:{labels:['T1','T2','T3','T4'],datasets:[{data:[tQ.Q1,tQ.Q2,tQ.Q3,tQ.Q4],backgroundColor:C.PAL,borderRadius:6}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}});

    // Por mes (1-12)
    const mNum=Array(12).fill(0);
    d.forEach(r=>{const f=parseFecha(r[C.f.fecha]);if(f)mNum[f.getMonth()]++;});
    const mNom=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    makeChart('ch-mes',{type:'bar',data:{labels:mNom,datasets:[{data:mNum,backgroundColor:mNum.map((_,i)=>C.PAL[i%6]),borderRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}});

    // Día de la semana
    const dSem=Array(7).fill(0);
    d.forEach(r=>{const f=parseFecha(r[C.f.fecha]);if(f)dSem[f.getDay()]++;});
    const dNom=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
    makeChart('ch-diasem',{type:'bar',data:{labels:dNom,datasets:[{data:dSem,backgroundColor:dSem.map((_,i)=>C.PAL[i%6]),borderRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}});

    // Heatmap año × mes
    renderHeatmap(d);
  },0);
}

function renderHeatmap(d){
  const byAnoMes={};
  d.forEach(r=>{
    const f=parseFecha(r[C.f.fecha]);
    if(!f)return;
    const a=f.getFullYear(),m=f.getMonth();
    if(!byAnoMes[a])byAnoMes[a]=Array(12).fill(0);
    byAnoMes[a][m]++;
  });
  const anos=Object.keys(byAnoMes).sort();
  if(!anos.length){document.getElementById('heatmap-wrap').innerHTML='<p style="color:var(--sub);font-size:.8rem">Sin datos</p>';return;}
  const max=Math.max(...anos.flatMap(a=>byAnoMes[a]));
  const mNom=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  let html='<div style="display:grid;gap:6px">';
  // Header
  html+=`<div style="display:grid;grid-template-columns:48px repeat(12,1fr);gap:4px">${'<div></div>'+mNom.map(m=>`<div style="text-align:center;font-size:.65rem;color:var(--sub);font-weight:700">${m}</div>`).join('')}</div>`;
  anos.forEach(a=>{
    html+=`<div style="display:grid;grid-template-columns:48px repeat(12,1fr);gap:4px">`;
    html+=`<div style="font-size:.72rem;font-weight:700;color:var(--sub);display:flex;align-items:center">${a}</div>`;
    byAnoMes[a].forEach((v,i)=>{
      const op=max>0?(v/max*.7+.08).toFixed(2):'0';
      const col=C.PAL[i%6];
      html+=`<div class="hm-cell" style="background:${col};opacity:${op}" title="${mNom[i]} ${a}: ${v} act.">${v||''}</div>`;
    });
    html+='</div>';
  });
  html+='</div>';
  document.getElementById('heatmap-wrap').innerHTML=html;
}

export { renderTemporal, renderHeatmap };

import {C} from '../config.js';
import {S} from '../estado.js';
import {parseFecha, fmtFecha, n, nf, fmt, fmtD, pct,
        colPal, colPalL, unidadNombre, unidadNombreCompleto,
        destroyChart, makeChart, hbarChart, calcDiversidad,
        rankHTML, contarPor, sumarPor} from '../utils.js';

function renderDashboard(){
  const d=S.filtrados;
  const act=d.length;
  const part=d.reduce((s,r)=>s+n(r[C.f.participantes]),0);
  const hom=d.reduce((s,r)=>s+n(r[C.f.hombres]),0);
  const muj=d.reduce((s,r)=>s+n(r[C.f.mujeres]),0);
  const hrs=d.reduce((s,r)=>s+nf(r[C.f.horas]),0);
  const ses=d.reduce((s,r)=>s+n(r[C.f.sesiones]),0);
  const profs=new Set(d.map(r=>r[C.f.profesional]).filter(Boolean)).size;
  const unids=new Set(d.map(r=>unidadNombre(r))).size;
  const desf=d.filter(r=>String(r[C.f.zona])==='1').length;

  const kData=[
    {ico:'📋',val:fmt(act),lbl:'Actividades',sub:''},
    {ico:'👥',val:fmt(part),lbl:'Participantes',sub:`♂${fmt(hom)} ♀${fmt(muj)}`},
    {ico:'⏱️',val:fmtD(hrs),lbl:'Horas totales',sub:act>0?fmtD(hrs/act)+' h/act':''},
    {ico:'🎯',val:fmt(ses),lbl:'Sesiones',sub:act>0?fmtD(ses/act)+' ses/act':''},
    {ico:'👤',val:fmt(profs),lbl:'Profesionales',sub:''},
    {ico:'🏥',val:fmt(unids),lbl:'Unidades activas',sub:''},
    {ico:'🏘️',val:fmt(desf),lbl:'Actividades zona desf.',sub:pct(desf,act)},
    {ico:'📊',val:act>0?fmtD(part/act):'—',lbl:'Participantes/actividad',sub:''},
  ];

  document.getElementById('kpis').innerHTML=kData.map(k=>`
    <div class="kpi"><div class="ico">${k.ico}</div><div class="val">${k.val}</div>
    <div class="lbl">${k.lbl}</div>${k.sub?`<div class="sub">${k.sub}</div>`:''}</div>`).join('');

  // Charts row 1
  const tipos=contarPor(d,C.f.tipo,C.tipo).slice(0,8);
  const temas=contarPor(d,C.f.tematica,C.tema).slice(0,8);
  const progs=contarPor(d,C.f.programa,C.prog).slice(0,8);

  document.getElementById('charts-row1').innerHTML=`
    <div class="chart-card"><h3>📊 Tipos de actividad</h3><div class="chart-wrap"><canvas id="dash-tipos"></canvas></div></div>
    <div class="chart-card"><h3>📚 Temáticas</h3><div class="chart-wrap"><canvas id="dash-temas"></canvas></div></div>
    <div class="chart-card"><h3>🎯 Programas</h3><div class="chart-wrap"><canvas id="dash-progs"></canvas></div></div>`;

  // Charts row 2 — mensual, sexo, distritos
  document.getElementById('charts-row2').innerHTML=`
    <div class="chart-card"><h3>📈 Evolución mensual</h3><div class="chart-wrap"><canvas id="dash-mensual"></canvas></div></div>
    <div class="chart-card"><h3>👥 Sexo participantes</h3><div class="chart-wrap"><canvas id="dash-sexo"></canvas></div></div>
    <div class="chart-card"><h3>📍 Por distrito</h3><div class="chart-wrap"><canvas id="dash-dist"></canvas></div></div>`;

  setTimeout(()=>{
    hbarChart('dash-tipos',tipos);
    hbarChart('dash-temas',temas);
    hbarChart('dash-progs',progs);

    // Mensual
    const porMes={};
    d.forEach(r=>{const f=parseFecha(r[C.f.fecha]);if(f){const k=`${f.getFullYear()}-${String(f.getMonth()+1).padStart(2,'0')}`;porMes[k]=(porMes[k]||0)+1;}});
    const meses=Object.keys(porMes).sort();
    makeChart('dash-mensual',{type:'line',data:{labels:meses,datasets:[{label:'Actividades',data:meses.map(m=>porMes[m]),borderColor:C.PAL[0],backgroundColor:C.PAL_L[0],tension:.4,fill:true,pointRadius:3}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}});

    // Sexo
    makeChart('dash-sexo',{type:'doughnut',data:{labels:['Hombres','Mujeres'],datasets:[{data:[hom,muj],backgroundColor:[C.PAL[0],C.PAL[4]],borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}}});

    // Distritos
    const g=d.filter(r=>String(r[C.f.distrito])==='0').length;
    const m=d.filter(r=>String(r[C.f.distrito])==='1').length;
    makeChart('dash-dist',{type:'bar',data:{labels:['Granada','Metropolitano'],datasets:[{data:[g,m],backgroundColor:[C.PAL[0],C.PAL[1]],borderRadius:6}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}});
  },0);

  // Rankings
  const rankUnid={};
  d.forEach(r=>{const u=unidadNombreCompleto(r);rankUnid[u]=(rankUnid[u]||{act:0,part:0});rankUnid[u].act++;rankUnid[u].part+=n(r[C.f.participantes]);});
  const ruAct=Object.entries(rankUnid).map(([k,v])=>({k,v:v.act})).sort((a,b)=>b.v-a.v).slice(0,10);
  const ruPart=Object.entries(rankUnid).map(([k,v])=>({k,v:v.part})).sort((a,b)=>b.v-a.v).slice(0,10);

  document.getElementById('rankings-wrap').innerHTML=`
    <div class="card"><div class="card-title">🏆 Top unidades — Actividades</div><div id="rk-u-act">${rankHTML(ruAct,colPal)}</div></div>
    <div class="card"><div class="card-title">👥 Top unidades — Participantes</div><div id="rk-u-part">${rankHTML(ruPart,colPal)}</div></div>`;
}

export { renderDashboard };

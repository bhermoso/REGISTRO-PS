import {C} from '../config.js';
import {S} from '../estado.js';
import {parseFecha, fmtFecha, n, nf, fmt, fmtD, pct,
        colPal, colPalL, unidadNombre, unidadNombreCompleto,
        destroyChart, makeChart, calcDiversidad,
        rankHTML, contarPor, sumarPor} from '../utils.js';

function renderAlertas(){
  const d=S.filtrados;
  const alertas=[];

  if(!d.length){document.getElementById('alertas-list').innerHTML='<p style="color:var(--sub);text-align:center;padding:40px">Sin datos cargados</p>';return;}

  const act=d.length;
  const part=d.reduce((s,r)=>s+n(r[C.f.participantes]),0);
  const hrs=d.reduce((s,r)=>s+nf(r[C.f.horas]),0);
  const desf=d.filter(r=>String(r[C.f.zona])==='1').length;
  const pctDesf=desf/act;

  // Actividades sin participantes
  const sinPart=d.filter(r=>n(r[C.f.participantes])===0).length;
  if(sinPart>0) alertas.push({nivel:'media',ico:'⚠️',titulo:`${fmt(sinPart)} actividades sin participantes registrados`,desc:`Representa el ${pct(sinPart,act)} del total. Revisar registros.`});

  // Actividades sin horas
  const sinHrs=d.filter(r=>nf(r[C.f.horas])===0).length;
  if(sinHrs>0) alertas.push({nivel:'baja',ico:'ℹ️',titulo:`${fmt(sinHrs)} actividades sin horas registradas`,desc:`${pct(sinHrs,act)} sin duración. Completar el campo de horas.`});

  // Cobertura zona desfavorecida
  if(pctDesf<0.15) alertas.push({nivel:'alta',ico:'🔴',titulo:`Baja cobertura en zonas desfavorecidas: ${(pctDesf*100).toFixed(1)}%`,desc:'Se recomienda al menos un 15-20% de actividades en zonas de especial necesidad.'});
  else if(pctDesf>=0.25) alertas.push({nivel:'baja',ico:'✅',titulo:`Buena cobertura en zonas desfavorecidas: ${(pctDesf*100).toFixed(1)}%`,desc:'El porcentaje de actividades en zonas desfavorecidas supera el umbral recomendado.'});

  // Concentración de actividades en pocas unidades
  const uCount={};d.forEach(r=>{const u=unidadNombreCompleto(r);uCount[u]=(uCount[u]||0)+1;});
  const nUnids=Object.keys(uCount).length;
  const top3=Object.values(uCount).sort((a,b)=>b-a).slice(0,3).reduce((s,v)=>s+v,0);
  if(top3/act>0.6&&nUnids>5) alertas.push({nivel:'media',ico:'📍',titulo:`Alta concentración: top 3 unidades acumulan ${pct(top3,act)} de actividades`,desc:'La distribución territorial puede no ser equitativa. Revisar cobertura.'});

  // Diversidad temática
  const div=calcDiversidad(d);
  if(div<0.5) alertas.push({nivel:'media',ico:'📚',titulo:`Baja diversidad temática: índice ${fmtD(div)} (escala 0-1)`,desc:'Las actividades están concentradas en pocas temáticas. Valorar ampliar cobertura.'});
  else alertas.push({nivel:'baja',ico:'🌈',titulo:`Buena diversidad temática: índice ${fmtD(div)}`,desc:'Las actividades cubren un amplio espectro de temáticas de salud.'});

  // Participantes medio
  if(act>0&&part/act<8) alertas.push({nivel:'media',ico:'👥',titulo:`Media de participantes baja: ${fmtD(part/act)} por actividad`,desc:'Valorar estrategias para aumentar alcance de las actividades grupales.'});

  // Sin actividades en algún trimestre del último año
  const anyos=[...new Set(d.map(r=>{const f=parseFecha(r[C.f.fecha]);return f?f.getFullYear():null;}).filter(Boolean))];
  if(anyos.length){
    const ult=Math.max(...anyos);
    const dUlt=d.filter(r=>{const f=parseFecha(r[C.f.fecha]);return f&&f.getFullYear()===ult;});
    const qUlt=new Set(dUlt.map(r=>{const f=parseFecha(r[C.f.fecha]);return f?Math.floor(f.getMonth()/3)+1:null;}).filter(Boolean));
    [1,2,3,4].forEach(q=>{if(!qUlt.has(q)) alertas.push({nivel:'media',ico:'📅',titulo:`Sin actividades en T${q} de ${ult}`,desc:`No hay registros en el trimestre ${q} del año ${ult}.`});});
  }

  if(!alertas.length) alertas.push({nivel:'baja',ico:'✅',titulo:'No se detectan alertas relevantes',desc:'El conjunto de datos cumple los indicadores de seguimiento básicos.'});

  document.getElementById('alertas-list').innerHTML=alertas.map(a=>`
    <div class="alerta ${a.nivel}">
      <div class="alerta-ico">${a.ico}</div>
      <div class="alerta-body"><strong>${a.titulo}</strong><span>${a.desc}</span></div>
    </div>`).join('');
}

export { renderAlertas };

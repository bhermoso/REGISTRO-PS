import {C} from '../config.js';
import {S} from '../estado.js';
import {parseFecha, fmtFecha, n, nf, fmt, fmtD, pct,
        colPal, colPalL, unidadNombre, unidadNombreCompleto,
        destroyChart, makeChart, rankHTML, contarPor, sumarPor} from '../utils.js';

function renderTabla(){
  const d=S.filtrados;
  const total=d.length;
  const ini=(S.pag-1)*S.PPP;
  const fin=Math.min(ini+S.PPP,total);
  const pags=Math.ceil(total/S.PPP)||1;

  document.getElementById('pag-info').textContent=`Página ${S.pag} de ${pags} · ${fmt(total)} registros`;

  const tbody=document.getElementById('tbody-tabla');
  tbody.innerHTML=d.slice(ini,fin).map(r=>{
    const dist=String(r[C.f.distrito])==='0'?'Granada':'Metro';
    return `<tr>
      <td><span class="badge ${String(r[C.f.distrito])==='0'?'badge-a':'badge-t'}">${dist}</span></td>
      <td>${unidadNombre(r)}</td>
      <td>${r[C.f.profesional]||'—'}</td>
      <td>${fmtFecha(r[C.f.fecha])}</td>
      <td><span class="badge badge-d">${C.tipo[r[C.f.tipo]]||r[C.f.tipo]||'—'}</span></td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${r[C.f.actividad]||''}">${r[C.f.actividad]||'—'}</td>
      <td>${C.tema[r[C.f.tematica]]||'—'}</td>
      <td>${C.prog[r[C.f.programa]]||'—'}</td>
      <td>${fmt(n(r[C.f.participantes]))}<span style="color:var(--sub);font-size:.72rem"> ♂${n(r[C.f.hombres])} ♀${n(r[C.f.mujeres])}</span></td>
      <td>${nf(r[C.f.horas])}</td>
      <td>${String(r[C.f.zona])==='1'?'<span class="badge badge-r">Sí</span>':'<span class="badge badge-t">No</span>'}</td>
    </tr>`;
  }).join('');

  document.getElementById('btn-prev').disabled=S.pag<=1;
  document.getElementById('btn-next').disabled=S.pag>=pags;
}

export { renderTabla };

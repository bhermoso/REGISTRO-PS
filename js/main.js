import {C} from './config.js';
import {S} from './estado.js';
import {setLoading} from './utils.js';
import {cargarCSV, aplicarFiltros} from './carga.js';
import {actualizarPanelActivo, renderPanel} from './render.js';
import {renderTabla} from './paneles/tabla.js';
import {expCSV, expXLSX, expPDF} from './exportacion.js';
import {generarDatosPrueba} from './generador.js';

document.addEventListener('DOMContentLoaded',()=>{
  // Nav tabs
  document.querySelectorAll('.nav-tab').forEach(t=>{
    t.addEventListener('click',function(){
      document.querySelectorAll('.nav-tab').forEach(x=>x.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(x=>x.classList.remove('active'));
      this.classList.add('active');
      const id='p-'+this.dataset.tab;
      const panel=document.getElementById(id);
      if(panel)panel.classList.add('active');
      if(S.raw.length)renderPanel(this.dataset.tab);
    });
  });

  // CSV input
  document.getElementById('file-csv').addEventListener('change',function(e){
    if(e.target.files[0])cargarCSV(e.target.files[0]);
    this.value='';
  });

  // Drop zone
  const dz=document.getElementById('drop-zone');
  dz.addEventListener('dragover',e=>{e.preventDefault();dz.style.borderColor='var(--azul)';});
  dz.addEventListener('dragleave',()=>{dz.style.borderColor='';});
  dz.addEventListener('drop',e=>{e.preventDefault();dz.style.borderColor='';if(e.dataTransfer.files[0])cargarCSV(e.dataTransfer.files[0]);});

  // Nivel
  document.getElementById('sel-nivel').addEventListener('change',function(){
    S.nivel=this.value;
    document.getElementById('grp-unidad').style.display=S.nivel==='unidad'?'flex':'none';
    document.getElementById('grp-prof').style.display=S.nivel==='profesional'?'flex':'none';
    if(S.nivel!=='unidad')S.unidad='';
    if(S.nivel!=='profesional')S.prof='';
    aplicarFiltros();
  });
  document.getElementById('sel-unidad').addEventListener('change',function(){S.unidad=this.value;aplicarFiltros();});
  document.getElementById('sel-prof').addEventListener('change',function(){S.prof=this.value;aplicarFiltros();});

  // Filtros
  document.getElementById('btn-filtrar').addEventListener('click',aplicarFiltros);
  document.getElementById('btn-limpiar-f').addEventListener('click',()=>{
    ['f-desde','f-hasta','f-tipo','f-tema','f-prog','f-zona'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
    aplicarFiltros();
  });

  // Búsqueda tabla
  document.getElementById('busqueda-tabla').addEventListener('input',()=>{S.pag=1;aplicarFiltros();});

  // Paginación
  document.getElementById('btn-prev').addEventListener('click',()=>{if(S.pag>1){S.pag--;renderTabla();}});
  document.getElementById('btn-next').addEventListener('click',()=>{const t=Math.ceil(S.filtrados.length/S.PPP)||1;if(S.pag<t){S.pag++;renderTabla();}});

  // Exportación
  document.getElementById('btn-exp-csv').addEventListener('click',expCSV);
  document.getElementById('btn-exp-xlsx').addEventListener('click',expXLSX);
  document.getElementById('btn-exp-pdf').addEventListener('click',expPDF);

  // Limpiar
  document.getElementById('btn-limpiar').addEventListener('click',()=>{
    if(!confirm('¿Limpiar todos los datos?'))return;
    S.raw=[];S.filtrados=[];S.nivel='global';S.unidad='';S.prof='';S.pag=1;
    document.getElementById('controles').style.display='none';
    document.getElementById('bienvenida').style.display='block';
    Object.values(S.charts).forEach(c=>c.destroy());S.charts={};
    document.querySelectorAll('.nav-tab').forEach((t,i)=>{t.classList.toggle('active',i===0);});
    document.querySelectorAll('.panel').forEach((p,i)=>{p.classList.toggle('active',i===0);});
    document.getElementById('kpis').innerHTML='';
    document.getElementById('charts-row1').innerHTML='';
    document.getElementById('charts-row2').innerHTML='';
    document.getElementById('rankings-wrap').innerHTML='';
  });

  // Demo
  document.getElementById('btn-demo').addEventListener('click',generarDatosPrueba);
});

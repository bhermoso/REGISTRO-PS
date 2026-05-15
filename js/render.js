import {S} from './estado.js';
import {renderDashboard}   from './paneles/dashboard.js';
import {renderTabla}       from './paneles/tabla.js';
import {renderDemografico} from './paneles/demografico.js';
import {renderTerritorial} from './paneles/territorial.js';
import {renderProfesional} from './paneles/profesional.js';
import {renderTemporal}    from './paneles/temporal.js';
import {renderProgramas}   from './paneles/programas.js';
import {renderBrechas}     from './paneles/equidad.js';
import {renderEficiencia}  from './paneles/eficiencia.js';
import {renderAlertas}     from './paneles/alertas.js';

function actualizarPanelActivo(){
  const tab=document.querySelector('.nav-tab.active')?.dataset.tab||'dashboard';
  renderPanel(tab);
}

function renderPanel(tab){
  switch(tab){
    case 'dashboard':   renderDashboard();break;
    case 'tabla':       renderTabla();break;
    case 'demografico': renderDemografico();break;
    case 'territorial': renderTerritorial();break;
    case 'profesional': renderProfesional();break;
    case 'temporal':    renderTemporal();break;
    case 'programas':   renderProgramas();break;
    case 'brechas':     renderBrechas();break;
    case 'eficiencia':  renderEficiencia();break;
    case 'alertas':     renderAlertas();break;
  }
}

export { actualizarPanelActivo, renderPanel };

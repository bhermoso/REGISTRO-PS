import { CONFIG } from '../config.js';
import { estado } from '../estado.js';
import { parsearFechaREDCap } from '../utils.js';

function mostrarDashboardProfesional(profesional) {
    if (!profesional || estado.nivelActual !== 'profesional') {
        document.getElementById('dashboard-profesional').style.display = 'none';
        return;
    }
    
    const datosProfesional = estado.datosFiltrados.filter(row => 
        row[CONFIG.campos.profesional] === profesional
    );
    
    if (datosProfesional.length === 0) {
        document.getElementById('dashboard-profesional').style.display = 'none';
        return;
    }
    
    const metricasProfesional = {
        actividades: datosProfesional.length,
        participantes: datosProfesional.reduce((sum, row) => 
            sum + (parseInt(row[CONFIG.campos.participantes]) || 0), 0),
        horas: datosProfesional.reduce((sum, row) => 
            sum + (parseInt(row[CONFIG.campos.horas]) || 0), 0),
        sesiones: datosProfesional.reduce((sum, row) => 
            sum + (parseInt(row[CONFIG.campos.sesiones]) || 0), 0)
    };
    
    const todosProfesionales = {};
    estado.datosFiltrados.forEach(row => {
        const prof = row[CONFIG.campos.profesional];
        if (prof) {
            if (!todosProfesionales[prof]) {
                todosProfesionales[prof] = {
                    actividades: 0,
                    participantes: 0,
                    horas: 0
                };
            }
            todosProfesionales[prof].actividades++;
            todosProfesionales[prof].participantes += parseInt(row[CONFIG.campos.participantes]) || 0;
            todosProfesionales[prof].horas += parseInt(row[CONFIG.campos.horas]) || 0;
        }
    });
    
    const numProfesionales = Object.keys(todosProfesionales).length;
    const promedioActividades = Object.values(todosProfesionales).reduce((sum, p) => 
        sum + p.actividades, 0) / numProfesionales;
    const promedioParticipantes = Object.values(todosProfesionales).reduce((sum, p) => 
        sum + p.participantes, 0) / numProfesionales;
    
    const rankingActividades = Object.entries(todosProfesionales)
        .sort((a, b) => b[1].actividades - a[1].actividades);
    const posicionRanking = rankingActividades.findIndex(([prof]) => prof === profesional) + 1;
    
    document.getElementById('profesional-nombre').textContent = profesional;
    
    const infoContainer = document.getElementById('profesional-info');
    infoContainer.innerHTML = `
        <div class="profesional-metrica">
            <div class="profesional-metrica-valor">${metricasProfesional.actividades}</div>
            <div class="profesional-metrica-label">Mis Actividades</div>
            <div class="profesional-metrica-comparativa">
                Promedio distrito: ${promedioActividades.toFixed(1)}
                ${metricasProfesional.actividades > promedioActividades ? '▲' : '▼'}
            </div>
        </div>
        <div class="profesional-metrica">
            <div class="profesional-metrica-valor">${metricasProfesional.participantes}</div>
            <div class="profesional-metrica-label">Mis Participantes</div>
            <div class="profesional-metrica-comparativa">
                Promedio distrito: ${promedioParticipantes.toFixed(1)}
                ${metricasProfesional.participantes > promedioParticipantes ? '▲' : '▼'}
            </div>
        </div>
        <div class="profesional-metrica">
            <div class="profesional-metrica-valor">${metricasProfesional.horas}</div>
            <div class="profesional-metrica-label">Horas Dedicadas</div>
        </div>
        <div class="profesional-metrica">
            <div class="profesional-metrica-valor">#${posicionRanking}</div>
            <div class="profesional-metrica-label">Ranking por Actividades</div>
            <div class="profesional-metrica-comparativa">
                Entre ${numProfesionales} profesionales
            </div>
        </div>
    `;
    
    document.getElementById('dashboard-profesional').style.display = 'block';
}

export { mostrarDashboardProfesional };

import { CONFIG } from '../config.js';
import { estado } from '../estado.js';
import { parsearFechaREDCap } from '../utils.js';

function calcularMetricasEficiencia() {
    if (estado.datosFiltrados.length === 0) {
        document.getElementById('eficiencia-panel').style.display = 'none';
        return;
    }
    
    const metricas = calcularMetricas();
    
    const promedioParticipantes = metricas.actividades > 0 ? 
        (metricas.participantes / metricas.actividades).toFixed(1) : 0;
    
    const horasPorParticipante = metricas.participantes > 0 ? 
        (metricas.horas / metricas.participantes).toFixed(2) : 0;
    
    const ratioSesiones = metricas.actividades > 0 ? 
        (metricas.sesiones / metricas.actividades).toFixed(1) : 0;
    
    const tematicasUnicas = new Set(estado.datosFiltrados.map(row => row[CONFIG.campos.tematica])).size;
    const indiceDiversidad = metricas.actividades > 0 ? 
        (tematicasUnicas / metricas.actividades * 100).toFixed(1) : 0;
    
    const unidadesActivas = new Set();
    estado.datosFiltrados.forEach(row => {
        const distrito = String(row[CONFIG.campos.distrito]);
        if (distrito === '0') {
            const unidadId = String(row[CONFIG.campos.unidad_granada]);
            if (CONFIG.unidades_granada[unidadId]) unidadesActivas.add(unidadId);
        } else if (distrito === '1') {
            const unidadId = String(row[CONFIG.campos.unidad_metro]);
            if (CONFIG.unidades_metro[unidadId]) unidadesActivas.add(unidadId);
        }
    });
    
    const totalUnidades = Object.keys(CONFIG.unidades_granada).length + Object.keys(CONFIG.unidades_metro).length;
    const coberturaUnidades = ((unidadesActivas.size / totalUnidades) * 100).toFixed(1);
    
    const container = document.getElementById('eficiencia-grid');
    container.innerHTML = `
        <div class="eficiencia-card">
            <div class="eficiencia-valor">${promedioParticipantes}</div>
            <div class="eficiencia-label">Participantes/Actividad</div>
            <div class="eficiencia-descripcion">Promedio de personas por actividad</div>
        </div>
        <div class="eficiencia-card">
            <div class="eficiencia-valor">${horasPorParticipante}</div>
            <div class="eficiencia-label">Horas/Participante</div>
            <div class="eficiencia-descripcion">Tiempo dedicado por persona</div>
        </div>
        <div class="eficiencia-card">
            <div class="eficiencia-valor">${ratioSesiones}</div>
            <div class="eficiencia-label">Sesiones/Actividad</div>
            <div class="eficiencia-descripcion">Número medio de sesiones</div>
        </div>
        <div class="eficiencia-card">
            <div class="eficiencia-valor">${indiceDiversidad}%</div>
            <div class="eficiencia-label">Diversidad Temática</div>
            <div class="eficiencia-descripcion">${tematicasUnicas} temáticas diferentes</div>
        </div>
        <div class="eficiencia-card">
            <div class="eficiencia-valor">${coberturaUnidades}%</div>
            <div class="eficiencia-label">Cobertura Unidades</div>
            <div class="eficiencia-descripcion">${unidadesActivas.size} de ${totalUnidades} unidades activas</div>
        </div>
    `;
    
    document.getElementById('eficiencia-panel').style.display = 'block';
}

export { calcularMetricasEficiencia };

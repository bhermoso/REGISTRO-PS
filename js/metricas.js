import { CONFIG } from './config.js';
import { estado } from './estado.js';
import { parsearFechaREDCap } from './utils.js';

function calcularMetricas() {
    const actividades = estado.datosFiltrados.length;
    const participantes = estado.datosFiltrados.reduce((sum, row) => sum + (parseInt(row[CONFIG.campos.participantes]) || 0), 0);
    const hombres = estado.datosFiltrados.reduce((sum, row) => sum + (parseInt(row[CONFIG.campos.hombres]) || 0), 0);
    const mujeres = estado.datosFiltrados.reduce((sum, row) => sum + (parseInt(row[CONFIG.campos.mujeres]) || 0), 0);
    const horas = estado.datosFiltrados.reduce((sum, row) => sum + (parseInt(row[CONFIG.campos.horas]) || 0), 0);
    const sesiones = estado.datosFiltrados.reduce((sum, row) => sum + (parseInt(row[CONFIG.campos.sesiones]) || 0), 0);
    
    return { actividades, participantes, hombres, mujeres, horas, sesiones };
}

function actualizarKPIs(metricas) {
    document.getElementById('kpi-actividades').textContent = metricas.actividades.toLocaleString('es-ES');
    document.getElementById('kpi-participantes').textContent = metricas.participantes.toLocaleString('es-ES');
    document.getElementById('kpi-horas').textContent = metricas.horas.toLocaleString('es-ES');
    document.getElementById('kpi-sesiones').textContent = metricas.sesiones.toLocaleString('es-ES');
    document.getElementById('kpi-hombres').textContent = metricas.hombres.toLocaleString('es-ES');
    document.getElementById('kpi-mujeres').textContent = metricas.mujeres.toLocaleString('es-ES');
    
    const pctHombres = metricas.participantes > 0 ? ((metricas.hombres / metricas.participantes) * 100).toFixed(1) : 0;
    const pctMujeres = metricas.participantes > 0 ? ((metricas.mujeres / metricas.participantes) * 100).toFixed(1) : 0;
    
    document.getElementById('kpi-hombres-pct').textContent = `${pctHombres}%`;
    document.getElementById('kpi-mujeres-pct').textContent = `${pctMujeres}%`;
}

function actualizarRankings() {
    const container = document.getElementById('rankings-container');
    
    // Mostrar rankings solo en niveles global y de distrito
    if (estado.nivelActual === 'global' || estado.nivelActual === 'distrito-granada' || estado.nivelActual === 'distrito-metro') {
        container.style.display = 'block';
        
        // Ranking por unidades
        crearRankingUnidades();
        
        // Ranking por profesionales
        crearRankingProfesionales();
    } else {
        container.style.display = 'none';
    }
}

function crearRankingUnidades() {
    const ranking = {};
    
    estado.datosFiltrados.forEach(row => {
        const distrito = String(row[CONFIG.campos.distrito]);
        let unidadNombre = '';
        
        if (distrito === '0') {
            const unidadId = String(row[CONFIG.campos.unidad_granada]);
            unidadNombre = CONFIG.unidades_granada[unidadId] ? `${CONFIG.unidades_granada[unidadId]} (Granada)` : 'Sin unidad';
        } else if (distrito === '1') {
            const unidadId = String(row[CONFIG.campos.unidad_metro]);
            unidadNombre = CONFIG.unidades_metro[unidadId] ? `${CONFIG.unidades_metro[unidadId]} (Metro)` : 'Sin unidad';
        }
        
        if (unidadNombre) {
            if (!ranking[unidadNombre]) {
                ranking[unidadNombre] = {
                    actividades: 0,
                    participantes: 0,
                    horas: 0
                };
            }
            ranking[unidadNombre].actividades++;
            ranking[unidadNombre].participantes += parseInt(row[CONFIG.campos.participantes]) || 0;
            ranking[unidadNombre].horas += parseInt(row[CONFIG.campos.horas]) || 0;
        }
    });
    
    const rankingArray = Object.entries(ranking)
        .map(([nombre, datos]) => ({ nombre, ...datos }))
        .sort((a, b) => b.actividades - a.actividades)
        .slice(0, 10);
    
    mostrarRanking('ranking-1', rankingArray, 'actividades');
    document.getElementById('ranking-titulo-1').textContent = '🏆 Top 10 Unidades por Actividades';
}

function crearRankingProfesionales() {
    const ranking = {};
    
    estado.datosFiltrados.forEach(row => {
        const profesional = row[CONFIG.campos.profesional];
        if (profesional) {
            if (!ranking[profesional]) {
                ranking[profesional] = {
                    actividades: 0,
                    participantes: 0,
                    horas: 0
                };
            }
            ranking[profesional].actividades++;
            ranking[profesional].participantes += parseInt(row[CONFIG.campos.participantes]) || 0;
            ranking[profesional].horas += parseInt(row[CONFIG.campos.horas]) || 0;
        }
    });
    
    const rankingArray = Object.entries(ranking)
        .map(([nombre, datos]) => ({ nombre, ...datos }))
        .sort((a, b) => b.participantes - a.participantes)
        .slice(0, 10);
    
    mostrarRanking('ranking-2', rankingArray, 'participantes');
    document.getElementById('ranking-titulo-2').textContent = '👥 Top 10 Profesionales por Participantes';
}

function mostrarRanking(containerId, datos, metrica) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if (datos.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--color-gris); padding: 20px;">No hay datos para mostrar</p>';
        return;
    }
    
    const maxValor = Math.max(...datos.map(d => d[metrica]));
    
    datos.forEach((item, index) => {
        const porcentaje = (item[metrica] / maxValor) * 100;
        
        const div = document.createElement('div');
        div.className = 'ranking-item';
        div.innerHTML = `
            <div class="ranking-posicion">${index + 1}</div>
            <div class="ranking-nombre">${item.nombre}</div>
            <div class="ranking-barra">
                <div class="ranking-barra-fill" style="width: ${porcentaje}%"></div>
            </div>
            <div class="ranking-valor">${item[metrica].toLocaleString('es-ES')}</div>
        `;
        container.appendChild(div);
    });
}

export { calcularMetricas, actualizarKPIs, actualizarRankings, crearRankingUnidades, crearRankingProfesionales, mostrarRanking };

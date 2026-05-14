import { CONFIG } from '../config.js';
import { estado } from '../estado.js';
import { parsearFechaREDCap } from '../utils.js';

function calcularBenchmark() {
    if (estado.datosFiltrados.length === 0) {
        document.getElementById('benchmark-panel').style.display = 'none';
        return;
    }
    
    // Análisis por Unidad
    const actividadesPorUnidad = {};
    estado.datosFiltrados.forEach(row => {
        const distrito = String(row[CONFIG.campos.distrito]);
        let unidadNombre = '';
        
        if (distrito === '0') {
            const unidadId = String(row[CONFIG.campos.unidad_granada]);
            unidadNombre = CONFIG.unidades_granada[unidadId];
        } else if (distrito === '1') {
            const unidadId = String(row[CONFIG.campos.unidad_metro]);
            unidadNombre = CONFIG.unidades_metro[unidadId];
        }
        
        if (unidadNombre) {
            if (!actividadesPorUnidad[unidadNombre]) {
                actividadesPorUnidad[unidadNombre] = 0;
            }
            actividadesPorUnidad[unidadNombre]++;
        }
    });
    
    const unidades = Object.entries(actividadesPorUnidad)
        .map(([nombre, actividades]) => ({ nombre, actividades }))
        .sort((a, b) => b.actividades - a.actividades);
    
    // Calcular percentiles
    const valores = unidades.map(u => u.actividades);
    const p25 = calcularPercentil(valores, 25);
    const p50 = calcularPercentil(valores, 50);
    const p75 = calcularPercentil(valores, 75);
    
    const container = document.getElementById('percentiles-grid');
    container.innerHTML = '';
    
    // Categoría: Excelentes (>P75)
    const divExcelente = document.createElement('div');
    divExcelente.className = 'percentil-categoria';
    divExcelente.innerHTML = '<h4>🌟 Excelente (Top 25%)</h4>';
    const excelentes = unidades.filter(u => u.actividades >= p75);
    excelentes.forEach(u => {
        divExcelente.innerHTML += crearItemPercentil(u.nombre, u.actividades, 'excelente');
    });
    if (excelentes.length > 0) container.appendChild(divExcelente);
    
    // Categoría: Bueno (P50-P75)
    const divBueno = document.createElement('div');
    divBueno.className = 'percentil-categoria';
    divBueno.innerHTML = '<h4>👍 Bueno (P50-P75)</h4>';
    const buenos = unidades.filter(u => u.actividades >= p50 && u.actividades < p75);
    buenos.forEach(u => {
        divBueno.innerHTML += crearItemPercentil(u.nombre, u.actividades, 'bueno');
    });
    if (buenos.length > 0) container.appendChild(divBueno);
    
    // Categoría: Regular (P25-P50)
    const divRegular = document.createElement('div');
    divRegular.className = 'percentil-categoria';
    divRegular.innerHTML = '<h4>⚠️ Regular (P25-P50)</h4>';
    const regulares = unidades.filter(u => u.actividades >= p25 && u.actividades < p50);
    regulares.forEach(u => {
        divRegular.innerHTML += crearItemPercentil(u.nombre, u.actividades, 'regular');
    });
    if (regulares.length > 0) container.appendChild(divRegular);
    
    // Categoría: Necesita mejora (<P25)
    const divMejorar = document.createElement('div');
    divMejorar.className = 'percentil-categoria';
    divMejorar.innerHTML = '<h4>🔧 Necesita Mejora (Bottom 25%)</h4>';
    const mejorar = unidades.filter(u => u.actividades < p25);
    mejorar.forEach(u => {
        divMejorar.innerHTML += crearItemPercentil(u.nombre, u.actividades, 'mejorar');
    });
    if (mejorar.length > 0) container.appendChild(divMejorar);
    
    document.getElementById('benchmark-panel').style.display = 'block';
}

function calcularPercentil(valores, percentil) {
    if (valores.length === 0) return 0;
    const sorted = [...valores].sort((a, b) => a - b);
    const index = (percentil / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;
    
    if (lower === upper) return sorted[lower];
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

function crearItemPercentil(nombre, valor, categoria) {
    const badges = {
        'excelente': 'EXCELENTE',
        'bueno': 'BUENO',
        'regular': 'REGULAR',
        'mejorar': 'MEJORAR'
    };
    
    return `
        <div class="percentil-item percentil-${categoria}">
            <span class="percentil-nombre">${nombre}</span>
            <span class="percentil-badge">${badges[categoria]}</span>
            <span class="percentil-valor">${valor}</span>
        </div>
    `;
}

export { calcularBenchmark };

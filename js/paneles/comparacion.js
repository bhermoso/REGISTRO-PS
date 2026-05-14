import { CONFIG } from '../config.js';
import { estado } from '../estado.js';

function inicializarModoComparacion() {
    // Poblar selectores con unidades
    const select1 = document.getElementById('comparacion-entidad1');
    const select2 = document.getElementById('comparacion-entidad2');
    
    // Limpiar
    select1.innerHTML = '<option value="">-- Seleccionar --</option>';
    select2.innerHTML = '<option value="">-- Seleccionar --</option>';
    
    // Añadir unidades Granada
    Object.entries(CONFIG.unidades_granada).forEach(([id, nombre]) => {
        select1.innerHTML += `<option value="granada-${id}">${nombre} (Granada)</option>`;
        select2.innerHTML += `<option value="granada-${id}">${nombre} (Granada)</option>`;
    });
    
    // Añadir unidades Metro
    Object.entries(CONFIG.unidades_metro).forEach(([id, nombre]) => {
        select1.innerHTML += `<option value="metro-${id}">${nombre} (Metro)</option>`;
        select2.innerHTML += `<option value="metro-${id}">${nombre} (Metro)</option>`;
    });
    
    document.getElementById('comparacion-panel').style.display = 'block';
}

function actualizarComparacion() {
    const entidad1 = document.getElementById('comparacion-entidad1').value;
    const entidad2 = document.getElementById('comparacion-entidad2').value;
    
    if (!entidad1 || !entidad2) {
        document.getElementById('comparacion-resultados').innerHTML = '';
        return;
    }
    
    const datos1 = obtenerDatosEntidad(entidad1);
    const datos2 = obtenerDatosEntidad(entidad2);
    
    const container = document.getElementById('comparacion-resultados');
    container.innerHTML = `
        <div class="comparacion-entidad">
            <div class="comparacion-entidad-nombre">${datos1.nombre}</div>
            ${crearMetricasComparacion(datos1.metricas, datos2.metricas, true)}
        </div>
        <div class="comparacion-entidad">
            <div class="comparacion-entidad-nombre">${datos2.nombre}</div>
            ${crearMetricasComparacion(datos2.metricas, datos1.metricas, false)}
        </div>
    `;
}

function obtenerDatosEntidad(entidadId) {
    const [tipo, id] = entidadId.split('-');
    let nombre = '';
    let filtrados = [];
    
    if (tipo === 'granada') {
        nombre = CONFIG.unidades_granada[id];
        filtrados = estado.datosFiltrados.filter(r => 
            String(r[CONFIG.campos.distrito]) === '0' && 
            String(r[CONFIG.campos.unidad_granada]) === id
        );
    } else {
        nombre = CONFIG.unidades_metro[id];
        filtrados = estado.datosFiltrados.filter(r => 
            String(r[CONFIG.campos.distrito]) === '1' && 
            String(r[CONFIG.campos.unidad_metro]) === id
        );
    }
    
    const metricas = {
        actividades: filtrados.length,
        participantes: filtrados.reduce((sum, r) => sum + (parseInt(r[CONFIG.campos.participantes]) || 0), 0),
        horas: filtrados.reduce((sum, r) => sum + (parseInt(r[CONFIG.campos.horas]) || 0), 0),
        sesiones: filtrados.reduce((sum, r) => sum + (parseInt(r[CONFIG.campos.sesiones]) || 0), 0)
    };
    
    return { nombre, metricas };
}

function crearMetricasComparacion(metricas, metricasOtra, esIzquierda) {
    const comparaciones = [
        { label: 'Actividades', valor: metricas.actividades, otro: metricasOtra.actividades },
        { label: 'Participantes', valor: metricas.participantes, otro: metricasOtra.participantes },
        { label: 'Horas totales', valor: metricas.horas, otro: metricasOtra.horas },
        { label: 'Sesiones', valor: metricas.sesiones, otro: metricasOtra.sesiones }
    ];
    
    return comparaciones.map(c => {
        const ganador = c.valor > c.otro;
        return `
            <div class="comparacion-metrica ${ganador ? 'comparacion-ganador' : ''}">
                <span class="comparacion-metrica-label">${c.label}</span>
                <span class="comparacion-metrica-valor">${c.valor} ${ganador ? '👑' : ''}</span>
            </div>
        `;
    }).join('');
}

export { inicializarModoComparacion, actualizarComparacion };

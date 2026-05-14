import { CONFIG } from '../config.js';
import { estado } from '../estado.js';

function inicializarBusquedaAvanzada() {
    // Poblar selectores
    const selectTematica = document.getElementById('busqueda-tematica');
    const selectTipo = document.getElementById('busqueda-tipo');
    
    // Temáticas
    Object.entries(CONFIG.tematicas).forEach(([id, nombre]) => {
        selectTematica.innerHTML += `<option value="${id}">${nombre}</option>`;
    });
    
    // Tipos
    Object.entries(CONFIG.tipos_actividad).forEach(([id, nombre]) => {
        selectTipo.innerHTML += `<option value="${id}">${nombre}</option>`;
    });
    
    document.getElementById('busqueda-panel').style.display = 'block';
}

function aplicarBusquedaAvanzada() {
    // Guardar los criterios de búsqueda avanzada
    estado.criteriosBusquedaAvanzada = {
        profesional: document.getElementById('busqueda-profesional').value.toLowerCase(),
        actividad: document.getElementById('busqueda-actividad').value.toLowerCase(),
        tematica: document.getElementById('busqueda-tematica').value,
        tipo: document.getElementById('busqueda-tipo').value,
        minParticipantes: parseInt(document.getElementById('busqueda-min-participantes').value) || 0,
        zona: document.getElementById('busqueda-zona').value
    };
    
    // Verificar si hay algún criterio activo
    const hayCriterios = estado.criteriosBusquedaAvanzada.profesional || 
                         estado.criteriosBusquedaAvanzada.actividad || 
                         estado.criteriosBusquedaAvanzada.tematica || 
                         estado.criteriosBusquedaAvanzada.tipo || 
                         estado.criteriosBusquedaAvanzada.minParticipantes > 0 || 
                         estado.criteriosBusquedaAvanzada.zona;
    
    if (!hayCriterios) {
        alert('⚠️ Por favor, introduce al menos un criterio de búsqueda.');
        return;
    }
    
    // Aplicar filtros (que ahora incluyen los criterios de búsqueda avanzada)
    aplicarFiltros();
    
    // Mostrar información de búsqueda
    document.getElementById('busqueda-info').style.display = 'flex';
    document.getElementById('busqueda-contador').textContent = 
        `✓ ${estado.datosFiltrados.length} resultado${estado.datosFiltrados.length !== 1 ? 's' : ''} encontrado${estado.datosFiltrados.length !== 1 ? 's' : ''}`;
}

function limpiarBusquedaAvanzada() {
    // Limpiar campos
    document.getElementById('busqueda-profesional').value = '';
    document.getElementById('busqueda-actividad').value = '';
    document.getElementById('busqueda-tematica').value = '';
    document.getElementById('busqueda-tipo').value = '';
    document.getElementById('busqueda-min-participantes').value = '';
    document.getElementById('busqueda-zona').value = '';
    
    // 🆕 Limpiar criterios guardados
    estado.criteriosBusquedaAvanzada = null;
    
    // Ocultar info
    document.getElementById('busqueda-info').style.display = 'none';
    
    // Restaurar datos aplicando solo los filtros normales
    aplicarFiltros();
}

export { inicializarBusquedaAvanzada, aplicarBusquedaAvanzada, limpiarBusquedaAvanzada };

import { CONFIG } from './config.js';
import { estado } from './estado.js';

// Callback registrado por main.js para evitar dependencia circular
let _onFiltrosAplicados = () => {};
export function registrarCallbackFiltros(fn) { _onFiltrosAplicados = fn; }

function inicializarFiltros() {
    // Poblar selectores de filtros
    poblarSelect('filtro-tipo-actividad', CONFIG.tipos_actividad);
    poblarSelect('filtro-tematica', CONFIG.tematicas);
    poblarSelect('filtro-programa', CONFIG.programas);
    
    // Poblar selector de unidades
    const selectUnidad = document.getElementById('select-unidad');
    selectUnidad.innerHTML = '<option value="">-- Todas las unidades --</option>';
    
    // Unidades Granada
    Object.entries(CONFIG.unidades_granada).forEach(([key, value]) => {
        const option = document.createElement('option');
        option.value = `granada-${key}`;
        option.textContent = `${value} (Granada)`;
        selectUnidad.appendChild(option);
    });
    
    // Unidades Metro
    Object.entries(CONFIG.unidades_metro).forEach(([key, value]) => {
        const option = document.createElement('option');
        option.value = `metro-${key}`;
        option.textContent = `${value} (Metropolitano)`;
        selectUnidad.appendChild(option);
    });
    
    // Poblar selector de profesionales
    const profesionales = [...new Set(estado.datosOriginales.map(row => row[CONFIG.campos.profesional]).filter(Boolean))].sort();
    const selectProfesional = document.getElementById('select-profesional');
    selectProfesional.innerHTML = '<option value="">-- Todos los profesionales --</option>';
    profesionales.forEach(prof => {
        const option = document.createElement('option');
        option.value = prof;
        option.textContent = prof;
        selectProfesional.appendChild(option);
    });
}

function aplicarFiltros() {
    estado.datosFiltrados = estado.datosOriginales.filter(row => {
        // Filtros de nivel
        if (estado.nivelActual === 'distrito-granada' && String(row[CONFIG.campos.distrito]) !== '0') return false;
        if (estado.nivelActual === 'distrito-metro' && String(row[CONFIG.campos.distrito]) !== '1') return false;
        
        if (estado.nivelActual === 'unidad' && estado.unidadSeleccionada) {
            const [distrito, unidadId] = estado.unidadSeleccionada.split('-');
            if (distrito === 'granada') {
                if (String(row[CONFIG.campos.distrito]) !== '0' || String(row[CONFIG.campos.unidad_granada]) !== unidadId) return false;
            } else {
                if (String(row[CONFIG.campos.distrito]) !== '1' || String(row[CONFIG.campos.unidad_metro]) !== unidadId) return false;
            }
        }
        
        if (estado.nivelActual === 'profesional' && estado.profesionalSeleccionado) {
            if (row[CONFIG.campos.profesional] !== estado.profesionalSeleccionado) return false;
        }
        
        // Filtros avanzados (panel de filtros)
        const fechaDesde = document.getElementById('filtro-fecha-desde').value;
        const fechaHasta = document.getElementById('filtro-fecha-hasta').value;
        const tipoActividad = document.getElementById('filtro-tipo-actividad').value;
        const tematica = document.getElementById('filtro-tematica').value;
        const programa = document.getElementById('filtro-programa').value;
        
        if (fechaDesde) {
            const fecha = parsearFechaREDCap(row[CONFIG.campos.fecha_inicio]);
            if (!fecha || fecha < new Date(fechaDesde)) return false;
        }
        
        if (fechaHasta) {
            const fecha = parsearFechaREDCap(row[CONFIG.campos.fecha_inicio]);
            if (!fecha || fecha > new Date(fechaHasta)) return false;
        }
        
        if (tipoActividad && String(row[CONFIG.campos.tipo_actividad]) !== tipoActividad) return false;
        if (tematica && String(row[CONFIG.campos.tematica]) !== tematica) return false;
        if (programa && String(row[CONFIG.campos.programa]) !== programa) return false;
        
        // 🆕 APLICAR CRITERIOS DE BÚSQUEDA AVANZADA (si existen)
        if (estado.criteriosBusquedaAvanzada) {
            if (estado.criteriosBusquedaAvanzada.profesional) {
                if (!(row[CONFIG.campos.profesional] || '').toLowerCase().includes(estado.criteriosBusquedaAvanzada.profesional)) return false;
            }
            
            if (estado.criteriosBusquedaAvanzada.actividad) {
                if (!(row[CONFIG.campos.nombre_actividad] || '').toLowerCase().includes(estado.criteriosBusquedaAvanzada.actividad)) return false;
            }
            
            if (estado.criteriosBusquedaAvanzada.tematica) {
                if (String(row[CONFIG.campos.tematica]) !== estado.criteriosBusquedaAvanzada.tematica) return false;
            }
            
            if (estado.criteriosBusquedaAvanzada.tipo) {
                if (String(row[CONFIG.campos.tipo_actividad]) !== estado.criteriosBusquedaAvanzada.tipo) return false;
            }
            
            if (estado.criteriosBusquedaAvanzada.minParticipantes > 0) {
                if ((parseInt(row[CONFIG.campos.participantes]) || 0) < estado.criteriosBusquedaAvanzada.minParticipantes) return false;
            }
            
            if (estado.criteriosBusquedaAvanzada.zona) {
                if (String(row['es_una_zona_desfavorecidas']) !== estado.criteriosBusquedaAvanzada.zona) return false;
            }
        }
        
        return true;
    });
    
    // Resetear paginación de todas las pestañas
    estado.paginacion.granada = 1;
    estado.paginacion.metro = 1;
    estado.paginacion.ambos = 1;
    
    // 🆕 Actualizar contador de búsqueda si hay criterios activos
    if (estado.criteriosBusquedaAvanzada) {
        document.getElementById('busqueda-info').style.display = 'flex';
        document.getElementById('busqueda-contador').textContent = 
            `✓ ${estado.datosFiltrados.length} resultado${estado.datosFiltrados.length !== 1 ? 's' : ''} encontrado${estado.datosFiltrados.length !== 1 ? 's' : ''}`;
    }
    
    actualizarNivelActualInfo();
    _onFiltrosAplicados();
}

function limpiarFiltros() {
    document.getElementById('filtro-fecha-desde').value = '';
    document.getElementById('filtro-fecha-hasta').value = '';
    document.getElementById('filtro-tipo-actividad').value = '';
    document.getElementById('filtro-tematica').value = '';
    document.getElementById('filtro-programa').value = '';
    aplicarFiltros();
}

function actualizarNivelActualInfo() {
    let texto = '';
    switch(estado.nivelActual) {
        case 'global':
            texto = '🌍 Distrito Sanitario Granada-Metropolitano (Total)';
            break;
        case 'distrito-granada':
            texto = '📍 Distrito Granada';
            break;
        case 'distrito-metro':
            texto = '📍 Distrito Metropolitano de Granada';
            break;
        case 'unidad':
            if (estado.unidadSeleccionada) {
                const [distrito, unidadId] = estado.unidadSeleccionada.split('-');
                const unidades = distrito === 'granada' ? CONFIG.unidades_granada : CONFIG.unidades_metro;
                texto = `🏥 Unidad: ${unidades[unidadId]} (${distrito === 'granada' ? 'Granada' : 'Metropolitano'})`;
            } else {
                texto = '🏥 Todas las Unidades Asistenciales';
            }
            break;
        case 'profesional':
            if (estado.profesionalSeleccionado) {
                texto = `👤 Profesional: ${estado.profesionalSeleccionado}`;
            } else {
                texto = '👤 Todos los Profesionales';
            }
            break;
    }
    document.getElementById('nivel-actual-texto').textContent = texto;
}

export { inicializarFiltros, aplicarFiltros, limpiarFiltros, actualizarNivelActualInfo };

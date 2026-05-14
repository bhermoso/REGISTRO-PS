import { CONFIG } from './config.js';
import { estado } from './estado.js';
import { mostrarLoading } from './utils.js';
import { inicializarFiltros } from './filtros.js';

let _onDatosActualizados = () => {};
export function registrarCallbackDatos(fn) { _onDatosActualizados = fn; }

function poblarSelect(idSelect, opciones) {
    const select = document.getElementById(idSelect);
    Object.entries(opciones).forEach(([key, value]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = value;
        select.appendChild(option);
    });
}

function limpiarDatos() {
    // Confirmar con el usuario
    if (!confirm('⚠️ ¿Estás seguro de que quieres limpiar todos los datos cargados?\n\nEsto eliminará:\n- Todos los datos del CSV\n- Los filtros aplicados\n- Las búsquedas activas\n\nLos perfiles guardados se mantendrán.')) {
        return;
    }
    
    try {
        // Limpiar arrays de datos
        estado.datosOriginales = [];
        estado.datosFiltrados = [];
        
        // Resetear input de archivo
        const fileInput = document.getElementById('file-input');
        if (fileInput) fileInput.value = '';
        
        // Limpiar todos los filtros - con verificación
        const filtros = [
            'filtro-fecha-desde', 
            'filtro-fecha-hasta', 
            'filtro-tipo-actividad', 
            'filtro-tematica', 
            'filtro-programa'
        ];
        filtros.forEach(id => {
            const elem = document.getElementById(id);
            if (elem) elem.value = '';
        });
        
        // Resetear nivel de análisis - con verificación
        const nivelAgg = document.getElementById('nivel-agregacion');
        if (nivelAgg) nivelAgg.value = 'global';
        
        const selectUnidad = document.getElementById('select-unidad');
        if (selectUnidad) selectUnidad.value = '';
        
        const selectProf = document.getElementById('select-profesional');
        if (selectProf) selectProf.value = '';
        
        const grupoUnidad = document.getElementById('grupo-unidad');
        if (grupoUnidad) grupoUnidad.style.display = 'none';
        
        const grupoProf = document.getElementById('grupo-profesional');
        if (grupoProf) grupoProf.style.display = 'none';
        
        // Actualizar el texto del nivel actual
        const nivelActualTexto = document.getElementById('nivel-actual-texto');
        if (nivelActualTexto) {
            nivelActualTexto.textContent = 'Distrito Sanitario Granada-Metropolitano (Total)';
        }
        
        // Limpiar búsqueda avanzada - con verificación
        const busquedas = [
            'busqueda-profesional',
            'busqueda-actividad',
            'busqueda-tematica',
            'busqueda-tipo',
            'busqueda-min-participantes',
            'busqueda-zona'
        ];
        busquedas.forEach(id => {
            const elem = document.getElementById(id);
            if (elem) elem.value = '';
        });
        
        const busquedaInfo = document.getElementById('busqueda-info');
        if (busquedaInfo) busquedaInfo.style.display = 'none';
        
        // Ocultar todos los paneles - con verificación
        const paneles = [
            'alertas-panel',
            'comparativas-panel',
            'dashboard-profesional',
            'brechas-panel',
            'perfiles-panel',
            'eficiencia-panel',
            'predictivo-panel',
            'correlaciones-panel',
            'benchmark-panel',
            'pdf-panel',
            'comparacion-panel',
            'busqueda-panel'
        ];
        paneles.forEach(id => {
            const elem = document.getElementById(id);
            if (elem) elem.style.display = 'none';
        });
        
        // Limpiar KPIs - con verificación
        const kpis = [
            'kpi-actividades',
            'kpi-participantes',
            'kpi-horas',
            'kpi-sesiones',
            'kpi-hombres',
            'kpi-mujeres'
        ];
        kpis.forEach(id => {
            const elem = document.getElementById(id);
            if (elem) elem.textContent = '0';
        });
        
        // Destruir gráficos existentes
        const chartIds = [
            'chartTipos',
            'chartTematicas',
            'chartProgramas',
            'chartGenero',
            'chartDistritoComparativa',
            'chartEvolucion',
            'chartPredictivo'
        ];
        chartIds.forEach(chart => {
            if (window[chart] && typeof window[chart].destroy === 'function') {
                window[chart].destroy();
            }
        });
        
        // Limpiar rankings - con verificación
        const rankingProf = document.getElementById('ranking-profesionales');
        if (rankingProf) rankingProf.innerHTML = '';
        
        const rankingTipos = document.getElementById('ranking-tipos');
        if (rankingTipos) rankingTipos.innerHTML = '';
        
        // Limpiar tablas - con verificación
        const tablaGranadaBody = document.getElementById('tabla-granada-body');
        if (tablaGranadaBody) tablaGranadaBody.innerHTML = '';
        
        const tablaMetroBody = document.getElementById('tabla-metro-body');
        if (tablaMetroBody) tablaMetroBody.innerHTML = '';
        
        const tablaInfoGranada = document.getElementById('tabla-info-granada');
        if (tablaInfoGranada) tablaInfoGranada.textContent = 'Mostrando 0 de 0 actividades';
        
        const tablaInfoMetro = document.getElementById('tabla-info-metro');
        if (tablaInfoMetro) tablaInfoMetro.textContent = 'Mostrando 0 de 0 actividades';
        
        // Resetear variables de paginación (si existen)
        if (typeof paginaActualGranada !== 'undefined') paginaActualGranada = 1;
        if (typeof paginaActualMetro !== 'undefined') paginaActualMetro = 1;
        
        // Mostrar mensaje de éxito
        alert('✅ Datos limpiados correctamente.\n\nPuedes cargar un nuevo archivo CSV usando el botón "📁 Cargar archivo CSV".');
        
        console.log('🗑️ Datos limpiados. Dashboard reseteado.');
        
    } catch (error) {
        console.error('❌ Error al limpiar datos:', error);
        alert('⚠️ Ocurrió un error al limpiar los datos. Por favor, recarga la página.\n\nError: ' + error.message);
    }
}

function inicializarCargaCSV() {
    const fileInput = document.getElementById('file-input');
    if (!fileInput) return;
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        mostrarLoading(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
                estado.datosOriginales = results.data;
                inicializarFiltros();
                _onDatosActualizados();
                mostrarLoading(false);
            },
            error: function(error) {
                alert('Error al cargar el archivo: ' + error.message);
                mostrarLoading(false);
            }
        });
    });
}

function inicializarSelectores() {
    const nivelAgg = document.getElementById('nivel-agregacion');
    if (nivelAgg) {
        nivelAgg.addEventListener('change', function() {
            estado.nivelActual = this.value;
            const grupoUnidad = document.getElementById('grupo-unidad');
            const grupoProf   = document.getElementById('grupo-profesional');
            if (grupoUnidad) grupoUnidad.style.display = (this.value === 'unidad') ? 'block' : 'none';
            if (grupoProf)   grupoProf.style.display   = (this.value === 'profesional') ? 'block' : 'none';
            _onDatosActualizados();
        });
    }
    const selectUnidad = document.getElementById('select-unidad');
    if (selectUnidad) {
        selectUnidad.addEventListener('change', function() {
            estado.unidadSeleccionada = this.value;
            _onDatosActualizados();
        });
    }
    const selectProf = document.getElementById('select-profesional');
    if (selectProf) {
        selectProf.addEventListener('change', function() {
            estado.profesionalSeleccionado = this.value;
            _onDatosActualizados();
        });
    }
}

function inicializarLimpiarDatos() {
    const btn = document.getElementById('btn-limpiar-datos');
    if (btn) btn.addEventListener('click', limpiarDatos);
}

export { poblarSelect, limpiarDatos, inicializarCargaCSV, inicializarSelectores, inicializarLimpiarDatos };

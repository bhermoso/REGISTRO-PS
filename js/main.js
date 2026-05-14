import { CONFIG }                    from './config.js';
import { estado }                    from './estado.js';
import { parsearFechaREDCap, formatearFecha, mostrarLoading } from './utils.js';
import { inicializarFiltros, aplicarFiltros, registrarCallbackFiltros } from './filtros.js';
import { poblarSelect, inicializarCargaCSV, inicializarSelectores, inicializarLimpiarDatos, registrarCallbackDatos } from './cargaDatos.js';
import { calcularMetricas, actualizarKPIs, actualizarRankings } from './metricas.js';
import { actualizarGraficos }        from './graficos.js';
import { actualizarTabla, inicializarTablas } from './tablas.js';
import { inicializarExportacion }    from './exportacion.js';
import { cargarPerfiles, inicializarPerfiles } from './perfiles.js';
import { calcularComparativa, inicializarComparativas } from './paneles/comparativas.js';
import { generarAlertas, mostrarAlertas } from './paneles/alertas.js';
import { mostrarDashboardProfesional } from './paneles/dashboard.js';
import { analizarBrechas }           from './paneles/brechas.js';
import { calcularMetricasEficiencia } from './paneles/eficiencia.js';
import { inicializarPresentacion }   from './paneles/presentacion.js';
import { calcularPredicciones }      from './paneles/predicciones.js';
import { calcularCorrelaciones }     from './paneles/correlaciones.js';
import { calcularBenchmark }         from './paneles/benchmark.js';
import { mostrarPanelPDF, accionRapidaPDF,
         generarPDFEjecutivo, generarPDFCompleto, generarPDFComparativo, generarPDFPersonalizado,
         generarInformeProfesionalExhaustivo } from './paneles/pdf.js';
import { inicializarModoComparacion, actualizarComparacion } from './paneles/comparacion.js';
import { inicializarBusquedaAvanzada, aplicarBusquedaAvanzada, limpiarBusquedaAvanzada } from './paneles/busquedaAvanzada.js';

function actualizarDashboard() {
    const metricas = calcularMetricas();
    actualizarKPIs(metricas);
    actualizarGraficos();
    actualizarTabla();
    actualizarRankings();
    mostrarDashboardProfesional(estado.profesionalSeleccionado);
}

// ─── Inicialización ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    // Registrar callbacks para romper dependencias circulares
    registrarCallbackFiltros(actualizarDashboard);
    registrarCallbackDatos(actualizarDashboard);

    inicializarCargaCSV();
    inicializarSelectores();
    inicializarLimpiarDatos();
    inicializarTablas();
    inicializarExportacion();
    inicializarPerfiles();
    inicializarComparativas();
    inicializarPresentacion();
    inicializarModoComparacion();
    inicializarBusquedaAvanzada();

    // Filtros
    const btnAplicar = document.getElementById('btn-aplicar-filtros');
    if (btnAplicar) btnAplicar.addEventListener('click', aplicarFiltros);
    const btnLimpiarF = document.getElementById('btn-limpiar-filtros');
    if (btnLimpiarF) btnLimpiarF.addEventListener('click', function() {
        document.querySelectorAll('#filtro-fecha-desde, #filtro-fecha-hasta, #filtro-tipo-actividad, #filtro-tematica, #filtro-programa')
            .forEach(el => el.value = '');
        actualizarDashboard();
    });

    // Botones de paneles avanzados
    const panelBtns = [
        ['btn-alertas',      'alertas-panel',      () => mostrarAlertas(generarAlertas())],
        ['btn-comparativas', 'comparativas-panel',  calcularComparativa],
        ['btn-brechas',      'brechas-panel',       analizarBrechas],
        ['btn-eficiencia',   'eficiencia-panel',    calcularMetricasEficiencia],
        ['btn-predicciones', 'predictivo-panel',    calcularPredicciones],
        ['btn-correlaciones','correlaciones-panel', calcularCorrelaciones],
        ['btn-benchmark',    'benchmark-panel',     calcularBenchmark],
        ['btn-pdf',          'pdf-panel',           mostrarPanelPDF],
    ];
    panelBtns.forEach(([btnId, panelId, fn]) => {
        const btn = document.getElementById(btnId);
        if (!btn) return;
        btn.addEventListener('click', function() {
            const panel = document.getElementById(panelId);
            if (!panel) return;
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            if (panel.style.display === 'block') fn();
        });
    });

    const btnModo = document.getElementById('btn-modo-presentacion');
    if (btnModo) btnModo.addEventListener('click', () => {
        const { activarModoPresentacion } = window._raps;
        if (activarModoPresentacion) activarModoPresentacion();
    });

    const btnActualizarComp = document.getElementById('btn-actualizar-comparativa');
    if (btnActualizarComp) btnActualizarComp.addEventListener('click', calcularComparativa);

    console.log('RAPS v4.0 iniciado. Carga un archivo CSV para comenzar.');
});

// Exponer en window las funciones llamadas desde onclicks del HTML
window.accionRapidaPDF                  = accionRapidaPDF;
window.generarInformeProfesionalExhaustivo = generarInformeProfesionalExhaustivo;
window.actualizarComparacion            = actualizarComparacion;
window.generarPDFEjecutivo              = generarPDFEjecutivo;
window.generarPDFCompleto               = generarPDFCompleto;
window.generarPDFComparativo            = generarPDFComparativo;
window.generarPDFPersonalizado          = generarPDFPersonalizado;
window.aplicarBusquedaAvanzada          = aplicarBusquedaAvanzada;
window.limpiarBusquedaAvanzada          = limpiarBusquedaAvanzada;

export { actualizarDashboard };

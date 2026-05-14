import { CONFIG } from '../config.js';
import { estado } from '../estado.js';
import { calcularMetricas } from '../metricas.js';
import { parsearFechaREDCap, formatearFecha } from '../utils.js';

function mostrarPanelPDF() {
    const panel = document.getElementById('pdf-panel');
    if (panel) {
        if (estado.datosFiltrados && estado.datosFiltrados.length > 0) {
            panel.style.display = 'block';
            console.log('✅ Panel PDF mostrado - Datos disponibles:', estado.datosFiltrados.length, 'registros');
        } else {
            panel.style.display = 'none';
            console.log('⚠️ Panel PDF oculto - Sin datos');
        }
    } else {
        console.error('❌ Panel PDF no encontrado en el DOM');
    }
}

function accionRapidaPDF() {
    if (!estado.datosFiltrados || estado.datosFiltrados.length === 0) {
        alert('⚠️ Primero carga un archivo CSV.\n\n1. Click en "📁 Cargar archivo CSV"\n2. Selecciona tu archivo\n3. Después podrás generar PDFs');
        return;
    }
    
    // Si hay datos, preguntar qué tipo de PDF quiere
    const opcion = confirm('📄 ¿Qué informe deseas generar?\n\n✅ Aceptar → Informe Ejecutivo (rápido)\n❌ Cancelar → Ver todas las opciones');
    
    if (opcion) {
        // Generar directamente el PDF ejecutivo
        generarPDFEjecutivo();
    } else {
        // Hacer scroll al panel para que elija
        const panel = document.getElementById('pdf-panel');
        if (panel) {
            panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

function generarPDFEjecutivo() {
    try {
        // Verificar que hay datos
        if (!estado.datosFiltrados || estado.datosFiltrados.length === 0) {
            alert('⚠️ No hay datos cargados.\n\nPor favor, carga un archivo CSV primero.');
            return;
        }
        
        // Verificar que jsPDF está disponible
        if (typeof window.jspdf === 'undefined') {
            alert('❌ Error: La librería jsPDF no está cargada.\n\nPor favor, verifica tu conexión a internet y recarga la página.');
            console.error('jsPDF no está disponible en window.jspdf');
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Título
        doc.setFontSize(20);
        doc.setTextColor(25, 118, 210);
        doc.text('INFORME EJECUTIVO', 105, 20, { align: 'center' });
        
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Distrito Sanitario Granada-Metropolitano', 105, 30, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 105, 37, { align: 'center' });
        
        // KPIs
        const metricas = calcularMetricas();
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        let y = 50;
        
        doc.text('METRICAS PRINCIPALES', 20, y);
        y += 10;
        
        doc.setFontSize(10);
        doc.text(`Total de actividades: ${metricas.actividades}`, 20, y);
        y += 7;
        doc.text(`Total de participantes: ${metricas.participantes}`, 20, y);
        y += 7;
        doc.text(`Total de horas: ${metricas.horas}`, 20, y);
        y += 7;
        doc.text(`Total de sesiones: ${metricas.sesiones}`, 20, y);
        y += 7;
        
        // Calcular porcentajes de forma segura
        const pctHombres = metricas.participantes > 0 
            ? ((metricas.hombres / metricas.participantes) * 100).toFixed(1) 
            : 0;
        const pctMujeres = metricas.participantes > 0 
            ? ((metricas.mujeres / metricas.participantes) * 100).toFixed(1) 
            : 0;
        
        doc.text(`Participantes hombres: ${metricas.hombres} (${pctHombres}%)`, 20, y);
        y += 7;
        doc.text(`Participantes mujeres: ${metricas.mujeres} (${pctMujeres}%)`, 20, y);
        y += 15;
        
        // Añadir más información
        doc.setFontSize(12);
        doc.text('INDICADORES DE EFICIENCIA', 20, y);
        y += 10;
        
        doc.setFontSize(10);
        const participantesPorActividad = metricas.actividades > 0 
            ? (metricas.participantes / metricas.actividades).toFixed(1) 
            : 0;
        const horasPorParticipante = metricas.participantes > 0 
            ? (metricas.horas / metricas.participantes).toFixed(2) 
            : 0;
        const sesionesPorActividad = metricas.actividades > 0 
            ? (metricas.sesiones / metricas.actividades).toFixed(1) 
            : 0;
        
        doc.text(`Participantes por actividad: ${participantesPorActividad}`, 20, y);
        y += 7;
        doc.text(`Horas por participante: ${horasPorParticipante}`, 20, y);
        y += 7;
        doc.text(`Sesiones por actividad: ${sesionesPorActividad}`, 20, y);
        y += 15;
        
        // Pie de página
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text('Dashboard Promocion de la Salud v4.0', 105, 280, { align: 'center' });
        doc.text('Distrito Sanitario Granada-Metropolitano', 105, 285, { align: 'center' });
        
        // Guardar
        const nombreArchivo = `Informe_Ejecutivo_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(nombreArchivo);
        
        console.log('✅ PDF generado:', nombreArchivo);
        alert('✅ Informe PDF generado correctamente.\n\nEl archivo se ha descargado: ' + nombreArchivo);
        
    } catch (error) {
        console.error('❌ Error al generar PDF:', error);
        alert('❌ Error al generar el PDF.\n\nDetalles: ' + error.message + '\n\nPor favor, verifica la consola (F12) para más información.');
    }
}

function generarPDFCompleto() {
    try {
        if (!estado.datosFiltrados || estado.datosFiltrados.length === 0) {
            alert('⚠️ No hay datos cargados.\n\nPor favor, carga un archivo CSV primero.');
            return;
        }
        
        if (typeof window.jspdf === 'undefined') {
            alert('❌ Error: La librería jsPDF no está cargada.\n\nPor favor, verifica tu conexión a internet y recarga la página.');
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Página 1: Portada
        doc.setFontSize(24);
        doc.setTextColor(25, 118, 210);
        doc.text('INFORME COMPLETO', 105, 40, { align: 'center' });
        
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Promocion de la Salud', 105, 55, { align: 'center' });
        doc.text('Distrito Sanitario Granada-Metropolitano', 105, 65, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setTextColor(128, 128, 128);
        doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 105, 80, { align: 'center' });
        doc.text(`Datos analizados: ${estado.datosFiltrados.length} actividades`, 105, 90, { align: 'center' });
        
        // Página 2: Métricas
        doc.addPage();
        const metricas = calcularMetricas();
        let y = 20;
        
        doc.setFontSize(16);
        doc.setTextColor(25, 118, 210);
        doc.text('1. METRICAS PRINCIPALES', 20, y);
        y += 15;
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Total de actividades: ${metricas.actividades}`, 30, y);
        y += 8;
        doc.text(`Total de participantes: ${metricas.participantes}`, 30, y);
        y += 8;
        doc.text(`Total de horas: ${metricas.horas}`, 30, y);
        y += 8;
        doc.text(`Total de sesiones: ${metricas.sesiones}`, 30, y);
        y += 8;
        doc.text(`Participantes hombres: ${metricas.hombres}`, 30, y);
        y += 8;
        doc.text(`Participantes mujeres: ${metricas.mujeres}`, 30, y);
        y += 20;
        
        // Indicadores de eficiencia
        doc.setFontSize(16);
        doc.setTextColor(25, 118, 210);
        doc.text('2. INDICADORES DE EFICIENCIA', 20, y);
        y += 15;
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        const participantesPorActividad = metricas.actividades > 0 
            ? (metricas.participantes / metricas.actividades).toFixed(1) 
            : 0;
        const horasPorParticipante = metricas.participantes > 0 
            ? (metricas.horas / metricas.participantes).toFixed(2) 
            : 0;
        const sesionesPorActividad = metricas.actividades > 0 
            ? (metricas.sesiones / metricas.actividades).toFixed(1) 
            : 0;
        
        doc.text(`Participantes por actividad: ${participantesPorActividad}`, 30, y);
        y += 8;
        doc.text(`Horas por participante: ${horasPorParticipante}`, 30, y);
        y += 8;
        doc.text(`Sesiones por actividad: ${sesionesPorActividad}`, 30, y);
        
        // Pie de página
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text('Dashboard v4.0 - Pagina 2/2', 105, 285, { align: 'center' });
        
        // Guardar
        const nombreArchivo = `Informe_Completo_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(nombreArchivo);
        
        console.log('✅ PDF completo generado:', nombreArchivo);
        alert('✅ Informe PDF Completo generado.\n\n' + nombreArchivo);
        
    } catch (error) {
        console.error('❌ Error al generar PDF completo:', error);
        alert('❌ Error al generar el PDF.\n\nDetalles: ' + error.message);
    }
}

function generarPDFComparativo() {
    try {
        if (!estado.datosFiltrados || estado.datosFiltrados.length === 0) {
            alert('⚠️ No hay datos cargados.\n\nPor favor, carga un archivo CSV primero.');
            return;
        }
        
        alert('⚖️ Generando análisis comparativo...\n\nEsta funcionalidad está en desarrollo.\n\nPor ahora, usa "Informe Ejecutivo" o "Informe Completo".');
        
    } catch (error) {
        console.error('Error:', error);
    }
}

function generarPDFPersonalizado() {
    try {
        if (!estado.datosFiltrados || estado.datosFiltrados.length === 0) {
            alert('⚠️ No hay datos cargados.\n\nPor favor, carga un archivo CSV primero.');
            return;
        }
        
        alert('⚙️ Modo personalizado...\n\nEsta funcionalidad está en desarrollo.\n\nPor ahora, usa "Informe Ejecutivo" o "Informe Completo".');
        
    } catch (error) {
        console.error('Error:', error);
    }
}

function generarInformeProfesionalExhaustivo() {
    try {
        // Verificar que estamos en modo profesional
        if (estado.nivelActual !== 'profesional' || !estado.profesionalSeleccionado) {
            alert('⚠️ Debes estar en modo "Profesional Individual".\n\n1. Selecciona "Profesional Individual" en Nivel de Análisis\n2. Elige tu nombre\n3. Vuelve a generar el informe');
            return;
        }
        
        // Verificar que hay datos
        if (!estado.datosFiltrados || estado.datosFiltrados.length === 0) {
            alert('⚠️ No hay actividades registradas para este profesional en el período seleccionado.');
            return;
        }
        
        // Verificar jsPDF
        if (typeof window.jspdf === 'undefined') {
            alert('❌ Error: La librería jsPDF no está cargada.\n\nPor favor, verifica tu conexión y recarga la página.');
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Calcular métricas
        const metricas = calcularMetricas();
        let y = 20;
        const margenIzq = 20;
        const margenDer = 190;
        const anchoUtil = margenDer - margenIzq;
        
        // ============================================
        // PÁGINA 1: PORTADA
        // ============================================
        
        // Logo/Header
        doc.setFillColor(25, 118, 210);
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont(undefined, 'bold');
        doc.text('INFORME PROFESIONAL', 105, 20, { align: 'center' });
        
        doc.setFontSize(16);
        doc.setFont(undefined, 'normal');
        doc.text('Promocion de la Salud', 105, 30, { align: 'center' });
        
        // Nombre del profesional
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        y = 60;
        doc.text(estado.profesionalSeleccionado, 105, y, { align: 'center' });
        
        // Información del documento
        y = 75;
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text('Distrito Sanitario Granada-Metropolitano', 105, y, { align: 'center' });
        
        y += 8;
        doc.text(`Periodo analizado: ${estado.datosFiltrados.length} actividades`, 105, y, { align: 'center' });
        
        y += 8;
        doc.text(`Generado: ${new Date().toLocaleDateString('es-ES', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        })}`, 105, y, { align: 'center' });
        
        // Resumen ejecutivo en portada
        y = 110;
        doc.setFontSize(14);
        doc.setTextColor(25, 118, 210);
        doc.setFont(undefined, 'bold');
        doc.text('RESUMEN EJECUTIVO', margenIzq, y);
        
        y += 10;
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
        
        const resumenLineas = [
            `Total de actividades realizadas: ${metricas.actividades}`,
            `Participantes impactados: ${metricas.participantes} personas`,
            `Horas dedicadas: ${metricas.horas} horas`,
            `Sesiones impartidas: ${metricas.sesiones}`,
            `Participacion por sexo: ${metricas.hombres} hombres, ${metricas.mujeres} mujeres`
        ];
        
        resumenLineas.forEach(linea => {
            doc.text(linea, margenIzq, y);
            y += 7;
        });
        
        // Pie de portada
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Documento generado automaticamente - Sistema de Gestion de Actividades', 105, 280, { align: 'center' });
        doc.text('Servicio Andaluz de Salud - Distrito Sanitario Granada-Metropolitano', 105, 285, { align: 'center' });
        
        // ============================================
        // PÁGINA 2: MÉTRICAS PRINCIPALES
        // ============================================
        
        doc.addPage();
        y = 20;
        
        // Título de sección
        doc.setFillColor(25, 118, 210);
        doc.rect(margenIzq, y-5, anchoUtil, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('1. METRICAS PRINCIPALES', margenIzq + 5, y + 2);
        
        y += 15;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        
        // KPIs en cajas
        const kpis = [
            { label: 'Total Actividades', valor: metricas.actividades, icono: '📊' },
            { label: 'Total Participantes', valor: metricas.participantes, icono: '👥' },
            { label: 'Horas Totales', valor: metricas.horas, icono: '⏱️' },
            { label: 'Sesiones', valor: metricas.sesiones, icono: '📅' }
        ];
        
        kpis.forEach((kpi, index) => {
            const col = index % 2;
            const fila = Math.floor(index / 2);
            const x = margenIzq + col * 85;
            const yBox = y + fila * 25;
            
            doc.setDrawColor(200, 200, 200);
            doc.setFillColor(245, 245, 245);
            doc.roundedRect(x, yBox, 80, 20, 3, 3, 'FD');
            
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`${kpi.icono} ${kpi.label}`, x + 5, yBox + 7);
            
            doc.setFontSize(16);
            doc.setTextColor(25, 118, 210);
            doc.setFont(undefined, 'bold');
            doc.text(String(kpi.valor), x + 5, yBox + 16);
            doc.setFont(undefined, 'normal');
        });
        
        y += 60;
        
        // Distribución por sexo
        doc.setFontSize(12);
        doc.setTextColor(25, 118, 210);
        doc.setFont(undefined, 'bold');
        doc.text('Distribucion de Participantes por Sexo', margenIzq, y);
        
        y += 8;
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
        
        const pctHombres = metricas.participantes > 0 
            ? ((metricas.hombres / metricas.participantes) * 100).toFixed(1) 
            : 0;
        const pctMujeres = metricas.participantes > 0 
            ? ((metricas.mujeres / metricas.participantes) * 100).toFixed(1) 
            : 0;
        
        doc.text(`Hombres: ${metricas.hombres} (${pctHombres}%)`, margenIzq + 5, y);
        y += 6;
        doc.text(`Mujeres: ${metricas.mujeres} (${pctMujeres}%)`, margenIzq + 5, y);
        
        // Indicadores de eficiencia
        y += 15;
        doc.setFontSize(12);
        doc.setTextColor(25, 118, 210);
        doc.setFont(undefined, 'bold');
        doc.text('Indicadores de Eficiencia', margenIzq, y);
        
        y += 8;
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
        
        const participantesPorActividad = metricas.actividades > 0 
            ? (metricas.participantes / metricas.actividades).toFixed(1) 
            : 0;
        const horasPorParticipante = metricas.participantes > 0 
            ? (metricas.horas / metricas.participantes).toFixed(2) 
            : 0;
        const sesionesPorActividad = metricas.actividades > 0 
            ? (metricas.sesiones / metricas.actividades).toFixed(1) 
            : 0;
        
        doc.text(`Media de participantes por actividad: ${participantesPorActividad}`, margenIzq + 5, y);
        y += 6;
        doc.text(`Horas promedio por participante: ${horasPorParticipante}`, margenIzq + 5, y);
        y += 6;
        doc.text(`Sesiones promedio por actividad: ${sesionesPorActividad}`, margenIzq + 5, y);
        
        // Pie de página
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`${estado.profesionalSeleccionado} - Pagina 2`, 105, 285, { align: 'center' });
        
        // ============================================
        // PÁGINA 3: DISTRIBUCIÓN DE ACTIVIDADES
        // ============================================
        
        doc.addPage();
        y = 20;
        
        // Título
        doc.setFillColor(25, 118, 210);
        doc.rect(margenIzq, y-5, anchoUtil, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('2. DISTRIBUCION DE ACTIVIDADES', margenIzq + 5, y + 2);
        
        y += 15;
        
        // Por tipo de actividad
        doc.setFontSize(12);
        doc.setTextColor(25, 118, 210);
        doc.setFont(undefined, 'bold');
        doc.text('Por Tipo de Actividad', margenIzq, y);
        
        y += 8;
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
        
        const tiposConteo = {};
        estado.datosFiltrados.forEach(row => {
            const tipo = row[CONFIG.campos.tipo_actividad];
            const nombre = CONFIG.tipos_actividad[tipo] || 'Sin especificar';
            tiposConteo[nombre] = (tiposConteo[nombre] || 0) + 1;
        });
        
        const tiposOrdenados = Object.entries(tiposConteo)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        
        tiposOrdenados.forEach(([tipo, count]) => {
            if (y > 260) {
                doc.addPage();
                y = 20;
            }
            doc.text(`${tipo}: ${count}`, margenIzq + 5, y);
            y += 5;
        });
        
        y += 5;
        
        // Por temática
        doc.setFontSize(12);
        doc.setTextColor(25, 118, 210);
        doc.setFont(undefined, 'bold');
        doc.text('Por Tematica', margenIzq, y);
        
        y += 8;
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
        
        const tematicasConteo = {};
        estado.datosFiltrados.forEach(row => {
            const tem = row[CONFIG.campos.tematica];
            const nombre = CONFIG.tematicas[tem] || 'Sin especificar';
            tematicasConteo[nombre] = (tematicasConteo[nombre] || 0) + 1;
        });
        
        const tematicasOrdenadas = Object.entries(tematicasConteo)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        
        tematicasOrdenadas.forEach(([tematica, count]) => {
            if (y > 260) {
                doc.addPage();
                y = 20;
            }
            doc.text(`${tematica}: ${count}`, margenIzq + 5, y);
            y += 5;
        });
        
        // Pie de página
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`${estado.profesionalSeleccionado} - Pagina 3`, 105, 285, { align: 'center' });
        
        // ============================================
        // PÁGINA 4: LISTADO DETALLADO DE ACTIVIDADES
        // ============================================
        
        doc.addPage();
        y = 20;
        
        // Título
        doc.setFillColor(25, 118, 210);
        doc.rect(margenIzq, y-5, anchoUtil, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('3. LISTADO DETALLADO DE ACTIVIDADES', margenIzq + 5, y + 2);
        
        y += 15;
        
        // Tabla de actividades
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
        
        // Encabezados
        doc.setFont(undefined, 'bold');
        doc.text('Fecha', margenIzq, y);
        doc.text('Actividad', margenIzq + 25, y);
        doc.text('Tipo', margenIzq + 85, y);
        doc.text('Part.', margenIzq + 130, y);
        doc.text('Hrs', margenIzq + 150, y);
        doc.text('Ses', margenIzq + 165, y);
        
        y += 2;
        doc.setDrawColor(200, 200, 200);
        doc.line(margenIzq, y, margenDer, y);
        y += 4;
        
        doc.setFont(undefined, 'normal');
        
        estado.datosFiltrados.forEach((row, index) => {
            if (y > 270) {
                doc.addPage();
                y = 20;
                // Repetir encabezados
                doc.setFont(undefined, 'bold');
                doc.text('Fecha', margenIzq, y);
                doc.text('Actividad', margenIzq + 25, y);
                doc.text('Tipo', margenIzq + 85, y);
                doc.text('Part.', margenIzq + 130, y);
                doc.text('Hrs', margenIzq + 150, y);
                doc.text('Ses', margenIzq + 165, y);
                y += 2;
                doc.line(margenIzq, y, margenDer, y);
                y += 4;
                doc.setFont(undefined, 'normal');
            }
            
            const fecha = row[CONFIG.campos.fecha_inicio] || '';
            let nombreActividad = row[CONFIG.campos.nombre_actividad] || 'Sin nombre';
            if (nombreActividad.length > 25) nombreActividad = nombreActividad.substring(0, 22) + '...';
            
            const tipoId = row[CONFIG.campos.tipo_actividad];
            let tipoNombre = CONFIG.tipos_actividad[tipoId] || 'N/A';
            if (tipoNombre.length > 20) tipoNombre = tipoNombre.substring(0, 17) + '...';
            
            const participantes = row[CONFIG.campos.participantes] || '0';
            const horas = row[CONFIG.campos.horas] || '0';
            const sesiones = row[CONFIG.campos.sesiones] || '0';
            
            doc.text(fecha, margenIzq, y);
            doc.text(nombreActividad, margenIzq + 25, y);
            doc.text(tipoNombre, margenIzq + 85, y);
            doc.text(String(participantes), margenIzq + 130, y);
            doc.text(String(horas), margenIzq + 150, y);
            doc.text(String(sesiones), margenIzq + 165, y);
            
            y += 5;
        });
        
        // Número de página actual
        const paginaActual = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`${estado.profesionalSeleccionado} - Pagina ${paginaActual}`, 105, 285, { align: 'center' });
        
        // ============================================
        // PÁGINA FINAL: CONCLUSIONES
        // ============================================
        
        doc.addPage();
        y = 20;
        
        // Título
        doc.setFillColor(25, 118, 210);
        doc.rect(margenIzq, y-5, anchoUtil, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('4. CONCLUSIONES Y CUMPLIMIENTO DE OBJETIVOS', margenIzq + 5, y + 2);
        
        y += 15;
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
        
        const conclusiones = [
            `Durante el periodo analizado, ${estado.profesionalSeleccionado} ha realizado un total de`,
            `${metricas.actividades} actividades de promocion de la salud, impactando directamente a`,
            `${metricas.participantes} participantes a traves de ${metricas.sesiones} sesiones`,
            `y ${metricas.horas} horas de trabajo directo con la poblacion.`,
            '',
            'Este informe constituye evidencia documentada del cumplimiento de los objetivos',
            'de promocion de la salud establecidos para el profesional, demostrando el',
            'compromiso activo en la mejora de la salud de la poblacion del distrito.'
        ];
        
        conclusiones.forEach(linea => {
            doc.text(linea, margenIzq, y);
            y += 6;
        });
        
        y += 10;
        
        // Sello/Firma
        doc.setDrawColor(25, 118, 210);
        doc.setLineWidth(0.5);
        doc.rect(margenIzq, y, anchoUtil, 40);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Documento generado automaticamente el:', margenIzq + 5, y + 10);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(25, 118, 210);
        doc.text(new Date().toLocaleString('es-ES'), margenIzq + 5, y + 17);
        
        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text('Sistema de Gestion de Actividades de Promocion de la Salud', margenIzq + 5, y + 28);
        doc.text('Distrito Sanitario Granada-Metropolitano', margenIzq + 5, y + 34);
        
        // Pie de página final
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`${estado.profesionalSeleccionado} - Pagina ${doc.internal.getNumberOfPages()}`, 105, 285, { align: 'center' });
        
        // ============================================
        // GUARDAR PDF
        // ============================================
        
        const nombreArchivo = `Informe_Profesional_${estado.profesionalSeleccionado.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(nombreArchivo);
        
        console.log('✅ Informe profesional generado:', nombreArchivo);
        alert(`✅ Informe Profesional Generado Exitosamente\n\nArchivo: ${nombreArchivo}\n\nContenido:\n• Portada profesional\n• Metricas principales\n• Distribucion de actividades\n• Listado completo detallado\n• Conclusiones\n\nEste documento sirve como evidencia oficial para justificar el cumplimiento de objetivos.`);
        
    } catch (error) {
        console.error('❌ Error al generar informe profesional:', error);
        alert('❌ Error al generar el informe.\n\nDetalles: ' + error.message);
    }
}

export { mostrarPanelPDF, accionRapidaPDF, generarInformeProfesionalExhaustivo,
         generarPDFEjecutivo, generarPDFCompleto, generarPDFComparativo, generarPDFPersonalizado };

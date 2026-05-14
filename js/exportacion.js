import { CONFIG } from './config.js';
import { estado } from './estado.js';
import { parsearFechaREDCap, formatearFecha } from './utils.js';

function exportarExcelProfesional() {
    mostrarLoading(true);
    
    try {
        const wb = XLSX.utils.book_new();
        
        // HOJA 1: Resumen Ejecutivo
        const metricas = calcularMetricas();
        const resumenData = [
            ['REGISTRO DE ACTUACIONES DE PROMOCIÓN DE LA SALUD'],
            ['Distrito Sanitario Granada-Metropolitano'],
            [''],
            ['MÉTRICAS GLOBALES'],
            ['Total de actividades', metricas.actividades],
            ['Total de participantes', metricas.participantes],
            ['Total de horas', metricas.horas],
            ['Total de sesiones', metricas.sesiones],
            ['Participantes hombres', metricas.hombres, `${((metricas.hombres/metricas.participantes)*100).toFixed(1)}%`],
            ['Participantes mujeres', metricas.mujeres, `${((metricas.mujeres/metricas.participantes)*100).toFixed(1)}%`],
            [''],
            ['Nivel de análisis', document.getElementById('nivel-actual-texto').textContent],
            ['Fecha de generación', new Date().toLocaleDateString('es-ES')]
        ];
        
        const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
        wsResumen['!cols'] = [{wch: 30}, {wch: 20}, {wch: 15}];
        XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen Ejecutivo');
        
        // HOJA 2: Distrito Granada
        const datosGranada = estado.datosFiltrados.filter(row => String(row[CONFIG.campos.distrito]) === '0');
        if (datosGranada.length > 0) {
            const wsGranada = crearHojaDistrito(datosGranada, 'granada');
            XLSX.utils.book_append_sheet(wb, wsGranada, 'Distrito Granada');
        }
        
        // HOJA 3: Distrito Metropolitano
        const datosMetro = estado.datosFiltrados.filter(row => String(row[CONFIG.campos.distrito]) === '1');
        if (datosMetro.length > 0) {
            const wsMetro = crearHojaDistrito(datosMetro, 'metro');
            XLSX.utils.book_append_sheet(wb, wsMetro, 'Distrito Metropolitano');
        }
        
        // HOJA 4: Análisis por Unidad
        const wsUnidades = crearAnalisisUnidades();
        XLSX.utils.book_append_sheet(wb, wsUnidades, 'Por Unidad');
        
        // HOJA 5: Análisis por Profesional
        const wsProfesionales = crearAnalisisProfesionales();
        XLSX.utils.book_append_sheet(wb, wsProfesionales, 'Por Profesional');
        
        // HOJA 6: Análisis por Temática
        const wsTematicas = crearAnalisisTematicas();
        XLSX.utils.book_append_sheet(wb, wsTematicas, 'Por Temática');
        
        // HOJA 7: Evolución Mensual
        const wsMensual = crearEvolucionMensual();
        XLSX.utils.book_append_sheet(wb, wsMensual, 'Evolución Mensual');
        
        // Exportar archivo
        const fecha = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `Informe_Promocion_Salud_${fecha}.xlsx`);
        
        mostrarLoading(false);
    } catch (error) {
        console.error('Error al exportar Excel:', error);
        alert('Error al generar el archivo Excel. Por favor, inténtelo de nuevo.');
        mostrarLoading(false);
    }
}

function crearHojaDistrito(datos, distrito) {
    const rows = [
        ['Unidad', 'Profesional', 'Fecha', 'Tipo', 'Actividad', 'Participantes', 'Hombres', 'Mujeres', 'Horas']
    ];
    
    datos.forEach(row => {
        const unidadId = distrito === 'granada' ? 
            String(row[CONFIG.campos.unidad_granada]) : 
            String(row[CONFIG.campos.unidad_metro]);
        const unidades = distrito === 'granada' ? CONFIG.unidades_granada : CONFIG.unidades_metro;
        const unidad = unidades[unidadId] || '-';
        
        rows.push([
            unidad,
            row[CONFIG.campos.profesional] || '-',
            formatearFecha(row[CONFIG.campos.fecha_inicio]),
            CONFIG.tipos_actividad[row[CONFIG.campos.tipo_actividad]] || '-',
            row[CONFIG.campos.nombre_actividad] || '-',
            parseInt(row[CONFIG.campos.participantes]) || 0,
            parseInt(row[CONFIG.campos.hombres]) || 0,
            parseInt(row[CONFIG.campos.mujeres]) || 0,
            parseInt(row[CONFIG.campos.horas]) || 0
        ]);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [
        {wch: 25}, {wch: 30}, {wch: 12}, {wch: 30}, 
        {wch: 40}, {wch: 13}, {wch: 10}, {wch: 10}, {wch: 8}
    ];
    
    return ws;
}

function crearAnalisisUnidades() {
    const ranking = {};
    
    estado.datosFiltrados.forEach(row => {
        const distrito = String(row[CONFIG.campos.distrito]);
        let unidadNombre = '';
        
        if (distrito === '0') {
            const unidadId = String(row[CONFIG.campos.unidad_granada]);
            unidadNombre = CONFIG.unidades_granada[unidadId] ? 
                `${CONFIG.unidades_granada[unidadId]} (Granada)` : 'Sin unidad';
        } else if (distrito === '1') {
            const unidadId = String(row[CONFIG.campos.unidad_metro]);
            unidadNombre = CONFIG.unidades_metro[unidadId] ? 
                `${CONFIG.unidades_metro[unidadId]} (Metro)` : 'Sin unidad';
        }
        
        if (unidadNombre) {
            if (!ranking[unidadNombre]) {
                ranking[unidadNombre] = {
                    actividades: 0,
                    participantes: 0,
                    hombres: 0,
                    mujeres: 0,
                    horas: 0,
                    sesiones: 0
                };
            }
            ranking[unidadNombre].actividades++;
            ranking[unidadNombre].participantes += parseInt(row[CONFIG.campos.participantes]) || 0;
            ranking[unidadNombre].hombres += parseInt(row[CONFIG.campos.hombres]) || 0;
            ranking[unidadNombre].mujeres += parseInt(row[CONFIG.campos.mujeres]) || 0;
            ranking[unidadNombre].horas += parseInt(row[CONFIG.campos.horas]) || 0;
            ranking[unidadNombre].sesiones += parseInt(row[CONFIG.campos.sesiones]) || 0;
        }
    });
    
    const rows = [
        ['Unidad', 'Actividades', 'Participantes', 'Hombres', 'Mujeres', 'Horas', 'Sesiones', 'Promedio Part./Act.']
    ];
    
    Object.entries(ranking)
        .sort((a, b) => b[1].actividades - a[1].actividades)
        .forEach(([unidad, datos]) => {
            rows.push([
                unidad,
                datos.actividades,
                datos.participantes,
                datos.hombres,
                datos.mujeres,
                datos.horas,
                datos.sesiones,
                datos.actividades > 0 ? (datos.participantes / datos.actividades).toFixed(1) : 0
            ]);
        });
    
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{wch: 35}, {wch: 12}, {wch: 13}, {wch: 10}, {wch: 10}, {wch: 8}, {wch: 10}, {wch: 18}];
    
    return ws;
}

function crearAnalisisProfesionales() {
    const ranking = {};
    
    estado.datosFiltrados.forEach(row => {
        const profesional = row[CONFIG.campos.profesional];
        if (profesional) {
            if (!ranking[profesional]) {
                ranking[profesional] = {
                    actividades: 0,
                    participantes: 0,
                    hombres: 0,
                    mujeres: 0,
                    horas: 0,
                    sesiones: 0
                };
            }
            ranking[profesional].actividades++;
            ranking[profesional].participantes += parseInt(row[CONFIG.campos.participantes]) || 0;
            ranking[profesional].hombres += parseInt(row[CONFIG.campos.hombres]) || 0;
            ranking[profesional].mujeres += parseInt(row[CONFIG.campos.mujeres]) || 0;
            ranking[profesional].horas += parseInt(row[CONFIG.campos.horas]) || 0;
            ranking[profesional].sesiones += parseInt(row[CONFIG.campos.sesiones]) || 0;
        }
    });
    
    const rows = [
        ['Profesional', 'Actividades', 'Participantes', 'Hombres', 'Mujeres', 'Horas', 'Sesiones', 'Promedio Part./Act.']
    ];
    
    Object.entries(ranking)
        .sort((a, b) => b[1].actividades - a[1].actividades)
        .forEach(([profesional, datos]) => {
            rows.push([
                profesional,
                datos.actividades,
                datos.participantes,
                datos.hombres,
                datos.mujeres,
                datos.horas,
                datos.sesiones,
                datos.actividades > 0 ? (datos.participantes / datos.actividades).toFixed(1) : 0
            ]);
        });
    
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{wch: 35}, {wch: 12}, {wch: 13}, {wch: 10}, {wch: 10}, {wch: 8}, {wch: 10}, {wch: 18}];
    
    return ws;
}

function crearAnalisisTematicas() {
    const conteo = {};
    
    estado.datosFiltrados.forEach(row => {
        const tematica = CONFIG.tematicas[row[CONFIG.campos.tematica]] || 'Sin clasificar';
        conteo[tematica] = (conteo[tematica] || 0) + 1;
    });
    
    const rows = [['Temática', 'Número de Actividades', 'Porcentaje']];
    const total = estado.datosFiltrados.length;
    
    Object.entries(conteo)
        .sort((a, b) => b[1] - a[1])
        .forEach(([tematica, cantidad]) => {
            rows.push([
                tematica,
                cantidad,
                `${((cantidad/total)*100).toFixed(1)}%`
            ]);
        });
    
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{wch: 40}, {wch: 20}, {wch: 12}];
    
    return ws;
}

function crearEvolucionMensual() {
    const porMes = {};
    
    estado.datosFiltrados.forEach(row => {
        const fecha = parsearFechaREDCap(row[CONFIG.campos.fecha_inicio]);
        if (fecha) {
            const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
            if (!porMes[mes]) {
                porMes[mes] = {
                    actividades: 0,
                    participantes: 0,
                    horas: 0
                };
            }
            porMes[mes].actividades++;
            porMes[mes].participantes += parseInt(row[CONFIG.campos.participantes]) || 0;
            porMes[mes].horas += parseInt(row[CONFIG.campos.horas]) || 0;
        }
    });
    
    const rows = [['Mes', 'Actividades', 'Participantes', 'Horas']];
    
    Object.keys(porMes)
        .sort()
        .forEach(mes => {
            rows.push([
                mes,
                porMes[mes].actividades,
                porMes[mes].participantes,
                porMes[mes].horas
            ]);
        });
    
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{wch: 12}, {wch: 12}, {wch: 13}, {wch: 8}];
    
    return ws;
}

function inicializarExportacion() {
    const btnExcel = document.getElementById('btn-exportar-excel');
    if (btnExcel) btnExcel.addEventListener('click', exportarExcelProfesional);
}

export { exportarExcelProfesional, inicializarExportacion };

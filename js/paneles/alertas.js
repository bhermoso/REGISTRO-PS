import { CONFIG } from '../config.js';
import { estado } from '../estado.js';
import { parsearFechaREDCap } from '../utils.js';

function generarAlertas() {
    const alertas = [];
    
    const haceUnMes = new Date();
    haceUnMes.setMonth(haceUnMes.getMonth() - 1);
    
    const actividadesPorUnidad = {};
    estado.datosFiltrados.forEach(row => {
        const fecha = parsearFechaREDCap(row[CONFIG.campos.fecha_inicio]);
        if (fecha && fecha >= haceUnMes) {
            const distrito = String(row[CONFIG.campos.distrito]);
            let unidadNombre = '';
            
            if (distrito === '0') {
                const unidadId = String(row[CONFIG.campos.unidad_granada]);
                unidadNombre = CONFIG.unidades_granada[unidadId];
            } else {
                const unidadId = String(row[CONFIG.campos.unidad_metro]);
                unidadNombre = CONFIG.unidades_metro[unidadId];
            }
            
            if (unidadNombre) {
                actividadesPorUnidad[unidadNombre] = (actividadesPorUnidad[unidadNombre] || 0) + 1;
            }
        }
    });
    
    const todasUnidades = {...CONFIG.unidades_granada, ...CONFIG.unidades_metro};
    Object.values(todasUnidades).forEach(unidad => {
        const actividades = actividadesPorUnidad[unidad] || 0;
        if (actividades < 5) {
            alertas.push({
                nivel: 'media',
                icono: '⚠️',
                texto: `La unidad "${unidad}" tiene solo ${actividades} actividades en el último mes`
            });
        }
    });
    
    const tematicasPrioritarias = {
        '7': 'Consumo de tabaco (PITA)',
        '16': 'Manejo terapéutico enfermedad (PIOBIN)',
        '19': 'Otras formas de fumar (PSIA)'
    };
    
    const totalActividades = estado.datosFiltrados.length;
    Object.entries(tematicasPrioritarias).forEach(([codigo, nombre]) => {
        const actividadesTematica = estado.datosFiltrados.filter(row => 
            String(row[CONFIG.campos.tematica]) === codigo
        ).length;
        
        const porcentaje = (actividadesTematica / totalActividades) * 100;
        if (porcentaje < 10) {
            alertas.push({
                nivel: 'alta',
                icono: '🚨',
                texto: `Baja cobertura en ${nombre}: solo ${porcentaje.toFixed(1)}% de actividades`
            });
        }
    });
    
    const haceDosMeses = new Date();
    haceDosMeses.setMonth(haceDosMeses.getMonth() - 2);
    
    const profesionalesActivos = new Set();
    estado.datosFiltrados.forEach(row => {
        const fecha = parsearFechaREDCap(row[CONFIG.campos.fecha_inicio]);
        if (fecha && fecha >= haceDosMeses) {
            profesionalesActivos.add(row[CONFIG.campos.profesional]);
        }
    });
    
    const todosProfesionales = new Set(estado.datosOriginales.map(row => row[CONFIG.campos.profesional]).filter(Boolean));
    const inactivos = [...todosProfesionales].filter(prof => !profesionalesActivos.has(prof));
    
    if (inactivos.length > 0 && inactivos.length < 10) {
        alertas.push({
            nivel: 'baja',
            icono: 'ℹ️',
            texto: `${inactivos.length} profesionales sin actividad en los últimos 2 meses`
        });
    }
    
    const metricas = calcularMetricas();
    if (metricas.participantes > 0) {
        const pctHombres = (metricas.hombres / metricas.participantes) * 100;
        
        if (pctHombres < 30) {
            alertas.push({
                nivel: 'media',
                icono: '⚠️',
                texto: `Baja participación masculina: ${pctHombres.toFixed(1)}%. Revisar estrategias de captación`
            });
        } else if (pctHombres > 70) {
            alertas.push({
                nivel: 'media',
                icono: '⚠️',
                texto: `Baja participación femenina: ${(100-pctHombres).toFixed(1)}%. Revisar estrategias de captación`
            });
        }
    }
    
    mostrarAlertas(alertas);
}

function mostrarAlertas(alertas) {
    if (alertas.length === 0) {
        document.getElementById('alertas-panel').style.display = 'none';
        return;
    }
    
    const container = document.getElementById('alertas-container');
    container.innerHTML = '';
    
    alertas.forEach(alerta => {
        const div = document.createElement('div');
        div.className = 'alerta-item';
        div.innerHTML = `
            <div class="alerta-icono">${alerta.icono}</div>
            <div class="alerta-texto">${alerta.texto}</div>
            <div class="alerta-nivel alerta-${alerta.nivel}">${alerta.nivel.toUpperCase()}</div>
        `;
        container.appendChild(div);
    });
    
    document.getElementById('alertas-panel').style.display = 'block';
}

export { generarAlertas, mostrarAlertas };

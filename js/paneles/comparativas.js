import { estado } from '../estado.js';
import { parsearFechaREDCap } from '../utils.js';

function calcularComparativa() {
    const periodoActual = document.getElementById('periodo-actual').value;
    const tipoComparacion = document.getElementById('periodo-comparar').value;
    
    const hoy = new Date();
    let fechasActual, fechasAnterior;
    
    switch(periodoActual) {
        case 'mes-actual':
            fechasActual = {
                desde: new Date(hoy.getFullYear(), hoy.getMonth(), 1),
                hasta: new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
            };
            if (tipoComparacion === 'anterior') {
                fechasAnterior = {
                    desde: new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1),
                    hasta: new Date(hoy.getFullYear(), hoy.getMonth(), 0)
                };
            } else {
                fechasAnterior = {
                    desde: new Date(hoy.getFullYear() - 1, hoy.getMonth(), 1),
                    hasta: new Date(hoy.getFullYear() - 1, hoy.getMonth() + 1, 0)
                };
            }
            break;
            
        case 'trimestre-actual':
            const trimestreActual = Math.floor(hoy.getMonth() / 3);
            fechasActual = {
                desde: new Date(hoy.getFullYear(), trimestreActual * 3, 1),
                hasta: new Date(hoy.getFullYear(), (trimestreActual + 1) * 3, 0)
            };
            if (tipoComparacion === 'anterior') {
                const trimestreAnterior = trimestreActual === 0 ? 3 : trimestreActual - 1;
                const añoAnterior = trimestreActual === 0 ? hoy.getFullYear() - 1 : hoy.getFullYear();
                fechasAnterior = {
                    desde: new Date(añoAnterior, trimestreAnterior * 3, 1),
                    hasta: new Date(añoAnterior, (trimestreAnterior + 1) * 3, 0)
                };
            } else {
                fechasAnterior = {
                    desde: new Date(hoy.getFullYear() - 1, trimestreActual * 3, 1),
                    hasta: new Date(hoy.getFullYear() - 1, (trimestreActual + 1) * 3, 0)
                };
            }
            break;
            
        case 'año-actual':
            fechasActual = {
                desde: new Date(hoy.getFullYear(), 0, 1),
                hasta: new Date(hoy.getFullYear(), 11, 31)
            };
            fechasAnterior = {
                desde: new Date(hoy.getFullYear() - 1, 0, 1),
                hasta: new Date(hoy.getFullYear() - 1, 11, 31)
            };
            break;
    }
    
    const datosActual = filtrarPorPeriodo(estado.datosFiltrados, fechasActual);
    const datosAnterior = filtrarPorPeriodo(estado.datosOriginales, fechasAnterior);
    
    const metricasActual = calcularMetricasPeriodo(datosActual);
    const metricasAnterior = calcularMetricasPeriodo(datosAnterior);
    
    mostrarComparativas(metricasActual, metricasAnterior);
}

function filtrarPorPeriodo(datos, fechas) {
    return datos.filter(row => {
        const fecha = parsearFechaREDCap(row[CONFIG.campos.fecha_inicio]);
        return fecha && fecha >= fechas.desde && fecha <= fechas.hasta;
    });
}

function calcularMetricasPeriodo(datos) {
    return {
        actividades: datos.length,
        participantes: datos.reduce((sum, row) => sum + (parseInt(row[CONFIG.campos.participantes]) || 0), 0),
        horas: datos.reduce((sum, row) => sum + (parseInt(row[CONFIG.campos.horas]) || 0), 0),
        sesiones: datos.reduce((sum, row) => sum + (parseInt(row[CONFIG.campos.sesiones]) || 0), 0)
    };
}

function mostrarComparativas(actual, anterior) {
    const container = document.getElementById('comparativa-cards');
    container.innerHTML = '';
    
    const metricas = [
        {label: 'Actividades', actual: actual.actividades, anterior: anterior.actividades},
        {label: 'Participantes', actual: actual.participantes, anterior: anterior.participantes},
        {label: 'Horas', actual: actual.horas, anterior: anterior.horas},
        {label: 'Sesiones', actual: actual.sesiones, anterior: anterior.sesiones}
    ];
    
    metricas.forEach(metrica => {
        const cambio = metrica.actual - metrica.anterior;
        const cambioPct = metrica.anterior > 0 ? ((cambio / metrica.anterior) * 100).toFixed(1) : 0;
        const clase = cambio > 0 ? 'cambio-positivo' : cambio < 0 ? 'cambio-negativo' : 'cambio-neutro';
        const icono = cambio > 0 ? '▲' : cambio < 0 ? '▼' : '═';
        
        const card = document.createElement('div');
        card.className = 'comparativa-card';
        card.innerHTML = `
            <div class="comparativa-label">${metrica.label}</div>
            <div class="comparativa-valores">
                <span class="valor-actual">${metrica.actual.toLocaleString('es-ES')}</span>
                <span class="valor-anterior">vs ${metrica.anterior.toLocaleString('es-ES')}</span>
            </div>
            <div class="comparativa-cambio ${clase}">
                ${icono} ${cambio > 0 ? '+' : ''}${cambio.toLocaleString('es-ES')} (${cambioPct}%)
            </div>
        `;
        container.appendChild(card);
    });
    
    document.getElementById('comparativas-panel').style.display = 'block';
}

function inicializarComparativas() {
    const btn = document.getElementById('btn-comparativa');
    if (btn) btn.addEventListener('click', function() {
        const panel = document.getElementById('comparativas-panel');
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            if (panel.style.display === 'block') calcularComparativa();
        }
    });
}

export { calcularComparativa, inicializarComparativas };

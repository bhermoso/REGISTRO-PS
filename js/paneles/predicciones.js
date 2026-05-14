import { estado } from '../estado.js';
import { parsearFechaREDCap } from '../utils.js';

function calcularPredicciones() {
    if (estado.datosFiltrados.length < 10) {
        document.getElementById('predictivo-panel').style.display = 'none';
        return;
    }
    
    const porMes = {};
    estado.datosFiltrados.forEach(row => {
        const fecha = parsearFechaREDCap(row[CONFIG.campos.fecha_inicio]);
        if (fecha) {
            const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
            if (!porMes[mes]) {
                porMes[mes] = { actividades: 0, participantes: 0, horas: 0 };
            }
            porMes[mes].actividades++;
            porMes[mes].participantes += parseInt(row[CONFIG.campos.participantes]) || 0;
            porMes[mes].horas += parseInt(row[CONFIG.campos.horas]) || 0;
        }
    });
    
    const meses = Object.keys(porMes).sort();
    if (meses.length < 3) {
        document.getElementById('predictivo-panel').style.display = 'none';
        return;
    }
    
    const ultimos3Meses = meses.slice(-3);
    const promedioActividades = ultimos3Meses.reduce((sum, mes) => sum + porMes[mes].actividades, 0) / 3;
    const promedioParticipantes = ultimos3Meses.reduce((sum, mes) => sum + porMes[mes].participantes, 0) / 3;
    const promedioHoras = ultimos3Meses.reduce((sum, mes) => sum + porMes[mes].horas, 0) / 3;
    
    const actividadMesAnterior = porMes[ultimos3Meses[ultimos3Meses.length - 1]].actividades;
    const tendenciaActividades = actividadMesAnterior > promedioActividades ? 'positiva' : 
                                actividadMesAnterior < promedioActividades ? 'negativa' : 'estable';
    
    const container = document.getElementById('predictivo-cards');
    container.innerHTML = `
        <div class="predictivo-card">
            <div class="predictivo-periodo">Proyección próximo mes</div>
            <div class="predictivo-valor">${Math.round(promedioActividades)}</div>
            <div class="predictivo-label">Actividades estimadas</div>
            <div class="predictivo-tendencia tendencia-${tendenciaActividades}">
                ${tendenciaActividades === 'positiva' ? '▲ Tendencia alcista' : 
                  tendenciaActividades === 'negativa' ? '▼ Tendencia bajista' : 
                  '═ Tendencia estable'}
            </div>
        </div>
        <div class="predictivo-card">
            <div class="predictivo-periodo">Proyección próximo mes</div>
            <div class="predictivo-valor">${Math.round(promedioParticipantes)}</div>
            <div class="predictivo-label">Participantes estimados</div>
            <div class="predictivo-tendencia">
                Basado en media móvil (últimos 3 meses)
            </div>
        </div>
        <div class="predictivo-card">
            <div class="predictivo-periodo">Proyección próximo mes</div>
            <div class="predictivo-valor">${Math.round(promedioHoras)}</div>
            <div class="predictivo-label">Horas estimadas</div>
            <div class="predictivo-tendencia">
                Basado en media móvil (últimos 3 meses)
            </div>
        </div>
    `;
    
    crearGraficoPredictivo(porMes, meses, promedioActividades);
    
    document.getElementById('predictivo-panel').style.display = 'block';
}

function crearGraficoPredictivo(porMes, meses, promedioProximo) {
    const mesesRecientes = meses.slice(-6);
    const datosReales = mesesRecientes.map(mes => porMes[mes].actividades);
    
    const proximoMes = new Date(mesesRecientes[mesesRecientes.length - 1] + '-01');
    proximoMes.setMonth(proximoMes.getMonth() + 1);
    const proximoMesStr = `${proximoMes.getFullYear()}-${String(proximoMes.getMonth() + 1).padStart(2, '0')}`;
    
    const ctx = document.getElementById('grafico-predictivo').getContext('2d');
    if (window.chartPredictivo) window.chartPredictivo.destroy();
    
    window.chartPredictivo = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [...mesesRecientes, proximoMesStr],
            datasets: [
                {
                    label: 'Actividades reales',
                    data: datosReales,
                    borderColor: 'rgba(25, 118, 210, 1)',
                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Proyección',
                    data: [...Array(mesesRecientes.length).fill(null), Math.round(promedioProximo)],
                    borderColor: 'rgba(156, 39, 176, 1)',
                    backgroundColor: 'rgba(156, 39, 176, 0.1)',
                    borderDash: [5, 5],
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { 
                    display: true,
                    labels: { color: '#fff' }
                },
                title: {
                    display: true,
                    text: 'Evolución y Proyección de Actividades',
                    color: '#fff',
                    font: { size: 16 }
                }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: { color: '#fff' }
                },
                x: { 
                    ticks: { color: '#fff' }
                }
            }
        }
    });
}

export { calcularPredicciones };

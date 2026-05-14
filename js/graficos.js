import { CONFIG } from './config.js';
import { estado } from './estado.js';
import { calcularMetricas } from './metricas.js';
import { parsearFechaREDCap } from './utils.js';

function actualizarGraficos() {
    actualizarGraficoTipos();
    actualizarGraficoTematicas();
    actualizarGraficoProgramas();
    actualizarGraficoSexo(calcularMetricas());
    actualizarGraficoComparativo();
    actualizarGraficoMensual();
}

function contarPor(datos, campo, opciones) {
    const conteo = {};
    datos.forEach(row => {
        const valor = String(row[campo]);
        conteo[valor] = (conteo[valor] || 0) + 1;
    });
    
    return Object.entries(conteo)
        .map(([key, value]) => ({
            label: opciones[key] || key,
            value: value
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
}

function actualizarGraficoTipos() {
    const datos = contarPor(estado.datosFiltrados, CONFIG.campos.tipo_actividad, CONFIG.tipos_actividad);
    crearGraficoBarrasHorizontal('grafico-tipos', datos);
}

function actualizarGraficoTematicas() {
    const datos = contarPor(estado.datosFiltrados, CONFIG.campos.tematica, CONFIG.tematicas);
    crearGraficoBarrasHorizontal('grafico-tematicas', datos);
}

function actualizarGraficoProgramas() {
    const datos = contarPor(estado.datosFiltrados, CONFIG.campos.programa, CONFIG.programas);
    crearGraficoBarrasHorizontal('grafico-programas', datos);
}

function actualizarGraficoSexo(metricas) {
    const ctx = document.getElementById('grafico-genero');
    
    if (estado.graficos.sexo) {
        estado.graficos.sexo.destroy();
    }
    
    estado.graficos.sexo = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Hombres', 'Mujeres'],
            datasets: [{
                data: [metricas.hombres, metricas.mujeres],
                backgroundColor: [CONFIG.colores.primario, CONFIG.colores.acento3]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function actualizarGraficoComparativo() {
    const ctx = document.getElementById('grafico-distritos');
    
    if (estado.graficos.distritos) {
        estado.graficos.distritos.destroy();
    }
    
    let labels, data, titulo;
    
    if (estado.nivelActual === 'global') {
        // Comparativa por distritos
        const granada = estado.datosFiltrados.filter(row => String(row[CONFIG.campos.distrito]) === '0').length;
        const metro = estado.datosFiltrados.filter(row => String(row[CONFIG.campos.distrito]) === '1').length;
        labels = ['Distrito Granada', 'Distrito Metropolitano'];
        data = [granada, metro];
        titulo = '📊 Comparativa por Distrito';
    } else if (estado.nivelActual === 'distrito-granada' || estado.nivelActual === 'distrito-metro') {
        // Top 5 unidades del distrito
        const ranking = {};
        estado.datosFiltrados.forEach(row => {
            const distrito = String(row[CONFIG.campos.distrito]);
            let unidadNombre = '';
            
            if (distrito === '0') {
                const unidadId = String(row[CONFIG.campos.unidad_granada]);
                unidadNombre = CONFIG.unidades_granada[unidadId] || '';
            } else {
                const unidadId = String(row[CONFIG.campos.unidad_metro]);
                unidadNombre = CONFIG.unidades_metro[unidadId] || '';
            }
            
            if (unidadNombre) {
                ranking[unidadNombre] = (ranking[unidadNombre] || 0) + 1;
            }
        });
        
        const top5 = Object.entries(ranking)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        labels = top5.map(([nombre]) => nombre);
        data = top5.map(([, valor]) => valor);
        titulo = '🏆 Top 5 Unidades por Actividades';
    } else {
        // Para otros niveles, mostrar evolución mensual simple
        labels = ['Actividades'];
        data = [estado.datosFiltrados.length];
        titulo = '📊 Total de Actividades';
    }
    
    document.getElementById('titulo-grafico-comparativo').textContent = titulo;
    
    estado.graficos.distritos = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Actividades',
                data: data,
                backgroundColor: CONFIG.colores.paleta
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function actualizarGraficoMensual() {
    const porMes = {};
    estado.datosFiltrados.forEach(row => {
        const fecha = parsearFechaREDCap(row[CONFIG.campos.fecha_inicio]);
        if (fecha) {
            const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
            porMes[mes] = (porMes[mes] || 0) + 1;
        }
    });
    
    const meses = Object.keys(porMes).sort();
    const valores = meses.map(mes => porMes[mes]);
    
    const ctx = document.getElementById('grafico-mensual');
    
    if (estado.graficos.mensual) {
        estado.graficos.mensual.destroy();
    }
    
    estado.graficos.mensual = new Chart(ctx, {
        type: 'line',
        data: {
            labels: meses,
            datasets: [{
                label: 'Actividades',
                data: valores,
                borderColor: CONFIG.colores.primario,
                backgroundColor: CONFIG.colores.primario + '33',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function crearGraficoBarrasHorizontal(idCanvas, datos) {
    const ctx = document.getElementById(idCanvas);
    
    if (estado.graficos[idCanvas]) {
        estado.graficos[idCanvas].destroy();
    }
    
    estado.graficos[idCanvas] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: datos.map(d => d.label),
            datasets: [{
                data: datos.map(d => d.value),
                backgroundColor: CONFIG.colores.paleta
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { beginAtZero: true }
            }
        }
    });
}

function exportarGrafico(chartId) {
    const canvas = document.getElementById(chartId);
    if (!canvas) return;
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const ctx = tempCanvas.getContext('2d');
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    ctx.drawImage(canvas, 0, 0);
    
    ctx.fillStyle = '#1976d2';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Distrito Sanitario Granada-Metropolitano', 20, tempCanvas.height - 20);
    
    const link = document.createElement('a');
    link.download = `grafico_${chartId}_${new Date().toISOString().split('T')[0]}.png`;
    link.href = tempCanvas.toDataURL('image/png', 1.0);
    link.click();
}

export { actualizarGraficos, contarPor, exportarGrafico };

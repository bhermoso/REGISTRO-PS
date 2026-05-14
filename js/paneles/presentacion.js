import { estado } from '../estado.js';
import { calcularMetricas } from '../metricas.js';

function activarModoPresentacion() {
    if (estado.datosFiltrados.length === 0) {
        alert('Por favor, carga datos primero');
        return;
    }
    
    const metricas = calcularMetricas();
    
    const slide1 = document.getElementById('presentacion-kpis-slide1');
    slide1.innerHTML = `
        <div class="presentacion-kpi">
            <div class="presentacion-kpi-valor">${metricas.actividades}</div>
            <div class="presentacion-kpi-label">Actividades</div>
        </div>
        <div class="presentacion-kpi">
            <div class="presentacion-kpi-valor">${metricas.participantes.toLocaleString('es-ES')}</div>
            <div class="presentacion-kpi-label">Participantes</div>
        </div>
        <div class="presentacion-kpi">
            <div class="presentacion-kpi-valor">${metricas.horas.toLocaleString('es-ES')}</div>
            <div class="presentacion-kpi-label">Horas</div>
        </div>
        <div class="presentacion-kpi">
            <div class="presentacion-kpi-valor">${metricas.sesiones.toLocaleString('es-ES')}</div>
            <div class="presentacion-kpi-label">Sesiones</div>
        </div>
    `;
    
    const pctHombres = metricas.participantes > 0 ? ((metricas.hombres / metricas.participantes) * 100).toFixed(1) : 0;
    const pctMujeres = metricas.participantes > 0 ? ((metricas.mujeres / metricas.participantes) * 100).toFixed(1) : 0;
    
    const slide4 = document.getElementById('presentacion-kpis-slide4');
    slide4.innerHTML = `
        <div class="presentacion-kpi">
            <div class="presentacion-kpi-valor">${metricas.hombres.toLocaleString('es-ES')}</div>
            <div class="presentacion-kpi-label">♂️ Hombres (${pctHombres}%)</div>
        </div>
        <div class="presentacion-kpi">
            <div class="presentacion-kpi-valor">${metricas.mujeres.toLocaleString('es-ES')}</div>
            <div class="presentacion-kpi-label">♀️ Mujeres (${pctMujeres}%)</div>
        </div>
    `;
    
    crearGraficoPresentacion();
    
    document.getElementById('modo-presentacion').classList.add('active');
    slideActual = 1;
    mostrarSlide(slideActual);
}

function desactivarModoPresentacion() {
    document.getElementById('modo-presentacion').classList.remove('active');
    if (autoPlay) toggleAutoPlay();
}

function cambiarSlide(direccion) {
    slideActual += direccion;
    if (slideActual < 1) slideActual = totalSlides;
    if (slideActual > totalSlides) slideActual = 1;
    mostrarSlide(slideActual);
}

function mostrarSlide(numero) {
    document.querySelectorAll('.presentacion-slide').forEach((slide, index) => {
        slide.classList.toggle('active', index + 1 === numero);
    });
    document.getElementById('presentacion-indicador').textContent = `${numero} / ${totalSlides}`;
}

function toggleAutoPlay() {
    autoPlay = !autoPlay;
    const btn = document.getElementById('btn-play-pause');
    
    if (autoPlay) {
        btn.textContent = '⏸ Pausar';
        autoPlayInterval = setInterval(() => cambiarSlide(1), 5000);
    } else {
        btn.textContent = '▶ Auto';
        clearInterval(autoPlayInterval);
    }
}

function crearGraficoPresentacion() {
    const conteoTipos = {};
    estado.datosFiltrados.forEach(row => {
        const tipo = CONFIG.tipos_actividad[row[CONFIG.campos.tipo_actividad]] || 'Sin clasificar';
        conteoTipos[tipo] = (conteoTipos[tipo] || 0) + 1;
    });
    
    const dataTipos = Object.entries(conteoTipos)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    const ctx2 = document.getElementById('presentacion-grafico-tipos').getContext('2d');
    if (window.chartPresentacionTipos) window.chartPresentacionTipos.destroy();
    window.chartPresentacionTipos = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: dataTipos.map(([tipo]) => tipo),
            datasets: [{
                label: 'Actividades',
                data: dataTipos.map(([, count]) => count),
                backgroundColor: 'rgba(25, 118, 210, 0.8)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                title: { display: false }
            },
            scales: {
                y: { beginAtZero: true, ticks: { color: '#fff' } },
                x: { ticks: { color: '#fff' } }
            }
        }
    });
    
    const conteoTematicas = {};
    estado.datosFiltrados.forEach(row => {
        const tematica = CONFIG.tematicas[row[CONFIG.campos.tematica]] || 'Sin clasificar';
        conteoTematicas[tematica] = (conteoTematicas[tematica] || 0) + 1;
    });
    
    const dataTematicas = Object.entries(conteoTematicas)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    const ctx3 = document.getElementById('presentacion-grafico-tematicas').getContext('2d');
    if (window.chartPresentacionTematicas) window.chartPresentacionTematicas.destroy();
    window.chartPresentacionTematicas = new Chart(ctx3, {
        type: 'bar',
        data: {
            labels: dataTematicas.map(([tema]) => tema),
            datasets: [{
                label: 'Actividades',
                data: dataTematicas.map(([, count]) => count),
                backgroundColor: 'rgba(56, 142, 60, 0.8)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                title: { display: false }
            },
            scales: {
                y: { beginAtZero: true, ticks: { color: '#fff' } },
                x: { ticks: { color: '#fff' } }
            }
        }
    });
}

function inicializarPresentacion() {
    const btn = document.getElementById('btn-presentacion');
    if (btn) btn.addEventListener('click', activarModoPresentacion);
    const btnSalir = document.getElementById('btn-salir-presentacion');
    if (btnSalir) btnSalir.addEventListener('click', desactivarModoPresentacion);
    const btnPrev = document.getElementById('btn-slide-prev');
    if (btnPrev) btnPrev.addEventListener('click', () => cambiarSlide(-1));
    const btnNext = document.getElementById('btn-slide-next');
    if (btnNext) btnNext.addEventListener('click', () => cambiarSlide(1));
    const btnAuto = document.getElementById('btn-autoplay');
    if (btnAuto) btnAuto.addEventListener('click', toggleAutoPlay);
}

export { activarModoPresentacion, inicializarPresentacion };

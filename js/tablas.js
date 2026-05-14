import { CONFIG } from './config.js';
import { estado } from './estado.js';
import { parsearFechaREDCap, formatearFecha } from './utils.js';

function actualizarTabla() {
    actualizarTablaGranada();
    actualizarTablaMetro();
    actualizarTablaAmbos();
}

function actualizarTablaGranada() {
    const tbody = document.getElementById('tabla-body-granada');
    tbody.innerHTML = '';
    
    const datosGranada = estado.datosFiltrados.filter(row => String(row[CONFIG.campos.distrito]) === '0');
    
    // Ordenar alfabéticamente por unidad
    datosGranada.sort((a, b) => {
        const unidadA = CONFIG.unidades_granada[String(a[CONFIG.campos.unidad_granada])] || '';
        const unidadB = CONFIG.unidades_granada[String(b[CONFIG.campos.unidad_granada])] || '';
        return unidadA.localeCompare(unidadB, 'es');
    });
    
    const inicio = (estado.paginacion.granada - 1) * estado.registrosPorPagina;
    const fin = inicio + estado.registrosPorPagina;
    const registrosPagina = datosGranada.slice(inicio, fin);
    
    registrosPagina.forEach(row => {
        const unidadId = String(row[CONFIG.campos.unidad_granada]);
        const unidad = CONFIG.unidades_granada[unidadId] || '-';
        
        const hombres = parseInt(row[CONFIG.campos.hombres]) || 0;
        const mujeres = parseInt(row[CONFIG.campos.mujeres]) || 0;
        const total = parseInt(row[CONFIG.campos.participantes]) || 0;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${unidad}</td>
            <td>${row[CONFIG.campos.profesional] || '-'}</td>
            <td>${formatearFecha(row[CONFIG.campos.fecha_inicio])}</td>
            <td>${CONFIG.tipos_actividad[row[CONFIG.campos.tipo_actividad]] || '-'}</td>
            <td>${row[CONFIG.campos.nombre_actividad] || '-'}</td>
            <td>${total} (♂${hombres} - ♀${mujeres})</td>
            <td>${row[CONFIG.campos.horas] || 0}</td>
        `;
        tbody.appendChild(tr);
    });
    
    actualizarPaginacionPestana('granada', datosGranada.length);
}

function actualizarTablaMetro() {
    const tbody = document.getElementById('tabla-body-metro');
    tbody.innerHTML = '';
    
    const datosMetro = estado.datosFiltrados.filter(row => String(row[CONFIG.campos.distrito]) === '1');
    
    // Ordenar alfabéticamente por unidad
    datosMetro.sort((a, b) => {
        const unidadA = CONFIG.unidades_metro[String(a[CONFIG.campos.unidad_metro])] || '';
        const unidadB = CONFIG.unidades_metro[String(b[CONFIG.campos.unidad_metro])] || '';
        return unidadA.localeCompare(unidadB, 'es');
    });
    
    const inicio = (estado.paginacion.metro - 1) * estado.registrosPorPagina;
    const fin = inicio + estado.registrosPorPagina;
    const registrosPagina = datosMetro.slice(inicio, fin);
    
    registrosPagina.forEach(row => {
        const unidadId = String(row[CONFIG.campos.unidad_metro]);
        const unidad = CONFIG.unidades_metro[unidadId] || '-';
        
        const hombres = parseInt(row[CONFIG.campos.hombres]) || 0;
        const mujeres = parseInt(row[CONFIG.campos.mujeres]) || 0;
        const total = parseInt(row[CONFIG.campos.participantes]) || 0;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${unidad}</td>
            <td>${row[CONFIG.campos.profesional] || '-'}</td>
            <td>${formatearFecha(row[CONFIG.campos.fecha_inicio])}</td>
            <td>${CONFIG.tipos_actividad[row[CONFIG.campos.tipo_actividad]] || '-'}</td>
            <td>${row[CONFIG.campos.nombre_actividad] || '-'}</td>
            <td>${total} (♂${hombres} - ♀${mujeres})</td>
            <td>${row[CONFIG.campos.horas] || 0}</td>
        `;
        tbody.appendChild(tr);
    });
    
    actualizarPaginacionPestana('metro', datosMetro.length);
}

function actualizarTablaAmbos() {
    const tbody = document.getElementById('tabla-body-ambos');
    tbody.innerHTML = '';
    
    // Ordenar primero por distrito y luego alfabéticamente por unidad
    const datosOrdenados = [...estado.datosFiltrados].sort((a, b) => {
        const distritoA = String(a[CONFIG.campos.distrito]);
        const distritoB = String(b[CONFIG.campos.distrito]);
        
        // Primero ordenar por distrito (Granada = 0, Metropolitano = 1)
        if (distritoA !== distritoB) {
            return distritoA.localeCompare(distritoB);
        }
        
        // Luego ordenar por unidad alfabéticamente
        let unidadA = '';
        let unidadB = '';
        
        if (distritoA === '0') {
            unidadA = CONFIG.unidades_granada[String(a[CONFIG.campos.unidad_granada])] || '';
            unidadB = CONFIG.unidades_granada[String(b[CONFIG.campos.unidad_granada])] || '';
        } else {
            unidadA = CONFIG.unidades_metro[String(a[CONFIG.campos.unidad_metro])] || '';
            unidadB = CONFIG.unidades_metro[String(b[CONFIG.campos.unidad_metro])] || '';
        }
        
        return unidadA.localeCompare(unidadB, 'es');
    });
    
    const inicio = (estado.paginacion.ambos - 1) * estado.registrosPorPagina;
    const fin = inicio + estado.registrosPorPagina;
    const registrosPagina = datosOrdenados.slice(inicio, fin);
    
    registrosPagina.forEach(row => {
        const distrito = String(row[CONFIG.campos.distrito]) === '0' ? 'Granada' : 'Metropolitano';
        
        let unidad = '';
        if (String(row[CONFIG.campos.distrito]) === '0') {
            const unidadId = String(row[CONFIG.campos.unidad_granada]);
            unidad = CONFIG.unidades_granada[unidadId] || '-';
        } else {
            const unidadId = String(row[CONFIG.campos.unidad_metro]);
            unidad = CONFIG.unidades_metro[unidadId] || '-';
        }
        
        const hombres = parseInt(row[CONFIG.campos.hombres]) || 0;
        const mujeres = parseInt(row[CONFIG.campos.mujeres]) || 0;
        const total = parseInt(row[CONFIG.campos.participantes]) || 0;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${distrito}</td>
            <td>${unidad}</td>
            <td>${row[CONFIG.campos.profesional] || '-'}</td>
            <td>${formatearFecha(row[CONFIG.campos.fecha_inicio])}</td>
            <td>${CONFIG.tipos_actividad[row[CONFIG.campos.tipo_actividad]] || '-'}</td>
            <td>${row[CONFIG.campos.nombre_actividad] || '-'}</td>
            <td>${total} (♂${hombres} - ♀${mujeres})</td>
            <td>${row[CONFIG.campos.horas] || 0}</td>
        `;
        tbody.appendChild(tr);
    });
    
    actualizarPaginacionPestana('ambos', estado.datosFiltrados.length);
}

function actualizarPaginacionPestana(pestana, totalRegistros) {
    const totalPaginas = Math.ceil(totalRegistros / estado.registrosPorPagina);
    const paginaActual = estado.paginacion[pestana];
    
    const infoEl = document.getElementById(`paginacion-${pestana}`);
    if (infoEl) infoEl.textContent =
        `Página ${paginaActual} de ${totalPaginas} | Total: ${totalRegistros} registros`;

    ['anterior', 'siguiente'].forEach(dir => {
        const btn = document.getElementById(`btn-${dir}-${pestana}`);
        if (!btn) return;
        btn.onclick = () => {
            if (dir === 'anterior' && estado.paginacion[pestana] > 1) {
                estado.paginacion[pestana]--;
                actualizarTabla();
            } else if (dir === 'siguiente' && estado.paginacion[pestana] < totalPaginas) {
                estado.paginacion[pestana]++;
                actualizarTabla();
            }
        };
    });
}

function inicializarTablas() {
    // Tabs de tabla
    document.querySelectorAll('.tab').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            const tabEl = document.getElementById('tab-' + this.dataset.tab);
            if (tabEl) tabEl.classList.add('active');
            estado.tabActual = this.dataset.tab;
        });
    });
    // Búsqueda en tabla
    const buscador = document.getElementById('busqueda-tabla');
    if (buscador) {
        buscador.addEventListener('input', function() {
            actualizarTabla();
        });
    }
}

export { actualizarTabla, inicializarTablas };

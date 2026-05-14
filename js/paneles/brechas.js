import { CONFIG } from '../config.js';
import { estado } from '../estado.js';

function analizarBrechas() {
    const brechas = {
        unidadesBajas: [],
        tematicasBajas: [],
        zonasDesfavorecidas: 0
    };
    
    const actividadesPorUnidad = {};
    estado.datosFiltrados.forEach(row => {
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
    });
    
    brechas.unidadesBajas = Object.entries(actividadesPorUnidad)
        .sort((a, b) => a[1] - b[1])
        .slice(0, 5);
    
    const total = estado.datosFiltrados.length;
    const porTematica = {};
    
    estado.datosFiltrados.forEach(row => {
        const tematica = CONFIG.tematicas[row[CONFIG.campos.tematica]] || 'Sin clasificar';
        porTematica[tematica] = (porTematica[tematica] || 0) + 1;
    });
    
    brechas.tematicasBajas = Object.entries(porTematica)
        .filter(([, count]) => (count / total) < 0.05)
        .sort((a, b) => a[1] - b[1]);
    
    brechas.zonasDesfavorecidas = estado.datosFiltrados.filter(row => 
        String(row['es_una_zona_desfavorecidas']) === '1'
    ).length;
    
    mostrarBrechas(brechas);
}

function mostrarBrechas(brechas) {
    if (brechas.unidadesBajas.length === 0 && brechas.tematicasBajas.length === 0) {
        document.getElementById('brechas-panel').style.display = 'none';
        return;
    }
    
    const container = document.getElementById('brechas-grid');
    container.innerHTML = '';
    
    if (brechas.unidadesBajas.length > 0) {
        const cardUnidades = document.createElement('div');
        cardUnidades.className = 'brecha-card';
        cardUnidades.innerHTML = `
            <h3>🏥 Unidades con Menor Actividad</h3>
            <ul class="brecha-lista">
                ${brechas.unidadesBajas.map(([unidad, count]) => `
                    <li class="brecha-item">
                        <span class="brecha-nombre">${unidad}</span>
                        <span class="brecha-valor">${count} actividades</span>
                    </li>
                `).join('')}
            </ul>
        `;
        container.appendChild(cardUnidades);
    }
    
    if (brechas.tematicasBajas.length > 0) {
        const cardTematicas = document.createElement('div');
        cardTematicas.className = 'brecha-card';
        cardTematicas.innerHTML = `
            <h3>📚 Temáticas con Baja Cobertura (<5%)</h3>
            <ul class="brecha-lista">
                ${brechas.tematicasBajas.slice(0, 5).map(([tematica, count]) => `
                    <li class="brecha-item">
                        <span class="brecha-nombre">${tematica}</span>
                        <span class="brecha-valor">${count} actividades</span>
                    </li>
                `).join('')}
            </ul>
        `;
        container.appendChild(cardTematicas);
    }
    
    const cardZonas = document.createElement('div');
    cardZonas.className = 'brecha-card';
    const pctZonas = estado.datosFiltrados.length > 0 ? ((brechas.zonasDesfavorecidas / estado.datosFiltrados.length) * 100).toFixed(1) : 0;
    cardZonas.innerHTML = `
        <h3>📍 Cobertura en Zonas Desfavorecidas</h3>
        <div style="padding: 20px; text-align: center;">
            <div style="font-size: 48px; font-weight: 700; color: var(--color-acento2); margin-bottom: 10px;">
                ${brechas.zonasDesfavorecidas}
            </div>
            <div style="font-size: 14px; color: var(--color-gris);">
                Actividades en zonas ZNTS/ERACIS
            </div>
            <div style="font-size: 14px; color: var(--color-gris); margin-top: 10px;">
                ${pctZonas}% del total
            </div>
        </div>
    `;
    container.appendChild(cardZonas);
    
    document.getElementById('brechas-panel').style.display = 'block';
}

export { analizarBrechas, mostrarBrechas };

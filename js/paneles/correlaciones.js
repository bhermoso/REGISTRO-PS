import { estado } from '../estado.js';

function calcularCorrelaciones() {
    if (estado.datosFiltrados.length < 10) {
        document.getElementById('correlaciones-panel').style.display = 'none';
        return;
    }
    
    // Calcular correlación entre Participantes y Horas
    const corrParticipantesHoras = calcularCorrelacionPearson(
        estado.datosFiltrados.map(r => parseInt(r[CONFIG.campos.participantes]) || 0),
        estado.datosFiltrados.map(r => parseInt(r[CONFIG.campos.horas]) || 0)
    );
    
    // Calcular correlación entre Participantes y Sesiones
    const corrParticipantesSesiones = calcularCorrelacionPearson(
        estado.datosFiltrados.map(r => parseInt(r[CONFIG.campos.participantes]) || 0),
        estado.datosFiltrados.map(r => parseInt(r[CONFIG.campos.sesiones]) || 0)
    );
    
    // Calcular correlación entre Horas y Sesiones
    const corrHorasSesiones = calcularCorrelacionPearson(
        estado.datosFiltrados.map(r => parseInt(r[CONFIG.campos.horas]) || 0),
        estado.datosFiltrados.map(r => parseInt(r[CONFIG.campos.sesiones]) || 0)
    );
    
    const container = document.getElementById('correlaciones-grid');
    container.innerHTML = '';
    
    // Participantes vs Horas
    const card1 = crearTarjetaCorrelacion(
        corrParticipantesHoras,
        'Participantes vs Horas',
        '¿A más participantes, más horas dedicadas?'
    );
    container.appendChild(card1);
    
    // Participantes vs Sesiones
    const card2 = crearTarjetaCorrelacion(
        corrParticipantesSesiones,
        'Participantes vs Sesiones',
        '¿A más participantes, más sesiones?'
    );
    container.appendChild(card2);
    
    // Horas vs Sesiones
    const card3 = crearTarjetaCorrelacion(
        corrHorasSesiones,
        'Horas vs Sesiones',
        '¿A más sesiones, más horas totales?'
    );
    container.appendChild(card3);
    
    document.getElementById('correlaciones-panel').style.display = 'block';
}

function calcularCorrelacionPearson(x, y) {
    const n = x.length;
    if (n === 0) return 0;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerador = n * sumXY - sumX * sumY;
    const denominador = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    if (denominador === 0) return 0;
    return numerador / denominador;
}

function crearTarjetaCorrelacion(valor, label, interpretacion) {
    const div = document.createElement('div');
    div.className = 'correlacion-item';
    
    let clase = 'correlacion-neutra';
    let texto = 'Correlación débil o nula';
    
    if (valor > 0.7) {
        clase = 'correlacion-positiva';
        texto = 'Correlación positiva fuerte';
    } else if (valor > 0.4) {
        clase = 'correlacion-positiva';
        texto = 'Correlación positiva moderada';
    } else if (valor < -0.7) {
        clase = 'correlacion-negativa';
        texto = 'Correlación negativa fuerte';
    } else if (valor < -0.4) {
        clase = 'correlacion-negativa';
        texto = 'Correlación negativa moderada';
    }
    
    div.innerHTML = `
        <div class="correlacion-label">${label}</div>
        <div class="correlacion-valor ${clase}">${valor.toFixed(3)}</div>
        <div class="correlacion-interpretacion">${texto}</div>
        <div style="font-size: 11px; margin-top: 5px; opacity: 0.8;">${interpretacion}</div>
    `;
    
    return div;
}

export { calcularCorrelaciones };

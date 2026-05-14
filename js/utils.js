// Utilidades generales

function parsearFechaREDCap(fechaStr) {
    if (!fechaStr) return null;
    const partes = String(fechaStr).split('/');
    if (partes.length !== 3) return null;
    return new Date(partes[2], partes[1] - 1, partes[0]);
}

function formatearFecha(fechaStr) {
    const fecha = parsearFechaREDCap(fechaStr);
    if (!fecha) return '-';
    return fecha.toLocaleDateString('es-ES');
}

function mostrarLoading(mostrar) {
    document.getElementById('loading-overlay').style.display = mostrar ? 'flex' : 'none';
}

export { parsearFechaREDCap, formatearFecha, mostrarLoading };

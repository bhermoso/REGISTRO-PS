// Estado compartido de la aplicación
export const estado = {
    datosOriginales: [],
    datosFiltrados: [],
    graficos: {},
    registrosPorPagina: 50,
    nivelActual: 'global',
    unidadSeleccionada: '',
    profesionalSeleccionado: '',
    tabActual: 'granada',
    criteriosBusquedaAvanzada: null,
    paginacion: { granada: 1, metro: 1, ambos: 1 }
};

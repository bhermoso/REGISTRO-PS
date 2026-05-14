import { estado } from './estado.js';

function cargarPerfiles() {
    const stored = localStorage.getItem('perfiles_promocion_salud');
    if (stored) {
        perfilesGuardados = JSON.parse(stored);
        mostrarPerfiles();
    }
}

function guardarPerfil() {
    const nombre = document.getElementById('perfil-nombre-input').value.trim();
    if (!nombre) {
        alert('Por favor, introduce un nombre para el perfil');
        return;
    }
    
    if (perfilesGuardados.length >= 5) {
        alert('Has alcanzado el límite de 5 perfiles. Elimina uno antes de crear otro.');
        return;
    }
    
    const perfil = {
        nombre: nombre,
        nivel: estado.nivelActual,
        unidad: estado.unidadSeleccionada,
        profesional: estado.profesionalSeleccionado,
        fechaDesde: document.getElementById('filtro-fecha-desde').value,
        fechaHasta: document.getElementById('filtro-fecha-hasta').value,
        tipoActividad: document.getElementById('filtro-tipo-actividad').value,
        tematica: document.getElementById('filtro-tematica').value,
        programa: document.getElementById('filtro-programa').value
    };
    
    perfilesGuardados.push(perfil);
    localStorage.setItem('perfiles_promocion_salud', JSON.stringify(perfilesGuardados));
    
    document.getElementById('perfil-nombre-input').value = '';
    mostrarPerfiles();
    
    alert(`✅ Perfil "${nombre}" guardado correctamente`);
}

function mostrarPerfiles() {
    if (perfilesGuardados.length === 0) {
        document.getElementById('perfiles-panel').style.display = 'none';
        return;
    }
    
    const container = document.getElementById('perfiles-lista');
    container.innerHTML = '';
    
    perfilesGuardados.forEach((perfil, index) => {
        const div = document.createElement('div');
        div.className = 'perfil-item';
        div.innerHTML = `
            <span class="perfil-nombre">${perfil.nombre}</span>
            <button class="perfil-eliminar" data-index="${index}">✕</button>
        `;
        
        div.querySelector('.perfil-nombre').addEventListener('click', () => cargarPerfil(perfil));
        div.querySelector('.perfil-eliminar').addEventListener('click', (e) => {
            e.stopPropagation();
            eliminarPerfil(index);
        });
        
        container.appendChild(div);
    });
    
    document.getElementById('perfiles-panel').style.display = 'block';
}

function cargarPerfil(perfil) {
    document.getElementById('nivel-agregacion').value = perfil.nivel;
    
    estado.nivelActual = perfil.nivel;
    estado.unidadSeleccionada = perfil.unidad || '';
    estado.profesionalSeleccionado = perfil.profesional || '';
    
    document.getElementById('grupo-unidad').style.display = estado.nivelActual === 'unidad' ? 'block' : 'none';
    document.getElementById('grupo-profesional').style.display = estado.nivelActual === 'profesional' ? 'block' : 'none';
    
    if (perfil.unidad) document.getElementById('select-unidad').value = perfil.unidad;
    if (perfil.profesional) document.getElementById('select-profesional').value = perfil.profesional;
    
    document.getElementById('filtro-fecha-desde').value = perfil.fechaDesde || '';
    document.getElementById('filtro-fecha-hasta').value = perfil.fechaHasta || '';
    document.getElementById('filtro-tipo-actividad').value = perfil.tipoActividad || '';
    document.getElementById('filtro-tematica').value = perfil.tematica || '';
    document.getElementById('filtro-programa').value = perfil.programa || '';
    
    aplicarFiltros();
    
    alert(`✅ Perfil "${perfil.nombre}" cargado`);
}

function eliminarPerfil(index) {
    if (confirm(`¿Eliminar el perfil "${perfilesGuardados[index].nombre}"?`)) {
        perfilesGuardados.splice(index, 1);
        localStorage.setItem('perfiles_promocion_salud', JSON.stringify(perfilesGuardados));
        mostrarPerfiles();
    }
}

function inicializarPerfiles() {
    const btnGuardar = document.getElementById('btn-guardar-perfil');
    if (btnGuardar) btnGuardar.addEventListener('click', guardarPerfil);
    cargarPerfiles();
}

export { cargarPerfiles, inicializarPerfiles };

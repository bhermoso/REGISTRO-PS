# RAPS · DGRAMET v5.0

**Registro de Actuaciones de Promoción de la Salud**  
Distrito Sanitario Granada-Metropolitano · Servicio Andaluz de Salud

---

## Descripción

Aplicación web de análisis y visualización de las actividades de Promoción de la Salud registradas en REDCap por los profesionales del Distrito Sanitario Granada-Metropolitano (~700.000 habitantes).

Permite filtrar, explorar y exportar datos por nivel de análisis (distrito, unidad asistencial, profesional), con 10 paneles de visualización.

**Ningún dato abandona el navegador del usuario.** Todo el procesamiento es local (JavaScript en cliente). No hay backend, no hay base de datos, no hay llamadas a servicios externos.

---

## Requisitos

- Navegador moderno con soporte ES6 Modules: Chrome ≥ 89, Firefox ≥ 89, Edge ≥ 89, Safari ≥ 15
- Servidor web estático (Apache, nginx, IIS) — **no funciona abierto directamente como fichero** (`file://`) por la política de módulos ES6
- No requiere Node.js, PHP, Python ni ningún backend

---

## Despliegue

### Apache
1. Copiar el contenido de esta carpeta al DocumentRoot o a un alias configurado
2. El fichero `.htaccess` incluido configura automáticamente cabeceras de seguridad y caché
3. Verificar que `mod_headers` y `mod_expires` están activos: `a2enmod headers expires`

### nginx
1. Copiar al directorio de la web
2. Añadir el contenido de `nginx.conf` al bloque `server{}` correspondiente
3. Recargar: `nginx -s reload`

### Desarrollo local
```bash
# Python (cualquier versión)
python3 -m http.server 8001 --directory /ruta/a/raps

# Node.js (si disponible)
npx serve . -p 8001
```

---

## Estructura de ficheros

```
raps/
├── index.html                  # Punto de entrada (HTML delgado)
├── .htaccess                   # Cabeceras seguridad Apache
├── nginx.conf                  # Cabeceras seguridad nginx
│
├── vendor/                     # Dependencias locales (sin CDN)
│   ├── chart.umd.min.js        # Chart.js 4.4.0
│   ├── papaparse.min.js        # PapaParse 5.4.1
│   └── xlsx.full.min.js        # XLSX.js 0.18.5
│
├── styles/
│   ├── variables.css           # Variables CSS / paleta COMPAS
│   ├── base.css                # Layout y estructura base
│   ├── componentes.css         # Botones, tarjetas, KPIs, tabla, ranking
│   └── paneles.css             # Estilos específicos por panel
│
└── js/
    ├── config.js               # Tablas de lookup REDCap (campos, categorías)
    ├── estado.js               # Estado compartido de la aplicación (S)
    ├── utils.js                # Utilidades puras (formato, gráficos, cálculos)
    ├── carga.js                # Carga, validación y filtrado de CSV
    ├── render.js               # Enrutamiento de paneles
    ├── main.js                 # Inicialización y event listeners
    ├── exportacion.js          # Exportación CSV / Excel / PDF
    ├── generador.js            # Generador de datos de prueba (~7 500 registros)
    └── paneles/
        ├── dashboard.js        # Panel principal con KPIs y rankings
        ├── tabla.js            # Tabla paginada con búsqueda
        ├── demografico.js      # Sexo, población, horario, lugar
        ├── territorial.js      # Análisis por distrito y unidad
        ├── profesional.js      # Análisis por categoría y profesional
        ├── temporal.js         # Evolución mensual, heatmap
        ├── programas.js        # Programas, temáticas, tipos
        ├── equidad.js          # Brechas zona desfavorecida
        ├── eficiencia.js       # Participantes/hora, diversidad temática
        └── alertas.js          # Alertas automáticas e indicadores
```

---

## Formato del CSV

Exportación directa desde el instrumento RAPS de REDCap.  
Campos mínimos requeridos: `fecha_de_inicio`, `tipo_de_actividad`, `distrito0`, `apellidos_y_nombre`, `asist_total`.

El separador debe ser coma (`,`) y la codificación UTF-8 o latin1 (ambas soportadas).

---

## Seguridad y privacidad

- Sin backend → sin riesgo de fuga de datos por servidor
- Sin CDN externas → sin dependencias de terceros en tiempo de ejecución
- Cabeceras CSP configuradas para bloquear recursos externos
- Los datos del CSV permanecen exclusivamente en memoria del navegador durante la sesión
- Al cerrar o recargar la página, los datos desaparecen

Clasificación de datos: el CSV puede contener datos de actividad sanitaria con nombre de profesional. **No incluye datos de pacientes identificativos.** Tratar según política de uso de herramientas corporativas del SAS.

---

## Dependencias (locales)

| Librería | Versión | Licencia | Uso |
|---|---|---|---|
| Chart.js | 4.4.0 | MIT | Gráficos interactivos |
| PapaParse | 5.4.1 | MIT | Parseo de CSV |
| XLSX.js | 0.18.5 | Apache 2.0 | Exportación Excel |

---

## Accesibilidad

Diseñado para cumplir WCAG 2.1 nivel AA:
- Roles ARIA en todos los elementos interactivos y regiones
- `aria-live` en zonas de actualización dinámica
- Navegación por teclado en pestañas y formularios
- Etiquetas `<label>` asociadas a todos los controles
- `scope` en cabeceras de tabla

---

## Versión y autoría

- **Versión**: 5.0 (mayo 2026)
- **Autor**: BR Hermoso — UGC Prevención y Promoción de la Salud, DS Granada-Metropolitano
- **Licencia**: MIT
- **Repositorio**: github.com/bhermoso/REGISTRO-PS

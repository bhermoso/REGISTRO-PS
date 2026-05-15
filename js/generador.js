import {C} from './config.js';
import {S} from './estado.js';
import {postCarga} from './carga.js';

function generarDatosPrueba(){
  /* ── Estimación realista DS Granada-Metropolitano (~700 000 hab.) ──────
     36 centros de salud + ~90 consultorios locales + 4 CSMC + UGC Prevención

     Profesionales únicos estimados que generan RAPS:
       Enfermería (cat 2):      ~200  (enferm. comunitaria, matronas, EAP)
       Medicina Familia (cat 6):~170  (médicos EAP y UGC)
       Pediatría (cat 7):        ~70  (pediatras EAP)
       Trabajo Social (cat 13):  ~55  (TS CS + CSMC + servicios sociales)
       Fisioterapia (cat 5):     ~36  (fisios CS + UGC rehab.)
       TEPSPC (cat 9):           ~20  (técnicos PS comunitaria)
       Psicología clínica (cat 8):~18 (psicólogos CSMC)
       Odontología (cat 14):     ~18  (higienistas + odontólogos)
       Otros (cat 15):           ~20
       Farmacia, EpidemAP,       ~8-10 c/u
       T. Salud Amb, T.Ocup, PRL:~6-8 c/u

     Actividades anuales estimadas:
       Enfermería:       200 × 9 act/año  = 1 800
       Medicina Fam.:    170 × 5          =   850
       Trabajo Social:    55 × 9          =   495
       Pediatría:         70 × 5          =   350
       TEPSPC:            20 × 12         =   240
       Fisioterapia:      36 × 5          =   180
       Resto:             varios           =   385
       TOTAL/año: ~4 300  ·  2 años: ~8 600
     (con reducción verano se generan ~7 500 registros)
  ─────────────────────────────────────────────────────────────────────── */

  // ── Nombres españoles para generación de pools ─────────────────────────
  const nomF = ['Ana','Carmen','María','Rosa','Laura','Isabel','Pilar','Marta',
    'Elena','Nuria','Sofía','Cristina','Beatriz','Eva','Patricia','Lucía',
    'Raquel','Silvia','Inés','Amparo','Rocío','Dolores','Mercedes','Consuelo',
    'Encarnación','Josefa','Remedios','Yolanda','Sandra','Alicia','Susana',
    'Elisa','Almudena','Concepción','Gracia','Mónica','Irene','Vanessa',
    'Rebeca','Lourdes','Noelia','Araceli','Gloria','Fátima','Paloma','Manuela',
    'Antonia','Victoria','Claudia','Verónica','Adriana','Nerea','Esther',
    'Andrea','Sara','Natalia','Miriam','Sonia','Lidia','Amelia','Esperanza',
    'Blanca','Macarena','Trinidad','Ascensión','Gemma','Olga','Maite','Leire'];

  const nomM = ['Antonio','Francisco','Manuel','Juan','Pablo','Miguel','Rafael',
    'Enrique','Andrés','Alberto','Diego','Emilio','Sergio','Raúl','Roberto',
    'Fernando','Marcos','Óscar','Víctor','Julio','Alfonso','Ricardo','Esteban',
    'Ramón','Arturo','Jorge','Héctor','Ángel','Adrián','César','Lorenzo',
    'Nicolás','Alejandro','Javier','Luis','David','Carlos','Eduardo','Pedro',
    'José','Ignacio','Tomás','Daniel','Rodrigo','Álvaro','Hugo','Gonzalo',
    'Felipe','Gregorio','Aurelio','Bernardo','Clemente','Dámaso'];

  const ape = ['García','López','Martínez','Sánchez','Fernández','González',
    'Romero','Torres','Navarro','Jiménez','Moreno','Muñoz','Álvarez','Ramos',
    'Iglesias','Santos','Herrera','Medina','Guerrero','Cano','Vargas','Suárez',
    'Molina','Prieto','Cruz','Domínguez','Vega','Bravo','Pascual','Ibáñez',
    'Mora','Cabello','Méndez','Giménez','Montero','Pardo','Flores','León',
    'Calvo','Núñez','Soler','Carrillo','Rubio','Serrano','Marín','Gallego',
    'Ríos','Crespo','Blanco','Delgado','Ortega','Reyes','Aguilar','Castillo',
    'Ruiz','Pérez','Gómez','Díaz','Rueda','Salas','Parra','Lara','Vera',
    'Hinojosa','Barrios','Linares','Cortés','Duarte','Jurado','Espejo',
    'Campos','Chacón','Baena','Espinosa','Cantero','Cañas','Vergara',
    'Toboso','Montoya','Arias','Carmona','Contreras','Fuentes','Gutiérrez',
    'Heredia','Infante','Juárez','Laguna','Maldonado','Navarrete','Olmedo',
    'Palomino','Quintero','Redondo','Salinas','Trujillo','Urbano','Zamora',
    'Peña','Moya','Millán','Mateo','Luque','Lozano','Pedrosa','Quevedo',
    'Navajas','Osuna','Roldán','Tejada','Úbeda','Escribano','Montilla'];

  // Genera N nombres únicos con pct% de mujeres; formato "Apellido1 Apellido2, Nombre"
  function generarPool(n, pctF){
    const usados = new Set();
    const pool = [];
    let intentos = 0;
    while(pool.length < n && intentos < n * 30){
      intentos++;
      const esFem = Math.random() < pctF;
      const nombre = esFem ? nomF[Math.floor(Math.random()*nomF.length)]
                           : nomM[Math.floor(Math.random()*nomM.length)];
      const a1 = ape[Math.floor(Math.random()*ape.length)];
      const a2 = ape[Math.floor(Math.random()*ape.length)];
      if(a1===a2) continue;
      const k = `${a1} ${a2}, ${nombre}`;
      if(!usados.has(k)){ usados.add(k); pool.push(k); }
    }
    return pool;
  }

  // ── Pools de profesionales por categoría ──────────────────────────────
  // Porcentaje mujeres basado en datos reales de cada colectivo en AP andaluza
  const pools = {
    1:  generarPool(  8, 0.60),  // A4 Vet./Farm.
    2:  generarPool(200, 0.88),  // Enfermería (altísima feminización)
    3:  generarPool(  9, 0.55),  // Epidemiología AP
    4:  generarPool( 10, 0.65),  // Farmacia
    5:  generarPool( 36, 0.60),  // Fisioterapia
    6:  generarPool(170, 0.52),  // Medicina de Familia (paridad aproximada)
    7:  generarPool( 70, 0.65),  // Pediatría
    8:  generarPool( 18, 0.72),  // Psicología clínica
    9:  generarPool( 20, 0.70),  // TEPSPC
    10: generarPool(  7, 0.45),  // T. PRL
    11: generarPool(  8, 0.55),  // T. Salud Ambiental
    12: generarPool(  7, 0.60),  // T. Ocupacional
    13: generarPool( 55, 0.82),  // Trabajo Social
    14: generarPool( 18, 0.68),  // Odontología
    15: generarPool( 20, 0.58),  // Otros
  };

  function profDeCat(cat){ const p=pools[cat]; return p[Math.floor(Math.random()*p.length)]; }

  // ── Pesos para sorteo de categoría (proporcionales a act/año estimadas) ─
  // cat:   1    2     3    4    5    6     7    8    9    10   11   12   13   14   15
  const catPesos = [0, 1, 1800, 15, 15, 180, 850, 350, 40, 240, 10, 20, 10, 495, 20, 80];
  const catAcum=[]; let acc=0;
  for(let i=1;i<=15;i++){acc+=catPesos[i];catAcum.push(acc);}
  const totalPeso=acc;
  function sortearCat(){
    const r=Math.random()*totalPeso;
    for(let i=0;i<catAcum.length;i++) if(r<catAcum[i]) return i+1;
    return 15;
  }

  // ── Actividades, tipos, temáticas y programas por categoría ───────────
  const actCat={
    2:['Sesión GRAFA','Taller GRUSE','Escuela Pacientes - diabetes',
       'Escuela Pacientes - EPOC','Taller cesación tabáquica',
       'Ed. grupal EPOC/asma','Ed. grupal diabetes tipo 2',
       'Rehabilitación cardiaca grupal','Educación maternal',
       'Taller incontinencia urinaria','Sesión menopausia',
       'Taller cuidadoras personas dependientes','Taller dolor crónico',
       'Taller hipertensión','Taller GRUSE cuidadoras',
       'Taller alimentación saludable adultos','Ed. grupal rehab. respiratoria',
       'Sesión IG EPOC','Sesión PIOBIN enfermería','Taller lactancia materna'],
    6:['Charla alimentación saludable','Charla tabaco','Charla alcohol',
       'Charla actividad física y salud','Mesa de salud escolar',
       'PSIA sesión grupal','Jornada salud comunitaria barrio',
       'Mapeo de activos comunitarios','Ponencia salud mental',
       'Taller bienestar emocional adultos','Charla vacunas adultos',
       'Sesión Forma Joven - sexualidad','Charla prevención cardiovascular',
       'Sesión IAHS','Charla diabetes preventiva','Charla EPOC y tabaco',
       'Taller salud laboral','Charla prevención caídas mayores',
       'Mesa salud mental comunitaria','Sesión PSIA médico'],
    7:['Taller parentalidad positiva','Charla lactancia materna',
       'Sesión vacunas infantiles','Taller alimentación infantil',
       'Charla prevención accidentes infancia','Taller pantallas y salud',
       'Sesión Forma Joven pediatría','Charla higiene dental infantil',
       'Taller actividad física infantil'],
    13:['Intervención social RELAS','Detección violencia de género',
        'Taller habilidades parentales','Sesión AVISTA',
        'Charla recursos sociales y salud','Taller PRIA violencia género',
        'Intervención riesgo conducta suicida','Sesión coordinación servicios sociales',
        'Taller manejo situaciones crisis','Intervención familias vulnerables'],
    9:['Mapeo activos comunitarios','Jornada participación ciudadana',
       'Taller salud comunitaria','Sesión coordinación PSIA',
       'Intervención comunitaria barrio desfavorecido','Taller activos salud mental',
       'Sesión PSIA comunitario','Foro salud barrio'],
    5:['Taller higiene postural','Sesión dolor crónico fisioterapia',
       'Taller actividad física mayores','Charla prevención caídas',
       'Sesión rehabilitación pulmonar','Taller movilidad articular'],
    8:['Taller bienestar emocional','Sesión conducta suicida CSMC',
       'Taller manejo ansiedad','Intervención salud mental comunitaria',
       'Sesión psicoeducación familiar'],
    _:['Sesión clínica formativa','Taller primeros auxilios',
       'Intervención media','Ponencia jornada distrital',
       'Sesión formativa interprofesional','Taller Forma Joven']
  };

  const tipoCat={
    2:[5,6,7,8,9,10,11,13,22,23],
    6:[0,3,4,14,17,19,20,22,23],
    7:[0,11,20,23],
    13:[3,17,22,23],
    9:[18,3,20,22],
    5:[22,23,3],
    8:[22,23,3],
    _:[0,1,3,21,22,23,24]
  };

  const temaCat={
    2:[8,10,13,15,16,17,25,1,4,7,3,12],
    6:[1,3,4,5,6,7,14,21,24,25,27,30,10,17],
    7:[15,20,21,1,3,27,23],
    13:[4,28,20,5,14],
    9:[2,4,21,26,1],
    5:[8,12,1,10],
    8:[4,5,18,14],
    _:[1,3,4,6,7,9,11,22,23,24,29,30]
  };

  const progCat={
    2:[9,10,3,5,2,16,17],
    6:[7,8,14,16,17,19,21,22,25,6],
    7:[8,14,21,22],
    13:[1,14,24,20,18],
    9:[12,18,4,25],
    5:[2,5,25],
    8:[20,3,25],
    _:[11,25,6,7]
  };

  // Participantes medios realistas por categoría
  const partBase={2:12,6:20,7:16,13:10,9:22,5:8,8:8,1:6,3:16,4:10,10:6,11:8,12:6,14:8,15:12};

  const pick = arr => arr[Math.floor(Math.random()*arr.length)];
  const fmt2 = v => String(v).padStart(2,'0');

  // ── Generación de registros ────────────────────────────────────────────
  const rows=[];
  let rid=1;
  // Objetivo: ~8600 intentos; los meses de verano se saltan ~50%
  // → resultado final ~7200–7500 registros
  for(let i=0;i<8600;i++){
    // Fechas: enero 2024 – diciembre 2025
    const mesTotal=Math.floor(Math.random()*24);
    const anyo=2024+Math.floor(mesTotal/12);
    const mes=mesTotal%12;
    // Reducción estival: jun-ago ~55% menos actividad
    if(mes>=5&&mes<=7&&Math.random()<0.55) continue;
    const dia=1+Math.floor(Math.random()*28);
    const d=new Date(anyo,mes,dia);
    const fecha=`${fmt2(d.getDate())}/${fmt2(d.getMonth()+1)}/${d.getFullYear()}`;

    const cat=sortearCat();
    const prof=profDeCat(cat);
    // Distribución: Granada ~38%, Metro ~62%
    const dist=Math.random()<0.38?0:1;
    const u=dist===0?Math.floor(Math.random()*15):Math.floor(Math.random()*21);

    const base=partBase[cat]||10;
    const part=Math.max(1,Math.round(base*(0.4+Math.random()*1.1)));
    const pctMuj=cat===6?0.56:cat===7?0.62:0.68;
    const muj=Math.min(part,Math.max(0,Math.round(part*(pctMuj-0.15+Math.random()*0.30))));
    const hom=part-muj;
    const horas=parseFloat((0.5+Math.random()*3.5).toFixed(1));
    const ses=1+Math.floor(Math.random()*4);

    rows.push({
      record_id: rid++,
      fecha_del_registro: fecha,
      apellidos_y_nombre: prof,
      sexo: Math.random()<(cat===6?0.35:cat===7?0.40:0.18)?0:1,
      categor_a_profesional: cat,
      especialidad_de_enfermer_a: cat===2?(Math.random()<0.55?Math.ceil(Math.random()*6):''):'',
      distrito0: dist,
      unidad_asistencial:   dist===0?u:'',
      unidad_asistencial_2: dist===1?u:'',
      nombre_de_la_actividad: pick(actCat[cat]||actCat['_']),
      tipo_de_actividad: pick(tipoCat[cat]||tipoCat['_']),
      qu_tem_tica_s_aborda_la_ac: pick(temaCat[cat]||temaCat['_']),
      en_qu_estrategia_plan_inte: pick(progCat[cat]||progCat['_']),
      fecha_de_inicio: fecha,
      fecha_de_fin: fecha,
      n_mero_de_sesiones: ses,
      n_mero_de_horas: horas,
      horario: Math.floor(Math.random()*3),
      localidad_donde_se_realiza: dist===0?'Granada':'Municipio Metro',
      es_una_zona_desfavorecidas: Math.random()<0.18?1:0,
      lugar_de_realizaci_n_de_la: Math.floor(Math.random()*10),
      poblaci_n_destinataria: Math.floor(Math.random()*16),
      asist_total: part,
      asist_hombres: hom,
      asist_mujeres: muj,
      observaciones_sobre_la_act: ''
    });
  }

  S.raw=rows;
  postCarga();
}

export { generarDatosPrueba };

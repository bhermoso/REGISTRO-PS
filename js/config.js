// Configuración global y tablas de lookup REDCap
export const C = {
  f: {
    fecha:'fecha_de_inicio', actividad:'nombre_de_la_actividad',
    tipo:'tipo_de_actividad', tematica:'qu_tem_tica_s_aborda_la_ac',
    programa:'en_qu_estrategia_plan_inte', participantes:'asist_total',
    hombres:'asist_hombres', mujeres:'asist_mujeres',
    horas:'n_mero_de_horas', sesiones:'n_mero_de_sesiones',
    profesional:'apellidos_y_nombre', distrito:'distrito0',
    u_granada:'unidad_asistencial', u_metro:'unidad_asistencial_2',
    sexo_prof:'sexo', categoria:'categor_a_profesional',
    especialidad:'especialidad_de_enfermer_a', record:'record_id',
    horario:'horario', localidad:'localidad_donde_se_realiza',
    zona:'es_una_zona_desfavorecidas', lugar:'lugar_de_realizaci_n_de_la',
    poblacion:'poblaci_n_destinataria', fecha_reg:'fecha_del_registro',
    fecha_fin:'fecha_de_fin'
  },
  tipo:{0:'Charla',1:'Comisión/grupo trabajo',2:'Control Alerta SP',3:'Entrevista/Reunión',4:'Intervención media',5:'IG: cuidadoras',6:'IG: dolor',7:'IG: diabetológica',8:'IG: EPOC/asma',9:'IG: rehab. cardiaca',10:'IG: rehab. respiratoria',11:'Ed. maternal',12:'GRAFA',13:'GRUSE',14:'IAHS',15:'PIOBIN',16:'PITA',17:'PSIA',18:'Mapeo activos',19:'Mesa/stand',20:'Ponencia',21:'Sesión clínica',22:'Sesión formativa',23:'Taller',24:'Otros'},
  tema:{1:'Actividad física',2:'Activos salud',3:'Alimentación',4:'Bienestar emocional',5:'Conducta suicida',6:'Alcohol',7:'Tabaco',8:'Dolor',9:'Enf. transmisibles',10:'Envejecimiento',11:'Higiene manos',12:'Higiene postural',13:'Incontinencia',14:'IRAS',15:'Lactancia',16:'Manejo enf.',17:'Menopausia',18:'Otras adicciones',19:'Otras formas fumar',20:'Parentalidad',21:'Prev. accidentes',22:'Primeros auxilios',23:'Salud bucodental',24:'Sexualidad',25:'Uso medicamento',26:'Uso TRICs',27:'Vacunas',28:'Violencia género',29:'Voluntades vitales',30:'Otra'},
  prog:{1:'C.C. Violencia Género',2:'En Buena Edad',3:'Escuela Pacientes',4:'AVISTA',5:'Est. Cuidados',6:'Seg. Paciente',7:'EVSA',8:'Forma Joven',9:'GRAFA',10:'GRUSE',11:'Jornadas salud',12:'Mapa Activos',13:'PAITSIDA',14:'PAPEF',15:'Plan Humanización',16:'PIOBIN',17:'PITA',18:'Participación ciudadana',19:'PSIA',20:'Prev. conducta suicida',21:'Por 1M pasos',22:'PromoSalud educ.',23:'PSLT',24:'RELAS',25:'Otros'},
  ugranada:{0:'Albayzín',1:'Almanjáyar',2:'Cartuja',3:'Casería de Montijo',4:'Caleta',5:'Chana',6:'Gran Capitán',7:'Flores-Fígares',8:'Fortuny/Velluti',9:'Zaidín C-E',10:'Zaidín Sur',11:'Gógora',12:'Realejo',13:'Bola de Oro',14:'Doctores'},
  umetro:{0:'Albolote',1:'Alfacar',2:'Alhama',3:'Armilla',4:'Atarfe',5:'Cenes',6:'Churriana',7:'Huétor-Tájar',8:'Huétor-Vega',9:'Íllora',10:'Iznalloz',11:'La Zubia',12:'Las Gabias',13:'Loja',14:'Maracena',15:'Montefrío',16:'Ogíjares',17:'Peligros',18:'Pinos Puente',19:'Santa Fe',20:'Valle Lecrín'},
  categoria:{1:'A4 (Vet./Farm.)',2:'Enfermería',3:'Epidemiología AP',4:'Farmacia',5:'Fisioterapia',6:'Medicina Familia',7:'Pediatría',8:'Psicología clínica',9:'TEPSPC',10:'T. PRL',11:'T. salud ambiental',12:'T. ocupacional',13:'Trabajo Social',14:'Odontología',15:'Otros'},
  especialidad:{1:'EBAP',2:'EFYC',3:'EGC',4:'ERCE',5:'Infanto-juvenil',6:'Matrona',7:'Trabajo',8:'Salud Pública',9:'SUAP'},
  horario:{0:'Mañana',1:'Tarde',2:'Mañana y tarde'},
  lugar:{0:'Centro salud',1:'Hospital',2:'Asoc./ONG',3:'C. residencial',4:'C. acogida',5:'C. sociosan.',6:'C. educativo',7:'Universidad',8:'Ayto./Municipal',9:'Empresa',10:'C. menores',11:'Penitenciario',12:'Radio/TV',13:'RRSS',14:'Otros'},
  poblacion:{0:'Infancia',1:'Adolescencia',2:'Juventud',3:'Adulta',4:'Mayores',5:'General',6:'Mujeres',7:'Hombres',8:'Prof. sanitarios',9:'Prof. no sanitarios',10:'Enf. crónicas',11:'Salud mental',12:'Cuidadoras',13:'Migrantes',14:'Riesgo colectivo',15:'Vulnerabilidad'},
  PAL:['#4a90e2','#00c9a7','#43b89c','#b8f04a','#ffc340','#ff6b6b','#7c5cbf'],
  PAL_L:['rgba(74,144,226,.15)','rgba(0,201,167,.15)','rgba(67,184,156,.15)','rgba(184,240,74,.15)','rgba(255,195,64,.15)','rgba(255,107,107,.15)','rgba(124,92,191,.15)']
};

import csv, random
from datetime import date, timedelta

random.seed(42)

DESFAV_GR = {1, 3, 5}
DESFAV_ME = {4, 14}

APELLIDOS = [
    'Garcia','Gonzalez','Martinez','Lopez','Sanchez','Perez','Fernandez',
    'Rodriguez','Jimenez','Moreno','Ruiz','Hernandez','Diaz','Torres',
    'Romero','Alonso','Navarro','Molina','Gutierrez','Serrano','Blanco',
    'Castro','Ortiz','Vega','Ramos','Medina','Aguilar','Reyes','Morales',
    'Vargas','Silva','Flores','Cruz','Rios','Campos','Suarez','Cabrera',
    'Delgado','Iglesias','Cortes','Dominguez','Rubio','Guerrero','Cano',
    'Marin','Herrera','Leon','Pastor','Pardo','Lara','Fuentes','Gimenez',
    'Santana','Mendoza','Carmona','Espinosa','Bravo','Hidalgo','Montero'
]
NOMBRES_M = [
    'Antonio','Jose','Manuel','Francisco','David','Juan','Javier',
    'Carlos','Alejandro','Pedro','Miguel','Fernando','Rafael','Sergio',
    'Pablo','Roberto','Diego','Jorge','Andres','Mario'
]
NOMBRES_F = [
    'Maria','Carmen','Ana','Laura','Isabel','Cristina','Marta','Elena',
    'Patricia','Rosa','Sara','Lucia','Pilar','Sofia','Beatriz',
    'Inmaculada','Dolores','Amparo','Mercedes','Virginia','Silvia','Nuria'
]

def make_name(sexo):
    n  = random.choice(NOMBRES_F if sexo == 'F' else NOMBRES_M)
    a1 = random.choice(APELLIDOS)
    a2 = random.choice([a for a in APELLIDOS if a != a1])
    return f"{a1} {a2}, {n}"

def fmt_date(d):
    return d.strftime('%d/%m/%Y')

START = date(2024, 1, 1)
END   = date(2025, 12, 31)

# ── Units ─────────────────────────────────────────────────────────────────────
# GR: 4 large + 11 medium = 4*200 + 11*165 = 2615
# ME: 4 large + 13 medium + 4 small = 4*200 + 13*165 + 4*110 = 3385
# Total = 6000
UNITS_GR = {
     0: ('Albayzin',          'medium', 'Granada'),
     1: ('Almanjayar',        'large',  'Granada'),
     2: ('Cartuja',           'medium', 'Granada'),
     3: ('Caseria Montijo',   'medium', 'Granada'),
     4: ('Caleta',            'medium', 'Granada'),
     5: ('Chana',             'large',  'Granada'),
     6: ('Gran Capitan',      'medium', 'Granada'),
     7: ('Flores-Figares',    'medium', 'Granada'),
     8: ('Fortuny Velluti',   'medium', 'Granada'),
     9: ('Zaidan Centro-Este','large',  'Granada'),
    10: ('Zaidan Sur',        'large',  'Granada'),
    11: ('Gogora',            'medium', 'Granada'),
    12: ('Realejo',           'medium', 'Granada'),
    13: ('Bola de Oro',       'medium', 'Granada'),
    14: ('Doctores',          'medium', 'Granada'),
}
UNITS_ME = {
     0: ('Albolote',     'medium', 'Albolote'),
     1: ('Alfacar',      'small',  'Alfacar'),
     2: ('Alhama',       'medium', 'Alhama de Granada'),
     3: ('Armilla',      'large',  'Armilla'),
     4: ('Atarfe',       'medium', 'Atarfe'),
     5: ('Cenes',        'small',  'Cenes de la Vega'),
     6: ('Churriana',    'medium', 'Churriana de la Vega'),
     7: ('Huetor-Tajar', 'medium', 'Huetor Tajar'),
     8: ('Huetor-Vega',  'medium', 'Huetor Vega'),
     9: ('Illora',       'medium', 'Illora'),
    10: ('Iznalloz',     'medium', 'Iznalloz'),
    11: ('La Zubia',     'large',  'La Zubia'),
    12: ('Las Gabias',   'medium', 'Las Gabias'),
    13: ('Loja',         'medium', 'Loja'),
    14: ('Maracena',     'large',  'Maracena'),
    15: ('Montefrio',    'small',  'Montefrio'),
    16: ('Ogiajres',     'medium', 'Ogiajres'),
    17: ('Peligros',     'medium', 'Peligros'),
    18: ('Pinos Puente', 'medium', 'Pinos Puente'),
    19: ('Santa Fe',     'large',  'Santa Fe'),
    20: ('Valle Lecrin', 'small',  'Valle de Lecrin'),
}

TARGETS = {'large': 200, 'medium': 165, 'small': 110}

# ── Activity types and names ──────────────────────────────────────────────────
NOMBRES_ACT = {
    0:  ['Charla sobre alimentacion saludable',
         'Charla prevencion cardiovascular',
         'Charla sobre higiene del sueno',
         'Charla uso adecuado de medicamentos',
         'Charla sobre tabaco y salud',
         'Habitos saludables en la infancia',
         'Actividad fisica y bienestar',
         'Prevencion del consumo de alcohol',
         'Charla sobre sexualidad sana'],
    23: ['Taller de cocina saludable',
         'Taller de relajacion y mindfulness',
         'Taller de primeros auxilios',
         'Taller de deshabituacion tabaquica',
         'Taller de lactancia materna',
         'Taller bienestar emocional',
         'Taller de actividad fisica mayor',
         'Taller de reduccion del estres'],
    12: ['GRAFA - Grupo de afrontamiento de la ansiedad',
         'GRAFA - Sesion de tecnicas de relajacion'],
    13: ['GRUSE - Grupo socioeducativo de salud',
         'GRUSE - Habilidades para la vida'],
    7:  ['Educacion diabetologica - manejo de la glucemia',
         'Educacion diabetologica - alimentacion y ejercicio',
         'Educacion diabetologica - uso del glucometro'],
    8:  ['Taller de uso correcto de inhaladores',
         'Grupo EPOC - ejercicio y respiracion',
         'Educacion terapeutica en asma'],
    11: ['Grupo de educacion maternal - preparacion al parto',
         'Grupo de educacion maternal - lactancia y cuidados'],
    5:  ['Grupo de apoyo a personas cuidadoras',
         'Taller de autocuidado para cuidadores'],
    19: ['Mesa informativa Dia Mundial sin Tabaco',
         'Mesa informativa Dia de la Diabetes',
         'Mesa informativa Semana del Corazon',
         'Mesa informativa Dia Mundial de la Salud',
         'Marcha saludable organizada desde el centro de salud'],
    22: ['Sesion formativa sobre prevencion de caidas en mayores',
         'Sesion sobre salud mental en adolescentes',
         'Sesion sobre violencia de genero - deteccion precoz',
         'Formacion en EpS',
         'Actualizacion EpS'],
    3:  ['Reunion de coordinacion con Trabajo Social',
         'Reunion red comunitaria de salud',
         'Reunion con asociaciones del barrio'],
    14: ['Intervencion IAHS - adolescentes y habitos saludables'],
    16: ['PIOBIN - prevencion obesidad infantil',
         'PIOBIN - taller familias saludables'],
    17: ['PITA - grupo de deshabituacion tabaquica',
         'PITA - sesion de refuerzo deshabituacion'],
    21: ['Sesion clinica sobre manejo del dolor cronico',
         'Sesion clinica sobre prescripcion de ejercicio'],
    20: ['Ponencia en Jornadas de Promocion de Salud',
         'Comunicacion en congreso de AP'],
    6:  ['Intervencion grupal cartera - alcohol',
         'Taller prevencion alcohol'],
    9:  ['Intervencion grupal cartera - actividad fisica',
         'Grupo prescripcion ejercicio'],
    10: ['Intervencion grupal cartera - alimentacion',
         'Grupo alimentacion saludable'],
    15: ['Grupo de apoyo puerperio', 'Visita puerperal grupas'],
}
NOMBRES_DEFAULT = ['Actividad de promocion de la salud',
                    'Intervencion comunitaria', 'Accion EpS']

TEMATICAS_POR_TIPO = {
    0:  [3, 1, 7, 6, 4, 24],
    23: [3, 1, 7, 6, 4, 24],
    22: [3, 1, 4, 7, 6],
    3:  [4, 3, 1, 7, 6],
    5:  [4, 25],
    6:  [6, 7],
    7:  [2, 3],
    8:  [11, 12],
    9:  [1, 3],
    10: [3, 1],
    11: [15, 20],
    12: [4, 5],
    13: [4, 18],
    14: [23, 24],
    15: [15, 20],
    16: [3, 1],
    17: [7],
    19: [3, 1, 7, 6, 24, 4],
    20: [3, 1, 4, 7],
    21: [3, 4, 5],
}
TEMATICAS_DEFAULT = [3, 1, 4, 7, 6]

PARTIC_RANGO = {
    0:  (15, 60),  23: (8, 20),   22: (15, 40),
    3:  (3, 15),   5:  (6, 15),   6:  (6, 15),
    7:  (6, 15),   8:  (6, 15),   9:  (6, 15),
    10: (6, 15),   11: (8, 15),   12: (6, 12),
    13: (6, 12),   14: (10, 25),  15: (8, 15),
    16: (8, 20),   17: (6, 12),
    19: (30, 150), 20: (20, 80),  21: (20, 80),
}
PARTIC_DEFAULT = (10, 30)

# ── Type pools by category ────────────────────────────────────────────────────
_T_MF  = ([0]*20 + [23]*15 + [22]*12 + [7]*10 + [8]*8 + [17]*8
           + [3]*10 + [19]*5 + [20]*3 + [5]*5 + [6]*4 + [9]*3 + [21]*3)
_T_ENF = ([0]*20 + [23]*15 + [22]*12 + [7]*10 + [8]*8 + [17]*6
           + [3]*8 + [5]*8 + [6]*5 + [11]*5 + [19]*3 + [15]*3)
_T_GEN = ([0]*20 + [23]*18 + [22]*12 + [3]*10 + [5]*3 + [6]*3 + [7]*3
           + [8]*2 + [9]*2 + [10]*1 + [11]*1 + [13]*5 + [12]*4
           + [19]*4 + [20]*3 + [21]*3 + [14]*2 + [16]*2 + [17]*2)

def get_tipo(cat, esp):
    if   cat == 6:               return random.choice(_T_MF)
    elif cat == 2 and esp == 1:  return random.choice(_T_ENF)
    elif cat == 2 and esp == 6:  return random.choice([11, 5, 23, 0, 3, 15])
    elif cat == 7:               return random.choice([0]*25+[23]*20+[22]*20+[19]*15+[3]*10+[14]*10)
    elif cat == 14:              return random.choice([0]*30+[22]*30+[23]*20+[19]*20)
    elif cat == 8:               return random.choice([12]*30+[13]*20+[0]*20+[23]*15+[22]*15)
    elif cat == 13:              return random.choice([12]*20+[13]*15+[3]*20+[0]*20+[23]*10+[5]*15)
    elif cat == 9:               return random.choice([0]*20+[23]*15+[19]*15+[13]*10+[12]*10+[20]*10+[22]*10+[3]*5+[16]*5)
    elif cat == 5:               return random.choice([0]*25+[22]*20+[23]*20+[3]*15+[8]*10+[5]*10)
    elif cat == 2 and esp == 2:  return random.choice([0]*25+[23]*20+[22]*15+[7]*10+[8]*10+[3]*10+[5]*10)
    else:                        return random.choice(_T_GEN)

LUGARES  = [0]*65 + [6]*20 + [8]*8 + [2]*4 + [3]*3
HORARIOS = [0]*70 + [1]*25 + [2]*5

# ── Build professional pools per unit ─────────────────────────────────────────
def build_unit_profs(uid, distrito, size):
    profs = []

    def add(cat, esp, sexo_bias_m):
        s = 'M' if random.random() < sexo_bias_m else 'F'
        if cat == 2 and esp == 6:
            s = 'F'
        profs.append({
            'nombre': make_name(s),
            'sexo':   1 if s == 'M' else 2,
            'cat':    cat,
            'esp':    esp,
        })

    if distrito == 0:
        n_mf  = 6 if size == 'large' else 4
        n_enf = 6 if size == 'large' else 4
        for _ in range(n_mf):  add(6, '', 0.35)
        for _ in range(n_enf): add(2, 1, 0.20)
        add(7, '', 0.40)       # Pediatra
        add(13, '', 0.20)      # TS
        add(2, 6, 0.0)         # Matrona
        if size == 'large':
            add(5, '', 0.50)   # Fisio
    else:
        n_mf  = 4 if size == 'large' else (3 if size == 'medium' else 2)
        n_enf = 4 if size == 'large' else (3 if size == 'medium' else 2)
        for _ in range(n_mf):  add(6, '', 0.35)
        for _ in range(n_enf): add(2, 1, 0.20)
        add(7, '', 0.40)
        if size != 'small':
            add(13, '', 0.20)
            add(2, 6, 0.0)
        if size == 'large':
            add(5, '', 0.50)

    return profs

# District-level specialists added to random units
def add_district_specialists(units_dict, unit_pool):
    uids = list(units_dict.keys())

    # Psicología
    for _ in range(4):
        s = 'M' if random.random() < 0.3 else 'F'
        p = {'nombre': make_name(s), 'sexo': 1 if s=='M' else 2, 'cat': 8, 'esp': ''}
        for uid in random.sample(uids, min(3, len(uids))):
            unit_pool[uid].append(dict(p))

    # Odontología
    for _ in range(4):
        s = 'M' if random.random() < 0.4 else 'F'
        p = {'nombre': make_name(s), 'sexo': 1 if s=='M' else 2, 'cat': 14, 'esp': ''}
        for uid in random.sample(uids, min(2, len(uids))):
            unit_pool[uid].append(dict(p))

    # EFYC enfermería
    for _ in range(10):
        s = 'M' if random.random() < 0.2 else 'F'
        p = {'nombre': make_name(s), 'sexo': 1 if s=='M' else 2, 'cat': 2, 'esp': 2}
        uid = random.choice(uids)
        unit_pool[uid].append(dict(p))

    # Técnico EpS (district: appears in all units)
    eps = []
    for _ in range(3):
        s = 'M' if random.random() < 0.4 else 'F'
        eps.append({'nombre': make_name(s), 'sexo': 1 if s=='M' else 2, 'cat': 9, 'esp': ''})
    for uid in uids:
        for p in eps:
            unit_pool[uid].append(dict(p))

# Build pools
pool_gr = {uid: build_unit_profs(uid, 0, info[1]) for uid, info in UNITS_GR.items()}
pool_me = {uid: build_unit_profs(uid, 1, info[1]) for uid, info in UNITS_ME.items()}
add_district_specialists(UNITS_GR, pool_gr)
add_district_specialists(UNITS_ME, pool_me)

# ── Generate rows ─────────────────────────────────────────────────────────────
COLS = [
    'record_id','fecha_del_registro','apellidos_y_nombre','sexo',
    'categor_a_profesional','especialidad_de_enfermer_a','distrito0',
    'unidad_asistencial','unidad_asistencial_2','nombre_de_la_actividad',
    'tipo_de_actividad','fecha_de_inicio','fecha_de_fin','n_mero_de_sesiones',
    'n_mero_de_horas','horario','localidad_donde_se_realiza',
    'es_una_zona_desfavorecidas','lugar_de_realizaci_n_de_la',
    'poblaci_n_destinataria','asist_total','asist_hombres','asist_mujeres',
    'qu_tem_tica_s_aborda_la_ac','en_qu_estrategia_plan_inte',
    'observaciones_sobre_la_act'
]

months_list = [(y, m) for y in [2024, 2025] for m in range(1, 13)]

def gen_row(prof, year, month, distrito, uid):
    cat = prof['cat']
    esp = prof['esp']
    tipo = get_tipo(cat, esp)

    # Date within the target month
    if month < 12:
        last_day = (date(year, month + 1, 1) - timedelta(days=1)).day
    else:
        last_day = 31
    fi = date(year, month, random.randint(1, last_day))
    if fi > END: fi = END

    sesiones = random.choices([1,2,3,4,5,6,8,10,12],[30,20,15,12,8,6,4,3,2])[0]
    horas    = round(sesiones * random.uniform(1.0, 2.5), 1)
    ff = min(fi + timedelta(days=sesiones), END)
    days_left = max(0, (END - fi).days)
    freg = fi + timedelta(days=random.randint(0, min(14, days_left)))

    rango   = PARTIC_RANGO.get(tipo, PARTIC_DEFAULT)
    total_p = random.randint(*rango)

    if cat == 2 and esp == 6:
        mujeres = total_p; hombres = 0
    elif tipo in (6, 17):
        hombres = round(total_p * random.uniform(0.50, 0.65))
        mujeres = total_p - hombres
    else:
        mujeres = round(total_p * random.uniform(0.50, 0.65))
        hombres = total_p - mujeres

    if cat == 2 and esp == 6:   pool = [15, 20]
    elif cat == 7:               pool = [20, 27, 23]
    elif cat == 14:              pool = [23]
    else:                        pool = TEMATICAS_POR_TIPO.get(tipo, TEMATICAS_DEFAULT)
    tematica = random.choice(pool)

    if distrito == 0:
        zona_desf = 1 if uid in DESFAV_GR else 0
        ua = uid; ua2 = ''
        loc = UNITS_GR[uid][2]
    else:
        zona_desf = 1 if uid in DESFAV_ME else 0
        ua = ''; ua2 = uid
        loc = UNITS_ME[uid][2]

    nom_act = random.choice(NOMBRES_ACT.get(tipo, NOMBRES_DEFAULT))

    return {
        'record_id':                  0,
        'fecha_del_registro':         fmt_date(freg),
        'apellidos_y_nombre':         prof['nombre'],
        'sexo':                       prof['sexo'],
        'categor_a_profesional':      cat,
        'especialidad_de_enfermer_a': esp,
        'distrito0':                  distrito,
        'unidad_asistencial':         ua,
        'unidad_asistencial_2':       ua2,
        'nombre_de_la_actividad':     nom_act,
        'tipo_de_actividad':          tipo,
        'fecha_de_inicio':            fmt_date(fi),
        'fecha_de_fin':               fmt_date(ff),
        'n_mero_de_sesiones':         sesiones,
        'n_mero_de_horas':            horas,
        'horario':                    random.choice(HORARIOS),
        'localidad_donde_se_realiza': loc,
        'es_una_zona_desfavorecidas': zona_desf,
        'lugar_de_realizaci_n_de_la': random.choice(LUGARES),
        'poblaci_n_destinataria':     random.randint(1, 10),
        'asist_total':                total_p,
        'asist_hombres':              hombres,
        'asist_mujeres':              mujeres,
        'qu_tem_tica_s_aborda_la_ac': tematica,
        'en_qu_estrategia_plan_inte': random.randint(1, 8),
        'observaciones_sobre_la_act': '',
    }

all_rows = []

for uid, (uname, size, loc) in UNITS_GR.items():
    target = TARGETS[size]
    profs  = pool_gr[uid]
    base = target // 24
    xtra = target % 24
    for i, (yr, mo) in enumerate(months_list):
        n = base + (1 if i < xtra else 0)
        for _ in range(n):
            all_rows.append(gen_row(random.choice(profs), yr, mo, 0, uid))

for uid, (uname, size, loc) in UNITS_ME.items():
    target = TARGETS[size]
    profs  = pool_me[uid]
    base = target // 24
    xtra = target % 24
    for i, (yr, mo) in enumerate(months_list):
        n = base + (1 if i < xtra else 0)
        for _ in range(n):
            all_rows.append(gen_row(random.choice(profs), yr, mo, 1, uid))

# Sort and renumber
all_rows.sort(key=lambda r: list(reversed(r['fecha_de_inicio'].split('/'))))
for i, r in enumerate(all_rows, 1):
    r['record_id'] = i

out = 'C:/Users/blash/Downloads/datos_prueba_raps.csv'
with open(out, 'w', newline='', encoding='utf-8') as f:
    w = csv.DictWriter(f, fieldnames=COLS)
    w.writeheader()
    w.writerows(all_rows)

print(f'CSV generado: {out}')
print(f'Total filas: {len(all_rows)}')

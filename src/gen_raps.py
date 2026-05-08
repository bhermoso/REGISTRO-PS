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
    'Delgado','Iglesias','Cortes','Dominguez','Rubio','Guerrero','Cano'
]
NOMBRES_M = ['Antonio','Jose','Manuel','Francisco','David','Juan','Javier',
             'Carlos','Alejandro','Pedro','Miguel','Fernando','Rafael','Sergio','Pablo']
NOMBRES_F = ['Maria','Carmen','Ana','Laura','Isabel','Cristina','Marta','Elena',
             'Patricia','Rosa','Sara','Lucia','Pilar','Sofia','Beatriz',
             'Inmaculada','Concepcion','Dolores','Amparo','Mercedes']

def nombre(sexo):
    n  = random.choice(NOMBRES_F if sexo == 'F' else NOMBRES_M)
    a1 = random.choice(APELLIDOS)
    a2 = random.choice([a for a in APELLIDOS if a != a1])
    return f"{a1} {a2}, {n}"

# (cat, esp, sexo_bias_M, weight_per_prof, n_profs)
CATS = [
    (6,  '',  0.3, 3.0, 180),
    (7,  '',  0.4, 2.5,  35),
    (2,   1,  0.2, 3.5,  90),
    (2,   2,  0.2, 4.5,  20),
    (2,   3,  0.3, 2.5,  10),
    (2,   6,  0.0, 5.0,  15),
    (13, '',  0.3, 4.0,  18),
    (5,  '',  0.4, 2.0,  12),
    (8,  '',  0.3, 3.0,   8),
    (9,  '',  0.4, 8.0,   6),
    (11, '',  0.5, 3.0,   4),
    (10, '',  0.6, 2.5,   3),
    (4,  '',  0.3, 2.0,   5),
    (14, '',  0.4, 2.5,   8),
]

def fmt_date(d):
    return d.strftime('%d/%m/%Y')

def rand_date(start, end):
    return start + timedelta(days=random.randint(0, (end - start).days))

START = date(2024, 1, 1)
END   = date(2025, 12, 31)

TEMATICAS_POR_TIPO = {
    0:  [3, 1, 7, 6, 4, 24],
    23: [3, 1, 7, 6, 4, 24],
    22: [3, 1, 4, 7, 6],
    3:  [4, 3, 1, 7, 6],
    5:  [1, 3, 4], 6: [7, 6], 7: [3, 1],
    8:  [4], 9: [1], 10: [3], 11: [4, 5],
    13: [4, 18], 12: [4, 5],
    19: [3, 1, 7, 6, 24, 4],
    20: [3, 1, 4, 7], 21: [3, 4, 5],
}
TEMATICAS_DEFAULT = [3, 1, 4, 7, 6]

PARTIC_RANGO = {
    0:  (15, 60),  23: (8, 20),  22: (15, 40),
    3:  (3, 15),   5:  (6, 15),  6:  (6, 15),
    7:  (6, 15),   8:  (6, 15),  9:  (6, 15),
    10: (6, 15),   11: (6, 15),
    13: (6, 12),   12: (6, 12),
    19: (30, 150), 20: (20, 80), 21: (20, 80),
}
PARTIC_DEFAULT = (10, 30)

TIPO_PESOS = [
    (0, 20), (23, 18), (22, 12), (3, 10),
    (5, 3), (6, 3), (7, 3), (8, 2), (9, 2), (10, 1), (11, 1),
    (13, 5), (12, 4), (19, 4), (20, 3), (21, 3), (15, 2), (16, 2), (17, 2),
]
tipo_lista = []
for t, w in TIPO_PESOS:
    tipo_lista.extend([t] * w)

LUGARES  = [0]*65 + [6]*20 + [8]*8 + [2]*4 + [3]*3
HORARIOS = [0]*70 + [1]*25 + [2]*5

NOMBRES_ACT = {
    0:  ['Taller de alimentacion saludable','Charla sobre tabaco y salud',
         'Habitos saludables en la infancia','Actividad fisica y bienestar',
         'Prevencion del consumo de alcohol','Charla sobre sexualidad sana'],
    23: ['Taller de relajacion','Taller de cocina saludable',
         'Taller bienestar emocional','Taller de actividad fisica mayor',
         'Taller de reduccion del estres'],
    22: ['Sesion formativa enfermeria','Formacion en EpS','Actualizacion EpS'],
    3:  ['Reunion coordinacion','Entrevista motivacional','Reunion equipo EpS'],
    13: ['Grupo de apoyo GRUSE','Grupo usuarios','Grupo salud comunitaria'],
    12: ['Grupo de ayuda familiar GRAFA','Grupo familias','GRAFA bienestar'],
    19: ['Mesa informativa salud','Stand salud feria','Mesa prevencion'],
    20: ['Ponencia jornada salud','Ponencia EpS','Comunicacion congreso'],
    21: ['Sesion clinica EpS','Sesion clinica PS','Formacion interna EpS'],
}
NOMBRES_ACT_DEFAULT = ['Actividad de promocion de la salud',
                        'Intervencion comunitaria','Accion EpS']

LOCALIDADES_GR = ['Granada','Granada (Albayzan)','Granada (Almanjayar)',
                   'Granada (Chana)','Granada (Zaidan)','Granada (Realejo)']
LOCALIDADES_ME = ['Albolote','Alfacar','Alhama de Granada','Armilla','Atarfe',
                   'Cenes de la Vega','Churriana de la Vega','Huetor Tajar',
                   'Huetor Vega','Illora','Iznalloz','La Zubia','Las Gabias',
                   'Loja','Maracena','Montefrio','Ogiajres','Peligros',
                   'Pinos Puente','Santa Fe','Valle de Lecrin']

# Construir profesionales
profesionales = []
for cat, esp, sexo_bias_m, weight, n in CATS:
    for i in range(n):
        sexo = 'M' if random.random() < sexo_bias_m else 'F'
        if cat == 2 and esp == 6:
            sexo = 'F'
        ap_nom = nombre(sexo)
        if cat == 9:
            distrito = random.choice([0, 1])
            unidad = ''; unidad2 = ''
        elif cat == 6:
            if random.random() < 0.6:
                distrito = 0; unidad = random.randint(0, 14); unidad2 = ''
            else:
                distrito = 1; unidad = ''; unidad2 = random.randint(0, 20)
        elif cat == 7:
            if random.random() < 0.55:
                distrito = 0; unidad = random.randint(0, 14); unidad2 = ''
            else:
                distrito = 1; unidad = ''; unidad2 = random.randint(0, 20)
        else:
            if random.random() < 0.5:
                distrito = 0; unidad = random.randint(0, 14); unidad2 = ''
            else:
                distrito = 1; unidad = ''; unidad2 = random.randint(0, 20)
        profesionales.append({
            'nombre': ap_nom, 'sexo': sexo, 'cat': cat, 'esp': esp,
            'distrito': distrito, 'unidad': unidad, 'unidad2': unidad2,
            'weight': weight,
        })

# Distribucion de registros
total = 2800
pesos = [max(0.5, p['weight'] + random.uniform(-0.3, 0.3)) for p in profesionales]
suma  = sum(pesos)
conteos = []
acum = 0
for i, w in enumerate(pesos):
    if i == len(pesos) - 1:
        conteos.append(max(0, total - acum))
    else:
        c = max(0, round(w / suma * total))
        conteos.append(c); acum += c

diff = sum(conteos) - total
idx_list = list(range(len(conteos)))
random.shuffle(idx_list)
for idx in idx_list[:abs(diff)]:
    conteos[idx] += -1 if diff > 0 else 1
    if conteos[idx] < 0:
        conteos[idx] = 0

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

rows = []
record_id = 1

for prof, cnt in zip(profesionales, conteos):
    cat = prof['cat']
    esp = prof['esp']
    dis = prof['distrito']

    for _ in range(cnt):
        if cat == 2 and esp == 6:
            tipo = random.choice([22, 3, 0, 23])
        elif cat == 7:
            tipo = random.choice([0, 22, 23, 3, 19])
        elif cat == 14:
            tipo = random.choice([0, 22, 23, 19])
        else:
            tipo = random.choice(tipo_lista)

        fi = rand_date(START, END)
        sesiones = random.choices([1,2,3,4,5,6,8,10,12],[30,20,15,12,8,6,4,3,2])[0]
        horas    = round(sesiones * random.uniform(1.0, 2.5), 1)
        ff = min(fi + timedelta(days=sesiones), END)
        days_left = (END - fi).days
        freg = fi + timedelta(days=random.randint(0, min(14, days_left)))

        rango   = PARTIC_RANGO.get(tipo, PARTIC_DEFAULT)
        total_p = random.randint(*rango)
        if cat == 2 and esp == 6:
            mujeres = total_p; hombres = 0
        elif tipo in (7, 6):
            hombres = round(total_p * random.uniform(0.50, 0.65))
            mujeres = total_p - hombres
        else:
            mujeres = round(total_p * random.uniform(0.50, 0.65))
            hombres = total_p - mujeres

        if cat == 2 and esp == 6:
            pool = [15, 20]
        elif cat == 7:
            pool = [20, 27, 23]
        elif cat == 14:
            pool = [23]
        else:
            pool = TEMATICAS_POR_TIPO.get(tipo, TEMATICAS_DEFAULT)
        tematica   = random.choice(pool)
        estrategia = random.randint(1, 8)

        if dis == 0:
            u = prof['unidad']
            localidad = random.choice(LOCALIDADES_GR)
            zona_desf = 1 if u in DESFAV_GR else 0
            ua = u; ua2 = ''
        else:
            u2 = prof['unidad2']
            localidad = random.choice(LOCALIDADES_ME)
            zona_desf = 1 if u2 in DESFAV_ME else 0
            ua = ''; ua2 = u2

        nom_act = random.choice(NOMBRES_ACT.get(tipo, NOMBRES_ACT_DEFAULT))

        rows.append({
            'record_id':                  record_id,
            'fecha_del_registro':         fmt_date(freg),
            'apellidos_y_nombre':         prof['nombre'],
            'sexo':                       1 if prof['sexo'] == 'M' else 2,
            'categor_a_profesional':      cat,
            'especialidad_de_enfermer_a': esp,
            'distrito0':                  dis,
            'unidad_asistencial':         ua,
            'unidad_asistencial_2':       ua2,
            'nombre_de_la_actividad':     nom_act,
            'tipo_de_actividad':          tipo,
            'fecha_de_inicio':            fmt_date(fi),
            'fecha_de_fin':               fmt_date(ff),
            'n_mero_de_sesiones':         sesiones,
            'n_mero_de_horas':            horas,
            'horario':                    random.choice(HORARIOS),
            'localidad_donde_se_realiza': localidad,
            'es_una_zona_desfavorecidas': zona_desf,
            'lugar_de_realizaci_n_de_la': random.choice(LUGARES),
            'poblaci_n_destinataria':     random.randint(1, 10),
            'asist_total':                total_p,
            'asist_hombres':              hombres,
            'asist_mujeres':              mujeres,
            'qu_tem_tica_s_aborda_la_ac': tematica,
            'en_qu_estrategia_plan_inte': estrategia,
            'observaciones_sobre_la_act': '',
        })
        record_id += 1

rows.sort(key=lambda r: list(reversed(r['fecha_de_inicio'].split('/'))))
for i, r in enumerate(rows, 1):
    r['record_id'] = i

out = 'C:/Users/blash/Downloads/datos_prueba_raps.csv'
with open(out, 'w', newline='', encoding='utf-8') as f:
    w = csv.DictWriter(f, fieldnames=COLS)
    w.writeheader()
    w.writerows(rows)

print(f'CSV generado: {out}  ({len(rows)} filas)')

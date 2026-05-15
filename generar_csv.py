#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Genera datos_prueba_DGRAMET_2024_2025.csv
Replica la lógica de js/generador.js con semilla fija (reproducible).
"""
import csv, random, os

random.seed(42)

nom_f = ['Ana','Carmen','María','Rosa','Laura','Isabel','Pilar','Marta',
    'Elena','Nuria','Sofía','Cristina','Beatriz','Eva','Patricia','Lucía',
    'Raquel','Silvia','Inés','Amparo','Rocío','Dolores','Mercedes','Consuelo',
    'Encarnación','Josefa','Remedios','Yolanda','Sandra','Alicia','Susana',
    'Elisa','Almudena','Concepción','Gracia','Mónica','Irene','Vanessa',
    'Rebeca','Lourdes','Noelia','Araceli','Gloria','Fátima','Paloma','Manuela',
    'Antonia','Victoria','Claudia','Verónica','Adriana','Nerea','Esther',
    'Andrea','Sara','Natalia','Miriam','Sonia','Lidia','Amelia','Esperanza',
    'Blanca','Macarena','Trinidad','Ascensión','Gemma','Olga','Maite','Leire']

nom_m = ['Antonio','Francisco','Manuel','Juan','Pablo','Miguel','Rafael',
    'Enrique','Andrés','Alberto','Diego','Emilio','Sergio','Raúl','Roberto',
    'Fernando','Marcos','Óscar','Víctor','Julio','Alfonso','Ricardo','Esteban',
    'Ramón','Arturo','Jorge','Héctor','Ángel','Adrián','César','Lorenzo',
    'Nicolás','Alejandro','Javier','Luis','David','Carlos','Eduardo','Pedro',
    'José','Ignacio','Tomás','Daniel','Rodrigo','Álvaro','Hugo','Gonzalo',
    'Felipe','Gregorio','Aurelio','Bernardo','Clemente','Dámaso']

ape = ['García','López','Martínez','Sánchez','Fernández','González',
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
    'Navajas','Osuna','Roldán','Tejada','Úbeda','Escribano','Montilla']


def generar_pool(n, pct_f):
    usados, pool = set(), []
    intentos = 0
    while len(pool) < n and intentos < n * 30:
        intentos += 1
        nombre = random.choice(nom_f if random.random() < pct_f else nom_m)
        a1, a2 = random.choice(ape), random.choice(ape)
        if a1 == a2:
            continue
        k = f'{a1} {a2}, {nombre}'
        if k not in usados:
            usados.add(k)
            pool.append(k)
    return pool


pools = {
    1:  generar_pool(  8, 0.60),
    2:  generar_pool(200, 0.88),
    3:  generar_pool(  9, 0.55),
    4:  generar_pool( 10, 0.65),
    5:  generar_pool( 36, 0.60),
    6:  generar_pool(170, 0.52),
    7:  generar_pool( 70, 0.65),
    8:  generar_pool( 18, 0.72),
    9:  generar_pool( 20, 0.70),
    10: generar_pool(  7, 0.45),
    11: generar_pool(  8, 0.55),
    12: generar_pool(  7, 0.60),
    13: generar_pool( 55, 0.82),
    14: generar_pool( 18, 0.68),
    15: generar_pool( 20, 0.58),
}

cat_pesos = [0, 1, 1800, 15, 15, 180, 850, 350, 40, 240, 10, 20, 10, 495, 20, 80]
cat_acum, acc = [], 0
for i in range(1, 16):
    acc += cat_pesos[i]
    cat_acum.append(acc)
total_peso = acc


def sortear_cat():
    r = random.random() * total_peso
    for i, v in enumerate(cat_acum):
        if r < v:
            return i + 1
    return 15


act_cat = {
    2: ['Sesión GRAFA','Taller GRUSE','Escuela Pacientes - diabetes',
        'Escuela Pacientes - EPOC','Taller cesación tabáquica',
        'Ed. grupal EPOC/asma','Ed. grupal diabetes tipo 2',
        'Rehabilitación cardiaca grupal','Educación maternal',
        'Taller incontinencia urinaria','Sesión menopausia',
        'Taller cuidadoras personas dependientes','Taller dolor crónico',
        'Taller hipertensión','Taller GRUSE cuidadoras',
        'Taller alimentación saludable adultos','Ed. grupal rehab. respiratoria',
        'Sesión IG EPOC','Sesión PIOBIN enfermería','Taller lactancia materna'],
    6: ['Charla alimentación saludable','Charla tabaco','Charla alcohol',
        'Charla actividad física y salud','Mesa de salud escolar',
        'PSIA sesión grupal','Jornada salud comunitaria barrio',
        'Mapeo de activos comunitarios','Ponencia salud mental',
        'Taller bienestar emocional adultos','Charla vacunas adultos',
        'Sesión Forma Joven - sexualidad','Charla prevención cardiovascular',
        'Sesión IAHS','Charla diabetes preventiva','Charla EPOC y tabaco',
        'Taller salud laboral','Charla prevención caídas mayores',
        'Mesa salud mental comunitaria','Sesión PSIA médico'],
    7: ['Taller parentalidad positiva','Charla lactancia materna',
        'Sesión vacunas infantiles','Taller alimentación infantil',
        'Charla prevención accidentes infancia','Taller pantallas y salud',
        'Sesión Forma Joven pediatría','Charla higiene dental infantil',
        'Taller actividad física infantil'],
    13:['Intervención social RELAS','Detección violencia de género',
        'Taller habilidades parentales','Sesión AVISTA',
        'Charla recursos sociales y salud','Taller PRIA violencia género',
        'Intervención riesgo conducta suicida','Sesión coordinación servicios sociales',
        'Taller manejo situaciones crisis','Intervención familias vulnerables'],
    9: ['Mapeo activos comunitarios','Jornada participación ciudadana',
        'Taller salud comunitaria','Sesión coordinación PSIA',
        'Intervención comunitaria barrio desfavorecido','Taller activos salud mental',
        'Sesión PSIA comunitario','Foro salud barrio'],
    5: ['Taller higiene postural','Sesión dolor crónico fisioterapia',
        'Taller actividad física mayores','Charla prevención caídas',
        'Sesión rehabilitación pulmonar','Taller movilidad articular'],
    8: ['Taller bienestar emocional','Sesión conducta suicida CSMC',
        'Taller manejo ansiedad','Intervención salud mental comunitaria',
        'Sesión psicoeducación familiar'],
    0: ['Sesión clínica formativa','Taller primeros auxilios',
        'Intervención media','Ponencia jornada distrital',
        'Sesión formativa interprofesional','Taller Forma Joven'],
}

tipo_cat = {
    2:[5,6,7,8,9,10,11,13,22,23], 6:[0,3,4,14,17,19,20,22,23],
    7:[0,11,20,23], 13:[3,17,22,23], 9:[18,3,20,22],
    5:[22,23,3], 8:[22,23,3], 0:[0,1,3,21,22,23,24],
}
tema_cat = {
    2:[8,10,13,15,16,17,25,1,4,7,3,12], 6:[1,3,4,5,6,7,14,21,24,25,27,30,10,17],
    7:[15,20,21,1,3,27,23], 13:[4,28,20,5,14], 9:[2,4,21,26,1],
    5:[8,12,1,10], 8:[4,5,18,14], 0:[1,3,4,6,7,9,11,22,23,24,29,30],
}
prog_cat = {
    2:[9,10,3,5,2,16,17], 6:[7,8,14,16,17,19,21,22,25,6],
    7:[8,14,21,22], 13:[1,14,24,20,18], 9:[12,18,4,25],
    5:[2,5,25], 8:[20,3,25], 0:[11,25,6,7],
}
part_base = {2:12,6:20,7:16,13:10,9:22,5:8,8:8,1:6,3:16,4:10,10:6,11:8,12:6,14:8,15:12}

CAMPOS = [
    'record_id','fecha_de_inicio','fecha_de_fin','fecha_del_registro',
    'nombre_de_la_actividad','tipo_de_actividad','qu_tem_tica_s_aborda_la_ac',
    'en_qu_estrategia_plan_inte','asist_total','asist_hombres','asist_mujeres',
    'n_mero_de_horas','n_mero_de_sesiones','apellidos_y_nombre','distrito0',
    'unidad_asistencial','unidad_asistencial_2','sexo','categor_a_profesional',
    'especialidad_de_enfermer_a','horario','localidad_donde_se_realiza',
    'es_una_zona_desfavorecidas','lugar_de_realizaci_n_de_la',
    'poblaci_n_destinataria','observaciones_sobre_la_act',
]

rows = []
rid = 1
for _ in range(8600):
    mes_total = random.randint(0, 23)
    anyo = 2024 + mes_total // 12
    mes  = mes_total % 12
    if 5 <= mes <= 7 and random.random() < 0.55:
        continue
    dia  = random.randint(1, 28)
    fecha = f'{dia:02d}/{mes+1:02d}/{anyo}'

    cat  = sortear_cat()
    prof = random.choice(pools[cat])
    dist = 0 if random.random() < 0.38 else 1
    u    = random.randint(0, 14) if dist == 0 else random.randint(0, 20)

    base = part_base.get(cat, 10)
    part = max(1, round(base * (0.4 + random.random() * 1.1)))
    pct_muj = 0.56 if cat == 6 else (0.62 if cat == 7 else 0.68)
    muj  = min(part, max(0, round(part * (pct_muj - 0.15 + random.random() * 0.30))))
    hom  = part - muj
    horas = round(0.5 + random.random() * 3.5, 1)
    ses   = random.randint(1, 4)

    pct_hombre = 0.35 if cat == 6 else (0.40 if cat == 7 else 0.18)
    espec = ''
    if cat == 2 and random.random() < 0.55:
        espec = random.randint(1, 6)

    rows.append({
        'record_id':                  rid,
        'fecha_de_inicio':            fecha,
        'fecha_de_fin':               fecha,
        'fecha_del_registro':         fecha,
        'nombre_de_la_actividad':     random.choice(act_cat.get(cat, act_cat[0])),
        'tipo_de_actividad':          random.choice(tipo_cat.get(cat, tipo_cat[0])),
        'qu_tem_tica_s_aborda_la_ac': random.choice(tema_cat.get(cat, tema_cat[0])),
        'en_qu_estrategia_plan_inte': random.choice(prog_cat.get(cat, prog_cat[0])),
        'asist_total':                part,
        'asist_hombres':              hom,
        'asist_mujeres':              muj,
        'n_mero_de_horas':            horas,
        'n_mero_de_sesiones':         ses,
        'apellidos_y_nombre':         prof,
        'distrito0':                  dist,
        'unidad_asistencial':         u if dist == 0 else '',
        'unidad_asistencial_2':       u if dist == 1 else '',
        'sexo':                       0 if random.random() < pct_hombre else 1,
        'categor_a_profesional':      cat,
        'especialidad_de_enfermer_a': espec,
        'horario':                    random.randint(0, 2),
        'localidad_donde_se_realiza': 'Granada' if dist == 0 else 'Municipio Metro',
        'es_una_zona_desfavorecidas': 1 if random.random() < 0.18 else 0,
        'lugar_de_realizaci_n_de_la': random.randint(0, 9),
        'poblaci_n_destinataria':     random.randint(0, 15),
        'observaciones_sobre_la_act': '',
    })
    rid += 1

out = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                   'datos_prueba_DGRAMET_2024_2025.csv')
with open(out, 'w', newline='', encoding='utf-8-sig') as f:
    w = csv.DictWriter(f, fieldnames=CAMPOS)
    w.writeheader()
    w.writerows(rows)

print(f'Generados {len(rows)} registros  →  {os.path.basename(out)}')
cat_names = {1:'A4',2:'Enfermería',3:'EpidemAP',4:'Farmacia',5:'Fisioterapia',
             6:'Med.Familia',7:'Pediatría',8:'Psicología',9:'TEPSPC',
             10:'T.PRL',11:'T.SalAmb',12:'T.Ocup',13:'Trab.Social',14:'Odontología',15:'Otros'}
from collections import Counter
cats = Counter(r['categor_a_profesional'] for r in rows)
for k in sorted(cats):
    print(f'  cat {k:2d}  {cat_names[k]:<14}  {cats[k]:5d} registros')

# Biblia de Brawlground (arte y juego)

Documento de referencia para ChatGPT (director gráfico) y para cualquiera que trabaje en el juego.
Juego: https://akharta.github.io/Brawlground/ · Repositorio: github.com/akharta/Brawlground · Actualizado: 13 nov. 2026.

---

## 1. El juego en una página

**Brawlground** es un juego de cartas y batallas entre dos castillos, para móvil y **solo en vertical**. Cada bando
despliega unidades de su mazo por un camino de 5 carriles para destruir el castillo rival.

- **Historia**: eres el señor de un reino pequeño y quieres dominar el mundo. Conquistas reino a reino (9 castillos
  vasallos y el castillo real). Empiezas con Tulio el Legionario, Ailin la Arquera y Rodrigo el Tercio.
- **Batalla**: mazo de 8 cartas, 4 en la mano. Energía hasta 10 (empiezas con 5, 1 cada 3,5 s; el doble desde
  los 2 minutos). Tocas o arrastras una carta para sacar la unidad (se puede soltar en cualquier carril de tu mitad).
  El castillo tiene arqueros en sus torres y un trono con el héroe.
- **Héroe**: empiezas **sin héroe**. Al conquistar el Bosque (2.º reino) vuelve el rey Aldric y se unen Lyra y Gūll.
  El héroe salta del trono a las 15 bajas enemigas, lucha y tiene una habilidad con recarga. Los rivales llevan héroe
  desde el Bosque.
- **Además en batalla**: un hechizo (botón que se recarga) y una bestia en la cripta bajo tu castillo.
- **Progresión de unidades**: **nivel** 1–100 con oro (+3 % de vida y daño por nivel; saltos cada 10 con insignias)
  y **rango** E → D → C → B → A → S → S+ con copias de la carta (cada estrella tiene 5 puntas que se van llenando).
  En C, A y S+ aprenden una habilidad.
- **Conseguir unidades**: presos de la campaña, celdas de prisioneros (madera, hierro, rúnica, oro, diamante),
  Taberna del Multiverso, Tienda, Cuartel y el Abismo del Despertar (evento diario).
- **Campaña**: Mundo 1 (Praderas, Bosque, Desierto, Nieves, Pantano, Volcán) y Mundo 2 (Playa, Setas, Huesos,
  Engranajes, Cristal, Cementerio, Cielo). 10 castillos por reino.
- **Pestañas**: Tienda · Reino · Campaña · Ejército · Eventos. Tropas (galería de unidades vivas con filtros) desde Campaña.
- **Tecnología**: Phaser 3 en una sola página (PWA instalable). Las unidades se animan por código a partir de
  **piezas sueltas**: por eso el arte de personaje siempre se pide por piezas.

---

## 2. Estilo

- **Cartoon chibi original**, exclusivo de Brawlground: cabeza grande, cuerpo pequeño, **sin brazos**
  (manos flotantes), ojos expresivos.
- **Contorno grueso azul marino** `#1e2235` en todo.
- Colores planos con **una sombra sencilla** y un **brillo suave arriba a la izquierda**.
- **Sin texto** en ninguna imagen, salvo los marcos de carta (nombre y epíteto) y los carteles que se pidan con texto.
- Nada que se parezca a personajes, logos o arte de otros juegos.
- Referencia de estilo: adjunta siempre `docs/img/legionario_cuerpo.png` + una carta (`docs/img/legionario_carta.png`).

**Frase base para empezar cada prompt:**
> Con el mismo estilo que la imagen adjunta: cartoon chibi, contorno grueso azul marino (#1e2235), colores planos
> con una sombra sencilla, brillo suave arriba a la izquierda, fondo transparente y sin texto.

### Colores de rareza (fondos de rayos, barras, auras)
| Rareza | Color |
|---|---|
| Común | gris `#c7cde0` |
| Poco común | verde `#3ccf86` |
| Rara | azul `#4da3ff` |
| Épica | morado `#a855f7` |
| Legendaria | naranja/oro `#fbbf24` |
| Ascendida | rojo `#ff3a5c` |
| Héroe ascendido a S+ | granate con dorado (barra especial) |

### Colores de rango (estrellas y sellos)
E gris · D verde · C azul · B morado · A naranja · S rojo · S+ rojo y oro.

---

## 3. Cómo se entrega una unidad nueva (el paquete completo)

Todo en **PNG con fondo transparente**, la unidad **mirando a la derecha**, de perfil tres cuartos, en pose de reposo.

1. **Ilustración completa** (cuadrada, ~1254×1254): la unidad entera con sus manos y su arma, como referencia de
   cómo se monta. No se usa en el juego tal cual.
2. **Cuerpo sin manos ni armas** (la misma escala y postura que la completa).
3. **Manos sueltas**: normalmente dos (la de atrás y la de delante), cada una en su postura (puño, mano abierta,
   mano que agarra…). Si agarra un arma, la mano va sin el arma.
4. **Armas y objetos sueltos** (espada, arco, bastón, escudo, carrete…), rectos y sin manos.
5. **Proyectiles y efectos** si los tiene (flecha, bola de fuego, llamarada, rayo…), sueltos.
6. **Carta** (cuadrada, 1254×1254): la ilustración de la carta con fondo, para la tienda y las listas.
7. **Marco de carta** (ver 4).
8. **Variantes** si cambia de forma o de pose (transformaciones, poses de habilidad, skins, partes dañadas).

Reglas para que se pueda animar:
- **Todas las piezas a la misma escala** que la ilustración completa (si el cuerpo mide 1000 px en la completa,
  mide 1000 px suelto).
- **Nada recortado** en los bordes y un pequeño margen transparente alrededor.
- **Nada pegado**: el pelo, las capas y la ropa van con el cuerpo; manos y armas, nunca.
- Si algo debe moverse aparte (fuego del pelo, cola, alas, bufanda, cadenas), **pídelo como pieza suelta**,
  y si se anima por fotogramas, en **2–4 posiciones** del mismo tamaño.
- Varios fotogramas de una animación: mismo lienzo, misma posición y misma escala; solo cambia lo que se mueve.

**Descripción que acompaña a la unidad** (para Claude): nombre y epíteto, rareza, coste (1–7), a distancia o
cuerpo a cuerpo, ataque básico, habilidades (con números si los tienes: cada cuántos segundos, cuánto daño,
alcance) y su definitiva si es ascendida.

---

## 4. Marcos de carta (Tropas, mazo, mano de batalla)

- Lienzo **1024×1536 (2:3)**, **fondo transparente** alrededor del marco (sin rectángulo oscuro detrás).
- El marco lleva **dibujados el nombre y el epíteto** (como en los de Tulio o Nivea).
- **Hueco** en el centro relleno de **rayos del color de su rareza** (el juego detecta el hueco por esos rayos):
  ahí se coloca la unidad viva.
- **Sin coste**: el muslo del coste lo pone el juego en la esquina de arriba a la izquierda.
- Que el marco ocupe casi todo el lienzo (que no salga más pequeño que los demás).
- Marcos **animados**: varios PNG del mismo marco con lo que cambia (luces, sombras, interferencias, aro que gira…),
  mismo lienzo y posición. Hechos: Zero (5), Rhysida (4), Elyss (5), Nul (6), Legionario X-9 (5).
- La **barra de nivel** bajo la carta (2172×724) es por rareza; ya están todas.

---

## 5. Otros encargos de arte (formatos)

| Qué | Formato |
|---|---|
| Fondo de batalla | vertical 838×1877 aprox., vista aérea; camino central para 5 carriles |
| Castillo (aspecto) | PNG transparente, sin arqueros pintados (se animan aparte), con versión dañada y en ruinas |
| Arqueros de torre | cuerpo, arco y flecha sueltos |
| Trono del héroe | el héroe sentado en su trono y el trono vacío |
| Iconos (hechizos, edificios, bestias) | 512×512 transparente, dentro de su marco redondeado |
| Bestias | cuerpo entero de perfil a la derecha + retrato redondo; poses de acción |
| Botones e interfaz | PNG transparente, mismo grosor de contorno |
| Pantallas de evento | ver `PROMPTS_ARTE.md` |

Nombres de archivo: en minúsculas, sin espacios ni acentos (`ignis_mano.png`, `marco_nul_3.png`).

---

## 6. Unidades del juego

| Unidad | Clave | Rareza | Coste | Qué hace | Dónde se consigue |
|---|---|---|---|---|---|
| Pip, el Honderillo | honderillo | Común | 1 | Voltea la honda sobre la cabeza y lanza piedras en parábola desde lejos. | Torre del Cartel (Praderas) |
| Tulio, el Legionario | legionario | Común | 1 | Espada y escudo. Aguanta en primera línea. | De inicio |
| Ailin, la Arquera | arquera | Común | 2 | Dispara flechas en parábola desde lejos. | De inicio |
| Ivo, el Aprendiz de mago | ivo | Común | 2 | Agita la varita y lanza rayos de luz que dan al instante. | Bastión del Otoño (Praderas) |
| Kubi, la Slime | kubi | Común | 2 | Salta y aplasta. Al morir se parte en dos slimes más pequeñas, y cada una en otras dos. | Torre del Pozo (Praderas) |
| Rodrigo, el Tercio | tercio | Común | 2 | Pica larga que empuja. Triple de daño a la caballería y a los lobos. | De inicio |
| Rufo, el Perro cobarde | rufo | Común | 2 | A cada rival nuevo: salta a morder, se da la vuelta y se aleja olisqueándose el rabo; después pelea pegado. | Claro del Leñador (Bosque) |
| Garra, el Lobo de Esparta | lobo | Poco común | 1 | Embiste al ver a un enemigo cerca (1,5 veces su daño) y luego muerde. | Granja del Camino (Praderas) |
| Brynja, la Valkiria | valkiria | Poco común | 3 | A caballo. Barrido de hacha que da a todos los que tiene delante. | Fortín del Molino (Praderas) |
| Odo, el Tamborilero | odo | Poco común | 3 | No ataca: toca el tambor detrás de los suyos. Los aliados cerca andan y atacan un 25 % más rápido y tienen un 35 % de crítico. | Fortín de las Setas (Bosque) |
| Rhea, la Reina abeja | rhea | Poco común | 4 | No ataca: desde la distancia de Cole, cada 1,5 s su cetro suelta una abeja que vuela a picar (hasta 6 a la vez). | Muralla del Jabalí (Bosque) |
| Kazú, el Ninja del Suriken | ninja | Rara | 2 | Se teletransporta junto a los tiradores enemigos (cada 9 s) y lanza shuriken. | Granja Fortificada (Praderas) |
| Hayato, el Samurái | samurai | Rara | 3 | Iaido: un tajo y vuelve a envainar. Todos sus golpes son críticos. | Castillo del Lago (Praderas) |
| Mira, la Alquimista | mira | Rara | 3 | No ataca: cada 4 s lanza una poción al azar. Las buenas a un aliado (daño, velocidad, ataque o vida) y las malas a un enemigo (lentitud, torpeza, veneno o menos daño). | Fuerte del Escorpión (Desierto) |
| Nivea, la Maga de hielo | nivea | Rara | 3 | Lanza ráfagas de 3 copos de nieve desde su libro; cada tercer ataque, un cristal de hielo. | Fortín del Glaciar (Nieves) |
| Torque, el Robot obrero | torque | Rara | 3 | No ataca: se queda junto a tu castillo, yendo de un lado a otro, y lo repara con cemento. | Muralla de Hielo (Nieves) |
| Anubek, el Guardián Chacal | anubek | Rara | 4 | Jepés y escudo. Se agrieta al perder vida; al morir se rompe en pedazos y a los 2 s se rehace (una vez). | Torre de Arena (Desierto) |
| Fray Tomé, el Fraile | fraile | Rara | 4 | No ataca: cura al aliado más herido con la luz de su farolillo. | Atalaya del Alba (Praderas) |
| Gustav, el Acorazado | acorazado | Rara | 4 | Escudo frontal que para el 30 % del daño; herido, se atrinchera y para el 60 %. | Muralla de los Pinos (Praderas) |
| Cole, el Westerner | pistolero | Épica | 4 | Ráfagas con dos revólveres. Si le echan encima, da un mortal hacia atrás. | Puente de Troncos (Bosque) |
| Ezra, el Ilusionista | ezra | Épica | 5 | No ataca: cada 15 s alza su espejo ante un enemigo y de él sale una copia de cristal de ese enemigo que lucha de tu lado. | Cala de las Perlas (Playa) |
| Ignis, el Mago de fuego | ignis | Épica | 5 | Alterna bola de fuego con la mano y llamarada con el bastón, que quema en área. Su cuerpo arde: quema a los enemigos que tiene a melé. | Fortín del Azufre (Volcán) |
| Los Grises, las Ratas de cloaca | grises | Épica | 5 | Cuatro ratas en una carta: la del escudo (tapa de alcantarilla), la boxeadora, la del cuchillo y la de la palanca. | Fortín de los Juncos (Pantano) |
| Morgana, la Costurera oscura | morgana | Épica | 5 | Su aguja atraviesa a todos los que tiene delante cosiéndolos con su hilo, vuelve a atravesarlos y le devuelve vida. | Muralla Podrida (Pantano) |
| Tormund, el Berserker | tormund | Épica | 5 | Lanza sus hachas girando desde lejos; a 6 cuerpos salta y cae como una guillotina. Al 40 % de vida entra en furia: ataca el doble de rápido y roba vida. | Bastión de Obsidiana (Volcán) |
| Valdrys, el Escudo del paladín | valdrys | Épica | 5 | Tanque sin armas: aguanta en primera línea tras su escudo y cada 5 s lo lanza hecho luz, atravesando a todos los enemigos de su camino. | Fortaleza Real del Volcán (Volcán) |
| Berta, la Catapulta | catapulta | Épica | 6 | Rocas en área desde muy lejos. Triple de daño a los castillos. | Empalizada del Arroyo (Bosque) |
| Jhotum, el Desencadenado | desencadenado | Legendaria | 5 | Cadenazos en área; cada 3 ataques, cadenas por todo el carril hasta el castillo. | Bastión del Musgo (Pantano) |
| Lin, el Monje | kungfu | Legendaria | 5 | Se lanza a ras de suelo, combo de puñetazos y patada giratoria que arrolla y aturde a los de detrás. | Atalaya del Sol (Desierto) |
| Abaddon, el Devorador insaciable | abaddon | Legendaria | 6 | Pisotón que hace brotar pinchos bajo los enemigos (los levanta y aturde). Devora a los que tienen el 15 % de vida o menos y crece un 10 %; el crecimiento dura toda la batalla. | Castillo Real de las Setas (Setas) |
| Aurelion, el Báculo del paladín | aurelion | Legendaria | 6 | Vuela. Cura a sus aliados con destellos de su báculo y, cada 50 s, revive al aliado caído más cercano. | Palacio Real de la Playa (Playa) |
| Velkara, la Muerte | muerte | Legendaria | 6 | Guadaña en área, corte giratorio, corte de oscuridad y tumbas de las que salen esqueletos. | Paso de la Ventisca (Nieves) |
| Kaiju Tomo, el Lagarto colosal | kaiju | Legendaria | 7 | Llamarada en área. Cada 30 s, aliento atómico: un rayo que cruza el carril, daña a todos los enemigos y llega al castillo. | Fortaleza Real de los Huesos (Huesos) |
| Elyss, el Insaciable | imparable | Ascendida | 7 | Con 5 marcas se vuelve monstruo; al caer implosiona y renace consumido. | Abismo del Despertar |
| Legionario X-9, el Centinela | centinela | Ascendida | 7 | Francotirador y ametralladora. Misiles, dron que repara, escudo de energía y sobrecalentamiento. | Ciudadela Real de los Engranajes (Engranajes) |
| Nul, el Intocable | nul | Ascendida | 7 | Vuela. Lanza bolas de luz que atraviesan. 7 cargas de esquiva. A los 20 s de salir, y luego cada 30 s, su aro se traga al enemigo del centro. Definitiva: una estrella que cae sobre el campo. | Castillo Real de Cristal (Cristal) |
| Rhysida, la Interferencia | rhysida | Ascendida | 7 | Dos tajos y un remolino. Se teletransporta a la espalda del rival más débil. Definitiva: ralentiza el tiempo y corta a todos los rivales. Cambia de skin al subir de rango. | Palacio Real del Cielo (Cielo) |
| Zero, el Niño de amarillo | zero | Ascendida | 7 | Ataca con su sombra, que toma formas y envuelve al enemigo. Definitiva (a los 30 s, una vez): oscuridad total 3 s; después mueren los enemigos con la mitad de vida o menos y el resto pierde un 30 %. | Castillo Real del Cementerio (Cementerio) |

**Héroes**: Rey Aldric (martillo; onda sísmica), Lyra, Ojo de Halcón (arquera; flechas que atraviesan) y
Gūll, el Puerco (montado; embestida).
**Invocaciones**: abejas de Rhea, esqueletos de Velkara, ratas de Los Grises, guardias de Aldric, copias de cristal de Ezra.

---

## 7. Arte pendiente (por orden de utilidad)

1. **Ignis**: cuerpo con la calavera sin llamas + llamas del pelo sueltas en 2–3 posiciones.
2. **Marco de Ezra** con fondo transparente (ahora trae un halo oscuro).
3. **Lyra y Gūll sentados** en su trono (como `aldric_sentado.png`).
4. **Kaiju Tomo** (opcional): llamarada en 2–3 fases (empieza, a tope, se apaga).
5. **Versión oscura de cada unidad para el rango B** (armadura y arma con otro diseño): pendiente de decidir.
6. **Los cuatro consejeros** (tutoriales): general, consejero de los rumores, consejero de la moneda y consejera real.
7. **Hechizos como cartas**: pendiente de decidir su diseño.

---

## 8. Cómo trabajamos

- **ChatGPT** dibuja (director gráfico). **Claude** monta, anima, programa y prueba.
- El arte original se guarda en `arte/<unidad>/`; lo que usa el juego, procesado, en `docs/img/`.
- El código fuente está en `prototipos/escena/index.html` (motor de unidades) y `prototipos/batalla/*.js`
  (batalla, campaña, tropas…). **`docs/index.html` se genera** con `python3 prototipos/batalla/construir.py`:
  nunca se edita a mano.
- El diseño detallado de cada sistema y unidad está en `DISENO.md`; los prompts de pantallas, en `PROMPTS_ARTE.md`.
- Los fallos se envían desde el juego con el botón 🐞 y quedan en `bugs/`.

# Brawlground — Documento de diseño

> Estado: batalla jugable como app (carga, menú, mazo, batalla). Siguiente: campaña del primer reino.

## Concepto

Batalla entre dos castillos sobre un terreno horizontal. Cada bando despliega cartas
de su mazo para destruir el castillo rival. Mejoras tu ejército coleccionando cartas
y generas recursos aunque no juegues.

## Historia

Eres el señor de un reino pequeño con su castillo, y tu deseo es tener el mundo entero bajo tu
control. Para ello partes a conquistar los demás reinos, uno tras otro: primero sus castillos
vasallos y, al final, el castillo de su rey. Al empezar solo te acompañan los guerreros
originales de tu reino: **Tulio el Legionario, Ailin la Arquera y Rodrigo el Tercio**. El
resto del ejército lo reclutas por el camino (jaulas de prisioneros y Taberna del Multiverso).

## Batalla

- **Campo**: tu castillo a la izquierda, el de la IA a la derecha. Un único carril con
  profundidad: las unidades avanzan escalonadas (no en fila india) y combaten con lo que
  encuentran.
- **Mazo**: antes de cada batalla eliges 8 cartas. En partida tienes 4 en la mano; al
  jugar una entra la siguiente.
- **Cartas**: guerreros cuerpo a cuerpo, tiradores, máquinas de asedio… cada una con su
  coste de energía.
- **Desplegar**: tocar la carta saca la unidad delante de tu castillo. **Pulsa y arrastra**:
  mantén la carta y llévala al campo; al salir del panel se convierte en la unidad, que cuelga
  del dedo como si la cogiera un gigante (se balancea y agita el arma), y al soltarla cae,
  levanta polvo y sigue su marcha. Se arrastran **todas**, con dos reglas:
  1. Solo se sueltan en **tu mitad** (si la llevas más allá, se queda en la frontera).
  2. Nunca **detrás de un enemigo** que ya esté en tu mitad: siempre por delante de él.
  Los **asesinos** (clase nueva) se saltan la regla 2: pueden caer a la espalda de los enemigos,
  entre su primera línea y su retaguardia (de momento, el legionario; Kazú también es asesino,
  pero con su shuriken va aparte y se arrastra como los demás). Ninguna unidad ni habilidad
  permite aún soltar en la mitad rival.
- **Hacia atrás no se camina**: nadie camina hacia atrás para perseguir a un enemigo que tiene a
  la espalda; solo se da la vuelta para atacarle si lo tiene a tiro, y si no, sigue adelante (así
  funcionan los ataques sorpresa). Lo que sí se mantiene: el pasito atrás del tercio tras cada
  estocada y el mortal de Cole (habilidades).
- **A distancia**: los tiradores (arquera, catapulta, centinela (solo el francotirador), Lyra) atacan a todo lo
  que esté a tres cuartos del terreno de juego. El fraile y Cole conservan su alcance de siempre; la minigun del centinela también.
- **Energía**: máximo 10, se empieza con 5 y solo se recarga con el tiempo: 1 cada 3,5 s, y el doble
  a partir de los 2 minutos de partida. Abatir enemigos no da energía.
- **Castillo**: tiene defensas propias (p. ej. torres que disparan) y mejoras propias.
- **Héroe** (uno por batalla):
  - Espera sentado en un trono sobre tu castillo.
  - Cada héroe tiene un objetivo de bajas enemigas. Al cumplirlo se habilita el
    **botón del héroe**.
  - Al pulsarlo (o automáticamente en modo auto) salta al campo y empieza a luchar.
  - Tiene una **habilidad pasiva** (siempre activa en el campo) y una **habilidad
    activa** con recarga en segundos, que empieza a contar cuando salta al campo.
  - Si muere, no vuelve en esa batalla.
- **Modo híbrido**: al principio despliegas tú. Más adelante se desbloquea el **modo
  automático**, que despliega cartas y usa al héroe por ti.

## Progresión

- **Campaña**: cada mapa es un **reino** con **10 niveles**. Del 1 al 9 conquistas sus
  **castillos vasallos**; el nivel 10 es el **castillo del rey**, el jefe del reino. La dificultad
  sube nivel a nivel.
- **Mapa del mundo** (pestaña Campaña): un mapa grande con un punto por reino. Al vencer a
  su rey, el reino queda tachado y una línea lo une con el siguiente, como si tu ejército
  viajara por el mapa hasta él.
- **Mapa del reino**: el camino con sus 10 castillos; cada uno conquistado luce tu bandera.
- **Coleccionable**: cartas repetidas + oro para subir de nivel unidades, héroes y
  habilidades.
- **Jaulas de prisioneros** (sustituyen a los cofres): liberas a un preso y se une a
  tu ejército; si ya lo tenías, da copias de su carta. Ver «Conseguir personajes».
- **Taberna del Multiverso**: mercenarios que se compran con oro. Ver «Conseguir personajes».
- **Idle**: generas recursos mientras no juegas.
- *Pendiente*: cómo avanzar la campaña sin jugar (partiendo del modo automático).

### Reino 1: las Praderas (primera versión jugable)

| Nivel | Castillo | Escenario | Prisionero que liberas |
|---|---|---|---|
| 1 | Granja del Camino | Prado | Garra, el Lobo |
| 2 | Torre del Cartel | Montañas | — (oro) |
| 3 | Fortín del Molino | Molino | Brynja, la Valkiria |
| 4 | Torre del Pozo | Cerezos | — (oro) |
| 5 | Granja Fortificada | Atardecer | Kazú, el Ninja |
| 6 | Castillo del Lago | Lago | Hayato, el Samurái |
| 7 | Bastión del Otoño | Otoño | — (oro) |
| 8 | Atalaya del Alba | Amanecer | Fray Tomé, el Fraile |
| 9 | Muralla de los Pinos | Pinos | Gustav, el Acorazado |
| 10 | Castillo Real de las Praderas | Noche | La reina, **Lyra**, se une a ti como heroína |

- Los otros reinos luchan con las mismas unidades que tú. Los vasallos no tienen héroe; el rey
  (o la reina) espera en su trono y salta al campo como el tuyo.
- **Estrellas**: 1 por ganar, 2 si tu castillo acaba por encima del 50 %, 3 por encima del 80 %.
- **Oro**: cada castillo da oro la primera vez (más el real) y una cuarta parte al repetirlo.
  De momento solo se acumula; servirá para la taberna y para subir de nivel.
- Mientras tu ejército tenga menos de 8 unidades, el mazo lleva todas las que tienes.
- La dificultad de cada nivel (vida de la muralla rival y ritmo de energía del rival) se ajusta
  simulando partidas en las que la IA juega tu bando con el ejército que tendrías al llegar.
  Resultado actual (100-120 partidas por nivel): la IA de tu bando gana el 82 % en el castillo 1,
  ~75 % en el 2-3, ~68 % en el 4-5, ~58 % en el 6-8, 41 % en el 9 y 37 % contra Lyra.
  Muralla rival de 800 (nivel 1) a 1.600 (nivel 9) y 2.200 la del castillo real.
- La primera batalla enseña a jugar con burbujas de ayuda (sacar cartas, avanzar, usar al héroe).

### Mundo 1: los seis reinos

Praderas (reina: Lyra), Bosque (rey: Gūll), Desierto, Nieves, Pantano y Volcán; tu reino abajo.
Cada uno con su mapa pintado y su par de castillos (vasallo y real). Los reinos 2 a 6 ya tienen
sus 10 castillos con nombre y ejército, pero su dificultad es provisional (sin simular todavía) y
sus reyes, salvo Gūll, aún no tienen héroe. Prisioneros: Cole (Bosque 3), Berta (Bosque 7),
Lin (Desierto 5), Velkara (Nieves 6) y Jhotum (Pantano 7). Ahora mismo toda la campaña está
abierta para revisar los mapas (`CAMPANA_ABIERTA` en campana.js).

### Mundo 2 (arte guardado en assets/campana/mundo2)

Siete reinos jugables al otro lado del mar, de abajo arriba: Playa, Setas, Huesos, Engranajes,
Cristal, Cementerio y Cielo, con sus 10 castillos cada uno (nombres propios, dificultad provisional).
Se llega tras conquistar el Volcán. Ejércitos de nivel 7 (Playa) a 10 (Cielo). Sus reyes aún no
tienen héroe. En la pestaña Campaña se cambia entre Mundo 1 y Mundo 2.

## Promoción de unidades

Cada unidad mejora por dos caminos: el **nivel** y el **rango**.

- **Nivel (1–100)**: se sube con **oro**. Cada nivel da un **3 % más de vida, daño y curación**
  (nivel 100 = ×3,97). El oro crece con el nivel (20 + 8·n + 0,6·n², redondeado, × rareza:
  poco común ×1,15, rara ×1,3, épica ×1,5, legendaria ×1,8, ascendida ×2,2).
  - **Saltos de nivel**: para pasar del 10, 20, 30… hay que pagar el triple de oro y **insignias de mando**
    (1, 2, 3, 4, 6, 8, 10, 13 y 16). *Las insignias son el «otro objeto» provisional; se pueden cambiar.*
  - Insignias: 1 al conquistar un castillo vasallo y 5 el real (la primera vez), 2 en cada rellano del
    Abismo, 1 al completar las tres misiones del día y en la Tienda (5 por 60 diamantes).
- **Rango (E → D → C → B → A → S → S+)**: se sube con **copias de su carta** (5, 10, 20, 40, 70 y 120).
  Cada rango multiplica vida y daño: D ×1,15 · C ×1,3 · B ×1,5 · A ×1,75 · S ×2,05 · S+ ×2,4
  (de E a S+ sin estrellas → 6 ★).
  Cada rango tiene su **sello dibujado** (de la E gris a la S+ roja y dorada): en la ficha, en la esquina de
  las cartas (también en la mano de batalla) junto a sus estrellas, y grande arriba de la ficha al ascender.
  - **Habilidades de rango**: en **C, A y S+** la unidad aprende una habilidad nueva. Tipos que entiende el
    motor: golpe crítico, furia (más daño herido), ejecutar (más daño a enemigos tocados), aura (más daño a los
    aliados cercanos), escudo inicial, aguante (sobrevive una vez a un golpe mortal), robo de vida, aturdir,
    espinas, estallido al caer, regeneración, veloz (anda y ataca más rápido) y asedio (más daño a castillos).
    Ejemplo, Tulio: Muro de escudos (C), Disciplina de legión (A), Última legión (S+).
  - **Aspecto**: desde el rango B la unidad sale algo más grande. *Pendiente de arte: versión oscura de cada
    unidad para el rango B (armadura, escudo y arma con otro diseño).*
- **Copias**: 3 al conquistar un castillo por primera vez y 1 al repetirlo o ganar una batalla rápida, 1 cada
  2 horas de expedición, celdas, taberna, ofertas de la Tienda, Cuartel y el premio del Abismo.
- **Rivales con nivel y rango**: Praderas 1·E, Bosque 5·E, Desierto 10·E, Nieves 15·D, Pantano 20·D,
  Volcán 26·D; Playa 32·C, Setas 36·C, Huesos 42·C, Engranajes 48·B, Cristal 55·B, Cementerio 62·A,
  Cielo 70·A. Dentro de cada reino suben un nivel cada 3 castillos y el real +3. En la batalla rápida el
  rival lleva el nivel y el rango medios de tu mazo. *Falta ajustar la economía de oro con simulaciones.*
- Los héroes aún no suben de nivel (llegará con el Trono).

### Rango por puntas y subida continua
- Cada estrella (rango) tiene **5 puntas**. Al reunir las copias de una punta se llena una; con las
  5 sube la estrella entera. Cada punta cuesta la quinta parte de las copias del rango (el total no
  cambia: 1, 2, 4, 8, 14 y 24 copias por punta de E a S) y ya da una parte de la mejora de fuerza.
  Las habilidades de rango se aprenden al completar la estrella.
- **Mantener pulsado** el botón de subir nivel o de promocionar sube sin parar (cada vez más rápido)
  hasta el límite, hasta que falte un recurso o hasta que pida uno nuevo (el salto de nivel pide
  insignias: hay que volver a pulsar).

## Los cuatro consejeros (pendiente de diseñar)
Personajes que explican la app en los tutoriales y avisos. Cada uno se encarga de su parte:
- **El general de los ejércitos**: todo lo de batallas y guerra (despliegue, héroe, hechizos, bestias, mazo, campaña).
- **El consejero de los rumores**: todo lo relacionado con los eventos.
- **El consejero de la moneda**: todo lo de las compras dentro del juego, en la tienda.
- **La consejera real**: da la bienvenida al juego una vez instalado y explica todo lo demás que no
  cubran los otros tres (reino, taberna, ejército, perfil…).
Aún no existen en el juego: primero hay que diseñarlos (arte) y escribir sus tutoriales.

## Conseguir personajes

- Empiezas con **Tulio, Ailin y Rodrigo**. Los demás se reclutan en las **jaulas de
  prisioneros** y en la **Taberna del Multiverso**.

### Celdas de prisioneros

- Cinco celdas: **madera, hierro, rúnica, oro y diamante**. Al abrir una salen varias cartas
  (2, 3, 3, 4 y 5), cada una de una rareza al azar:

  | Celda | Común | Poco común | Rara | Épica | Legendaria | Ascendida |
  |---|---|---|---|---|---|---|
  | Madera | 80 % | 20 % | | | | |
  | Hierro | 45 % | 40 % | 15 % | | | |
  | Rúnica | | 35 % | 45 % | 20 % | | |
  | Oro | | 15 % | 40 % | 40 % | 5 % | |
  | Diamante | 5 % | 15 % | 30 % | 49 % | 10 % | 1 % |

  (Los de diamante suman 110 y se reparten en proporción: la ascendida sale ~0,9 % de las cartas.)
- Copias por carta: madera 2–3, hierro 3–5, rúnica 5–8, oro 8–12, diamante 12–18, multiplicadas por
  la rareza (común ×1, poco común ×0,75, rara ×0,5, épica ×0,35, legendaria ×0,2; ascendida 1–2).
  Si la unidad es nueva, la primera copia la recluta.
- Apertura: tocas la celda tres veces (tiembla, se agrieta, revienta) y salen los presos uno a uno.
- Se consiguen: al conquistar un castillo por primera vez (según el reino: Praderas madera, Bosque y
  Desierto hierro, Nieves y Pantano rúnica, Volcán y mundo 2 oro, Cristal en adelante diamante; el
  castillo real, una más y 10 diamantes), al repetir castillos (25 %, madera), en la batalla rápida
  (15 %, madera), en la expedición (una de madera cada 4 h), en el diario (días 2, 5 y 7) y en la
  tienda con diamantes (20, 50, 120, 250 y 600). De momento no hacen falta llaves.

### Taberna del Multiverso

- Se renueva cada **4 horas** con mercenarios de rareza aleatoria.
- **2 puestos** al principio, ampliables con mejoras hasta **6**.
- Mejorar la taberna también sube la probabilidad de mercenarios mejores.
- Se compran con oro; el precio depende de la rareza. Un repetido da copias de su carta.

### Ascendidos

- No salen en la taberna; en la celda de diamante, rara vez.
- *Pendiente*: cómo se consiguen.

## Estructura de la app

- **Barra de abajo**: cinco baldosas que casi se tocan; la de la pantalla en la que estás, en
  amarillo pastel. Deslizando el dedo de lado pasas a la pestaña de al lado: la pantalla sigue
  al dedo 1:1 y, al soltar, termina a la velocidad del gesto (o vuelve si no pasaste un tercio).

- **Barra de pestañas** (abajo): **Tienda · Reino · Campaña · Ejército · Eventos**. Se entra por Campaña. Dibujada: marco azul con remaches dorados y una baldosa con su icono por pestaña (la de la pestaña abierta, dorada y un poco más grande). Los botones de los lados de Campaña, el avatar con su nivel, las cápsulas de oro y diamantes y las barras (experiencia y carga) también van dibujados; la carga lleva su fondo de héroes con el logo en el centro y las demás pantallas, el fondo azul de héroes oscurecido.
- **Tienda**: regalo diario (100 de oro), 5 ofertas de cartas que se renuevan cada día (copias o la unidad
  si no la tienes; comunes a raras con oro, épicas y mejores con diamantes; renovar por 20 diamantes),
  celdas, oro por diamantes, diamantes con dinero real (se ven, pero los pagos llegarán más adelante; cada pack con su dibujo: montón, pila y cofre de oro; puñado, saco, cofre y carreta de diamantes) y lotes
  varios (cuerdas y antorchas para el Abismo, insignias, pack de bienvenida).
- **Reino**: el dibujo del reino de fondo (tejados, banderas y estandartes con el color de tu estandarte); cada
  lugar se toca en el dibujo o en su cartel, la vista se acerca y se entra. Cada lugar lleva su dibujo arriba:
  - **Arrabal** (bajo las murallas, en el mismo dibujo del reino, más alto que antes):
    **Mercado negro** (3 ofertas cada 8 horas: copias de cartas, insignias o celdas, con oro o diamantes) y
    **Altar del Retorno** (devuelve una unidad al nivel 1 y recuperas el 60 % del oro y las insignias gastados).
  - **El Trono**: tus héroes suben de nivel con oro (hasta 30, +3 % de vida y daño por nivel). El héroe rival
    llega con el nivel del poder de su reino (en la batalla rápida, con el del tuyo).
  - **Rivales**: cada reino lleva sus aspectos de castillo (dos de su tema en los vasallos y uno en el real) y su
    subsuelo; en la batalla rápida, uno al azar.
  - **Taberna**: 2 mercenarios cada 4 horas, con oro.
  - **Murallas**: estandarte (color y emblema), aspecto del castillo (20 castillos además del de piedra, 150 diamantes
    cada uno; con tu color y tu emblema en sus estandartes y arqueros. Con media vida pasa a su dibujo dañado
    (estandarte rasgado, grietas, fuego) y al caer, a sus ruinas con el estandarte caído en tu color; un aspecto
    nuevo sin esos dibujos se oscurece con grietas y cae en el montón genérico) y
    defensas: Muralla (+6 % de vida del castillo por nivel), Arqueros de las torres (+10 % de daño) y
    Atalaya (+2 % de cadencia), hasta nivel 20, con oro.
  - **Sanctum Arcano** (iconos dibujados): hechizos que se crean una vez y se suben de nivel (+10 % por nivel, hasta 10).
    Uno va contigo: botón encima de las cartas que se recarga con el tiempo.
    Cuerno de la victoria (+35 % de velocidad de movimiento y ataque, 8 s), Tormenta de rayos (5 rayos de
    70 que aturden), Luz sagrada (cura el 30 %), Ventisca (enemigos a mitad de velocidad 6 s) y Meteoro
    (160 en área, también al castillo).
  - **El Trono**: los héroes. Se abre al conquistar los siete reinos del Mundo 1 (hasta entonces el héroe se
    elige en el mazo). Más adelante: niveles, equipo y talentos de los héroes.
  - **Cripta** (bestias dibujadas). En batalla, tu bestia vive en una cripta de piedra bajo tu castillo, en el
    subsuelo, y cambia de pose al actuar: el dragón se levanta cuando su fuego está listo, ruge en la cripta y el
    fuego sale por la puerta del castillo; el huargo se agazapa antes de mandar al lobo y aúlla cuando sale; el
    basilisco se alza y su mirada envuelve a los enemigos en verde; el grifo se levanta a otear y bate las alas
    al bendecir cada unidad que sale. Bestias: la primera es gratis, las demás 150 diamantes; suben de nivel con oro. Una va
    contigo: Grifo real (bendición: +10 % de vida y daño a los tuyos), Basilisco (maldición: enemigos un
    12 % más lentos), Dragón de ceniza (habilidad: aliento de fuego en tu mitad del campo cada 30 s) y Huargo
    de la cripta (lucha: un lobo se une a la batalla cada 25 s).
  - **Cuartel**: 3 puestos (se abren con el reino a nivel 1, 5 y 12). Una unidad en cada uno gana copias:
    1 cada hora (común) … 8 horas (ascendida), hasta 12 horas sin recoger.
  - **Alto Consulado Bélico**: el clan (miembros, donaciones, guerras y asedios de clan). Necesita servidor.
- **Campaña**: la página principal. Arriba tu perfil, oro y diamantes; en el centro, la **expedición**
  (oro, experiencia, copias y celdas aunque no juegues, hasta 12 horas); abajo **¡Batalla!** (siguiente
  castillo) y **Mapa** (la campaña). A los lados: Tropas (unidades, mazo y promoción), Diario, Misiones,
  Celdas y Ofertas; Correo, Clasificación y Práctica.
- **Ejército** *(nombre provisional)*: lo competitivo. Batalla rápida contra la IA; duelos, torneo semanal,
  guerra de clanes y clasificación, próximamente.
- **Eventos**: el **Abismo del Despertar** (fijo) y los eventos que vayan saliendo.
  - Arte: la sima en espiral de fondo (baja contigo según la profundidad; en horizontal, el cartel), el cartel
    en la tarjeta de Eventos con la carta del premio del día, las 4 entradas a oscuras y, al caer o con la
    antorcha, la trampa que esconden (vacío, lava o sombras con ojos). Cuerda y antorcha dibujadas.
  - Cada día espera en el fondo una unidad: legendaria → 50 niveles; ascendida → 60. En cada nivel, 4 caminos
    (gruta, cueva, grieta, túnel): 3 bajan y dan oro (y diamantes cada 5), 1 lleva al vacío, a la lava o a las
    sombras según la profundidad.
  - **Cuerdas** (3 al día): si caes, te sujetan y ya sabes cuál era la trampa. **Antorchas** (1 al día):
    iluminan el nivel y enseñan la trampa. Rellano cada 10 niveles: +2 cuerdas, +1 antorcha, +2 insignias y
    una celda (de hierro a diamante). Si caes sin cuerdas, se acaba el descenso del día; puedes volver al último
    rellano por 50, 100 y 200 diamantes.
  - Con lo que se gana bajando, sin comprar nada, se llega al fondo en torno a 4 de cada 10 días
    (simulado: 42 % los días de 50 niveles y 38 % los de 60).
- **Diario**, **misiones**, **perfil** y **experiencia del reino**: como antes.

## Plataforma y aspecto

- **Móvil**, jugable en horizontal y en vertical.
  - Horizontal: campo completo; la cripta asoma en la esquina izquierda, junto al panel de cartas, y el hechizo
    y la bestia van en la esquina derecha.
  - Vertical: campo comprimido (escalado al ancho) con la interfaz y las cartas abajo. El camino sube lo justo
    (quitando cielo) para que debajo se vea entero el **subsuelo**, dibujado para cada aspecto del castillo: tu cripta a la
    izquierda, bajo tu castillo, con tu bestia dentro, y la del rival a la derecha, cada una con las gemas de los
    pilares del color de su bando. El dibujo se encoge para que tu cripta quepa entera en lo que se ve; si no
    llega a cubrir todo el ancho, la tierra del medio se repite en espejo. Se encoge con suavizado al tamaño con
    que se ve, para que sus contornos no salgan dentados.
    Temas: piedra (el de siempre), roble (raíces), luna, vitrales (cuarzo rosa), mareas (arena y coral), dragón
    (lava), engranajes, hielo, grifo (mármol), arena (ámbar), trueno, pagoda (rubíes), faroles (vetas de oro),
    carnero (cobre), escarabajo (lapislázuli), gólem, murciélago (amatistas), loto y sol (fósiles). Hay uno más,
    con setas, guardado para el castillo de las Setas.
- **Tecnología**: Phaser (HTML5), instalable como app (PWA) y jugable sin conexión.
- **Arte propio**, original y exclusivo de Brawlground. Estilo cartoon chibi: cabeza
  grande, sin brazos (manos flotantes), contorno grueso azul marino, colores planos.
  - **ChatGPT (director gráfico)** dibuja todo: personajes por piezas, escenarios por
    capas, castillos, kit de interfaz, bocetos de pantallas, jaulas, llaves y taberna.
  - **Claude** lo monta y le da vida: pantallas reales, animación por código, efectos.
  - Reglas completas en la Biblia de arte (documento aparte).
- **Al tocar cualquier cosa** (botones, cartas, castillos del mapa, pestañas, lugares del reino): se ilumina su
  contorno en blanco y dorado y crece un poco con un pequeño rebote. Fuera de la batalla la acción espera un
  instante para que se vea; en batalla responde al momento.
- **Sensación**: partículas, números de daño, destellos al golpear, temblor de pantalla,
  animaciones suaves en la interfaz, sonido y música.

## Siguientes pasos

1. ~~Legionario como patrón de estilo~~ y ~~batalla jugable con el arte aprobado~~ (hecho).
2. ~~App instalable con carga, menú y batalla a pantalla completa~~ (hecho: akharta.github.io/Brawlground).
3. Campaña del primer reino: mapa del mundo, mapa del reino con 10 castillos, progreso guardado.
4. Jaulas de prisioneros y Taberna del Multiverso para reclutar.

## Rhysida, la Interferencia (ascendida, coste 7)

Ninja hacker. Arte en bruto en `arte/hacker/`; piezas del juego en `docs/img/rhysida/`.

- **Skins por rango:** 1 al conseguirla (gris), +3 en rango C (trenzas, azul, blanco), +3 en A (traje, pirata, neón) y +3 en S+
  (espartano, oni, mariachi). Cada ~0,7 s sufre una interferencia (tiembla, la cruzan barras cian y magenta) y sale con otra
  skin de las que tenga. Con una sola skin, la interferencia se ve igual pero no cambia.
- **Combo:** tajo con un arma, tajo con la otra y remolino (dos mortales hacia delante con las armas como una sierra: 3 golpes
  en área). Provisional: 14–18 por tajo, 10–12 por golpe del remolino, 150 de vida.
- **Pasiva:** cada 8 s se teletransporta a la espalda del rival con menos vida.
- **Definitiva** (la lanza el jugador tocando su retrato, una vez por vida como las demás ascendidas): el tiempo va al 1 %,
  llena la pantalla de cortes, vuelve a su sitio y envaina; al envainar el tiempo corre y todos los rivales reciben 60 de daño
  (el castillo no). Mientras dura no recibe daño.
- Es asesina: al arrastrarla puede caer a la espalda de los enemigos.
- Pendiente: habilidades de rango (de momento su premio de rango son las skins) y ajustar los números.

## Nul, el Intocable (ascendido, coste 7)

Hechicero primordial. Arte en bruto en `arte/hechicero/`; piezas del juego en `docs/img/nul/`.

- **Ataque:** a distancia; va siempre volando; descarga el báculo y lanza una bola de luz que atraviesa hasta 4 enemigos (16–20).
- **Pasiva, intocable:** 7 cargas de esquiva; cada golpe que le llega (a distancia o cuerpo a cuerpo) gasta una y no hace daño,
  con una de sus 7 poses de esquiva. Agotadas, gana una carga cada 4 s. Las cargas se ven como 7 puntitos bajo sus pies.
- **Aro, cada 20 s:** el aro que gira junto a su mano sube sobre el enemigo con más vida, crece y se enciende (agujero blanco):
  se traga entero al del centro, sea cual sea su vida, y a los que estén justo debajo (radio de unas dos personas) con el 30 % de vida o menos. A los héroes no.
- **Definitiva** (una vez por vida, tocando su retrato): alza el báculo y nace una estrella que crece en cuatro fases (blanca,
  amarilla, naranja y roja); la lanza contra el centro de los enemigos y estalla: 180 de daño en área (provisional).
- Provisional: 120 de vida, levita y se desliza en vez de andar.

## Odo, el Tamborilero (poco común, coste 3)

Arte en bruto en `arte/tamborilero/`; piezas del juego en `docs/img/odo/`.

- No ataca: desde que sale toca el tambor sin parar (las dos baquetas alternando) y salen notas musicales (solo de adorno).
- Va dos pasos por detrás del aliado que lleva delante; no se mete entre los enemigos.
- Redoble: los aliados a su alrededor (unas 3 unidades de distancia) andan y atacan un 25 % más rápido y tienen un 35 % de
  probabilidad de crítico (daño doble). A él no le afecta. A veces sale una notita sobre los que reciben el redoble.
- Provisional: 90 de vida. Habilidades de rango: Piel de tambor (escudo), Buen ritmo (regenera), Último redoble (aguanta).

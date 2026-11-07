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

## Mejora de unidades

- Cada unidad va del **nivel 1 al 10**. Cada nivel le da un **10 % más de vida, daño y curación**
  (nivel 10 = ×1,9). El daño extra cuenta también en sus habilidades (shuriken, misiles, cadenas…).
- Subir de nivel cuesta **copias de su carta y oro**:

  | Del nivel | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
  |---|---|---|---|---|---|---|---|---|---|
  | Copias | 1 | 2 | 3 | 5 | 8 | 12 | 16 | 22 | 30 |
  | Oro (común) | 50 | 100 | 180 | 300 | 450 | 650 | 900 | 1.250 | 1.700 |

  El oro se multiplica según la rareza: poco común ×1,2, rara ×1,5, épica ×2, legendaria ×3, ascendida ×4.
- **Copias**: 3 al conquistar un castillo por primera vez y 1 al repetirlo o ganar una batalla rápida
  (de cartas de tu mazo); 1 cada 2 horas de expedición; y en la taberna, si el mercenario ya lo tenías.
- **Rivales con nivel**: los ejércitos del Reino de las Praderas son de nivel 1, Bosque 2, Desierto 3,
  Nieves 4, Pantano 5 y Volcán 6 (el castillo real, uno más desde el Bosque). En la batalla rápida, el
  rival lleva el nivel medio de tu mazo.
- Los héroes aún no suben de nivel.

## Conseguir personajes

- Empiezas con **Tulio, Ailin y Rodrigo**. Los demás se reclutan en las **jaulas de
  prisioneros** y en la **Taberna del Multiverso**.

### Jaulas de prisioneros

- Objeto portátil (celda pequeña con asa y candado). Se ve la silueta del preso dentro.
- Cuatro rarezas: común (madera), rara (hierro), épica (acero con runas), legendaria (oro).
- Cada jaula se abre con una **llave de su misma rareza**.
- Se consiguen al ganar batallas, en la tienda y en el modo idle (se acumulan mientras
  no juegas).
- Probabilidad de rareza (propuesta): común 70%, rara 22%, épica 7%, legendaria 1%.
- Apertura: tocar el candado varias veces → la jaula tiembla y se agrieta → los barrotes
  saltan y sale el preso.

### Taberna del Multiverso

- Se renueva cada **4 horas** con mercenarios de rareza aleatoria.
- **2 puestos** al principio, ampliables con mejoras hasta **6**.
- Mejorar la taberna también sube la probabilidad de mercenarios mejores.
- Se compran con oro; el precio depende de la rareza. Un repetido da copias de su carta.

### Ascendidos

- Nunca salen en jaulas ni en la taberna.
- *Pendiente*: cómo se consiguen.

## Estructura de la app

- **Barra de pestañas** (abajo): Inicio, Campaña, Ejército, Taberna y Arena.
- **Inicio**: arriba tu perfil (retrato de tu héroe, nivel y experiencia del reino, nombre), oro y diamantes.
  En el centro, la **expedición**: tu mazo avanza por el camino y despacha enemigos de un golpe; acumula oro
  y experiencia hasta 12 horas aunque no juegues, y se recoge en el cofre. Abajo, **¡Batalla!** (abre el
  siguiente castillo de la campaña) y **Mazo**. A los lados: Diario, Misiones, Jaulas y Ofertas; Correo,
  Clasificación y Práctica.
- **Diario**: premio por entrar cada día, 7 días (el séptimo, el mejor). **Misiones diarias**: ganar 2 batallas,
  sacar 25 cartas y recoger 2 veces; premio extra por completar las tres.
- **Ejército**: Unidades (ficha con estadísticas y habilidad; las que faltan dicen dónde conseguirlas), Héroes
  (pasiva, activa y elegir el de batalla) y Estandarte (color y emblema).
- **Taberna del Multiverso**: 2 mercenarios cada 4 horas, se pagan con oro (común 200 … legendaria 3.200);
  si ya lo tienes, guardas una copia de su carta.
- **Arena**: duelos contra jugadores (próximamente) y batalla rápida contra la IA.
- **Perfil**: nombre del reino, estadísticas y ajustes.
- **Experiencia del reino**: por ganar batallas (más la primera vez que conquistas un castillo), por la
  expedición y por las misiones.

## Plataforma y aspecto

- **Móvil**, jugable en horizontal y en vertical.
  - Horizontal: campo completo.
  - Vertical: campo comprimido (escalado al ancho, unidades algo más grandes) con la
    interfaz y las cartas abajo.
- **Tecnología**: Phaser (HTML5), instalable como app (PWA) y jugable sin conexión.
- **Arte propio**, original y exclusivo de Brawlground. Estilo cartoon chibi: cabeza
  grande, sin brazos (manos flotantes), contorno grueso azul marino, colores planos.
  - **ChatGPT (director gráfico)** dibuja todo: personajes por piezas, escenarios por
    capas, castillos, kit de interfaz, bocetos de pantallas, jaulas, llaves y taberna.
  - **Claude** lo monta y le da vida: pantallas reales, animación por código, efectos.
  - Reglas completas en la Biblia de arte (documento aparte).
- **Sensación**: partículas, números de daño, destellos al golpear, temblor de pantalla,
  animaciones suaves en la interfaz, sonido y música.

## Siguientes pasos

1. ~~Legionario como patrón de estilo~~ y ~~batalla jugable con el arte aprobado~~ (hecho).
2. ~~App instalable con carga, menú y batalla a pantalla completa~~ (hecho: akharta.github.io/Brawlground).
3. Campaña del primer reino: mapa del mundo, mapa del reino con 10 castillos, progreso guardado.
4. Jaulas de prisioneros y Taberna del Multiverso para reclutar.

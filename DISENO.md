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
